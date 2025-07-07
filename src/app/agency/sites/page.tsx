'use client';

import { useState } from 'react';
import { sites, guards, patrollingOfficers } from '@/lib/data';
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
  const [selectedPatrollingOfficers, setSelectedPatrollingOfficers] = useState<{
    [key: string]: string;
  }>({});
  const [geofencePerimeters, setGeofencePerimeters] = useState<{
    [key: string]: string;
  }>({});
  const { toast } = useToast();

  const getPatrollingOfficerForSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    // In an agency portal, we should consider sites assigned to this agency.
    // Assuming all sites in `sites` data are for the agency.
    if (!site) return null;

    // Use a more robust way to find the PO for a site.
    // For this mock, we assume the first guard's PO is the site's PO.
    const guardAtSite = guards.find(g => g.site === site.name && g.patrollingOfficerId);
    if (!guardAtSite) return null;

    return patrollingOfficers.find((s) => s.id === guardAtSite.patrollingOfficerId);
  };

  const assignedSites = sites.filter((site) => getPatrollingOfficerForSite(site.id));
  const unassignedSites = sites.filter(
    (site) => !getPatrollingOfficerForSite(site.id)
  );

  const handlePatrollingOfficerSelect = (siteId: string, patrollingOfficerId: string) => {
    setSelectedPatrollingOfficers((prev) => ({
      ...prev,
      [siteId]: patrollingOfficerId,
    }));
  };

  const handleGeofenceChange = (siteId: string, value: string) => {
    setGeofencePerimeters((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  const handleAssignPatrollingOfficer = (siteId: string) => {
    const patrollingOfficerId = selectedPatrollingOfficers[siteId];
    const perimeter = geofencePerimeters[siteId];

    if (!patrollingOfficerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a patrolling officer first.',
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
    const patrollingOfficerName = patrollingOfficers.find((s) => s.id === patrollingOfficerId)?.name;

    toast({
      title: 'Patrolling Officer Assigned',
      description: `${patrollingOfficerName} has been assigned to ${siteName} with a ${perimeter}m geofence. The site will be moved to the assigned list on next refresh.`,
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
            A list of all sites with an assigned patrolling officer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Patrolling Officer</TableHead>
                <TableHead>Incidents</TableHead>
                <TableHead>Geofence Perimeter</TableHead>
                <TableHead>TowerCo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedSites.length > 0 ? assignedSites.map((site) => {
                const patrollingOfficer = getPatrollingOfficerForSite(site.id);
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
                    <TableCell>{patrollingOfficer?.name}</TableCell>
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
                    <TableCell>{site.towerco}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(site)}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No sites with assigned patrolling officers found.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription>
              A list of sites that do not have a patrolling officer assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Geofence (m)</TableHead>
                  <TableHead>Assign Patrolling Officer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
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
                        <Select
                          value={selectedPatrollingOfficers[site.id] || ''}
                          onValueChange={(value) =>
                            handlePatrollingOfficerSelect(site.id, value)
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
                    <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAssignPatrollingOfficer(site.id)}
                          disabled={
                            !selectedPatrollingOfficers[site.id] ||
                            !geofencePerimeters[site.id]
                          }
                        >
                          Assign
                        </Button>
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
