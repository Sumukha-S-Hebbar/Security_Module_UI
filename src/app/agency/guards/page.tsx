
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Guard, PatrollingOfficer, Organization } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Upload, Loader2, Search, PlusCircle, ShieldAlert, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

const addGuardFormSchema = z.object({
    name: z.string().min(1, { message: 'Guard name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    site: z.string().min(1, { message: 'Please select a site.' }),
});

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [patrollingOfficers, setPatrollingOfficers] = useState<PatrollingOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
    }
  }, []);

  useEffect(() => {
    if (!loggedInOrg) return;

    const fetchGuardsData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const authHeader = { Authorization: `Token ${token}` };
        const orgCode = loggedInOrg.code;

        try {
            const guardsResponse = await fetchData<{ results: Guard[] }>(`/security/api/agency/${orgCode}/guards/list/`, { headers: authHeader });
            setGuards(guardsResponse?.results || []);

            const sitesResponse = await fetchData<{ results: Site[] }>(`/security/api/agency/${orgCode}/sites/list/`, { headers: authHeader });
            setSites(sitesResponse?.results || []);
            
            const poResponse = await fetchData<{ results: any[] }>(`/security/api/agency/${orgCode}/patrolling-officers/list/`, { headers: authHeader });
            const formattedPOs = poResponse?.results.map(po => ({
                id: po.id.toString(),
                name: `${po.first_name} ${po.last_name || ''}`.trim(),
                email: po.email,
                phone: po.phone,
                avatar: po.profile_picture,
            })) || [];
            setPatrollingOfficers(formattedPOs);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load guards data.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchGuardsData();
  }, [loggedInOrg, toast]);

  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });
  
  const addGuardForm = useForm<z.infer<typeof addGuardFormSchema>>({
    resolver: zodResolver(addGuardFormSchema),
    defaultValues: { name: '', phone: '', site: '' },
  });

  async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
    setIsUploading(true);
    console.log('Uploaded file:', values.excelFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.excelFile[0].name}" has been uploaded. Guard profiles would be processed.`,
    });
    uploadForm.reset({ excelFile: undefined });
    const fileInput = document.getElementById('excelFile-guard-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  }

  async function onAddGuardSubmit(values: z.infer<typeof addGuardFormSchema>) {
    setIsAdding(true);
    console.log('New guard data:', values);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Guard Added',
      description: `Guard "${values.name}" has been added successfully.`,
    });
    addGuardForm.reset();
    setIsAdding(false);
    setIsAddDialogOpen(false);
  }

  const handleDownloadTemplate = () => {
    toast({
        title: 'Template Downloaded',
        description: 'Guard profile Excel template has been downloaded.',
    });
  }

  const filteredGuards = useMemo(() => {
    return guards.filter((guard) => {
      const searchLower = searchQuery.toLowerCase();
      const guardName = `${guard.first_name} ${guard.last_name || ''}`.trim();
      
      const matchesSearch =
        guardName.toLowerCase().includes(searchLower) ||
        guard.employee_id.toLowerCase().includes(searchLower) ||
        (guard.site && guard.site.site_name.toLowerCase().includes(searchLower)) || false;

      const matchesSite = selectedSiteFilter === 'all' || guard.site?.id.toString() === selectedSiteFilter;
      
      const matchesPatrollingOfficer = 
        selectedPatrollingOfficerFilter === 'all' || 
        guard.patrolling_officer?.id.toString() === selectedPatrollingOfficerFilter;
        
      return matchesSearch && matchesSite && matchesPatrollingOfficer;
    });
  }, [searchQuery, selectedSiteFilter, selectedPatrollingOfficerFilter, guards]);

  const uniqueSites = useMemo(() => {
    const siteMap = new Map<number, Site>();
    guards.forEach(guard => {
      if (guard.site && !siteMap.has(guard.site.id)) {
        siteMap.set(guard.site.id, guard.site);
      }
    });
    return Array.from(siteMap.values());
  }, [guards]);
  
  const uniquePatrollingOfficers = useMemo(() => {
    const poMap = new Map<number, PatrollingOfficer>();
     guards.forEach(guard => {
      if (guard.patrolling_officer && !poMap.has(guard.patrolling_officer.id)) {
        const poName = `${guard.patrolling_officer.first_name} ${guard.patrolling_officer.last_name || ''}`.trim();
        poMap.set(guard.patrolling_officer.id, {
            id: guard.patrolling_officer.id.toString(),
            name: poName,
            email: guard.patrolling_officer.email,
            phone: guard.patrolling_officer.phone,
            avatar: guard.patrolling_officer.profile_picture || '',
        });
      }
    });
    return Array.from(poMap.values());
  }, [guards]);


  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Security Guard Management</h1>
              <p className="text-muted-foreground font-medium">Add, view, and manage guard profiles and their assignments.</p>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDownloadTemplate} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Excel Template
                </Button>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Excel
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Upload Guard Profiles</DialogTitle>
                        <DialogDescription className="font-medium">
                            Upload an Excel file to add multiple security guard profiles at once.
                        </DialogDescription>
                        </DialogHeader>
                        <Form {...uploadForm}>
                            <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)}>
                                <div className="grid gap-4 py-4">
                                    <FormField
                                        control={uploadForm.control}
                                        name="excelFile"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Guard Excel File</FormLabel>
                                            <FormControl>
                                            <Input
                                                id="excelFile-guard-input"
                                                type="file"
                                                accept=".xlsx, .xls"
                                                disabled={isUploading}
                                                onChange={(e) => field.onChange(e.target.files)}
                                            />
                                            </FormControl>
                                            <FormDescription className="font-medium">
                                            The Excel file should contain columns: name, phone, site.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isUploading} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                                    {isUploading ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                        </>
                                    ) : (
                                        <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Excel
                                        </>
                                    )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="bg-[#00B4D8] hover:bg-[#00B4D8]/90 text-white">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Guard
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Guard</DialogTitle>
                            <DialogDescription className="font-medium">
                                Fill in the details below to add a new security guard.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...addGuardForm}>
                            <form onSubmit={addGuardForm.handleSubmit(onAddGuardSubmit)} className="space-y-4">
                                <FormField
                                    control={addGuardForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addGuardForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter phone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addGuardForm.control}
                                    name="site"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign to Site</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a site" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sites.map((site) => (
                                                        <SelectItem key={site.id} value={site.id.toString()}>
                                                            {site.site_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isAdding} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                                    {isAdding ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding Guard...
                                        </>
                                    ) : (
                                        "Add Guard"
                                    )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Guard Details</CardTitle>
            <CardDescription className="font-medium">A list of all guards in your agency.</CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                  type="search"
                  placeholder="Search guards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  />
              </div>
              <Select value={selectedSiteFilter} onValueChange={setSelectedSiteFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all" className="font-medium">All Sites</SelectItem>
                      {uniqueSites.map((site) => (
                          <SelectItem key={site.id} value={site.id.toString()} className="font-medium">
                              {site.site_name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={selectedPatrollingOfficerFilter} onValueChange={setSelectedPatrollingOfficerFilter}>
                  <SelectTrigger className="w-full sm:w-[220px] font-medium hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Filter by Patrolling Officer" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all" className="font-medium">All Patrolling Officers</SelectItem>
                      {uniquePatrollingOfficers.map((po) => (
                          <SelectItem key={po.id} value={po.id.toString()} className="font-medium">
                              {po.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard ID</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
                  <TableHead>Incidents Occurred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuards.length > 0 ? (
                  filteredGuards.map((guard) => {
                    const guardName = `${guard.first_name} ${guard.last_name || ''}`.trim();
                    const poName = guard.patrolling_officer ? `${guard.patrolling_officer.first_name} ${guard.patrolling_officer.last_name || ''}`.trim() : 'Unassigned';
                    
                    return (
                      <TableRow 
                        key={guard.id}
                        onClick={() => router.push(`/agency/guards/${guard.id}`)}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                      >
                        <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/agency/guards/${guard.id}`}>{guard.employee_id}</Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                            <p className="font-medium">{guardName}</p>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <a href={`tel:${guard.phone}`} className="hover:underline font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>{guard.phone}</a>
                            </div>
                        </TableCell>
                        <TableCell>
                          {guard.site ? (
                            <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/agency/sites/${guard.site.id}`}>{guard.site.site_name}</Link>
                            </Button>
                           ) : (
                            <span className="font-medium text-muted-foreground">Unassigned</span>
                           )}
                        </TableCell>
                        <TableCell>
                            {guard.patrolling_officer ? (
                               <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                   <Link href={`/agency/patrolling-officers/${guard.patrolling_officer.id}`}>{poName}</Link>
                               </Button>
                            ) : (
                                <span className="text-muted-foreground group-hover:text-accent-foreground font-medium">Unassigned</span>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                            <span className="font-medium">{guard.incident_count}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10 font-medium">
                      No guards found for the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
