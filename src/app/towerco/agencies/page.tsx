
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
import { Phone, Mail, Upload, Loader2, PlusCircle, Search, MapPin, Building2, ChevronDown, ShieldAlert } from 'lucide-react';
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
import React from 'react';
import { cn } from '@/lib/utils';


const LOGGED_IN_ORG_ID = 'TCO01'; // Simulate logged-in user

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
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

async function getAgencies(): Promise<SecurityAgency[]> {
    // TODO: This is a mocked endpoint. Please replace with your actual Django API endpoint.
    const API_URL = 'https://ken.securebuddy.tel:8000/api/v1/agencies/';
    
    try {
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockAgencies;

    } catch (error) {
        console.error("Could not fetch agencies, returning empty array.", error);
        return [];
    }
}

async function getRegions(): Promise<string[]> {
    // TODO: This is a mocked endpoint. It should fetch the list of available regions from your backend.
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
    
    const loggedInOrg = useMemo(() => organizations.find(o => o.id === LOGGED_IN_ORG_ID), []);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [agenciesData, regionsData] = await Promise.all([
                getAgencies(),
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
        console.log('Uploaded file:', values.csvFile[0]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Upload Successful',
            description: `File "${values.csvFile[0].name}" has been uploaded. Agency profiles would be processed.`,
        });

        uploadForm.reset({ csvFile: undefined });
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
    
    const cities = useMemo(() => {
        if (selectedRegion === 'all') return [];
        return [...new Set(securityAgencies.filter((agency) => agency.region === selectedRegion).map((agency) => agency.city))].sort();
    }, [selectedRegion, securityAgencies]);

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
        setSelectedCity('all');
    };

    const filteredAgencies = useMemo(() => {
        return securityAgencies.filter((agency) => {
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
    }, [searchQuery, securityAgencies, selectedRegion, selectedCity]);

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
                    <p className="text-muted-foreground">
                        Add, view, and manage security agencies.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Upload Agency Profiles</DialogTitle>
                            <DialogDescription>
                                Upload a CSV file to add multiple security agency profiles at once.
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
                                                <FormLabel>Agency CSV File</FormLabel>
                                                <FormControl>
                                                <Input
                                                    id="csvFile-agency-input"
                                                    type="file"
                                                    accept=".csv"
                                                    disabled={isUploading}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                                </FormControl>
                                                <FormDescription>
                                                The CSV should contain columns: id, name, phone, email, address, city, region.
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
                                            Upload CSV
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
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Agency
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add a New Agency</DialogTitle>
                                <DialogDescription>
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
                        <CardDescription>A list of all security service providers.</CardDescription>
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
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
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
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by city" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
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
                                <TableHead>ID</TableHead>
                                <TableHead>Agency</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Sites Assigned</TableHead>
                                <TableHead>Incidents Occurred</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAgencies.length > 0 ? (
                                filteredAgencies.map((agency) => {
                                    const assignedSites = getAssignedSitesForAgency(agency.id);
                                    const assignedSitesCount = assignedSites.length;
                                    const incidentCount = getIncidentCountForAgency(agency.id);
                                    const isExpanded = expandedAgencyId === agency.id;

                                    return (
                                        <Fragment key={agency.id}>
                                            <TableRow onClick={() => handleRowClick(agency.id)} className="cursor-pointer">
                                                <TableCell>
                                                    <p className="font-medium">{agency.id}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={agency.avatar} alt={agency.name} />
                                                            <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-primary hover:underline">{agency.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                                        <a href={`mailto:${agency.email}`} onClick={(e) => e.stopPropagation()} className="truncate hover:underline">
                                                            {agency.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                                        <span>{agency.phone}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        <p>{agency.address}</p>
                                                        <p>{agency.city}, {agency.region}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                    variant="link"
                                                    className="p-0 h-auto flex items-center gap-2"
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
                                                  <div className="flex items-center gap-2">
                                                    <ShieldAlert className="h-4 w-4" />
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
                                                                                <TableCell className="font-medium">{site.id}</TableCell>
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
            </Card>
        </div>
    );
}
