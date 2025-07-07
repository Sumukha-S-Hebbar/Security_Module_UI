
'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  Users,
  Building2,
  ShieldAlert,
  CheckCircle,
  Eye,
  MapPin,
} from 'lucide-react';
import {
  securityAgencies,
  sites,
  alerts,
  guards,
  patrollingOfficers,
} from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Alert, SecurityAgency, Guard, PatrollingOfficer } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleGenerateReport = (name: string, type: string) => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${type} ${name}.`,
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

  const getAgencyById = (agencyId?: string): SecurityAgency | undefined => {
    return securityAgencies.find((agency) => agency.id === agencyId);
  };

  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const getPatrollingOfficerByGuardName = (
    guardName: string
  ): PatrollingOfficer | undefined => {
    const guard = getGuardByName(guardName);
    if (!guard || !guard.patrollingOfficerId) {
      return undefined;
    }
    return patrollingOfficers.find((s) => s.id === guard.patrollingOfficerId);
  };

  const getAgencyBySiteName = (
    siteName: string
  ): SecurityAgency | undefined => {
    const site = sites.find((s) => s.name === siteName);
    if (!site || !site.agencyId) {
      return undefined;
    }
    return securityAgencies.find((a) => a.id === site.agencyId);
  };

  const emergencyIncidents = alerts.filter(
    (alert) => alert.type === 'Emergency'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download detailed reports for your assets.
        </p>
      </div>

      <Tabs defaultValue="agency">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="agency">Agency Reports</TabsTrigger>
          <TabsTrigger value="site">Site Reports</TabsTrigger>
          <TabsTrigger value="guard">Guard Reports</TabsTrigger>
          <TabsTrigger value="patrolling-officer">
            Patrolling Officer Reports
          </TabsTrigger>
          <TabsTrigger value="incident">Incident Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="agency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Reports</CardTitle>
              <CardDescription>
                View or download detailed reports for each security agency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Sites Managed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityAgencies.map((agency) => {
                    const agencySites = sites.filter(
                      (site) => site.agencyId === agency.id
                    );
                    return (
                      <TableRow key={agency.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={agency.avatar}
                                alt={agency.name}
                              />
                              <AvatarFallback>
                                {agency.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{agency.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {agency.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {`${agency.city}, ${agency.state}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{agencySites.length}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button asChild variant="outline" size="sm">
                            <Link href={`/towerco/agencies/${agency.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Report
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateReport(agency.name, 'Agency')
                            }
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Activity Reports</CardTitle>
              <CardDescription>
                Download reports on individual site activity and incidents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Assigned Agency</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => {
                    const agency = getAgencyById(site.agencyId);
                    const incidentsCount = site.incidents?.length || 0;
                    return (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {site.address}
                          </div>
                        </TableCell>
                        <TableCell>{agency?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{incidentsCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateReport(site.name, 'Site')
                            }
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guard Performance Reports</CardTitle>
              <CardDescription>
                Generate reports on individual guard performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Perimeter Accuracy</TableHead>
                    <TableHead>Selfie Check-in Accuracy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guards.map((guard) => {
                    const site = sites.find((s) => s.name === guard.site);
                    const agency = getAgencyById(site?.agencyId);
                    const selfieAccuracy =
                      guard.totalSelfieRequests > 0
                        ? Math.round(
                            ((guard.totalSelfieRequests -
                              guard.missedSelfieCount) /
                              guard.totalSelfieRequests) *
                              100
                          )
                        : 100;

                    return (
                      <TableRow key={guard.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={guard.avatar}
                                alt={guard.name}
                              />
                              <AvatarFallback>
                                {guard.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{guard.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {guard.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{guard.site}</TableCell>
                        <TableCell>{agency?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          {guard.performance?.perimeterAccuracy}%
                        </TableCell>
                        <TableCell>{selfieAccuracy}%</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateReport(guard.name, 'Guard')
                            }
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patrolling-officer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patrolling Officer Activity Reports</CardTitle>
              <CardDescription>
                Generate reports summarizing patrolling officer activities and team
                performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patrolling Officer</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Guards Managed</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patrollingOfficers.map((patrollingOfficer) => {
                    const firstGuard = guards.find(
                      (g) => g.patrollingOfficerId === patrollingOfficer.id
                    );
                    const site = sites.find((s) => s.name === firstGuard?.site);
                    const agency = getAgencyById(site?.agencyId);

                    const supervisedGuardIds = patrollingOfficer.assignedGuards;
                    const supervisedGuards = guards.filter((g) =>
                      supervisedGuardIds.includes(g.id)
                    );
                    const supervisedSiteNames = [
                      ...new Set(supervisedGuards.map((g) => g.site)),
                    ];
                    const supervisorIncidents = alerts.filter(
                      (alert) =>
                        alert.type === 'Emergency' &&
                        supervisedSiteNames.includes(alert.site)
                    );
                    const incidentsCount = supervisorIncidents.length;

                    return (
                      <TableRow key={patrollingOfficer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={patrollingOfficer.avatar}
                                alt={patrollingOfficer.name}
                              />
                              <AvatarFallback>
                                {patrollingOfficer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patrollingOfficer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {patrollingOfficer.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{agency?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {patrollingOfficer.assignedGuards.length} Guards
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{incidentsCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateReport(
                                patrollingOfficer.name,
                                'Patrolling Officer'
                              )
                            }
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incident" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>
                A log of all emergency incidents reported across sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Patrolling Officer</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencyIncidents.map((incident) => {
                    const agency = getAgencyBySiteName(incident.site);
                    const patrollingOfficer = getPatrollingOfficerByGuardName(
                      incident.guard
                    );
                    return (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.id}</TableCell>
                        <TableCell>{incident.date}</TableCell>
                        <TableCell>{incident.site}</TableCell>
                        <TableCell>{agency?.name || 'N/A'}</TableCell>
                        <TableCell>{patrollingOfficer?.name}</TableCell>
                        <TableCell>{incident.guard}</TableCell>
                        <TableCell>
                          {getStatusBadge(incident.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleGenerateReport(incident.id, 'Incident')
                            }
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
