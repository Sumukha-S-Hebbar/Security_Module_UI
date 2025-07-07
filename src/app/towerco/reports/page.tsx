
'use client';

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

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

export default function TowercoIncidentsPage() {
  const towercoSites = sites.filter(
    (site) => site.towerco === LOGGED_IN_TOWERCO
  );
  const towercoSiteNames = new Set(towercoSites.map((site) => site.name));
  const towercoAlerts = alerts.filter(
    (alert) =>
      towercoSiteNames.has(alert.site) && alert.type === 'Emergency'
  );

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          A log of all emergency incidents for sites managed by {LOGGED_IN_TOWERCO}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>
            Review and monitor all high-priority alerts.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {towercoAlerts.length > 0 ? (
                towercoAlerts.map((incident) => {
                  const agency = getAgencyBySiteName(incident.site);
                  const patrollingOfficer = getPatrollingOfficerByGuardName(incident.guard);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{incident.date}</TableCell>
                      <TableCell>{incident.site}</TableCell>
                      <TableCell>{agency?.name || 'N/A'}</TableCell>
                      <TableCell>{patrollingOfficer?.name || 'N/A'}</TableCell>
                      <TableCell>{incident.guard}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No incidents found.
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
