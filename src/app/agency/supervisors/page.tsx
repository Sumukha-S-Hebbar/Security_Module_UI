
'use client';

import { patrollingOfficers } from '@/lib/data';
import type { PatrollingOfficer } from '@/types';
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
import { PatrollingOfficerUploader } from './_components/supervisor-uploader';
import { useToast } from '@/hooks/use-toast';

export default function AgencyPatrollingOfficersPage() {
    const { toast } = useToast();

    const handleDownloadReport = (patrollingOfficer: PatrollingOfficer) => {
        toast({
            title: 'Report Download Started',
            description: `Downloading report for ${patrollingOfficer.name}.`,
        });
        // In a real app, this would trigger a file download (e.g., CSV or PDF).
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Management</h1>
                <p className="text-muted-foreground">
                    Add, view, and manage patrolling officers and their assigned guards.
                </p>
            </div>

            <PatrollingOfficerUploader />

            <Card>
                <CardHeader>
                    <CardTitle>All Patrolling Officers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patrolling Officer</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Guards Under Him</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Actions</TableHead>
                                <TableHead className="text-right">Report</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patrollingOfficers.map((patrollingOfficer) => (
                                <TableRow key={patrollingOfficer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={patrollingOfficer.avatar} alt={patrollingOfficer.name} />
                                                <AvatarFallback>{patrollingOfficer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{patrollingOfficer.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ID: {patrollingOfficer.id}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{patrollingOfficer.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{patrollingOfficer.assignedGuards.length} Guards</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Map className="h-4 w-4" />
                                            <span>{patrollingOfficer.routes?.join(', ') || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`tel:${patrollingOfficer.phone}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Contact Patrolling Officer
                                            </a>
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadReport(patrollingOfficer)}
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
