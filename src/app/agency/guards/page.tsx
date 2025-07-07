'use client';

import { useState } from 'react';
import type { PatrollingOfficer, Site, Guard } from '@/types';
import { guards, patrollingOfficers, sites } from '@/lib/data';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuardUploader } from './_components/guard-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const [selectedPatrollingOfficers, setSelectedPatrollingOfficers] = useState<{
    [key: string]: string;
  }>({});
  const [selectedSites, setSelectedSites] = useState<{
    [key: string]: string;
  }>({});

  const getPatrollingOfficerById = (id?: string) =>
    patrollingOfficers.find((s) => s.id === id);

  const assignedGuards = guards.filter((guard) => guard.patrollingOfficerId);
  const unassignedGuards = guards.filter((guard) => !guard.patrollingOfficerId);

  const handlePatrollingOfficerSelect = (guardId: string, patrollingOfficerId: string) => {
    setSelectedPatrollingOfficers((prev) => ({
      ...prev,
      [guardId]: patrollingOfficerId,
    }));
    // When patrolling officer changes, reset the site selection for that guard
    setSelectedSites((prev) => {
      const newState = { ...prev };
      delete newState[guardId];
      return newState;
    });
  };

  const handleSiteSelect = (guardId: string, siteId: string) => {
    setSelectedSites((prev) => ({
      ...prev,
      [guardId]: siteId,
    }));
  };

  const handleAssign = (guardId: string) => {
    const patrollingOfficerId = selectedPatrollingOfficers[guardId];
    const siteId = selectedSites[guardId];
    if (!patrollingOfficerId || !siteId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a patrolling officer and a site.',
      });
      return;
    }
    const guardName = guards.find((g) => g.id === guardId)?.name;
    const patrollingOfficerName = patrollingOfficers.find((s) => s.id === patrollingOfficerId)?.name;
    const siteName = sites.find((s) => s.id === siteId)?.name;

    toast({
      title: 'Guard Assigned',
      description: `${guardName} has been assigned to ${siteName} under patrolling officer ${patrollingOfficerName}. The guard will be moved to the assigned list on next refresh.`,
    });
    // In a real app, you would make an API call here to update the database
    // and then refetch the data or update the state locally.
  };

  const handleDownloadReport = (guard: Guard) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${guard.name}.`,
    });
    // In a real app, this would trigger a file download.
  };

  // Determine which sites are managed by which patrolling officer
  const siteToPatrollingOfficerMap: Record<string, string> = {};
  sites.forEach((site) => {
    const firstAssignedGuard = guards.find(
      (g) => g.patrollingOfficerId && g.site === site.name
    );
    if (firstAssignedGuard) {
      siteToPatrollingOfficerMap[site.id] = firstAssignedGuard.patrollingOfficerId!;
    }
  });

  const unassignedSitesList = sites.filter(
    (site) => !siteToPatrollingOfficerMap[site.id]
  );

  const patrollingOfficerToAvailableSitesMap: Record<string, Site[]> =
    patrollingOfficers.reduce(
      (acc, patrollingOfficer) => {
        const managedSites = sites.filter(
          (site) => siteToPatrollingOfficerMap[site.id] === patrollingOfficer.id
        );
        acc[patrollingOfficer.id] = [...managedSites, ...unassignedSitesList].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        return acc;
      },
      {} as Record<string, Site[]>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Security Guard Management
        </h1>
        <p className="text-muted-foreground">
          Add, view, and manage guard profiles and their assignments.
        </p>
      </div>

      <GuardUploader />

      <Card>
        <CardHeader>
          <CardTitle>Assigned Security Guards</CardTitle>
          <CardDescription>
            A list of all guards with an assigned patrolling officer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guard</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Incidents at Site</TableHead>
                <TableHead>Patrolling Officer</TableHead>
                <TableHead>Perimeter Accuracy</TableHead>
                <TableHead>Selfie Check-in Accuracy</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedGuards.map((guard) => {
                const patrollingOfficer = getPatrollingOfficerById(guard.patrollingOfficerId);
                const siteDetails = sites.find((s) => s.name === guard.site);
                const incidentsCount = siteDetails?.incidents?.length || 0;
                const selfieAccuracy =
                  guard.totalSelfieRequests > 0
                    ? Math.round(
                        ((guard.totalSelfieRequests - guard.missedSelfieCount) /
                          guard.totalSelfieRequests) *
                          100
                      )
                    : 100;
                return (
                  <TableRow key={guard.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={guard.avatar} alt={guard.name} />
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
                    <TableCell>
                      <Badge variant="secondary">{incidentsCount}</Badge>
                    </TableCell>
                    <TableCell>{patrollingOfficer?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      {guard.performance?.perimeterAccuracy}%
                    </TableCell>
                    <TableCell>{selfieAccuracy}%</TableCell>
                    <TableCell>{guard.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(guard)}
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

      {unassignedGuards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Security Guards</CardTitle>
            <CardDescription>
              Assign a patrolling officer and site to a guard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assign Patrolling Officer</TableHead>
                  <TableHead>Assign Site</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedGuards.map((guard) => {
                  const selectedPatrollingOfficerId = selectedPatrollingOfficers[guard.id];
                  const availableSites = selectedPatrollingOfficerId
                    ? patrollingOfficerToAvailableSitesMap[selectedPatrollingOfficerId]
                    : [];

                  return (
                    <TableRow key={guard.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={guard.avatar} alt={guard.name} />
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
                      <TableCell>{guard.phone}</TableCell>
                      <TableCell>
                        <Select
                          value={selectedPatrollingOfficers[guard.id] || ''}
                          onValueChange={(value) =>
                            handlePatrollingOfficerSelect(guard.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Patrolling Officer" />
                          </SelectTrigger>
                          <SelectContent>
                            {patrollingOfficers.map((patrollingOfficer) => (
                              <SelectItem
                                key={patrollingOfficer.id}
                                value={patrollingOfficer.id}
                              >
                                {patrollingOfficer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={selectedSites[guard.id] || ''}
                          onValueChange={(value) =>
                            handleSiteSelect(guard.id, value)
                          }
                          disabled={!selectedPatrollingOfficerId}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Site" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSites.length > 0 ? (
                              availableSites.map((site) => (
                                <SelectItem key={site.id} value={site.id}>
                                  {site.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-sites" disabled>
                                Select patrolling officer first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(guard.id)}
                          disabled={
                            !selectedPatrollingOfficers[guard.id] ||
                            !selectedSites[guard.id]
                          }
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
