
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { patrollingOfficers, guards, sites } from '@/lib/data';
import type { PatrollingOfficer } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Phone, Map, FileDown, Upload, PlusCircle, Loader2, Search, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

const addPatrollingOfficerFormSchema = z.object({
    name: z.string().min(1, { message: 'Patrolling Officer name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    email: z.string().email({ message: 'Valid email is required.' }),
});

export default function AgencyPatrollingOfficersPage() {
    const { toast } = useToast();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const agencySites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID), []);
    const agencySiteNames = useMemo(() => new Set(agencySites.map(s => s.name)), [agencySites]);
    const agencyGuards = useMemo(() => guards.filter(g => agencySiteNames.has(g.site)), [agencySiteNames]);
    const agencyPatrollingOfficers = useMemo(() => {
        const poIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
        return patrollingOfficers.filter(po => poIds.has(po.id));
    }, [agencySites]);

    const getAssignedGuardsCount = (patrollingOfficerId: string) => {
        const sitesForPO = agencySites.filter(s => s.patrollingOfficerId === patrollingOfficerId);
        const siteNamesForPO = new Set(sitesForPO.map(s => s.name));
        return agencyGuards.filter(g => siteNamesForPO.has(g.site)).length;
    };

    const getAssignedSitesForPO = (patrollingOfficerId: string) => {
        return agencySites.filter(s => s.patrollingOfficerId === patrollingOfficerId).map(s => s.name);
    }

    const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const addForm = useForm<z.infer<typeof addPatrollingOfficerFormSchema>>({
        resolver: zodResolver(addPatrollingOfficerFormSchema),
        defaultValues: { name: '', phone: '', email: '' }
    });

    async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
        setIsUploading(true);
        console.log('Uploaded file:', values.csvFile[0]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
            title: 'Upload Successful',
            description: `File "${values.csvFile[0].name}" has been uploaded. Patrolling officer profiles would be processed.`,
        });
        uploadForm.reset({ csvFile: undefined });
        setIsUploading(false);
        setIsUploadDialogOpen(false);
    }

    async function onAddSubmit(values: z.infer<typeof addPatrollingOfficerFormSchema>) {
        setIsAdding(true);
        console.log('New patrolling officer data:', values);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
            title: 'Patrolling Officer Added',
            description: `Patrolling officer "${values.name}" has been created successfully.`,
        });
        addForm.reset();
        setIsAdding(false);
        setIsAddDialogOpen(false);
    }

    const handleDownloadReport = (patrollingOfficer: PatrollingOfficer) => {
        toast({
            title: 'Report Download Started',
            description: `Downloading report for ${patrollingOfficer.name}.`,
        });
    };

    const filteredPatrollingOfficers = useMemo(() => {
        return agencyPatrollingOfficers.filter((po) =>
            po.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.phone.includes(searchQuery)
        );
    }, [searchQuery, agencyPatrollingOfficers]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage patrolling officers and their assigned guards.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Patrolling Officers</CardTitle>
                            <CardDescription>A list of all patrolling officers in your agency.</CardDescription>
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
                                    <DialogTitle>Upload Patrolling Officer Profiles</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to add multiple patrolling officer profiles at once.
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
                                                        <FormLabel>Patrolling Officer CSV File</FormLabel>
                                                        <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept=".csv"
                                                            disabled={isUploading}
                                                            onChange={(e) => field.onChange(e.target.files)}
                                                        />
                                                        </FormControl>
                                                        <FormDescription>
                                                        The CSV should contain columns: name, phone, email.
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

                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Patrolling Officer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add a New Patrolling Officer</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details below to add a new patrolling officer.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...addForm}>
                                        <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                                            <FormField
                                                control={addForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Michael Scott" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addForm.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., 555-100-2000" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., michael.s@guardlink.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit" disabled={isAdding}>
                                                {isAdding ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Adding...
                                                    </>
                                                ) : (
                                                    "Add Patrolling Officer"
                                                )}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="relative pt-4">
                        <Search className="absolute left-2.5 top-6.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search patrolling officers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                        {filteredPatrollingOfficers.length > 0 ? (
                            filteredPatrollingOfficers.map((patrollingOfficer) => {
                                const assignedGuardsCount = getAssignedGuardsCount(patrollingOfficer.id);
                                const assignedSites = getAssignedSitesForPO(patrollingOfficer.id);
                                return (
                                <Card key={patrollingOfficer.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={patrollingOfficer.avatar} alt={patrollingOfficer.name} />
                                            <AvatarFallback>{patrollingOfficer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{patrollingOfficer.name}</CardTitle>
                                            <CardDescription>ID: {patrollingOfficer.id}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                        <span>{patrollingOfficer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                        <a href={`mailto:${patrollingOfficer.email}`} className="truncate hover:underline">
                                            {patrollingOfficer.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4 flex-shrink-0" />
                                        <span>{assignedGuardsCount} Guards</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Map className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate" title={assignedSites.join(', ')}>{assignedSites.join(', ') || 'No sites assigned'}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <a href={`tel:${patrollingOfficer.phone}`}>
                                            <Phone className="mr-2 h-4 w-4" />
                                            Contact
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadReport(patrollingOfficer)}
                                    >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Report
                                    </Button>
                                </CardFooter>
                                </Card>
                            )})
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-10">
                                No patrolling officers found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
