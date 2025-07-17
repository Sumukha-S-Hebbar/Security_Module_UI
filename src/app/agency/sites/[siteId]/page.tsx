
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import type { Incident } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, UserCheck, ShieldAlert, FileDown, Fence, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AgencySiteReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const siteId = params.siteId as string;

  const site = sites.find((s) => s.id === siteId);

  if (!site) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Site not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const siteIncidents = incidents.filter(
    (incident) => incident.siteId === site.id
  );
  
  const siteGuards = guards.filter(g => site.guards.includes(g.id));
  const patrollingOfficer = patrollingOfficers.find(p => p.id === site.patrollingOfficerId);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${site.name}.`,
    });
    // In a real app, this would trigger a download.
  };
  
  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Under Review':
        return <Badge variant="default">Under Review</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGuardById = (id: string) => guards.find(g => g.id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/agency/sites">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Sites</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Report</h1>
          <p className="text-muted-foreground">Detailed overview for {site.name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{site.name}</CardTitle>
              <CardDescription>ID: {site.id}</CardDescription>
            </div>
            <Button onClick={handleDownloadReport}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Address</p>
                <p>{site.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Patrolling Officer</p>
                <p>{patrollingOfficer ? patrollingOfficer.name : 'Unassigned'}</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <Fence className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Geofence Perimeter</p>
                <p>{site.geofencePerimeter ? `${site.geofencePerimeter}m` : 'Not set'}</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Total Incidents</p>
                <p>{siteIncidents.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Assigned Guards</CardTitle>
            </CardHeader>
            <CardContent>
                {siteGuards.length > 0 ? (
                    <div className="space-y-3">
                        {siteGuards.map(guard => (
                            <div key={guard.id} className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={guard.avatar} alt={guard.name} />
                                    <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{guard.name}</p>
                                    <p className="text-sm text-muted-foreground">ID: {guard.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No guards are assigned to this site.</p>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Incidents at {site.name}</CardTitle>
              <CardDescription>A log of all emergency incidents reported at this site.</CardDescription>
            </CardHeader>
            <CardContent>
              {siteIncidents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Guard</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siteIncidents.map((incident) => {
                      const guard = getGuardById(incident.raisedByGuardId);
                      return (
                        <TableRow key={incident.id}>
                          <TableCell>{incident.id}</TableCell>
                          <TableCell>{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                          <TableCell>{guard?.name || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(incident.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No emergency incidents have been reported for this site.</p>
              )}
            </CardContent>
          </Card>
      </div>

    </div>
  );
}

    