
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
import { Phone, Mail, Upload, Loader2 } from 'lucide-react';
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

const formSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

export default function TowercoAgenciesPage() {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onUploadSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        console.log('Uploaded file:', values.csvFile[0]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: 'Upload Successful',
            description: `File "${values.csvFile[0].name}" has been uploaded. Agency profiles would be processed.`,
        });

        form.reset({ csvFile: undefined });
        setIsLoading(false);
        setIsUploadDialogOpen(false);
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
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onUploadSubmit)}>
                                        <div className="grid gap-4 py-4">
                                            <FormField
                                                control={form.control}
                                                name="csvFile"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Agency CSV File</FormLabel>
                                                    <FormControl>
                                                    <Input
                                                        id="csvFile-agency-input"
                                                        type="file"
                                                        accept=".csv"
                                                        disabled={isLoading}
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
                                            <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
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
