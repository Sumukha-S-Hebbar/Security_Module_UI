
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Guard, PatrollingOfficer } from '@/types';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites } from '@/lib/data/sites';
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
import { FileDown, Upload, Loader2, Search, PlusCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
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
  const agencySiteNames = useMemo(() => new Set(agencySites.map(site => site.name)), [agencySites]);

  const agencyGuards = useMemo(() => guards.filter(guard => agencySiteNames.has(guard.site)), [agencySiteNames]);

  const agencyPatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
    return patrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencySites]);

  const getPatrollingOfficerForGuard = (guard: Guard): PatrollingOfficer | undefined => {
    const site = agencySites.find(s => s.name === guard.site);
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
      
      const matchesSearch =
        guard.name.toLowerCase().includes(searchLower) ||
        guard.id.toLowerCase().includes(searchLower) ||
        guard.site.toLowerCase().includes(searchLower);

      const matchesSite = selectedSiteFilter === 'all' || guard.site === selectedSiteFilter;
      
      const matchesPatrollingOfficer = 
        selectedPatrollingOfficerFilter === 'all' || 
        (selectedPatrollingOfficerFilter === 'unassigned' && !patrollingOfficer) ||
        (patrollingOfficer && patrollingOfficer.id === selectedPatrollingOfficerFilter);

      return matchesSearch && matchesSite && matchesPatrollingOfficer;
    });
  }, [searchQuery, selectedSiteFilter, selectedPatrollingOfficerFilter, agencyGuards]);

  const uniqueSites = useMemo(() => [...new Set(agencyGuards.map(g => g.site))], [agencyGuards]);
  const uniquePatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencyGuards.map(g => getPatrollingOfficerForGuard(g)?.id).filter(Boolean));
    return agencyPatrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencyGuards, agencyPatrollingOfficers]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Security Guard Management</h1>
              <p className="text-muted-foreground">Add, view, and manage guard profiles and their assignments.</p>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Excel Template
                </Button>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Excel
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Upload Guard Profiles</DialogTitle>
                        <DialogDescription>
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
                                            <FormDescription>
                                            The Excel file should contain columns: name, phone, site.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isUploading}>
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
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Guard
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Guard</DialogTitle>
                            <DialogDescription>
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
                                                        <SelectItem key={site.id} value={site.name}>
                                                            {site.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isAdding}>
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
            <CardDescription>A list of all guards in your agency.</CardDescription>
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
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {uniqueSites.map((site) => (
                          <SelectItem key={site} value={site}>
                              {site}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={selectedPatrollingOfficerFilter} onValueChange={setSelectedPatrollingOfficerFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Patrolling Officer" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Patrolling Officers</SelectItem>
                      {uniquePatrollingOfficers.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                              {po.name}
                          </SelectItem>
                      ))}
                      <SelectItem value="unassigned">Unassigned</SelectItem>
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
                  <TableHead>Site</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
                  <TableHead>Overall Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuards.length > 0 ? (
                  filteredGuards.map((guard) => {
                    const patrollingOfficer = getPatrollingOfficerForGuard(guard);
                    const selfieAccuracy = guard.totalSelfieRequests > 0 ? Math.round(((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100) : 100;
                    const perimeterAccuracy = guard.performance?.perimeterAccuracy || 0;
                    const compliance = Math.round((perimeterAccuracy + selfieAccuracy) / 2);
                    
                    return (
                      <TableRow 
                        key={guard.id}
                        onClick={() => router.push(`/agency/guards/${guard.id}`)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
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
                              <p>{guard.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{guard.site}</TableCell>
                        <TableCell>{patrollingOfficer?.name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={compliance} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">{compliance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
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
