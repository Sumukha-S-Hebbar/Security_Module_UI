
import {
  alerts,
  guards,
  sites,
  securityAgencies,
  patrollingOfficers,
} from '@/lib/data';
import type { Guard, PatrollingOfficer, SecurityAgency } from '@/types';
import {
  Card,
  CardContent,
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
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, Phone } from 'lucide-react';
import { TowercoAnalyticsDashboard } from './_components/towerco-analytics-dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SiteStatusBreakdown } from './_components/site-status-breakdown';
import { IncidentChart } from './_components/incident-chart';
import { AgencyPerformance } from './_components/agency-performance';

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

export default function TowercoHomePage() {
  // Filter data for the logged-in towerco
  const towercoSites = sites.filter(
    (site) => site.towerco === LOGGED_IN_TOWERCO
  );
  const towercoSiteNames = new Set(towercoSites.map((site) => site.name));
  const towercoAlerts = alerts.filter((alert) =>
    towercoSiteNames.has(alert.site)
  );
  const activeEmergencies = towercoAlerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  );
  const towercoSiteAgencyIds = new Set(
    towercoSites.map((site) => site.agencyId).filter(Boolean)
  );
  const towercoAgencies = securityAgencies.filter((agency) =>
    towercoSiteAgencyIds.has(agency.id)
  );

  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const getPatrollingOfficerByGuardName = (
    guardName: string
  ): PatrollingOfficer | undefined => {
    const guard = getGuardByName(guardName);
    if (!guard) return undefined;
    const site = sites.find(s => s.name === guard.site);
    if (!site || !site.patrollingOfficerId) {
      return undefined;
    }
    return patrollingOfficers.find((s) => s.id === site.patrollingOfficerId);
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
        <h1 className="text-3xl font-bold tracking-tight">TOWERCO Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here's a high-level overview of your assets.
        </p>
      </div>

      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <CardTitle>Active Emergency Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((alert) => {
                  const guardDetails = getGuardByName(alert.guard);
                  const patrollingOfficerDetails = getPatrollingOfficerByGuardName(
                    alert.guard
                  );
                  const agencyDetails = getAgencyBySiteName(alert.site);

                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.site}
                      </TableCell>
                      <TableCell>{agencyDetails?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficerDetails?.name}
                      </TableCell>
                      <TableCell>{alert.guard}</TableCell>
                      <TableCell>{alert.date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Contact <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {guardDetails && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${guardDetails.phone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Guard
                                </a>
                              </DropdownMenuItem>
                            )}
                            {patrollingOfficerDetails && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${patrollingOfficerDetails.phone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Patrolling Officer
                                </a>
                              </DropdownMenuItem>
                            )}
                            {agencyDetails && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${agencyDetails.phone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Agency
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No active emergency calls. All systems are normal.
            </p>
          )}
        </CardContent>
      </Card>

      <TowercoAnalyticsDashboard
        sites={towercoSites}
        agencies={towercoAgencies}
        alerts={activeEmergencies}
      />

      <SiteStatusBreakdown sites={towercoSites} />

      <AgencyPerformance
        agencies={towercoAgencies}
        sites={towercoSites}
        alerts={towercoAlerts}
      />

      <IncidentChart
        alerts={towercoAlerts}
        sites={towercoSites}
        securityAgencies={towercoAgencies}
      />
    </div>
  );
}
