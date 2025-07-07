
import { alerts, guards, sites, securityAgencies, supervisors } from '@/lib/data';
import type { Guard, Supervisor, SecurityAgency } from '@/types';
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

export default function TowercoHomePage() {
  const activeEmergencies = alerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  );

  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const getSupervisorByGuardName = (
    guardName: string
  ): Supervisor | undefined => {
    const guard = getGuardByName(guardName);
    if (!guard || !guard.supervisorId) {
      return undefined;
    }
    return supervisors.find((s) => s.id === guard.supervisorId);
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
          <CardTitle>Current Emergency Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((alert) => {
                  const guardDetails = getGuardByName(alert.guard);
                  const supervisorDetails = getSupervisorByGuardName(
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
                        {supervisorDetails?.name || 'N/A'}
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
                            {supervisorDetails && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${supervisorDetails.phone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Supervisor
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
        sites={sites}
        agencies={securityAgencies}
        alerts={activeEmergencies}
      />
    </div>
  );
}
