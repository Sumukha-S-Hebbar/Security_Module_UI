'use client';

import { useState, useMemo } from 'react';
import {
  alerts,
  guards,
  sites,
  securityAgencies,
  patrollingOfficers,
} from '@/lib/data';
import type { Alert, Guard, PatrollingOfficer, SecurityAgency } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, FileDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

export default function TowercoIncidentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');

  const towercoSites = useMemo(
    () => sites.filter((site) => site.towerco === LOGGED_IN_TOWERCO),
    []
  );

  const towercoSiteNames = useMemo(
    () => new Set(towercoSites.map((site) => site.name)),
    [towercoSites]
  );

  const towercoAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          towercoSiteNames.has(alert.site) && alert.type === 'Emergency'
      ),
    [towercoSiteNames]
  );

  const agenciesOnSites = useMemo(() => {
    const agencyIds = new Set(
      towercoSites.map((s) => s.agencyId).filter(Boolean)
    );
    return securityAgencies.filter((a) => agencyIds.has(a.id));
  }, [towercoSites]);

  const siteToAgencyMap = useMemo(() => {
    const map = new Map<string, string | undefined>();
    towercoSites.forEach((site) => {
      map.set(site.name, site.agencyId);
    });
    return map;
  }, [towercoSites]);

  const filteredIncidents = useMemo(() => {
    return towercoAlerts.filter((incident) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.id.toLowerCase().includes(searchLower) ||
        incident.site.toLowerCase().includes(searchLower) ||
        incident.guard.toLowerCase().includes(searchLower);

      const incidentAgencyId = siteToAgencyMap.get(incident.site);
      const matchesAgency =
        selectedAgency === 'all' || incidentAgencyId === selectedAgency;

      return matchesSearch && matchesAgency;
    });
  }, [searchQuery, selectedAgency, towercoAlerts, siteToAgencyMap]);

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

  const handleDownloadReport = (incident: Alert) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for incident #${incident.id}.`,
    });
    // In a real app, this would trigger a file download.
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          A log of all emergency incidents for sites managed by{' '}
          {LOGGED_IN_TOWERCO}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>
            Review and monitor all high-priority alerts.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agenciesOnSites.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <TableHead>Report</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const agency = getAgencyBySiteName(incident.site);
                  const patrollingOfficer = getPatrollingOfficerByGuardName(
                    incident.guard
                  );
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">
                        {incident.id}
                      </TableCell>
                      <TableCell>{incident.date}</TableCell>
                      <TableCell>{incident.site}</TableCell>
                      <TableCell>{agency?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{incident.guard}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/towerco/reports/${incident.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(incident)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground"
                  >
                    No incidents found for the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
