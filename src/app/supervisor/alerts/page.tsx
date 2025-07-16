
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { alerts as initialAlerts, incidents as initialIncidents, guards, sites } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CameraOff,
  LogOut,
  Phone,
  Eye,
  ShieldAlert,
  CheckCircle,
  ChevronDown,
  FileDown,
} from 'lucide-react';
import type { Alert, Incident, Site, Guard } from '@/types';
import { useToast } from '@/hooks/use-toast';

const LOGGED_IN_SUPERVISOR_ID = 'PO01'; // Simulate logged-in Patrolling Officer

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { toast } = useToast();

  const supervisorSites = useMemo(() => sites.filter(s => s.patrollingOfficerId === LOGGED_IN_SUPERVISOR_ID), []);
  const supervisorSiteIds = useMemo(() => new Set(supervisorSites.map(s => s.id)), [supervisorSites]);
  const supervisorGuards = useMemo(() => {
      const siteNames = new Set(supervisorSites.map(s => s.name));
      return guards.filter(g => siteNames.has(g.site));
  }, [supervisorSites]);
  
  const supervisorAlerts = useMemo(() => {
    const siteNames = new Set(supervisorSites.map(s => s.name));
    return alerts.filter(a => siteNames.has(a.site));
  }, [supervisorSites, alerts]);

  const supervisorIncidents = useMemo(() => incidents.filter(i => supervisorSiteIds.has(i.siteId)), [supervisorSiteIds, incidents]);

  const getGuardById = (id: string): Guard | undefined => supervisorGuards.find((g) => g.id === id);
  const getGuardByName = (name: string): Guard | undefined => supervisorGuards.find((g) => g.name === name);
  const getSiteById = (id: string): Site | undefined => supervisorSites.find((s) => s.id === id);

  const handleStatusChange = (incidentId: string, status: Incident['status']) => {
    setIncidents((prevIncidents) =>
      prevIncidents.map((incident) =>
        incident.id === incidentId ? { ...incident, status } : incident
      )
    );
  };

  const handleDownloadReport = (incident: Incident) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for incident #${incident.id}.`,
    });
    // In a real app, this would trigger a file download.
  };

  const alertTypeDisplay = (type: Alert['type']) => {
    switch (type) {
      case 'Missed Selfie':
        return (
          <div className="flex items-center gap-2">
            <CameraOff className="h-4 w-4 text-muted-foreground" />
            <span>Missed Selfie</span>
          </div>
        );
      case 'Guard Out of Premises':
        return (
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>Guard Out of Premises</span>
          </div>
        );
      default:
        return null;
    }
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

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts Log</h1>
          <p className="text-muted-foreground">
            A historical record of all system alerts.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Emergency Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisorIncidents.map((incident) => {
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const siteDetails = getSiteById(incident.siteId);
                  const isResolved = incident.status === 'Resolved';

                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                      <TableCell>{siteDetails?.name || 'N/A'}</TableCell>
                      <TableCell>{guardDetails?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        {incident.initialIncidentMediaUrl && incident.initialIncidentMediaUrl.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No Media
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(incident.id, 'Under Review')
                              }
                              disabled={
                                incident.status === 'Under Review' ||
                                incident.status === 'Resolved'
                              }
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Start Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(incident.id, 'Resolved')
                              }
                              disabled={isResolved}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(incident)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                      </TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone />
                              Contact Guard
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guard Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {supervisorAlerts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supervisorAlerts.map((alert) => {
                    const guardDetails = getGuardByName(alert.guard);
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {alert.id}
                        </TableCell>
                        <TableCell>{alertTypeDisplay(alert.type)}</TableCell>
                        <TableCell>{alert.date}</TableCell>
                        <TableCell>{alert.site}</TableCell>
                        <TableCell>{alert.guard}</TableCell>
                        <TableCell>
                          {guardDetails ? (
                            <Button asChild variant="outline" size="sm">
                              <a href={`tel:${guardDetails.phone}`}>
                                <Phone />
                                Contact Guard
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">
                No general alerts found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedIncident && (
        <Dialog
          open={!!selectedIncident}
          onOpenChange={(isOpen) => !isOpen && setSelectedIncident(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Details for Incident #{selectedIncident.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-1 sm:grid-cols-2">
              {selectedIncident.initialIncidentMediaUrl?.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`Emergency detail ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint={
                      selectedIncident.id === 'INC001'
                        ? 'security camera'
                        : 'fire alarm'
                    }
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
