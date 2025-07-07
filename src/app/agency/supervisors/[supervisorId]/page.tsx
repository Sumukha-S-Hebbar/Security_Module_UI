
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { patrollingOfficers, sites, guards, alerts } from '@/lib/data';
import type { Alert, Guard, Site, PatrollingOfficer } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, FileDown, Phone, Mail, MapPin, Users, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AgencyPatrollingOfficerReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const supervisorId = params.supervisorId as string;

  const patrollingOfficer = patrollingOfficers.find((p) => p.id === supervisorId);

  if (!patrollingOfficer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Patrolling Officer not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedSites = sites.filter(site => site.patrollingOfficerId === supervisorId);
  const assignedSiteNames = new Set(assignedSites.map(s => s.name));
  const assignedGuards = guards.filter(guard => assignedSiteNames.has(guard.site));
  const assignedIncidents = alerts.filter(alert => assignedSiteNames.has(alert.site) && alert.type === 'Emergency');

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${patrollingOfficer.name}.`,
    });
  };

  const getStatusBadge = (status: Alert['status']) => {
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/agency/supervisors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Patrolling Officers</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Report</h1>
          <p className="text-muted-foreground">Detailed overview for {patrollingOfficer.name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={patrollingOfficer.avatar} alt={patrollingOfficer.name} />
                <AvatarFallback>{patrollingOfficer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{patrollingOfficer.name}</CardTitle>
                <CardDescription>ID: {patrollingOfficer.id}</CardDescription>
              </div>
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
              <Phone className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline">{patrollingOfficer.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline">{patrollingOfficer.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Total Guards</p>
                <p>{assignedGuards.length}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Total Sites</p>
                <p>{assignedSites.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Assigned Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedSites.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Site Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Guards</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedSites.map(site => (
                            <TableRow key={site.id}>
                                <TableCell className="font-medium">{site.name}</TableCell>
                                <TableCell>{site.address}</TableCell>
                                <TableCell>{site.guards.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">No sites are assigned to this officer.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Guards Under Him</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedGuards.length > 0 ? (
                <div className="space-y-3">
                    {assignedGuards.map(guard => (
                        <div key={guard.id} className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={guard.avatar} alt={guard.name} />
                                <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{guard.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {guard.id} | Site: {guard.site}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No guards are assigned to this officer's sites.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>A log of emergency incidents at sites managed by {patrollingOfficer.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.id}</TableCell>
                    <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                    <TableCell>{incident.site}</TableCell>
                    <TableCell>{incident.guard}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.callDetails}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent incidents for this officer's sites.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
