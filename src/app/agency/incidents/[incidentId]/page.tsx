
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { incidents } from '@/lib/data/incidents';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import type { Incident, Site, SecurityAgency, Guard, PatrollingOfficer } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Briefcase, UserCheck, User, Calendar, FileDown, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AgencyIncidentReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const incidentId = params.incidentId as string;

  const incident = incidents.find((a) => a.id === incidentId);

  if (!incident) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Incident not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const site = sites.find((s) => s.id === incident.siteId);
  const agency = site ? securityAgencies.find((a) => a.siteIds.includes(site.id)) : undefined;
  const guard = guards.find((g) => g.id === incident.raisedByGuardId);
  const patrollingOfficer = patrollingOfficers.find((p) => p.id === incident.attendedByPatrollingOfficerId);

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for incident #${incident.id}.`,
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
  
  const getHintForIncident = (incident: Incident) => {
    const details = incident.description?.toLowerCase() || '';
    if (details.includes('break-in')) {
      return 'security camera';
    }
    if (details.includes('fire')) {
      return 'fire alarm';
    }
    return 'incident evidence';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/agency/incidents">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Incidents</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Report</h1>
          <p className="text-muted-foreground">Detailed overview for Incident #{incident.id}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Incident #{incident.id}
                {getStatusBadge(incident.status)}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <Calendar className="w-4 h-4" />
                {new Date(incident.incidentTime).toLocaleString()}
              </CardDescription>
            </div>
            <Button onClick={handleDownloadReport}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 divide-y">
            {incident.description && (
              <div className="pt-6">
                  <h4 className="font-semibold mb-2 text-lg">
                      Incident Summary
                  </h4>
                  <p className="text-muted-foreground">{incident.description}</p>
              </div>
            )}
            {incident.initialIncidentMediaUrl && incident.initialIncidentMediaUrl.length > 0 && (
                <div className="pt-6">
                    <h4 className="font-semibold mb-4 text-lg">
                        Media Evidence
                    </h4>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        {incident.initialIncidentMediaUrl.map((src, index) => (
                            <div key={index} className="relative aspect-video">
                            <Image
                                src={src}
                                alt={`Incident evidence ${index + 1}`}
                                fill
                                className="rounded-md object-cover"
                                data-ai-hint={getHintForIncident(incident)}
                            />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {site && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Site Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Name:</strong> {site.name}</p>
              <p><strong>Address:</strong> {site.address}</p>
              <p><strong>TowerCo:</strong> {site.towerco}</p>
            </CardContent>
          </Card>
        )}
        {agency && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Agency Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Name:</strong> {agency.name}</p>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${agency.phone}`} className="hover:underline">{agency.phone}</a></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${agency.email}`} className="hover:underline">{agency.email}</a></div>
            </CardContent>
          </Card>
        )}
        {patrollingOfficer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Patrolling Officer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Name:</strong> {patrollingOfficer.name}</p>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline">{patrollingOfficer.phone}</a></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline">{patrollingOfficer.email}</a></div>
            </CardContent>
          </Card>
        )}
        {guard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Guard Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Name:</strong> {guard.name}</p>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${guard.phone}`} className="hover:underline">{guard.phone}</a></div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
