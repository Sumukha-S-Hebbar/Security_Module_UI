

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Site, SecurityAgency, PaginatedSitesResponse, Organization, User } from '@/types';
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
  FileDown,
  Users,
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
import { Skeleton } from '@/components/ui/skeleton';
import { fetchData } from '@/lib/api';


const ASSIGNED_ITEMS_PER_PAGE = 5;
const UNASSIGNED_ITEMS_PER_PAGE = 5;


const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

const addSiteFormSchema = z.object({
  org_site_id: z.string().min(1, 'Site ID is required.'),
  site_name: z.string().min(1, 'Site name is required.'),
  region: z.string().min(1, 'Region is required.'),
  city: z.string().min(1, "City is required."),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  site_address_line1: z.string().min(1, 'Address is required.'),
  site_address_line2: z.string().optional(),
  site_address_line3: z.string().optional(),
  site_zip_code: z.string().min(1, 'Zip code is required.'),
});

type ApiRegion = {
  id: number;
  name: string;
};

type ApiCity = {
    id: number;
    name: string;
}

export default function TowercoSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [securityAgencies, setSecurityAgencies] = useState<SecurityAgency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [apiRegions, setApiRegions] = useState<ApiRegion[]>([]);
  const [apiCities, setApiCities] = useState<ApiCity[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);


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
  
  const unassignedSitesRef = useRef<Map<string, HTMLTableRowElement | null>>(new Map());

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

  useEffect(() => {
    async function loadInitialData() {
        if (!loggedInOrg) return;

        setIsLoading(true);
        const orgCode = loggedInOrg.code;
        const token = localStorage.getItem('token');
        const authHeader = { 'Authorization': `Token ${token}` };

        const [sitesResponse, agenciesResponse] = await Promise.all([
            fetchData<PaginatedSitesResponse>(`http://are.towerbuddy.tel:8000/security/api/orgs/${orgCode}/sites/list/`, { headers: authHeader }),
            fetchData<{results: SecurityAgency[]}>(`http://are.towerbuddy.tel:8000/security/api/orgs/${orgCode}/security-agencies/list/`, { headers: authHeader }),
        ]);
        
        setSites(sitesResponse?.results || []);
        setSecurityAgencies(agenciesResponse?.results || []);
        setIsLoading(false);
    }
    loadInitialData();
  }, [loggedInOrg]);
  
   useEffect(() => {
    async function fetchRegions() {
      if (!loggedInUser || !loggedInUser.country) return;

      const token = localStorage.getItem('token');
      const countryId = loggedInUser.country.id;
      const url = `http://are.towerbuddy.tel:8000/security/api/regions/?country=${countryId}`;
      
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
  }, [loggedInUser, toast]);


  const assignedSites = useMemo(
    () => sites.filter((site) => site.site_status === 'Assigned'),
    [sites]
  );

  const unassignedSites = useMemo(
    () => sites.filter((site) => site.site_status === 'Unassigned'),
    [sites]
  );

  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });

  const addSiteForm = useForm<z.infer<typeof addSiteFormSchema>>({
    resolver: zodResolver(addSiteFormSchema),
  });
  
  const watchedRegion = addSiteForm.watch('region');

  useEffect(() => {
    async function fetchCities() {
        if (!watchedRegion || !loggedInUser || !loggedInUser.country) {
            setApiCities([]);
            return;
        }
        
        setIsCitiesLoading(true);
        const token = localStorage.getItem('token');
        const countryId = loggedInUser.country.id;
        const url = `http://are.towerbuddy.tel:8000/security/api/cities/?country=${countryId}&region=${watchedRegion}`;

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
  }, [searchParams, sites]); // Rerun when sites are loaded

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
    if (!loggedInOrg) {
        toast({ variant: 'destructive', title: 'Error', description: 'Organization not found. Please log in again.'});
        return;
    }

    setIsAddingSite(true);
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/sites/add/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
              ...values, 
              region: Number(values.region),
              city: Number(values.city)
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || 'Failed to add site.');
        }

        toast({
            title: 'Site Added',
            description: responseData.detail,
        });

        setSites(prev => [...prev, responseData.data]);
        addSiteForm.reset();
        setIsAddSiteDialogOpen(false);

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error adding site',
            description: error.message,
        });
    } finally {
        setIsAddingSite(false);
    }
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

  const handleAssignAgency = async (siteId: number) => {
    const agencyId = assignments[siteId.toString()];
    const numGuards = guardsRequired[siteId.toString()];
    const token = localStorage.getItem('token');

    if (!loggedInOrg || !token) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication details not found. Please log in again.' });
        return;
    }

    if (!agencyId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select an agency to assign.' });
        return;
    }

    if (!numGuards || Number(numGuards) <= 0) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please specify the number of guards required.' });
        return;
    }

    const agency = securityAgencies.find((a) => a.agency_id === agencyId);
    if (!agency) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the selected agency.' });
        return;
    }

    const payload = {
        agency_name: agency.agency_name,
        number_of_guards: Number(numGuards)
    };

    try {
        const response = await fetch(`http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/sites/${siteId}/assign-agency/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || 'Failed to assign agency.');
        }

        toast({
            title: 'Agency Assigned',
            description: responseData.detail || `${agency.agency_name} has been assigned.`,
        });

        // Optimistically update UI or re-fetch data
        setSites(sites.map(s => s.id === siteId ? { ...s, site_status: 'Assigned', assigned_agency: agency } : s));

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Assignment Failed',
            description: error.message,
        });
    }
};

  const agenciesOnSites = useMemo(() => {
    const agencyIds = new Set<string>();
    assignedSites.forEach(site => {
        if(site.assigned_agency) {
            agencyIds.add(site.assigned_agency.agency_id);
        }
    });
    return securityAgencies.filter((a) => agencyIds.has(a.agency_id));
  }, [assignedSites, securityAgencies]);

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
      const fullAddress = `${site.site_address_line1} ${site.site_address_line2 || ''}`.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        fullAddress.includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower);

      const agency = site.assigned_agency;
      const matchesAgency =
        selectedAgency === 'all' || agency?.agency_id === selectedAgency;

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
       const fullAddress = `${site.site_address_line1} ${site.site_address_line2 || ''}`.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        fullAddress.includes(searchLower);
      
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

  if (isLoading || !loggedInOrg) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
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
          <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90" onClick={handleDownloadTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Excel Template
          </Button>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
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
              <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
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
                    name="org_site_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Site ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., SITE06"
                            {...field}
                          />
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
                          <Input
                            placeholder="e.g., Skycrapper"
                            {...field}
                          />
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={addSiteForm.control}
                        name="lat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 5.88888888" {...field} />
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
                                    <Input type="number" placeholder="e.g., 54.67676767" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <FormField
                    control={addSiteForm.control}
                    name="site_address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 10Th Main"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSiteForm.control}
                    name="site_address_line2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 5th Cross Road"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSiteForm.control}
                    name="site_address_line3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 3 (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addSiteForm.control}
                    name="site_zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 560060"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingSite} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Agencies</SelectItem>
                    {agenciesOnSites.map((agency) => (
                      <SelectItem key={agency.id} value={agency.agency_id} className="font-medium">
                        {agency.agency_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={assignedSelectedRegion} onValueChange={handleAssignedRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
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
                        <TableHead className="text-foreground">Site ID</TableHead>
                        <TableHead className="text-foreground">Site Name</TableHead>
                        <TableHead className="text-foreground">Agency</TableHead>
                        <TableHead className="text-foreground">Guards</TableHead>
                        <TableHead className="text-foreground">Incidents</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAssignedSites.length > 0 ? (
                        paginatedAssignedSites.map((site) => {
                            const agency = site.assigned_agency;
                            const incidentsCount = site.total_incidents;
                            return (
                                <TableRow
                                  key={site.id}
                                  onClick={() => router.push(`/towerco/sites/${site.id}`)}
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                                >
                                    <TableCell>
                                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/towerco/sites/${site.id}`}>{site.org_site_id}</Link>
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{site.site_name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium group-hover:text-accent-foreground">
                                            <MapPin className="w-3 h-3" />
                                            {site.site_address_line1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                            <span>{agency?.agency_name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2 font-medium">
                                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                        <span>{site.guards?.length || 0}</span>
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
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-10 font-medium">
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
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
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
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
                    <TableHead className="text-foreground">Site ID</TableHead>
                    <TableHead className="text-foreground">Site</TableHead>
                    <TableHead className="text-foreground">Guards Required</TableHead>
                    <TableHead className="text-foreground">Assign Agency</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnassignedSites.length > 0 ? (
                    paginatedUnassignedSites.map((site) => {
                      return (
                        <TableRow 
                          key={site.id} 
                          ref={(el) => unassignedSitesRef.current.set(site.id.toString(), el)}
                        >
                          <TableCell className="font-medium">{site.org_site_id}</TableCell>
                          <TableCell>
                            <p className="font-medium">{site.site_name}</p>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3" />
                              {site.site_address_line1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                                type="number"
                                placeholder="e.g. 2"
                                className="w-[120px]"
                                value={guardsRequired[site.id.toString()] || ''}
                                onChange={(e) => handleGuardsRequiredChange(site.id.toString(), e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              onValueChange={(value) =>
                                handleAssignmentChange(site.id.toString(), value)
                              }
                               onClick={(e) => e.stopPropagation()}
                            >
                              <SelectTrigger className="w-[200px] font-medium">
                                <SelectValue placeholder="Select an agency" />
                              </SelectTrigger>
                              <SelectContent>
                                {securityAgencies.length > 0 ? (
                                  securityAgencies.map((agency) => (
                                    <SelectItem key={agency.id} value={agency.agency_id} className="font-medium">
                                      {agency.agency_name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground font-medium">
                                    No agencies available
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-[#00B4D8] hover:bg-[#00B4D8]/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignAgency(site.id);
                              }}
                              disabled={!assignments[site.id.toString()] || !guardsRequired[site.id.toString()]}
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
