'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites, securityAgencies, alerts } from '@/lib/data';
import type { Alert } from '@/types';
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
import { ArrowLeft, MapPin, Building2, Briefcase, ShieldAlert, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SiteReportPage() {
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

  const agency = securityAgencies.find((a) => a.id === site.agencyId);
  const siteIncidents = alerts.filter(
    (alert) => alert.site === site.name && alert.type === 'Emergency'
  );

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${site.name}.`,
    });
    // In a real app, this would trigger a download.
  };
  
  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Investigating':
        return <Badge variant="default">Investigating</Badge>;
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
          <Link href="/towerco/sites">
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
              <Building2 className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">TowerCo</p>
                <p>{site.towerco}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Assigned Agency</p>
                <p>{agency ? agency.name : 'Unassigned'}</p>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.id}</TableCell>
                    <TableCell>{incident.date}</TableCell>
                    <TableCell>{incident.guard}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{incident.callDetails}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No emergency incidents have been reported for this site.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
