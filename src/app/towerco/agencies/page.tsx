
'use client';

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
import { Phone, Mail } from 'lucide-react';
import { AgencyUploader } from './_components/agency-uploader';

export default function TowercoAgenciesPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Agency Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage contracted security agencies.
                </p>
            </div>

            <AgencyUploader />

            <Card>
                <CardHeader>
                    <CardTitle>All Security Agencies</CardTitle>
                    <CardDescription>A list of all security service providers.</CardDescription>
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
