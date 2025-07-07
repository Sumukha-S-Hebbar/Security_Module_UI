'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { securityAgencies } from '@/lib/data';
import type { SecurityAgency } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Upload, Loader2, PlusCircle, Search } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

const addSiteFormSchema = z.object({
    name: z.string().min(1, { message: 'Site name is required.' }),
    address: z.string().min(1, { message: 'Address is required.' }),
    towerco: z.string().min(1, { message: 'TOWERCO is required.' }),
});

export default function TowercoAgenciesPage() {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingSite, setIsAddingSite] = useState(false);
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedState, setSelectedState] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');

    const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const addSiteForm = useForm<z.infer<typeof addSiteFormSchema>>({
        resolver: zodResolver(addSiteFormSchema),
        defaultValues: {
            name: '',
            address: '',
            towerco: '',
        }
    });

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

    async function onAddSiteSubmit(values: z.infer<typeof addSiteFormSchema>) {
        setIsAddingSite(true);
        console.log('New site data:', values);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Site Added',
            description: `Site "${values.name}" has been created successfully.`,
        });

        addSiteForm.reset();
        setIsAddingSite(false);
        setIsAddSiteDialogOpen(false);
    }

    const countries = useMemo(() => {
        const allCountries = securityAgencies.map((agency) => agency.country);
        return [...new Set(allCountries)];
    }, []);

    const states = useMemo(() => {
        if (selectedCountry === 'all') {
            return [];
        }
        const allStates = securityAgencies
            .filter((agency) => agency.country === selectedCountry)
            .map((agency) => agency.state);
        return [...new Set(allStates)];
    }, [selectedCountry]);

    const cities = useMemo(() => {
        if (selectedState === 'all' || selectedCountry === 'all') {
            return [];
        }
        const allCities = securityAgencies
            .filter((agency) => agency.country === selectedCountry && agency.state === selectedState)
            .map((agency) => agency.city);
        return [...new Set(allCities)];
    }, [selectedCountry, selectedState]);

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country);
        setSelectedState('all');
        setSelectedCity('all');
    };

    const handleStateChange = (state: string) => {
        setSelectedState(state);
        setSelectedCity('all');
    };


    const filteredAgencies = useMemo(() => {
        return securityAgencies.filter((agency) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                agency.name.toLowerCase().includes(searchLower) ||
                agency.email.toLowerCase().includes(searchLower) ||
                agency.address.toLowerCase().includes(searchLower);

            const matchesCountry =
                selectedCountry === 'all' || agency.country === selectedCountry;

            const matchesState =
                selectedState === 'all' || agency.state === selectedState;
            
            const matchesCity =
                selectedCity === 'all' || agency.city === selectedCity;

            return matchesSearch && matchesCountry && matchesState && matchesCity;
        });
    }, [searchQuery, selectedCountry, selectedState, selectedCity]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Agency Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage contracted security agencies.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Security Agencies</CardTitle>
                            <CardDescription>A list of all security service providers.</CardDescription>
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
                                                        The CSV should contain columns: name, phone, email, address, city, state, country.
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

                             <Dialog open={isAddSiteDialogOpen} onOpenChange={setIsAddSiteDialogOpen}>
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
                                            Fill in the details below to add a new site profile.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...addSiteForm}>
                                        <form onSubmit={addSiteForm.handleSubmit(onAddSiteSubmit)} className="space-y-4">
                                            <FormField
                                                control={addSiteForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Site Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Downtown Tower" {...field} />
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
                                                            <Input placeholder="e.g., 123 Main St, Metro City" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addSiteForm.control}
                                                name="towerco"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>TOWERCO/MNO</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., TowerCo Alpha" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit" disabled={isAddingSite}>
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
                        <Select value={selectedCountry} onValueChange={handleCountryChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={selectedState} onValueChange={handleStateChange} disabled={selectedCountry === 'all'}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                {states.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'all' || selectedCountry === 'all'}>
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
                                <TableHead>Agency</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAgencies.length > 0 ? (
                                filteredAgencies.map((agency) => (
                                    <TableRow key={agency.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={agency.avatar} alt={agency.name} />
                                                    <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{agency.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ID: {agency.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{agency.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>{agency.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                        {agency.address}
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild variant="outline" size="sm">
                                                <a href={`tel:${agency.phone}`}>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Contact Agency
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    No agencies found.
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
