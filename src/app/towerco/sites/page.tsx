

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { organizations } from '@/lib/data/organizations';
import { incidents } from '@/lib/data/incidents';
import type { Site, SecurityAgency } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Upload,
  PlusCircle,
  Search,
  Briefcase,
  ShieldAlert,
  Loader2,
  Eye,
  FileDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const LOGGED_IN_ORG_ID = 'TCO01'; // Simulate logged-in user
const ASSIGNED_ITEMS_PER_PAGE = 5;
const UNASSIGNED_ITEMS_PER_PAGE = 5;


const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

const addSiteFormSchema = z.object({
  id: z.string().min(1, 'Site ID is required.'),
  name: z.string().min(1, 'Site name is required.'),
  address: z.string().min(1, 'Address is required.'),
  region: z.string().min(1, 'Region is required.'),
  city: z.string().min(1, 'City is required.'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export default function TowercoSitesPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [assignedSelectedRegion, setAssignedSelectedRegion] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');
  const [unassignedSelectedRegion, setUnassignedSelectedRegion] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  // State for pagination
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1);
  const [unassignedCurrentPage, setUnassignedCurrentPage] = useState(1);


  const [assignments, setAssignments] = useState<{ [siteId: string]: string }>(
    {}
  );
  const [guardsRequired, setGuardsRequired] = useState<{ [siteId: string]: string }>({});
  
  const loggedInOrg = useMemo(() => organizations.find(o => o.id === LOGGED_IN_ORG_ID), []);
  const unassignedSitesRef = useRef<Map<string, HTMLTableRowElement | null>>(new Map());

  const towercoSites = useMemo(
    () => sites.filter((site) => site.towerco === loggedInOrg?.name),
    [loggedInOrg]
  );

  const getAgencyForSite = (siteId: string): SecurityAgency | undefined => {
    return securityAgencies.find(agency => agency.siteIds.includes(siteId));
  }

  const assignedSites = useMemo(
    () => towercoSites.filter((site) => getAgencyForSite(site.id)),
    [towercoSites]
  );

  const unassignedSites = useMemo(
    () => towercoSites.filter((site) => !getAgencyForSite(site.id)),
    [towercoSites]
  );

  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });

  const addSiteForm = useForm<z.infer<typeof addSiteFormSchema>>({
    resolver: zodResolver(addSiteFormSchema),
    defaultValues: { id: '', name: '', address: '', region: '', city: '' },
  });

  useEffect(() => {
    const focusSiteId = searchParams.get('focusSite');
    if (focusSiteId && unassignedSitesRef.current.has(focusSiteId)) {
        const row = unassignedSitesRef.current.get(focusSiteId);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('highlight-row');
            setTimeout(() => {
                row.classList.remove('highlight-row');
            }, 2000);
        }
    }
  }, [searchParams]);

  async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
    setIsUploading(true);
    console.log('Uploading file for TOWERCO:', loggedInOrg?.name, values.excelFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.excelFile[0].name}" has been uploaded. Site profiles would be processed.`,
    });
    uploadForm.reset({ excelFile: undefined });
    const fileInput = document.getElementById('excelFile-site-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  }

  async function onAddSiteSubmit(values: z.infer<typeof addSiteFormSchema>) {
    setIsAddingSite(true);
    console.log('New site data:', { ...values, towerco: loggedInOrg?.name });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Site Added',
      description: `Site "${values.name}" has been created successfully for ${loggedInOrg?.name}.`,
    });
    addSiteForm.reset();
    setIsAddingSite(false);
    setIsAddSiteDialogOpen(false);
  }

  const handleDownloadTemplate = () => {
    toast({
        title: 'Template Downloaded',
        description: 'Site profile Excel template has been downloaded.',
    });
  }

  const handleAssignmentChange = (siteId: string, agencyId: string) => {
    setAssignments((prev) => ({ ...prev, [siteId]: agencyId }));
  };

  const handleGuardsRequiredChange = (siteId: string, count: string) => {
    setGuardsRequired((prev) => ({ ...prev, [siteId]: count }));
  };

  const handleAssignAgency = (siteId: string) => {
    const agencyId = assignments[siteId];
    const numGuards = guardsRequired[siteId];

    if (!agencyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agency to assign.',
      });
      return;
    }

    if (!numGuards || Number(numGuards) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please specify the number of guards required.',
      });
      return;
    }

    const siteName = sites.find((s) => s.id === siteId)?.name;
    const agencyName = securityAgencies.find((a) => a.id === agencyId)?.name;

    console.log(`Assigning agency ${agencyId} to site ${siteId} with ${numGuards} guards for TOWERCO ${loggedInOrg?.name}`);
    
    toast({
      title: 'Agency Assigned',
      description: `${agencyName} has been assigned to site ${siteName} with a requirement of ${numGuards} guards. This change will be reflected on the next refresh.`,
    });
  };

  const agenciesOnSites = useMemo(() => {
    const agencyIds = new Set<string>();
    assignedSites.forEach(site => {
        const agency = getAgencyForSite(site.id);
        if(agency) {
            agencyIds.add(agency.id);
        }
    });
    return securityAgencies.filter((a) => agencyIds.has(a.id));
  }, [assignedSites]);

  const allAssignedRegions = useMemo(() => [...new Set(assignedSites.map((site) => site.region))].sort(), [assignedSites]);
  const assignedCitiesForFilter = useMemo(() => {
    if (assignedSelectedRegion === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.region === assignedSelectedRegion).map((site) => site.city))].sort();
  }, [assignedSelectedRegion, assignedSites]);

  const allUnassignedRegions = useMemo(() => [...new Set(unassignedSites.map((site) => site.region))].sort(), [unassignedSites]);
  const unassignedCitiesForFilter = useMemo(() => {
    if (unassignedSelectedRegion === 'all') return [];
    return [...new Set(unassignedSites.filter((site) => site.region === unassignedSelectedRegion).map((site) => site.city))].sort();
    }, [unassignedSelectedRegion, unassignedSites]);


  const handleAssignedRegionChange = (region: string) => {
    setAssignedSelectedRegion(region);
    setAssignedSelectedCity('all');
  };
  
  const handleUnassignedRegionChange = (region: string) => {
    setUnassignedSelectedRegion(region);
    setUnassignedSelectedCity('all');
  };

  const filteredAssignedSites = useMemo(() => {
    const filtered = assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower) ||
        site.id.toLowerCase().includes(searchLower);

      const agency = getAgencyForSite(site.id);
      const matchesAgency =
        selectedAgency === 'all' || agency?.id === selectedAgency;

      const matchesRegion = assignedSelectedRegion === 'all' || site.region === assignedSelectedRegion;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesAgency && matchesRegion && matchesCity;
    });
    setAssignedCurrentPage(1);
    return filtered;
  }, [
    assignedSearchQuery,
    selectedAgency,
    assignedSites,
    assignedSelectedRegion,
    assignedSelectedCity,
  ]);
  
  const paginatedAssignedSites = useMemo(() => {
    const startIndex = (assignedCurrentPage - 1) * ASSIGNED_ITEMS_PER_PAGE;
    return filteredAssignedSites.slice(startIndex, startIndex + ASSIGNED_ITEMS_PER_PAGE);
  }, [filteredAssignedSites, assignedCurrentPage]);

  const totalAssignedPages = Math.ceil(filteredAssignedSites.length / ASSIGNED_ITEMS_PER_PAGE);


  const filteredUnassignedSites = useMemo(() => {
    const filtered = unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);
      
      const matchesRegion = unassignedSelectedRegion === 'all' || site.region === unassignedSelectedRegion;
      const matchesCity = unassignedSelectedCity === 'all' || site.city === unassignedSelectedCity;

      return matchesSearch && matchesRegion && matchesCity;
    });
    setUnassignedCurrentPage(1);
    return filtered;
  }, [unassignedSearchQuery, unassignedSites, unassignedSelectedRegion, unassignedSelectedCity]);

  const paginatedUnassignedSites = useMemo(() => {
      const startIndex = (unassignedCurrentPage - 1) * UNASSIGNED_ITEMS_PER_PAGE;
      return filteredUnassignedSites.slice(startIndex, startIndex + UNASSIGNED_ITEMS_PER_PAGE);
  }, [filteredUnassignedSites, unassignedCurrentPage]);

  const totalUnassignedPages = Math.ceil(filteredUnassignedSites.length / UNASSIGNED_ITEMS_PER_PAGE);


  const getAgencyName = (siteId: string) => {
    const agency = getAgencyForSite(siteId);
    return agency ? agency.name : 'Unassigned';
  };

  const siteIncidentsCount = useMemo(() => {
    const counts: { [siteId: string]: number } = {};
    incidents.forEach((incident) => {
        if (!counts[incident.siteId]) {
          counts[incident.siteId] = 0;
        }
        counts[incident.siteId]++;
    });
    return counts;
  }, []);

  if (!loggedInOrg) {
     return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="font-medium">Could not load organization data.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground font-medium">
            Add, view, and manage operational sites for {loggedInOrg.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Excel Template
          </Button>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Site Profiles</DialogTitle>
                <DialogDescription className="font-medium">
                  Upload an Excel file to add multiple sites at once.
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
                          <FormLabel>Site Excel File</FormLabel>
                          <FormControl>
                            <Input
                              id="excelFile-site-input"
                              type="file"
                              accept=".xlsx, .xls"
                              disabled={isUploading}
                              onChange={(e) =>
                                field.onChange(e.target.files)
                              }
                            />
                          </FormControl>
                          <FormDescription className="font-medium">
                            The Excel file should contain columns: name, address.
                            The TowerCo will be set to {loggedInOrg.name}.
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload Excel
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAddSiteDialogOpen}
            onOpenChange={setIsAddSiteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add a New Site</DialogTitle>
                <DialogDescription className="font-medium">
                  Fill in the details below to add a new site for{' '}
                  {loggedInOrg.name}.
                </DialogDescription>
              </DialogHeader>
              <Form {...addSiteForm}>
                <form
                  onSubmit={addSiteForm.handleSubmit(onAddSiteSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={addSiteForm.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., SITE013"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSiteForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., North Tower"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSiteForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 123 Main St, Anytown, USA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={addSiteForm.control}
                      name="region"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Region</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., CA" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={addSiteForm.control}
                      name="city"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., Sunnyvale" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={addSiteForm.control}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 37.4024" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={addSiteForm.control}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Longitude</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., -122.0785" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingSite}>
                      {isAddingSite ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                          Adding Site...
                        </>
                      ) : (
                        'Add Site'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Sites</CardTitle>
            <CardDescription className="font-medium">
              A list of all your sites with an assigned security agency.
            </CardDescription>
             <div className="flex flex-wrap items-center gap-2 pt-4">
                <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search assigned sites..."
                    value={assignedSearchQuery}
                    onChange={(e) => setAssignedSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  />
                </div>
                <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium">
                    <SelectValue placeholder="Filter by agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Agencies</SelectItem>
                    {agenciesOnSites.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id} className="font-medium">
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={assignedSelectedRegion} onValueChange={handleAssignedRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                    {allAssignedRegions.map((region) => (
                      <SelectItem key={region} value={region} className="font-medium">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={assignedSelectedCity}
                  onValueChange={setAssignedSelectedCity}
                  disabled={assignedSelectedRegion === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px] font-medium">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                    {assignedCitiesForFilter.map((city) => (
                      <SelectItem key={city} value={city} className="font-medium">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Site ID</TableHead>
                        <TableHead>Site Name</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Incidents</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAssignedSites.length > 0 ? (
                        paginatedAssignedSites.map((site) => {
                            const agency = getAgencyForSite(site.id);
                            const incidentsCount = siteIncidentsCount[site.id] || 0;
                            return (
                                <TableRow
                                  key={site.id}
                                  onClick={() => router.push(`/towerco/sites/${site.id}`)}
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                                >
                                    <TableCell>
                                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/towerco/sites/${site.id}`}>{site.id}</Link>
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{site.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium group-hover:text-accent-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {site.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                            <span>{agency?.name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                            <span>{incidentsCount}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-10 font-medium">
                                No assigned sites found for the current filter.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {paginatedAssignedSites.length} of {filteredAssignedSites.length} sites.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssignedCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={assignedCurrentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {assignedCurrentPage} of {totalAssignedPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssignedCurrentPage(prev => Math.min(prev + 1, totalAssignedPages))}
                            disabled={assignedCurrentPage === totalAssignedPages || totalAssignedPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>

        {unassignedSites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Sites</CardTitle>
              <CardDescription className="font-medium">
                Sites that need a security agency to be assigned.
              </CardDescription>
               <div className="flex flex-wrap items-center gap-2 pt-4">
                <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search unassigned sites..."
                    value={unassignedSearchQuery}
                    onChange={(e) => setUnassignedSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  />
                </div>
                 <Select value={unassignedSelectedRegion} onValueChange={handleUnassignedRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                    {allUnassignedRegions.map((region) => (
                      <SelectItem key={region} value={region} className="font-medium">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={unassignedSelectedCity}
                  onValueChange={setUnassignedSelectedCity}
                  disabled={unassignedSelectedRegion === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px] font-medium">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                    {unassignedCitiesForFilter.map((city) => (
                      <SelectItem key={city} value={city} className="font-medium">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site ID</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Guards Required</TableHead>
                    <TableHead>Assign Agency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnassignedSites.length > 0 ? (
                    paginatedUnassignedSites.map((site) => {
                      const agenciesInRegion = securityAgencies.filter(
                        (agency) => agency.region === site.region
                      );
                      return (
                        <TableRow 
                          key={site.id} 
                          ref={(el) => unassignedSitesRef.current.set(site.id, el)}
                        >
                          <TableCell className="font-medium">{site.id}</TableCell>
                          <TableCell>
                            <p className="font-medium">{site.name}</p>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3" />
                              {site.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                                type="number"
                                placeholder="e.g. 2"
                                className="w-[120px]"
                                value={guardsRequired[site.id] || ''}
                                onChange={(e) => handleGuardsRequiredChange(site.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              onValueChange={(value) =>
                                handleAssignmentChange(site.id, value)
                              }
                               onClick={(e) => e.stopPropagation()}
                            >
                              <SelectTrigger className="w-[200px] font-medium">
                                <SelectValue placeholder="Select an agency" />
                              </SelectTrigger>
                              <SelectContent>
                                {agenciesInRegion.length > 0 ? (
                                  agenciesInRegion.map((agency) => (
                                    <SelectItem key={agency.id} value={agency.id} className="font-medium">
                                      {agency.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground font-medium">
                                    No agencies in this region
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignAgency(site.id);
                              }}
                              disabled={!assignments[site.id] || !guardsRequired[site.id]}
                            >
                              Assign Agency
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground font-medium">
                              No unassigned sites found for the current filter.
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {paginatedUnassignedSites.length} of {filteredUnassignedSites.length} sites.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUnassignedCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={unassignedCurrentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {unassignedCurrentPage} of {totalUnassignedPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUnassignedCurrentPage(prev => Math.min(prev + 1, totalUnassignedPages))}
                            disabled={unassignedCurrentPage === totalUnassignedPages || totalUnassignedPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
