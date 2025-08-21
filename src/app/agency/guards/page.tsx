
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Guard, PatrollingOfficer, Organization, User } from '@/types';
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
import { FileDown, Upload, Loader2, Search, PlusCircle, ShieldAlert, Phone, Mail } from 'lucide-react';
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
    first_name: z.string().min(1, { message: 'First name is required.' }),
    last_name: z.string().optional(),
    email: z.string().email({ message: 'Valid email is required.' }),
    employee_id: z.string().min(1, { message: 'Employee ID is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    region: z.string().min(1, { message: 'Region is required.' }),
    city: z.string().min(1, { message: 'City is required.' }),
});

type ApiRegion = {
  id: number;
  name: string;
};

type ApiCity = {
    id: number;
    name: string;
}

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [patrollingOfficers, setPatrollingOfficers] = useState<PatrollingOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');

  const [apiRegions, setApiRegions] = useState<ApiRegion[]>([]);
  const [apiCities, setApiCities] = useState<ApiCity[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

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
  
  const fetchGuardsData = useCallback(async () => {
    if (!loggedInOrg) return;
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const authHeader = { Authorization: `Token ${token}` };
      const orgCode = loggedInOrg.code;

      try {
          const guardsResponse = await fetchData<{ results: Guard[] }>(`/security/api/agency/${orgCode}/guards/list/`, { headers: authHeader });
          setGuards(guardsResponse?.results || []);

          const sitesResponse = await fetchData<{ results: Site[] }>(`/security/api/agency/${orgCode}/sites/list/`, { headers: authHeader });
          setSites(sitesResponse?.results || []);
          
          const poResponse = await fetchData<{ results: any[] }>(`/security/api/agency/${orgCode}/patrol_officers/list/`, { headers: authHeader });
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
  }, [loggedInOrg, toast]);

  useEffect(() => {
    if(loggedInOrg) {
      fetchGuardsData();
    }
  }, [loggedInOrg, fetchGuardsData]);

  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });
  
  const addGuardForm = useForm<z.infer<typeof addGuardFormSchema>>({
    resolver: zodResolver(addGuardFormSchema),
    defaultValues: { first_name: '', last_name: '', email: '', employee_id: '', phone: '', region: '', city: '' },
  });

  const watchedRegion = addGuardForm.watch('region');

  useEffect(() => {
      async function fetchRegions() {
          if (!loggedInUser || !loggedInUser.country || !isAddDialogOpen) return;

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
  }, [loggedInUser, isAddDialogOpen, toast]);

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

      if (watchedRegion) {
        addGuardForm.resetField('city');
        fetchCities();
      }
  }, [watchedRegion, loggedInUser, toast, addGuardForm]);


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
    
    if (!loggedInOrg) {
        toast({ variant: 'destructive', title: 'Error', description: 'Organization information not found.'});
        setIsAdding(false);
        return;
    }

    const token = localStorage.getItem('token');
    const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/agency/${loggedInOrg.code}/guards/add/`;

    const payload = {
        ...values,
        region: parseInt(values.region, 10),
        city: parseInt(values.city, 10),
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            const errorDetail = typeof responseData.detail === 'object' ? JSON.stringify(responseData.detail) : responseData.detail;
            throw new Error(errorDetail || 'Failed to add guard.');
        }

        toast({
            title: 'Guard Added',
            description: responseData.message,
        });
        
        addGuardForm.reset();
        setIsAdding(false);
        setIsAddDialogOpen(false);
        await fetchGuardsData(); // Re-fetch after adding

    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Add Failed',
            description: error.message,
        });
         setIsAdding(false);
    }
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
        (guard.employee_id && guard.employee_id.toLowerCase().includes(searchLower)) ||
        (guard.site && guard.site.site_name.toLowerCase().includes(searchLower)) || false;

      const matchesSite = selectedSiteFilter === 'all' || guard.site?.id.toString() === selectedSiteFilter;
      
      const poId = guard.patrolling_officer ? guard.patrolling_officer.id.toString() : null;
      const matchesPatrollingOfficer = selectedPatrollingOfficerFilter === 'all' || poId === selectedPatrollingOfficerFilter;
        
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
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Add a New Guard</DialogTitle>
                            <DialogDescription className="font-medium">
                                Fill in the details below to add a new security guard.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...addGuardForm}>
                            <form onSubmit={addGuardForm.handleSubmit(onAddGuardSubmit)} className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={addGuardForm.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter first name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addGuardForm.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter last name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={addGuardForm.control}
                                    name="employee_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter employee ID" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={addGuardForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter email address" {...field} />
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={addGuardForm.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Region</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                        control={addGuardForm.control}
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
                           <div className="space-y-1">
                                {guard.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                        <a href={`mailto:${guard.email}`} className="hover:underline font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>{guard.email}</a>
                                    </div>
                                )}
                                {guard.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                        <a href={`tel:${guard.phone}`} className="hover:underline font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>{guard.phone}</a>
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                          {guard.site ? (
                            <span className="font-medium">{guard.site.site_name}</span>
                           ) : (
                            <span className="font-medium text-muted-foreground">Unassigned</span>
                           )}
                        </TableCell>
                        <TableCell>
                            {guard.patrolling_officer ? (
                               <span className="font-medium">{poName}</span>
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

    