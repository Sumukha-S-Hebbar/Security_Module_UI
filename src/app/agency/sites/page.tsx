'use client';

import { useState } from 'react';
import { sites, guards, supervisors } from '@/lib/data';
import type { Site } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileDown, MapPin, Fence } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AgencySitesPage() {
  const [selectedSupervisors, setSelectedSupervisors] = useState<{
    [key: string]: string;
  }>({});
  const [geofencePerimeters, setGeofencePerimeters] = useState<{
    [key: string]: string;
  }>({});
  const { toast } = useToast();

  const getSupervisorForSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (!site || site.guards.length === 0) {
      return null;
    }
    // Assumption: all guards at a site have the same supervisor. We'll use the first guard.
    const guardId = site.guards[0];
    const guard = guards.find((g) => g.id === guardId);
    if (!guard || !guard.supervisorId) {
      return null;
    }
    return supervisors.find((s) => s.id === guard.supervisorId);
  };

  const assignedSites = sites.filter((site) => getSupervisorForSite(site.id));
  const unassignedSites = sites.filter(
    (site) => !getSupervisorForSite(site.id)
  );

  const handleSupervisorSelect = (siteId: string, supervisorId: string) => {
    setSelectedSupervisors((prev) => ({
      ...prev,
      [siteId]: supervisorId,
    }));
  };

  const handleGeofenceChange = (siteId: string, value: string) => {
    setGeofencePerimeters((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  const handleAssignSupervisor = (siteId: string) => {
    const supervisorId = selectedSupervisors[siteId];
    const perimeter = geofencePerimeters[siteId];

    if (!supervisorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a supervisor first.',
      });
      return;
    }
    if (!perimeter || Number(perimeter) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid geofence perimeter.',
      });
      return;
    }
    const siteName = unassignedSites.find((s) => s.id === siteId)?.name;
    const supervisorName = supervisors.find((s) => s.id === supervisorId)?.name;

    toast({
      title: 'Supervisor Assigned',
      description: `${supervisorName} has been assigned to ${siteName} with a ${perimeter}m geofence. The site will be moved to the assigned list on next refresh.`,
    });
    // In a real app, you would make an API call here to update the database
    // and then refetch the data or update the state locally.
  };

  const handleDownloadReport = (site: Site) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${site.name}.`,
    });
    // In a real app, this would trigger a file download (e.g., CSV or PDF).
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of all operational sites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription>
            A list of all sites with an assigned supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>TowerCo</TableHead>
                <TableHead>Incidents</TableHead>
                <TableHead>Geofence Perimeter</TableHead>
                <TableHead>Assigned On Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedSites.map((site) => {
                const supervisor = getSupervisorForSite(site.id);
                const incidentsCount = site.incidents?.length || 0;
                return (
                  <TableRow key={site.id}>
                    <TableCell>{site.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>{supervisor?.name || 'Unassigned'}</TableCell>
                    <TableCell>{site.towerco}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{incidentsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Fence className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {site.geofencePerimeter
                            ? `${site.geofencePerimeter}m`
                            : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{site.assignedOn || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadReport(site)}
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

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription>
              A list of sites that do not have a supervisor assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>TowerCo</TableHead>
                  <TableHead>Geofence (m)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>{site.towerco}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        className="w-[120px]"
                        value={geofencePerimeters[site.id] || ''}
                        onChange={(e) =>
                          handleGeofenceChange(site.id, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedSupervisors[site.id] || ''}
                          onValueChange={(value) =>
                            handleSupervisorSelect(site.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Supervisor" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((supervisor) => (
                              <SelectItem
                                key={supervisor.id}
                                value={supervisor.id}
                              >
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleAssignSupervisor(site.id)}
                          disabled={
                            !selectedSupervisors[site.id] ||
                            !geofencePerimeters[site.id]
                          }
                        >
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
