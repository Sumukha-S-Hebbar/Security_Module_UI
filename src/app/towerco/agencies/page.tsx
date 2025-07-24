

'use client';

import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sites } from '@/lib/data/sites';
import { organizations } from '@/lib/data/organizations';
import { incidents } from '@/lib/data/incidents';
import type { SecurityAgency, Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Upload, Loader2, PlusCircle, Search, MapPin, Building2, ChevronDown, ShieldAlert, FileDown } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { securityAgencies as mockAgencies } from '@/lib/data/security-agencies';
import { cn } from '@/lib/utils';


const LOGGED_IN_ORG_ID = 'TCO01'; // Simulate logged-in user
const ITEMS_PER_PAGE = 5;

const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

const addAgencyFormSchema = z.object({
    id: z.string().min(1, { message: 'Agency ID is required.' }),
    name: z.string().min(1, { message: 'Agency name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    email: z.string().email({ message: 'Valid email is required.' }),
    address: z.string().min(1, { message: 'Address is required.' }),
    city: z.string().min(1, { message: 'City is required.' }),
    region: z.string().min(1, { message: 'Region is required.' }),
});

async function getAgencies(orgId: string): Promise<SecurityAgency[]> {
    const API_URL = 'https://ken.securebuddy.tel:8000/api/v1/agencies/';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const org = organizations.find(o => o.id === orgId);
        if (!org) return [];

        const orgSites = sites.filter(s => s.towerco === org.name);
        const orgSiteIds = new Set(orgSites.map(s => s.id));
        
        const relevantAgencies = mockAgencies.filter(agency => 
            agency.siteIds.some(siteId => orgSiteIds.has(siteId))
        );

        return relevantAgencies;

    } catch (error) {
        console.error("Could not fetch agencies, returning empty array.", error);
        return [];
    }
}

async function getRegions(): Promise<string[]> {
    try {
         await new Promise(resolve => setTimeout(resolve, 500));
         const uniqueRegions = [...new Set(mockAgencies.map(agency => agency.region))];
         return uniqueRegions.sort();
    } catch (error) {
        console.error("Could not fetch regions, returning empty array.", error);
        return [];
    }
}


export default function TowercoAgenciesPage() {
    const [securityAgencies, setSecurityAgencies] = useState<SecurityAgency[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isAddAgencyDialogOpen, setIsAddAgencyDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingAgency, setIsAddingAgency] = useState(false);
    const [expandedAgencyId, setExpandedAgencyId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const loggedInOrg = useMemo(() => organizations.find(o => o.id === LOGGED_IN_ORG_ID), []);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [agenciesData, regionsData] = await Promise.all([
                getAgencies(LOGGED_IN_ORG_ID),
                getRegions(),
            ]);
            setSecurityAgencies(agenciesData);
            setRegions(regionsData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const addAgencyForm = useForm<z.infer<typeof addAgencyFormSchema>>({
        resolver: zodResolver(addAgencyFormSchema),
        defaultValues: {
            id: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            region: '',
        }
    });

    const watchedRegion = addAgencyForm.watch('region');

    const citiesForAddForm = useMemo(() => {
        if (!watchedRegion) return [];
        const allCities = new Set(mockAgencies
            .filter(agency => agency.region === watchedRegion)
            .map(agency => agency.city)
        );
        return Array.from(allCities).sort();
    }, [watchedRegion]);

    useEffect(() => {
        addAgencyForm.resetField('city');
    }, [watchedRegion, addAgencyForm]);

    async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
        setIsUploading(true);
        console.log('Uploaded file:', values.excelFile[0]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Upload Successful',
            description: `File "${values.excelFile[0].name}" has been uploaded. Agency profiles would be processed.`,
        });

        uploadForm.reset({ excelFile: undefined });
        setIsUploading(false);
        setIsUploadDialogOpen(false);
    }

    async function onAddAgencySubmit(values: z.infer<typeof addAgencyFormSchema>) {
        setIsAddingAgency(true);
        console.log('New agency data:', values);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newAgency: SecurityAgency = {
            ...values,
            country: 'USA',
            avatar: `https://placehold.co/100x100.png?text=${values.name.charAt(0)}`,
            siteIds: [],
        };

        setSecurityAgencies((prevAgencies) => [newAgency, ...prevAgencies]);

        toast({
            title: 'Agency Added',
            description: `Agency "${values.name}" has been created successfully.`,
        });

        addAgencyForm.reset();
        setIsAddingAgency(false);
        setIsAddAgencyDialogOpen(false);
    }
    
    const handleDownloadTemplate = () => {
        toast({
            title: 'Template Downloaded',
            description: 'Agency profile Excel template has been downloaded.',
        });
    }

    const cities = useMemo(() => {
        if (selectedRegion === 'all') return [];
        return [...new Set(securityAgencies.filter((agency) => agency.region === selectedRegion).map((agency) => agency.city))].sort();
    }, [selectedRegion, securityAgencies]);

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
        setSelectedCity('all');
    };

    const filteredAgencies = useMemo(() => {
        const filtered = securityAgencies.filter((agency) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = (
                agency.name.toLowerCase().includes(searchLower) ||
                agency.id.toLowerCase().includes(searchLower) ||
                agency.email.toLowerCase().includes(searchLower) ||
                agency.address.toLowerCase().includes(searchLower)
            );
            
            const matchesRegion = selectedRegion === 'all' || agency.region === selectedRegion;
            const matchesCity = selectedCity === 'all' || agency.city === selectedCity;

            return matchesSearch && matchesRegion && matchesCity;
        });
        setCurrentPage(1); // Reset to first page on filter change
        return filtered;
    }, [searchQuery, securityAgencies, selectedRegion, selectedCity]);

    const paginatedAgencies = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAgencies.slice(startIndex, endIndex);
    }, [filteredAgencies, currentPage]);
    
    const totalPages = Math.ceil(filteredAgencies.length / ITEMS_PER_PAGE);

    const getAssignedSitesForAgency = (agencyId: string) => {
      if (!loggedInOrg) return [];
      const agency = securityAgencies.find(a => a.id === agencyId);
      if (!agency) return [];
      return sites.filter(s => agency.siteIds.includes(s.id) && s.towerco === loggedInOrg.name);
    };

    const getIncidentCountForAgency = (agencyId: string) => {
      const assignedSites = getAssignedSitesForAgency(agencyId);
      const siteIds = new Set(assignedSites.map(s => s.id));
      return incidents.filter(i => siteIds.has(i.siteId)).length;
    }
    
    const handleRowClick = (agencyId: string) => {
        router.push(`/towerco/agencies/${agencyId}`);
    };

    const handleExpandClick = (e: React.MouseEvent, agencyId: string) => {
        e.stopPropagation();
        setExpandedAgencyId(prevId => prevId === agencyId ? null : agencyId);
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Agency Management</h1>
                    <p className="text-muted-foreground font-medium">
                        Add, view, and manage security agencies.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleDownloadTemplate}>
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
                            <DialogTitle>Upload Agency Profiles</DialogTitle>
                            <DialogDescription className="font-medium">
                                Upload an Excel file to add multiple security agency profiles at once.
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
                                                <FormLabel>Agency Excel File</FormLabel>
                                                <FormControl>
                                                <Input
                                                    id="excelFile-agency-input"
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    disabled={isUploading}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                                </FormControl>
                                                <FormDescription className="font-medium">
                                                The Excel file should contain columns: id, name, phone, email, address, city, region.
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

                    <Dialog open={isAddAgencyDialogOpen} onOpenChange={setIsAddAgencyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Agency
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add a New Agency</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Fill in the details below to add a new security agency profile.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...addAgencyForm}>
                                <form onSubmit={addAgencyForm.handleSubmit(onAddAgencySubmit)} className="space-y-4">
                                    <FormField
                                        control={addAgencyForm.control}
                                        name="id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Agency ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., AGY04" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addAgencyForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Agency Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., SecureGuard Inc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addAgencyForm.control}
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
                                        control={addAgencyForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., contact@secureguard.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addAgencyForm.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 123 Security Blvd" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addAgencyForm.control}
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
                                                        {regions.map((region) => (
                                                            <SelectItem key={region} value={region}>
                                                                {region}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={addAgencyForm.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                 <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRegion}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a city" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {citiesForAddForm.map((city) => (
                                                            <SelectItem key={city} value={city}>
                                                                {city}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={isAddingAgency}>
                                        {isAddingAgency ? (
                                            <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Agency...
                                            </>
                                        ) : (
                                            "Add Agency"
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
                    <div>
                        <CardTitle>All Security Agencies</CardTitle>
                        <CardDescription className="font-medium">A list of all security service providers.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        <div className="relative flex-1 md:grow-0">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search agencies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                          />
                        </div>
                        <Select value={selectedRegion} onValueChange={handleRegionChange}>
                            <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                                <SelectValue placeholder="Filter by region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                                {regions.map((region) => (
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
                            <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                                <SelectValue placeholder="Filter by city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                                {cities.map((city) => (
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
                                <TableHead className="text-foreground font-bold">ID</TableHead>
                                <TableHead className="text-foreground font-bold">Agency</TableHead>
                                <TableHead className="text-foreground font-bold">Contact Info</TableHead>
                                <TableHead className="text-foreground font-bold">Location</TableHead>
                                <TableHead className="text-foreground font-bold">Sites Assigned</TableHead>
                                <TableHead className="text-foreground font-bold">Incidents Occurred</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedAgencies.length > 0 ? (
                                paginatedAgencies.map((agency) => {
                                    const assignedSites = getAssignedSitesForAgency(agency.id);
                                    const assignedSitesCount = assignedSites.length;
                                    const incidentCount = getIncidentCountForAgency(agency.id);
                                    const isExpanded = expandedAgencyId === agency.id;

                                    return (
                                        <Fragment key={agency.id}>
                                            <TableRow onClick={() => handleRowClick(agency.id)} className="cursor-pointer hover:bg-accent hover:text-accent-foreground group">
                                                <TableCell>
                                                    <p className="text-accent font-semibold group-hover:text-accent-foreground">{agency.id}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={agency.avatar} alt={agency.name} />
                                                            <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{agency.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                                        <a href={`mailto:${agency.email}`} onClick={(e) => e.stopPropagation()} className="truncate hover:underline text-accent group-hover:text-accent-foreground">
                                                            {agency.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                                        <a href={`tel:${agency.phone}`} onClick={(e) => e.stopPropagation()} className="truncate hover:underline text-accent group-hover:text-accent-foreground">
                                                          {agency.phone}
                                                        </a>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium">{agency.address}</p>
                                                        <p className="text-muted-foreground font-medium group-hover:text-accent-foreground">{agency.city}, {agency.region}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                    variant="link"
                                                    className="p-0 h-auto flex items-center gap-2 text-accent group-hover:text-accent-foreground"
                                                    onClick={(e) => handleExpandClick(e, agency.id)}
                                                    disabled={assignedSitesCount === 0}
                                                    >
                                                        <Building2 className="h-4 w-4" />
                                                        {assignedSitesCount}
                                                        {assignedSitesCount > 0 && (
                                                            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex items-center gap-2 font-medium">
                                                    <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                                    {incidentCount}
                                                  </div>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                    <TableCell colSpan={6} className="p-0">
                                                        <div className="p-4">
                                                            <h4 className="font-semibold mb-2">Sites Assigned to {agency.name}</h4>
                                                            {assignedSites.length > 0 ? (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Site ID</TableHead>
                                                                            <TableHead>Site Name</TableHead>
                                                                            <TableHead>Address</TableHead>
                                                                            <TableHead>City</TableHead>
                                                                            <TableHead>Region</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {assignedSites.map((site) => (
                                                                            <TableRow key={site.id}>
                                                                                <TableCell>{site.id}</TableCell>
                                                                                <TableCell>{site.name}</TableCell>
                                                                                <TableCell>{site.address}</TableCell>
                                                                                <TableCell>{site.city}</TableCell>
                                                                                <TableCell>{site.region}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                                    No sites from {loggedInOrg?.name} are assigned to this agency.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    )
                                })
                             ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                        No agencies found for the current filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground font-medium">
                            Showing {Math.min(filteredAgencies.length, ITEMS_PER_PAGE * currentPage)} of {filteredAgencies.length} agencies.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

