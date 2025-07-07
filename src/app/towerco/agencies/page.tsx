
'use client';

import { useState } from 'react';
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
import { Phone, Mail, Upload, Loader2, PlusCircle } from 'lucide-react';
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
                    <div className="flex items-center justify-between">
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
                                                        The CSV should contain columns: name, phone, email, address, regionServed.
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
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agency</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Region Served</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {securityAgencies.map((agency) => (
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
                                    <TableCell>{agency.regionServed}</TableCell>
                                    <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`tel:${agency.phone}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Contact Agency
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
