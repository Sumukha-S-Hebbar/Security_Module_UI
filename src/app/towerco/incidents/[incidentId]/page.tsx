
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { incidentStore } from '@/lib/data/incident-store';
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
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Briefcase, UserCheck, User, Calendar, FileDown, Phone, Mail, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

export default function IncidentReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const incidentId = params.incidentId as string;
  
  const [incident, setIncident] = useState(incidentStore.getIncidentById(incidentId));

  const [description, setDescription] = useState(incident?.description || '');
  const [resolutionNotes, setResolutionNotes] = useState(incident?.resolutionNotes || '');
  const [incidentFiles, setIncidentFiles] = useState<FileList | null>(null);
  const [resolutionFiles, setResolutionFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      const updatedIncident = incidentStore.getIncidentById(incidentId);
      setIncident(updatedIncident);
      if (updatedIncident) {
        setDescription(updatedIncident.description || '');
        setResolutionNotes(updatedIncident.resolutionNotes || '');
      }
    });
    
    // Set initial state from store
    const currentIncident = incidentStore.getIncidentById(incidentId);
    if (currentIncident) {
        setDescription(currentIncident.description || '');
        setResolutionNotes(currentIncident.resolutionNotes || '');
    }

    return () => unsubscribe();
  }, [incidentId]);

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
  };

  const handleUpdateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a PATCH request to your API,
    // handling file uploads appropriately.
    console.log({
        description,
        resolutionNotes,
        incidentFiles,
        resolutionFiles,
    });
    
    // For now, we just update the text fields. A real implementation
    // would handle file uploads and update media URLs.
    incidentStore.updateIncident(incident.id, { description, resolutionNotes });

    toast({
        title: "Incident Updated",
        description: `Details for incident #${incident.id} have been saved.`
    });
  }
  
  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
        toast({ variant: 'destructive', title: 'Error', description: 'Incident description is required to resolve.' });
        return;
    }
    if (!resolutionNotes) {
        toast({ variant: 'destructive', title: 'Error', description: 'Resolution notes are required to resolve.' });
        return;
    }

    incidentStore.updateIncident(incident.id, { description, resolutionNotes, status: 'Resolved' });

    toast({
        title: "Incident Resolved",
        description: `Incident #${incident.id} has been marked as resolved.`
    });
    router.push('/towerco/incidents');
  }

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
          <Link href="/towerco/incidents">
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
            {incident.status === 'Resolved' && (
                <>
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
                                Incident Media Evidence
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
                     {incident.resolutionNotes && (
                      <div className="pt-6">
                          <h4 className="font-semibold mb-2 text-lg">
                              Resolution Notes
                          </h4>
                          <p className="text-muted-foreground">{incident.resolutionNotes}</p>
                      </div>
                    )}
                     {incident.resolvedIncidentMediaUrl && incident.resolvedIncidentMediaUrl.length > 0 && (
                        <div className="pt-6">
                            <h4 className="font-semibold mb-4 text-lg">
                                Resolution Media Evidence
                            </h4>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                {incident.resolvedIncidentMediaUrl.map((src, index) => (
                                    <div key={index} className="relative aspect-video">
                                    <Image
                                        src={src}
                                        alt={`Resolution evidence ${index + 1}`}
                                        fill
                                        className="rounded-md object-cover"
                                        data-ai-hint={'report document'}
                                    />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {incident.status === 'Active' && (
              <div className="pt-6 text-center text-muted-foreground">
                <p>Incident summary and media will be available once the incident is under review.</p>
              </div>
            )}

            {incident.status === 'Under Review' && (
              <form onSubmit={handleUpdateIncident}>
                  <div className="pt-6 space-y-6">
                      {/* After Incident Section */}
                      <div className="space-y-4">
                          <h3 className="text-xl font-semibold">After Incident</h3>
                          <div>
                              <Label htmlFor="description" className="text-base">Incident Description</Label>
                              <Textarea 
                                  id="description" 
                                  className="mt-2" 
                                  placeholder="Provide a detailed summary of what happened..." 
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  rows={5}
                              />
                          </div>
                          <div>
                              <Label htmlFor="incident-photos" className="text-base">Photos Regarding Incident</Label>
                              <Input 
                                  id="incident-photos" 
                                  type="file" 
                                  multiple
                                  className="mt-2"
                                  onChange={(e) => setIncidentFiles(e.target.files)}
                                  accept="image/*"
                              />
                          </div>
                      </div>

                      <Separator />

                      {/* After Resolving Section */}
                      <div className="space-y-4">
                          <h3 className="text-xl font-semibold">After Resolving</h3>
                          <div>
                              <Label htmlFor="resolution-notes" className="text-base">Resolution Notes</Label>
                              <Textarea 
                                  id="resolution-notes" 
                                  className="mt-2" 
                                  placeholder="Describe the steps taken to resolve the incident..." 
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  rows={5}
                              />
                          </div>
                          <div>
                              <Label htmlFor="resolution-photos" className="text-base">Photos or Media Evidence After Resolving</Label>
                              <Input 
                                  id="resolution-photos" 
                                  type="file" 
                                  multiple
                                  className="mt-2"
                                  onChange={(e) => setResolutionFiles(e.target.files)}
                                  accept="image/*,video/*,.pdf"
                              />
                          </div>
                      </div>
                  </div>
                 <CardFooter className="px-0 pt-6 justify-end gap-2">
                    <Button type="submit" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button onClick={handleResolveIncident}>
                        Mark as Resolved
                    </Button>
                </CardFooter>
              </form>
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
