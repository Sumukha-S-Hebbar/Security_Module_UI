
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
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
import { ArrowLeft, MapPin, Building2, Briefcase, ShieldAlert, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SiteReportPage() {
  const params = useParams();
  const router = useRouter();
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

  const agency = securityAgencies.find((a) => a.siteIds.includes(site.id));
  const siteIncidents = incidents.filter(
    (incident) => incident.siteId === site.id
  );

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${site.name}.`,
    });
    // In a real app, this would trigger a download.
  };
  
  const getStatusIndicator = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
    }
  };

  const getGuardById = (id: string) => guards.find(g => g.id === id);

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
            {site.latitude && site.longitude && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe mt-0.5 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                <div>
                  <p className="font-semibold text-foreground">Coordinates</p>
                  <p>Latitude: {site.latitude}, Longitude: {site.longitude}</p>
                </div>
              </div>
            )}
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteIncidents.map((incident) => {
                  const guard = getGuardById(incident.raisedByGuardId);
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                      <TableCell>{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
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
  );
}
