
'use client';

import { supervisors } from '@/lib/data';
import type { Supervisor } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Phone, Map, FileDown } from 'lucide-react';
import { SupervisorUploader } from './_components/supervisor-uploader';
import { useToast } from '@/hooks/use-toast';

export default function AgencySupervisorsPage() {
    const { toast } = useToast();

    const handleDownloadReport = (supervisor: Supervisor) => {
        toast({
            title: 'Report Download Started',
            description: `Downloading report for ${supervisor.name}.`,
        });
        // In a real app, this would trigger a file download (e.g., CSV or PDF).
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Supervisor Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage supervisors and their assigned guards.
                </p>
            </div>

            <SupervisorUploader />

            <Card>
                <CardHeader>
                    <CardTitle>All Supervisors</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supervisor</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Guards Under Him</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Actions</TableHead>
                                <TableHead className="text-right">Report</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisors.map((supervisor) => (
                                <TableRow key={supervisor.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={supervisor.avatar} alt={supervisor.name} />
                                                <AvatarFallback>{supervisor.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{supervisor.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {supervisor.id}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{supervisor.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{supervisor.assignedGuards.length} Guards</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Map className="h-4 w-4" />
                                            <span>{supervisor.routes?.join(', ') || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`tel:${supervisor.phone}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Contact Supervisor
                                            </a>
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadReport(supervisor)}
                                        >
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Download Report
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
