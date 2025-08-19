
'use client';

import { useState, useMemo, Fragment, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { PatrollingOfficer as PatrollingOfficerType, Site, Organization } from '@/types';
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
import { Users, Phone, Building2, Upload, PlusCircle, Loader2, Search, Mail, Eye, FileDown, ShieldAlert, ChevronDown } from 'lucide-react';
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
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

type ApiPatrollingOfficer = {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string | null;
    email: string;
    sites_assigned_count: number;
    site_details: {
        id: number;
        tb_site_id: string;
        org_site_id: string;
        site_name: string;
    } | null;
    incidents_count: number;
    assigned_sites_details?: any[]; // Keep this for expand logic
};

const uploadFormSchema = z.object({
  excelFile: z
    .any()
    .refine((files) => files?.length === 1, 'Excel file is required.')
    .refine((files) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(files?.[0]?.type), 'Only .xlsx or .xls files are accepted.'),
});

const addPatrollingOfficerFormSchema = z.object({
    name: z.string().min(1, { message: 'Patrolling officer name is required.' }),
    phone: z.string().min(1, { message: 'Phone is required.' }),
    email: z.string().email({ message: 'Valid email is required.' }),
});

export default function AgencyPatrollingOfficersPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [patrollingOfficers, setPatrollingOfficers] = useState<ApiPatrollingOfficer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOfficerId, setExpandedOfficerId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const orgData = localStorage.getItem('organization');
            if (orgData) {
                setLoggedInOrg(JSON.parse(orgData));
            }
        }
    }, []);

    const fetchPatrollingOfficers = useCallback(async () => {
        if (!loggedInOrg) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const url = `/security/api/agency/${loggedInOrg.code}/patrol_officers/list/`;
        try {
            const data = await fetchData<{ results: ApiPatrollingOfficer[] }>(url, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setPatrollingOfficers(data?.results || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load patrolling officers.' });
        } finally {
            setIsLoading(false);
        }
    }, [loggedInOrg, toast]);

    useEffect(() => {
        fetchPatrollingOfficers();
    }, [fetchPatrollingOfficers]);

    const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
        resolver: zodResolver(uploadFormSchema),
    });

    const addForm = useForm<z.infer<typeof addPatrollingOfficerFormSchema>>({
        resolver: zodResolver(addPatrollingOfficerFormSchema),
        defaultValues: { name: '', phone: '', email: '' }
    });

    async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
        setIsUploading(true);
        console.log('Uploaded file:', values.excelFile[0]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
            title: 'Upload Successful',
            description: `File "${values.excelFile[0].name}" has been uploaded. Patrolling officer profiles would be processed.`,
        });
        uploadForm.reset({ excelFile: undefined });
        setIsUploading(false);
        setIsUploadDialogOpen(false);
    }

    async function onAddSubmit(values: z.infer<typeof addPatrollingOfficerFormSchema>) {
        setIsAdding(true);
        console.log('New patrolling officer data:', values);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast({
            title: 'Patrolling Officer Added',
            description: `Patrolling Officer "${values.name}" has been created successfully.`,
        });
        addForm.reset();
        setIsAdding(false);
        setIsAddDialogOpen(false);
        // fetchPatrollingOfficers(); // Re-fetch after adding
    }

    const handleDownloadTemplate = () => {
        toast({
            title: 'Template Downloaded',
            description: 'Patrolling officer Excel template has been downloaded.',
        });
    }

    const filteredPatrollingOfficers = useMemo(() => {
        return patrollingOfficers.filter((po) => {
            const name = `${po.first_name} ${po.last_name || ''}`.trim();
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.employee_id.includes(searchQuery)
        });
    }, [searchQuery, patrollingOfficers]);

    const handleRowClick = (officerId: number) => {
        router.push(`/agency/patrolling-officers/${officerId}`);
    };

    const handleExpandClick = (e: React.MouseEvent, officer: ApiPatrollingOfficer) => {
        e.stopPropagation();
        setExpandedOfficerId(prevId => (prevId === officer.id ? null : officer.id));
    };

    return (
      <>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Management</h1>
                    <p className="text-muted-foreground font-medium">
                        Add, view, and manage patrolling officers.
                    </p>
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
                            <DialogTitle>Upload Patrolling Officer Profiles</DialogTitle>
                            <DialogDescription className="font-medium">
                                Upload an Excel file to add multiple patrolling officer profiles at once.
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
                                                <FormLabel>Patrolling Officer Excel File</FormLabel>
                                                <FormControl>
                                                <Input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    disabled={isUploading}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                                </FormControl>
                                                <FormDescription className="font-medium">
                                                The Excel file should contain columns: name, phone, email.
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
                                Add Patrolling Officer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add a New Patrolling Officer</DialogTitle>
                                <DialogDescription className="font-medium">
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
                                                    <Input placeholder="Enter full name" {...field} />
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
                                                    <Input placeholder="Enter phone number" {...field} />
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
                                                    <Input placeholder="Enter email address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={isAdding} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
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

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>All Patrolling Officers</CardTitle>
                            <CardDescription className="font-medium">A list of all patrolling officers in your agency.</CardDescription>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Sites Assigned</TableHead>
                        <TableHead>Incidents Occurred</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatrollingOfficers.length > 0 ? (
                            filteredPatrollingOfficers.map((patrollingOfficer) => {
                                const isExpanded = expandedOfficerId === patrollingOfficer.id;
                                const officerName = `${patrollingOfficer.first_name} ${patrollingOfficer.last_name || ''}`.trim();
                                
                                return (
                                <Fragment key={patrollingOfficer.id}>
                                    <TableRow 
                                    onClick={() => handleRowClick(patrollingOfficer.id)}
                                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                                    >
                                    <TableCell>
                                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/agency/patrolling-officers/${patrollingOfficer.id}`}>{patrollingOfficer.employee_id}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{officerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-medium">{officerName}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4 flex-shrink-0" />
                                            <a href={`mailto:${patrollingOfficer.email}`} className="truncate hover:underline font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                                {patrollingOfficer.email}
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="link"
                                        className="p-0 h-auto flex items-center gap-2 text-accent group-hover:text-accent-foreground"
                                        onClick={(e) => handleExpandClick(e, patrollingOfficer)}
                                        disabled={patrollingOfficer.sites_assigned_count === 0}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            {patrollingOfficer.sites_assigned_count}
                                            {patrollingOfficer.sites_assigned_count > 0 && (
                                                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-accent-foreground" />
                                            <span className="font-medium">{patrollingOfficer.incidents_count}</span>
                                        </div>
                                    </TableCell>
                                    </TableRow>
                                    {isExpanded && patrollingOfficer.assigned_sites_details && (
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="p-4">
                                                    <h4 className="font-semibold mb-2">Sites Assigned to {officerName}</h4>
                                                    {patrollingOfficer.assigned_sites_details.length > 0 ? (
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Towerbuddy ID</TableHead>
                                                                    <TableHead>Site ID</TableHead>
                                                                    <TableHead>Site Name</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {patrollingOfficer.assigned_sites_details.map((site: any) => (
                                                                    <TableRow 
                                                                    key={site.id} 
                                                                    onClick={() => router.push(`/agency/sites/${site.id}`)}
                                                                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                                                                    >
                                                                        <TableCell>
                                                                            <Button asChild variant="link" className="p-0 h-auto font-medium text-accent group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                                                            <Link href={`/agency/sites/${site.id}`}>{site.tb_site_id}</Link>
                                                                            </Button>
                                                                        </TableCell>
                                                                        <TableCell className="font-medium">{site.org_site_id}</TableCell>
                                                                        <TableCell>{site.site_name}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            No sites are assigned to this officer.
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            )})
                        ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-medium">
                                  No patrolling officers found.
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
