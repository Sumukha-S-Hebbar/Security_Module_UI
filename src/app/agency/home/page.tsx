
'use client';

import { useMemo, useState } from 'react';
import { alerts, guards, sites, patrollingOfficers } from '@/lib/data';
import type { Guard, PatrollingOfficer, Site } from '@/types';
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
import { IncidentStatusBreakdown } from './_components/incident-status-breakdown';
import { AgencyIncidentChart } from './_components/agency-incident-chart';
import { GuardPerformanceBreakdown } from './_components/guard-performance-breakdown';
import { PatrollingOfficerPerformance } from './_components/patrolling-officer-performance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencyHomePage() {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const agencySites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID), []);
  const agencySiteNames = useMemo(() => new Set(agencySites.map(site => site.name)), [agencySites]);

  const agencyAlerts = useMemo(() => alerts.filter(alert => agencySiteNames.has(alert.site)), [agencySiteNames]);
  
  const agencyGuards = useMemo(() => guards.filter(guard => agencySiteNames.has(guard.site)), [agencySiteNames]);
  
  const agencyPatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
    return patrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencySites]);

  const monthlyFilteredAlerts = useMemo(() => {
    if (selectedMonth === 'all') {
      return agencyAlerts;
    }
    return agencyAlerts.filter(alert => {
      const alertDate = new Date(alert.date);
      return alertDate.getMonth() === parseInt(selectedMonth, 10);
    });
  }, [agencyAlerts, selectedMonth]);

  const activeEmergencies = useMemo(() => agencyAlerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  ), [agencyAlerts]);

  const getGuardByName = (name: string): Guard | undefined => {
    return agencyGuards.find((g) => g.name === name);
  };

  const getPatrollingOfficerByGuardName = (
    guardName: string
  ): PatrollingOfficer | undefined => {
    const guard = getGuardByName(guardName);
    if (!guard) return undefined;
    const site = agencySites.find(s => s.name === guard.site);
    if (!site || !site.patrollingOfficerId) {
      return undefined;
    }
    return agencyPatrollingOfficers.find((s) => s.id === site.patrollingOfficerId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome! Here's a high-level overview of your operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleString('default', {
                      month: 'long',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
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
        guards={agencyGuards}
        sites={agencySites}
        patrollingOfficers={agencyPatrollingOfficers}
      />

      <IncidentStatusBreakdown alerts={monthlyFilteredAlerts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuardPerformanceBreakdown guards={agencyGuards} />
        <PatrollingOfficerPerformance patrollingOfficers={agencyPatrollingOfficers} sites={agencySites} />
      </div>

      <AgencyIncidentChart alerts={monthlyFilteredAlerts} />
    </div>
  );
}
