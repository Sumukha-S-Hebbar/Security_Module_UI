
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Guard, PatrollingOfficer } from '@/types';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites } from '@/lib/data/sites';
import { incidents } from '@/lib/data/incidents';
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

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');

  const agencySites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID), []);
  
  const agencyGuards = useMemo(() => {
    const agencySiteIds = new Set<string>(agencySites.map(s => s.id));
    return guards.filter(guard => {
      return guard.site && agencySiteIds.has(guard.site);
    });
  }, [agencySites]);

  // Use all patrolling officers for lookup, not just ones already assigned to a site.
  const agencyPatrollingOfficers = patrollingOfficers;

  const getPatrollingOfficerForGuard = (guard: Guard): PatrollingOfficer | undefined => {
    const site = agencySites.find(s => s.id === guard.site);
    if (!site || !site.patrollingOfficerId) return undefined;
    return agencyPatrollingOfficers.find(po => po.id === site.patrollingOfficerId);
  };
  
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
    return agencyGuards.filter((guard) => {
      const searchLower = searchQuery.toLowerCase();
      const patrollingOfficer = getPatrollingOfficerForGuard(guard);
      const site = agencySites.find(s => s.id === guard.site);
      
      const matchesSearch =
        guard.name.toLowerCase().includes(searchLower) ||
        guard.id.toLowerCase().includes(searchLower) ||
        (site && site.site_name.toLowerCase().includes(searchLower)) || false;

      const matchesSite = selectedSiteFilter === 'all' || guard.site === selectedSiteFilter;
      
      const matchesPatrollingOfficer = 
        selectedPatrollingOfficerFilter === 'all' || 
        (selectedPatrollingOfficerFilter === 'unassigned' && !patrollingOfficer) ||
        (patrollingOfficer && patrollingOfficer.id === selectedPatrollingOfficerFilter);

      return matchesSearch && matchesSite && matchesPatrollingOfficer;
    });
  }, [searchQuery, selectedSiteFilter, selectedPatrollingOfficerFilter, agencyGuards, agencySites]);
  
  const guardIncidentCounts = useMemo(() => {
    return incidents.reduce((acc, incident) => {
      acc[incident.raisedByGuardId] = (acc[incident.raisedByGuardId] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
  }, [incidents]);

  const uniqueSites = useMemo(() => {
      const siteIdsInUse = new Set(agencyGuards.map(g => g.site));
      return agencySites.filter(s => siteIdsInUse.has(s.id));
  }, [agencyGuards, agencySites]);
  
  const uniquePatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencyGuards.map(g => getPatrollingOfficerForGuard(g)?.id).filter(Boolean) as string[]);
    return agencyPatrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencyGuards]);

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
                                                <Input placeholder="e.g., John Doe" {...field} />
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
                                                <Input placeholder="e.g., 555-123-4567" {...field} />
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
                                                    {agencySites.map((site) => (
                                                        <SelectItem key={site.id} value={site.id}>
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
                          <SelectItem key={site.id} value={site.id} className="font-medium">
                              {site.site_name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={selectedPatrollingOfficerFilter} onValueChange={setSelectedPatrollingOfficerFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Filter by Patrolling Officer" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all" className="font-medium">All Patrolling Officers</SelectItem>
                      {uniquePatrollingOfficers.map((po) => (
                          <SelectItem key={po.id} value={po.id} className="font-medium">
                              {po.name}
                          </SelectItem>
                      ))}
                      <SelectItem value="unassigned" className="font-medium">Unassigned</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
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
                    const patrollingOfficer = getPatrollingOfficerForGuard(guard);
                    const incidentCount = guardIncidentCounts[guard.id] || 0;
                    const site = agencySites.find(s => s.id === guard.site);
                    
                    return (
                      <TableRow 
                        key={guard.id}
                        onClick={() => router.push(`/agency/guards/${guard.id}`)}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                      >
                        <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/agency/guards/${guard.id}`}>{guard.id}</Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={guard.avatar} alt={guard.name} />
                              <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{guard.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <a href={`tel:${guard.phone}`} className="hover:underline font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>{guard.phone}</a>
                            </div>
                        </TableCell>
                        <TableCell>
                          {site ? (
                            <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/agency/sites/${site.id}`}>{site.site_name}</Link>
                            </Button>
                           ) : (
                            <span className="font-medium">{guard.site}</span>
                           )}
                        </TableCell>
                        <TableCell>
                            {patrollingOfficer ? (
                               <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                   <Link href={`/agency/patrolling-officers/${patrollingOfficer.id}`}>{patrollingOfficer.name}</Link>
                               </Button>
                            ) : (
                                <span className="text-muted-foreground group-hover:text-accent-foreground font-medium">Unassigned</span>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                            <span className="font-medium">{incidentCount}</span>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
