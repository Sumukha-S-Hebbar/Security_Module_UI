
'use client';

import { useState } from 'react';
import { sites, securityAgencies } from '@/lib/data';
import type { Site, SecurityAgency } from '@/types';
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
import { FileDown, MapPin } from 'lucide-react';
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
import { SiteUploader } from './_components/site-uploader';

export default function TowercoSitesPage() {
  const [selectedAgencies, setSelectedAgencies] = useState<{
    [key: string]: string;
  }>({});
  const { toast } = useToast();

  const getAgencyForSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (!site || !site.agencyId) {
      return null;
    }
    return securityAgencies.find((a) => a.id === site.agencyId);
  };

  const assignedSites = sites.filter((site) => getAgencyForSite(site.id));
  const unassignedSites = sites.filter(
    (site) => !getAgencyForSite(site.id)
  );

  const handleAgencySelect = (siteId: string, agencyId: string) => {
    setSelectedAgencies((prev) => ({
      ...prev,
      [siteId]: agencyId,
    }));
  };

  const handleAssignAgency = (siteId: string) => {
    const agencyId = selectedAgencies[siteId];
    if (!agencyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a security agency first.',
      });
      return;
    }
    const siteName = unassignedSites.find((s) => s.id === siteId)?.name;
    const agencyName = securityAgencies.find((a) => a.id === agencyId)?.name;

    toast({
      title: 'Agency Assigned',
      description: `${agencyName} has been assigned to ${siteName}. The site will be moved to the assigned list on next refresh.`,
    });
    // In a real app, you would update the database here.
  };

  const handleDownloadReport = (site: Site) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${site.name}.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of all operational sites.
        </p>
      </div>

      <SiteUploader />

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription>
            A list of all sites with an assigned security agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Security Agency</TableHead>
                <TableHead>TowerCo</TableHead>
                <TableHead>Incidents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedSites.map((site) => {
                const agency = getAgencyForSite(site.id);
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
                    <TableCell>{agency?.name || 'Unassigned'}</TableCell>
                    <TableCell>{site.towerco}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{incidentsCount}</Badge>
                    </TableCell>
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
              A list of sites that do not have a security agency assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>TowerCo</TableHead>
                  <TableHead>Assign Agency</TableHead>
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
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedAgencies[site.id] || ''}
                          onValueChange={(value) =>
                            handleAgencySelect(site.id, value)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Agency" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityAgencies.map((agency) => (
                              <SelectItem
                                key={agency.id}
                                value={agency.id}
                              >
                                {agency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleAssignAgency(site.id)}
                          disabled={!selectedAgencies[site.id]}
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
