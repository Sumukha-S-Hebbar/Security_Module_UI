
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Organization, SecurityAgency, PaginatedSitesResponse, User } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileDown,
  Search,
  ShieldAlert,
  Users,
  PlusCircle,
  Loader2,
  MapPin,
  Upload,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchData } from '@/lib/api';


const addSiteFormSchema = z.object({
    org_site_id: z.string().min(1, 'Site ID is required.'),
    site_name: z.string().min(1, 'Site name is required.'),
    site_address_line1: z.string().min(1, 'Address is required.'),
    site_address_line2: z.string().optional(),
    site_address_line3: z.string().optional(),
    region: z.string().min(1, 'Region is required.'),
    city: z.string().min(1, 'City is required.'),
    site_zip_code: z.string().min(1, 'Zip code is required.'),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
});

const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

type ApiRegion = {
  id: number;
  name: string;
};

type ApiCity = {
    id: number;
    name: string;
}

export function SitesPageClient() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusSite = searchParams.get('focusSite');

  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allAgencies, setAllAgencies] = useState<SecurityAgency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // State for filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('all');
  const [assignedSelectedRegion, setAssignedSelectedRegion] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [unassignedSelectedRegion, setUnassignedSelectedRegion] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  // State for assignment and dialogs
  const [assignment, setAssignment] = useState<{ [siteId: string]: { agencyId?: string; guards?: string } }>({});
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);

  const [apiRegions, setApiRegions] = useState<ApiRegion[]>([]);
  const [apiCities, setApiCities] = useState<ApiCity[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  
  const unassignedSitesRef = useRef(new Map<string, HTMLTableRowElement | null>());

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        const userData = localStorage.getItem('user');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
        if (userData) {
            setLoggedInUser(JSON.parse(userData));
        }
    }
  }, []);
  
  const addSiteForm = useForm<z.infer<typeof addSiteFormSchema>>({
    resolver: zodResolver(addSiteFormSchema),
  });
  
  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });
  
  const watchedRegion = addSiteForm.watch('region');

  const fetchSitesAndAgencies = useCallback(async () => {
    if (!loggedInOrg) return;
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const authHeader = { 'Authorization': `Token ${token}` };

    try {
        const sitesResponse = await fetchData<{results: Site[]}>(`/security/api/orgs/${loggedInOrg.code}/sites/list/`, { headers: authHeader });
        setAllSites(sitesResponse?.results || []);
        
        const agenciesResponse = await fetchData<{results: SecurityAgency[]}>(`/security/api/orgs/${loggedInOrg.code}/security-agencies/list`, { headers: authHeader });
        setAllAgencies(agenciesResponse?.results || []);

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load initial site and agency data.'
        });
    } finally {
        setIsLoading(false);
    }
  }, [loggedInOrg, toast]);

  useEffect(() => {
    fetchSitesAndAgencies();
  }, [fetchSitesAndAgencies]);

  useEffect(() => {
      async function fetchRegions() {
          if (!loggedInUser || !loggedInUser.country || !isAddSiteDialogOpen) return;

          const token = localStorage.getItem('token');
          const countryId = loggedInUser.country.id;
          const url = `/security/api/regions/?country=${countryId}`;
          
          try {
              const data = await fetchData<{ regions: ApiRegion[] }>(url, {
              headers: { 'Authorization': `Token ${token}` }
              });
              setApiRegions(data?.regions || []);
          } catch (error) {
              console.error("Failed to fetch regions:", error);
              toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load regions for the selection.",
              });
          }
      }
      fetchRegions();
  }, [loggedInUser, isAddSiteDialogOpen, toast]);

  useEffect(() => {
      async function fetchCities() {
          if (!watchedRegion || !loggedInUser || !loggedInUser.country) {
              setApiCities([]);
              return;
          }
          
          setIsCitiesLoading(true);
          const token = localStorage.getItem('token');
          const countryId = loggedInUser.country.id;
          const url = `/security/api/cities/?country=${countryId}&region=${watchedRegion}`;

          try {
              const data = await fetchData<{ cities: ApiCity[] }>(url, {
                  headers: { 'Authorization': `Token ${token}` }
              });
              setApiCities(data?.cities || []);
          } catch (error) {
              console.error("Failed to fetch cities:", error);
              toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not load cities for the selected region.",
              });
              setApiCities([]);
          } finally {
              setIsCitiesLoading(false);
          }
      }

      addSiteForm.resetField('city');
      fetchCities();
  }, [watchedRegion, loggedInUser, toast, addSiteForm]);


  useEffect(() => {
    const el = focusSite ? unassignedSitesRef.current.get(focusSite) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-row');
      setTimeout(() => {
        el.classList.remove('highlight-row');
      }, 2000);
    }
  }, [focusSite, allSites]);

  const assignedSites = useMemo(
    () => allSites.filter((site) => site.site_status === 'Assigned'),
    [allSites]
  );
  const unassignedSites = useMemo(
    () => allSites.filter((site) => site.site_status === 'Unassigned'),
    [allSites]
  );

  const assignedRegions = useMemo(() => [...new Set(assignedSites.map((site) => site.region))].sort(), [assignedSites]);
  const assignedCities = useMemo(() => {
    if (assignedSelectedRegion === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.region === assignedSelectedRegion).map((site) => site.city))].sort();
  }, [assignedSelectedRegion, assignedSites]);

  const unassignedRegions = useMemo(() => [...new Set(unassignedSites.map((site) => site.region))].sort(), [unassignedSites]);
  const unassignedCities = useMemo(() => {
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

  const handleAssignmentChange = (siteId: string, key: 'agencyId' | 'guards', value: string) => {
      setAssignment(prev => ({
          ...prev, 
          [siteId]: {
            ...prev[siteId],
            [key]: value
          }
      }));
  }

  const handleAssignAgency = async (siteId: string) => {
    if (!loggedInOrg) return;

    const assignmentDetails = assignment[siteId];
    const agencyId = assignmentDetails?.agencyId;
    const numberOfGuards = assignmentDetails?.guards;

    if (!agencyId || !numberOfGuards || parseInt(numberOfGuards) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agency and enter a valid number of guards.',
      });
      return;
    }

    const agency = allAgencies.find(a => a.id.toString() === agencyId);
    if (!agency) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not find selected agency.' });
       return;
    }
    
    const token = localStorage.getItem('token');
    const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/orgs/${loggedInOrg.code}/sites/${siteId}/assign-agency/`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({
                agency_name: agency.name,
                number_of_guards: parseInt(numberOfGuards, 10),
            })
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.detail || 'Failed to assign agency.');
        }

        toast({
          title: 'Site Assigned Successfully',
          description: responseData.detail,
        });

        fetchSitesAndAgencies();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Assignment Failed',
            description: error.message,
        });
    }
  };

  const onAddSiteSubmit = async (values: z.infer<typeof addSiteFormSchema>) => {
    if (!loggedInOrg) {
        toast({ variant: 'destructive', title: 'Error', description: 'Organization info not loaded.' });
        return;
    }
    setIsAddingSite(true);
    const token = localStorage.getItem('token');
    const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/orgs/${loggedInOrg.code}/sites/add/`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                ...values,
                region: parseInt(values.region, 10),
                city: parseInt(values.city, 10),
            })
        });

        const responseData = await response.json();
        if (!response.ok) {
            const errorDetail = typeof responseData.detail === 'object' ? JSON.stringify(responseData.detail) : responseData.detail;
            throw new Error(errorDetail || 'Failed to add site.');
        }

        toast({
            title: 'Site Added Successfully',
            description: responseData.message,
        });
        
        fetchSitesAndAgencies(); // Refresh the list
        setIsAddSiteDialogOpen(false);
        addSiteForm.reset();

    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Add Site Failed',
            description: error.message,
        });
    } finally {
        setIsAddingSite(false);
    }
  }
  
  const onUploadSubmit = async (values: z.infer<typeof uploadFormSchema>) => {
    setIsUploading(true);
    console.log('Uploaded file:', values.excelFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.excelFile[0].name}" has been uploaded. Site profiles will be processed.`,
    });
    uploadForm.reset({ excelFile: undefined });
    const fileInput = document.getElementById('excelFile-site-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  }

  const handleDownloadTemplate = () => {
    toast({
        title: 'Template Downloaded',
        description: 'Site profile Excel template has been downloaded.',
    });
  }

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower) ||
        (site.assigned_agency && site.assigned_agency.name.toLowerCase().includes(searchLower));

      const matchesAgency = selectedAgencyFilter === 'all' || site.assigned_agency?.id.toString() === selectedAgencyFilter;
      const matchesRegion = assignedSelectedRegion === 'all' || site.region === assignedSelectedRegion;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesAgency && matchesRegion && matchesCity;
    });
  }, [
    assignedSearchQuery,
    assignedSites,
    selectedAgencyFilter,
    assignedSelectedRegion,
    assignedSelectedCity,
  ]);
  
  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower);

      const matchesRegion = unassignedSelectedRegion === 'all' || site.region === unassignedSelectedRegion;
      const matchesCity = unassignedSelectedCity === 'all' || site.city === unassignedSelectedCity;

      return matchesSearch && matchesRegion && matchesCity;
    });
  }, [unassignedSearchQuery, unassignedSites, unassignedSelectedRegion, unassignedSelectedCity]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground font-medium">
            Assign security agencies and manage your portfolio of sites.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownloadTemplate} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
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
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                        </FormControl>
                                        <FormDescription className="font-medium">
                                        The Excel file should contain columns for all site details.
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
            <Dialog open={isAddSiteDialogOpen} onOpenChange={setIsAddSiteDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Site
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add a New Site</DialogTitle>
                        <DialogDescription className="font-medium">
                            Fill in the details below to create a new site. It will be added to the unassigned list.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...addSiteForm}>
                        <form onSubmit={addSiteForm.handleSubmit(onAddSiteSubmit)} className="space-y-4">
                            <FormField
                                control={addSiteForm.control}
                                name="org_site_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter site ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addSiteForm.control}
                                name="site_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter site name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={addSiteForm.control}
                                name="site_address_line1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address Line 1</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                               <FormField
                                  control={addSiteForm.control}
                                  name="region"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Region</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                  <SelectTrigger>
                                                      <SelectValue placeholder="Select a region" />
                                                  </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                  {apiRegions.map(region => (
                                                      <SelectItem key={region.id} value={region.id.toString()}>
                                                          {region.name}
                                                      </SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
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
                                           <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRegion || isCitiesLoading}>
                                              <FormControl>
                                                  <SelectTrigger>
                                                      <SelectValue placeholder={isCitiesLoading ? "Loading cities..." : "Select a city"} />
                                                  </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                  {apiCities.map(city => (
                                                      <SelectItem key={city.id} value={city.id.toString()}>
                                                          {city.name}
                                                      </SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                            </div>
                             <FormField
                                control={addSiteForm.control}
                                name="site_zip_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter zip code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={addSiteForm.control}
                                    name="lat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Latitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter latitude" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={addSiteForm.control}
                                    name="lng"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Longitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter longitude" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isAddingSite} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                                {isAddingSite ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding Site...
                                    </>
                                ) : (
                                    "Add Site"
                                )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites ({filteredAssignedSites.length})</CardTitle>
          <CardDescription className="font-medium">
            A list of all sites that have been assigned to a security agency.
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
             <Select
              value={selectedAgencyFilter}
              onValueChange={setSelectedAgencyFilter}
            >
              <SelectTrigger className="w-full sm:w-[220px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Agencies</SelectItem>
                {allAgencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id.toString()} className="font-medium">
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignedSelectedRegion}
              onValueChange={handleAssignedRegionChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                {assignedRegions.map((region) => (
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
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                {assignedCities.map((city) => (
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
                <TableHead className="text-foreground">Towerbuddy ID</TableHead>
                <TableHead className="text-foreground">Site ID</TableHead>
                <TableHead className="text-foreground">Site Name</TableHead>
                <TableHead className="text-foreground">Location</TableHead>
                <TableHead className="text-foreground">Assigned Agency</TableHead>
                <TableHead className="text-foreground">Guards Requested</TableHead>
                <TableHead className="text-foreground">Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => {
                const incidentsCount = site.total_incidents || 0;
                return (
                  <TableRow 
                    key={site.id} 
                    onClick={() => router.push(`/towerco/sites/${site.id}`)}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                  >
                    <TableCell>
                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/towerco/sites/${site.id}`}>{site.tb_site_id}</Link>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{site.org_site_id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{site.site_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{site.city}, {site.region}</p>
                    </TableCell>
                    <TableCell>
                       <span className="font-medium">{site.assigned_agency?.name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                        <span>{site.total_guards_requested}</span>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10 font-medium">
                  No assigned sites found for the current filter.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {!isLoading && unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites ({filteredUnassignedSites.length})</CardTitle>
            <CardDescription className="font-medium">
              A list of sites that do not have a security agency assigned.
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                    {unassignedRegions.map((region) => (
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                    {unassignedCities.map((city) => (
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
                  <TableHead className="text-foreground">Towerbuddy ID</TableHead>
                  <TableHead className="text-foreground">Site ID</TableHead>
                  <TableHead className="text-foreground">Site Name</TableHead>
                  <TableHead className="text-foreground">Location</TableHead>
                  <TableHead className="text-foreground">Assign Agency</TableHead>
                  <TableHead className="text-foreground">Guards Required</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                        <TableRow 
                          key={site.id} 
                          ref={el => {
                            if (unassignedSitesRef.current) {
                                unassignedSitesRef.current.set(site.id.toString(), el);
                            }
                          }}
                        >
                          <TableCell className="font-medium">
                            {site.tb_site_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {site.org_site_id}
                          </TableCell>
                          <TableCell>
                             <div className="font-medium">{site.site_name}</div>
                          </TableCell>
                          <TableCell>
                             <p className="font-medium">{site.city}, {site.region}</p>
                          </TableCell>
                          <TableCell>
                             <div onClick={(e) => e.stopPropagation()}>
                              <Select
                                onValueChange={(value) =>
                                  handleAssignmentChange(site.id.toString(), 'agencyId', value)
                                }
                             >
                               <SelectTrigger className="w-[200px] font-medium">
                                 <SelectValue placeholder="Select an agency" />
                               </SelectTrigger>
                               <SelectContent>
                                {allAgencies.map(agency => (
                                    <SelectItem key={agency.id} value={agency.id.toString()}>{agency.name}</SelectItem>
                                ))}
                               </SelectContent>
                              </Select>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Input
                                type="number"
                                placeholder="Number of guards"
                                className="w-[120px]"
                                value={assignment[site.id.toString()]?.guards || ''}
                                onChange={(e) => handleAssignmentChange(site.id.toString(), 'guards', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                          </TableCell>
                          <TableCell className="text-right">
                             <Button
                                size="sm"
                                onClick={() => handleAssignAgency(site.id.toString())}
                                disabled={!assignment[site.id.toString()]?.agencyId || !assignment[site.id.toString()]?.guards}
                                className="bg-[#00B4D8] hover:bg-[#00B4D8]/90"
                              >
                                Assign
                              </Button>
                          </TableCell>
                        </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground font-medium py-10">
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
  );
}
