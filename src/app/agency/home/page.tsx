
import { alerts, guards, sites, patrollingOfficers } from '@/lib/data';
import type { Guard, PatrollingOfficer } from '@/types';
import { AgencyAnalyticsDashboard } from './_components/agency-analytics-dashboard';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, Phone } from 'lucide-react';

export default function AgencyHomePage() {
  const activeEmergencies = alerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  );

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here's a high-level overview of your operations.
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
                  <TableHead>Guard</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
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
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.site}
                      </TableCell>
                      <TableCell>{alert.guard}</TableCell>
                      <TableCell>
                        {patrollingOfficerDetails?.name}
                      </TableCell>
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

      <AgencyAnalyticsDashboard
        guards={guards}
        sites={sites}
        patrollingOfficers={patrollingOfficers}
      />
    </div>
  );
}
