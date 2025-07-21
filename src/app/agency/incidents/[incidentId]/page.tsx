
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
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Briefcase, UserCheck, User, Calendar, FileDown, Phone, Mail, Upload, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AgencyIncidentReportPage() {
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
  
  const handleSaveIncidentDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
        toast({ variant: 'destructive', title: 'Error', description: 'Incident description is required.' });
        return;
    }
    // In a real app, this would handle file uploads and update media URLs.
    console.log({ description, incidentFiles });
    
    const mediaUrls = incidentFiles ? Array.from(incidentFiles).map(file => `https://placehold.co/600x400.png?text=${encodeURIComponent(file.name)}`) : [];

    incidentStore.updateIncident(incident.id, { description, initialIncidentMediaUrl: mediaUrls });

    toast({
        title: "Incident Details Saved",
        description: `Initial report for incident #${incident.id} has been saved.`
    });
  };

  const handleStartReview = () => {
    incidentStore.updateIncident(incident.id, { status: 'Under Review' });
    toast({
      title: 'Review Started',
      description: `Incident #${incident.id} is now under review. Please add details below.`,
    });
  };

  const getStatusIndicator = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2 text-destructive">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2 text-primary">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2 text-chart-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
           <div className="flex items-center gap-2 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
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
  
  const isInitialReportSubmitted = !!incident.description;

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
              <CardTitle className="text-2xl flex items-center gap-3">
                Incident #{incident.id}
                {getStatusIndicator(incident.status)}
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
            {incident.status === 'Active' && (
              <div className="pt-6 text-center">
                <Alert variant="default" className="text-left mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Incident is Active</AlertTitle>
                  <AlertDescription>
                    This incident requires your attention. Start the review to submit an initial report and provide details.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleStartReview}>
                    Start Review
                </Button>
              </div>
            )}
            
            {incident.status === 'Under Review' && !isInitialReportSubmitted && (
                <form onSubmit={handleSaveIncidentDetails}>
                    <div className="pt-6 space-y-4">
                        <h3 className="text-xl font-semibold">Initial Incident Report</h3>
                         <div>
                              <Label htmlFor="description" className="text-base">Incident Summary</Label>
                              <Textarea 
                                  id="description" 
                                  className="mt-2" 
                                  placeholder="Provide a detailed summary of what happened, who was involved, and the immediate actions taken..." 
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  rows={5}
                              />
                          </div>
                          <div>
                              <Label htmlFor="incident-photos" className="text-base">Incident Media Evidence</Label>
                              <Input 
                                  id="incident-photos" 
                                  type="file" 
                                  multiple
                                  className="mt-2"
                                  onChange={(e) => setIncidentFiles(e.target.files)}
                                  accept="image/*,video/*"
                              />
                          </div>
                    </div>
                    <CardFooter className="px-0 pt-6 justify-end">
                        <Button type="submit">
                            Save Incident Details
                        </Button>
                    </CardFooter>
                </form>
            )}

            {(incident.status === 'Under Review' && isInitialReportSubmitted) && (
              <>
                <div className="pt-6">
                    <h4 className="font-semibold mb-2 text-lg">
                        Incident Summary
                    </h4>
                    <p className="text-muted-foreground">{incident.description}</p>
                </div>
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
                 <div className="pt-6">
                    <Alert variant="default">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Awaiting Resolution</AlertTitle>
                      <AlertDescription>
                        This incident report has been submitted. The TOWERCO/MNO will review and resolve this incident. No further action is required from the agency at this time.
                      </AlertDescription>
                    </Alert>
                </div>
              </>
            )}

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
