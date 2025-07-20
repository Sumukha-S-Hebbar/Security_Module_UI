
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine(
      (files) => files?.[0]?.type === 'text/csv',
      'Only .csv files are accepted.'
    ),
});

const addSiteFormSchema = z.object({
  id: z.string().min(1, 'Site ID is required.'),
  name: z.string().min(1, 'Site name is required.'),
  address: z.string().min(1, 'Address is required.'),
  region: z.string().min(1, 'Region is required.'),
  city: z.string().min(1, 'City is required.'),
});

export default function TowercoSitesPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // State for filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const [assignments, setAssignments] = useState<{ [siteId: string]: string }>(
    {}
  );
  
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
    console.log('Uploading file for TOWERCO:', loggedInOrg?.name, values.csvFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.csvFile[0].name}" has been uploaded. Site profiles would be processed.`,
    });
    uploadForm.reset({ csvFile: undefined });
    const fileInput = document.getElementById('csvFile-site-input') as HTMLInputElement | null;
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

  const handleAssignmentChange = (siteId: string, agencyId: string) => {
    setAssignments((prev) => ({ ...prev, [siteId]: agencyId }));
  };

  const handleAssignAgency = (siteId: string) => {
    const agencyId = assignments[siteId];
    if (!agencyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agency to assign.',
      });
      return;
    }
    const siteName = sites.find((s) => s.id === siteId)?.name;
    const agencyName = securityAgencies.find((a) => a.id === agencyId)?.name;

    console.log(`Assigning agency ${agencyId} to site ${siteId} for TOWERCO ${loggedInOrg?.name}`);
    
    toast({
      title: 'Agency Assigned',
      description: `${agencyName} has been assigned to site ${siteName}. This change will be reflected on the next refresh.`,
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

  const allRegions = useMemo(() => [...new Set(towercoSites.map((site) => site.region))].sort(), [towercoSites]);
  const citiesForFilter = useMemo(() => {
    if (selectedRegion === 'all') return [];
    return [...new Set(towercoSites.filter((site) => site.region === selectedRegion).map((site) => site.city))].sort();
  }, [selectedRegion, towercoSites]);


  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('all');
  };

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower) ||
        site.id.toLowerCase().includes(searchLower);

      const agency = getAgencyForSite(site.id);
      const matchesAgency =
        selectedAgency === 'all' || agency?.id === selectedAgency;

      const matchesRegion = selectedRegion === 'all' || site.region === selectedRegion;
      const matchesCity = selectedCity === 'all' || site.city === selectedCity;

      return matchesSearch && matchesAgency && matchesRegion && matchesCity;
    });
  }, [
    assignedSearchQuery,
    selectedAgency,
    assignedSites,
    selectedRegion,
    selectedCity,
  ]);

  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);
      
      const matchesRegion = selectedRegion === 'all' || site.region === selectedRegion;
      const matchesCity = selectedCity === 'all' || site.city === selectedCity;

      return matchesSearch && matchesRegion && matchesCity;
    });
  }, [unassignedSearchQuery, unassignedSites, selectedRegion, selectedCity]);


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
        <p>Could not load organization data.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground">
            Add, view, and manage operational sites for {loggedInOrg.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Site Profiles</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to add multiple sites at once.
                </DialogDescription>
              </DialogHeader>
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)}>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={uploadForm.control}
                      name="csvFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site CSV File</FormLabel>
                          <FormControl>
                            <Input
                              id="csvFile-site-input"
                              type="file"
                              accept=".csv"
                              disabled={isUploading}
                              onChange={(e) =>
                                field.onChange(e.target.files)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            The CSV should contain columns: name, address.
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
                          <Upload className="mr-2 h-4 w-4" /> Upload CSV
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Site</DialogTitle>
                <DialogDescription>
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
            <CardDescription>
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
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agenciesOnSites.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {allRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={selectedRegion === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {citiesForFilter.map((city) => (
                      <SelectItem key={city} value={city}>
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
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAssignedSites.length > 0 ? (
                    filteredAssignedSites.map((site) => {
                        const incidentsCount = siteIncidentsCount[site.id] || 0;
                        return (
                        <TableRow key={site.id}>
                            <TableCell className="font-medium">{site.id}</TableCell>
                            <TableCell>
                            <div>{site.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {site.address}
                            </div>
                            </TableCell>
                            <TableCell>{getAgencyName(site.id)}</TableCell>
                            <TableCell>{incidentsCount}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/towerco/sites/${site.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Report
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        );
                    })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No assigned sites found for the current filter.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        {unassignedSites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Sites</CardTitle>
              <CardDescription>
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
                 <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {allRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={selectedRegion === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {citiesForFilter.map((city) => (
                      <SelectItem key={city} value={city}>
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
                    <TableHead>Assign Agency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnassignedSites.length > 0 ? (
                    filteredUnassignedSites.map((site) => (
                      <TableRow key={site.id} ref={(el) => unassignedSitesRef.current.set(site.id, el)}>
                        <TableCell className="font-medium">{site.id}</TableCell>
                        <TableCell>
                          <div>{site.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {site.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) =>
                              handleAssignmentChange(site.id, value)
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select an agency" />
                            </SelectTrigger>
                            <SelectContent>
                              {securityAgencies.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id}>
                                  {agency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleAssignAgency(site.id)}
                            disabled={!assignments[site.id]}
                          >
                            Assign Agency
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No unassigned sites found for the current filter.
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
