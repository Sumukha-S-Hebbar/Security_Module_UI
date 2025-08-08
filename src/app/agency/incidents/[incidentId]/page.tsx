
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
import { ArrowLeft, MapPin, Briefcase, UserCheck, User, Calendar, FileDown, Phone, Mail, Upload, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const incidentTypes = [
  'SOS',
  'Suspicious Activity',
  'Theft',
  'Vandalism',
  'Trespassing',
  'Safety Hazard',
  'Other',
] as const;


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
  const [incidentType, setIncidentType] = useState(incident?.incidentType);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      const updatedIncident = incidentStore.getIncidentById(incidentId);
      setIncident(updatedIncident);
      if (updatedIncident) {
        setDescription(updatedIncident.description || '');
        setResolutionNotes(updatedIncident.resolutionNotes || '');
        setIncidentType(updatedIncident.incidentType);
      }
    });
    
    const currentIncident = incidentStore.getIncidentById(incidentId);
    if (currentIncident) {
        setDescription(currentIncident.description || '');
        setResolutionNotes(currentIncident.resolutionNotes || '');
        setIncidentType(currentIncident.incidentType);
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
  const agency = site ? securityAgencies.find((a) => a.siteIds?.includes(site.id)) : undefined;
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
    if (!incidentType) {
        toast({ variant: 'destructive', title: 'Error', description: 'Incident type is required.' });
        return;
    }
    if (!description) {
        toast({ variant: 'destructive', title: 'Error', description: 'Incident description is required.' });
        return;
    }
    
    const mediaUrls = incidentFiles ? Array.from(incidentFiles).map(file => `https://placehold.co/600x400.png?text=${encodeURIComponent(file.name)}`) : [];

    incidentStore.updateIncident(incident.id, { 
      description, 
      incidentType, 
      initialIncidentMediaUrl: [...(incident.initialIncidentMediaUrl || []), ...mediaUrls],
      status: 'Under Review'
    });

    toast({
        title: "Incident Details Saved",
        description: `Initial report for incident #${incident.id} has been saved and is now under review.`
    });
  };

  const handleMediaUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentFiles) {
       toast({ variant: 'destructive', title: 'Error', description: 'Please select files to upload.' });
       return;
    }
    const mediaUrls = Array.from(incidentFiles).map(file => `https://placehold.co/600x400.png?text=${encodeURIComponent(file.name)}`);
    incidentStore.updateIncident(incident.id, {
        initialIncidentMediaUrl: [...(incident.initialIncidentMediaUrl || []), ...mediaUrls]
    });
    toast({
        title: "Media Uploaded",
        description: `${incidentFiles.length} file(s) have been added to the incident.`
    });
    setIncidentFiles(null);
    // Reset the file input visually
    const fileInput = document.getElementById('active-incident-photos') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

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
          <div className="flex items-center gap-2 text-[#FFC107]">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
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
  
  const renderMediaGallery = () => {
    if (!incident.initialIncidentMediaUrl || incident.initialIncidentMediaUrl.length === 0) {
      return null;
    }
    return (
      <div>
          <h4 className="font-semibold mb-4 text-lg">
              Incident Media Evidence
          </h4>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {incident.initialIncidentMediaUrl.map((src, index) => (
                  <div key={index} className="relative aspect-video" onClick={() => setLightboxImage(src)}>
                  <Image
                      src={src}
                      alt={`Incident evidence ${index + 1}`}
                      fill
                      className="rounded-md object-cover cursor-pointer"
                      data-ai-hint={getHintForIncident(incident)}
                  />
                  </div>
              ))}
          </div>
      </div>
    );
  };

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <Button onClick={handleDownloadReport} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {site && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Site Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
               <div>
                  <div className="text-xl font-bold">{site.site_name}</div>
                  <p className="font-medium">ID: {site.id}</p>
              </div>
              <div className='font-medium pt-2 border-t'>
                <p className='flex items-start gap-2'><MapPin className="h-4 w-4 mt-0.5" /><span>{site.site_address_line1}</span></p>
              </div>
              {site.latitude && site.longitude && (
                <div className='font-medium'>
                    <p className='flex items-start gap-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        <span>{site.latitude}, {site.longitude}</span>
                    </p>
                </div>
              )}
               <Button asChild variant="link" className="p-0 h-auto font-medium mt-2">
                  <Link href={`/agency/sites/${site.id}`}>View Full Site Report</Link>
                </Button>
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
               <div>
                  <div className="text-xl font-bold">{agency.name}</div>
                  <p className="font-medium">ID: {agency.agency_id}</p>
              </div>
              <div className="flex items-center gap-2 font-medium pt-2 border-t"><Phone className="h-4 w-4" /> <a href={`tel:${agency.phone}`} className="hover:underline">{agency.phone}</a></div>
              <div className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> <a href={`mailto:${agency.email}`} className="hover:underline">{agency.email}</a></div>
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
              <div>
                <div className="text-xl font-bold">{patrollingOfficer.name}</div>
              </div>
              <div className="flex items-center gap-2 font-medium pt-2 border-t"><Phone className="h-4 w-4" /> <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline">{patrollingOfficer.phone}</a></div>
              <div className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline">{patrollingOfficer.email}</a></div>
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
               <div>
                  <div className="text-xl font-bold">{guard.name}</div>
                </div>
              <div className="flex items-center gap-2 font-medium pt-2 border-t"><Phone className="h-4 w-4" /> <a href={`tel:${guard.phone}`} className="hover:underline">{guard.phone}</a></div>
            </CardContent>
          </Card>
        )}
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
            {incident.incidentType && (
              <div className="text-right">
                 <CardTitle className="text-xl font-bold">Incident Type</CardTitle>
                <Badge variant="destructive" className="mt-1">{incident.incidentType}</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-6 divide-y">
              {incident.status === 'Active' && (
                 <form onSubmit={handleSaveIncidentDetails} className="space-y-6">
                    <Alert variant="default" className="text-left">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Incident is Active</AlertTitle>
                        <AlertDescription>
                        This incident requires your attention. Categorize the incident, add a summary, and upload any available media. Saving these details will move the incident to "Under Review".
                        </AlertDescription>
                    </Alert>

                    <div className="text-left p-4 my-4 border rounded-lg">
                      <Label htmlFor="active-incident-photos" className="text-base font-semibold">Upload Media</Label>
                      <p className="text-sm text-muted-foreground mb-2">Anyone can upload evidence while the incident is active.</p>
                      <div className="flex items-center gap-2">
                        <Input 
                            id="active-incident-photos" 
                            type="file" 
                            multiple
                            onChange={(e) => setIncidentFiles(e.target.files)}
                            accept="image/*,video/*"
                        />
                        <Button type="button" variant="secondary" disabled={!incidentFiles} onClick={handleMediaUpload}>
                            <Upload className="mr-2 h-4 w-4"/> Upload
                        </Button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Initial Incident Report</h3>
                       <div>
                        <Label htmlFor="incident-type" className="text-base">Incident Type</Label>
                        <Select value={incidentType} onValueChange={(value) => setIncidentType(value as Incident['incidentType'])}>
                          <SelectTrigger id="incident-type" className="mt-2">
                            <SelectValue placeholder="Select an incident type" />
                          </SelectTrigger>
                          <SelectContent>
                            {incidentTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                        {renderMediaGallery()}
                   </div>

                    <CardFooter className="px-0 pt-6 justify-end">
                        <Button type="submit">
                            Save and Start Review
                        </Button>
                    </CardFooter>
                 </form>
              )}
              
              {(incident.status === 'Under Review') && (
                <div className="space-y-6">
                  <div>
                      <h4 className="font-semibold mb-2 text-lg">
                          Incident Summary
                      </h4>
                      <p className="text-muted-foreground">{incident.description}</p>
                  </div>
                  {renderMediaGallery()}
                  <div>
                      <Alert variant="default">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Awaiting Resolution</AlertTitle>
                        <AlertDescription>
                          This incident report has been submitted. The TOWERCO/MNO will review and resolve this incident. No further action is required from the agency at this time.
                        </AlertDescription>
                      </Alert>
                  </div>
                </div>
              )}

              {incident.status === 'Resolved' && (
                  <div className="space-y-6">
                      {incident.description && (
                        <div>
                            <h4 className="font-semibold mb-2 text-lg">
                                Incident Summary
                            </h4>
                            <p className="text-muted-foreground">{incident.description}</p>
                        </div>
                      )}
                      {renderMediaGallery()}
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
                                      <div key={index} className="relative aspect-video" onClick={() => setLightboxImage(src)}>
                                      <Image
                                          src={src}
                                          alt={`Resolution evidence ${index + 1}`}
                                          fill
                                          className="rounded-md object-cover cursor-pointer"
                                          data-ai-hint={'report document'}
                                      />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
        </CardContent>
      </Card>

    </div>
    {lightboxImage && (
      <div 
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in-0"
        onClick={() => setLightboxImage(null)}
      >
        <button 
            className="absolute top-4 right-4 text-white hover:text-white/80 transition-opacity"
            onClick={() => setLightboxImage(null)}
        >
            <X className="h-8 w-8" />
        </button>
        <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Image 
                src={lightboxImage} 
                alt="Enlarged incident evidence" 
                width={1200}
                height={800}
                className="rounded-lg object-contain max-w-full max-h-[90vh]"
            />
        </div>
      </div>
    )}
    </>
  );
}
