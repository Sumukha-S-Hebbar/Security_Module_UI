
'use client';

import { useMemo, useState } from 'react';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import { sites } from '@/lib/data/sites';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { securityAgencies } from '@/lib/data/security-agencies';
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

  const agencySiteIds = useMemo(() => {
    const agency = securityAgencies.find(a => a.id === LOGGED_IN_AGENCY_ID);
    return new Set(agency ? agency.siteIds : []);
  }, []);

  const agencySites = useMemo(() => sites.filter(site => agencySiteIds.has(site.id)), [agencySiteIds]);

  const agencyIncidents = useMemo(() => incidents.filter(incident => agencySiteIds.has(incident.siteId)), [agencySiteIds]);
  
  const agencyGuards = useMemo(() => {
    const siteNames = new Set(agencySites.map(s => s.name));
    return guards.filter(guard => siteNames.has(guard.site));
  }, [agencySites]);
  
  const agencyPatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
    return patrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencySites]);

  const monthlyFilteredIncidents = useMemo(() => {
    if (selectedMonth === 'all') {
      return agencyIncidents;
    }
    return agencyIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      return incidentDate.getMonth() === parseInt(selectedMonth, 10);
    });
  }, [agencyIncidents, selectedMonth]);

  const activeEmergencies = useMemo(() => agencyIncidents.filter(
    (incident) => incident.status === 'Active'
  ), [agencyIncidents]);

  const getGuardById = (id: string): Guard | undefined => {
    return agencyGuards.find((g) => g.id === id);
  };
  
  const getSiteById = (id: string): Site | undefined => {
    return agencySites.find((s) => s.id === id);
  };

  const getPatrollingOfficerById = (id?: string): PatrollingOfficer | undefined => {
    if (!id) return undefined;
    return agencyPatrollingOfficers.find((p) => p.id === id);
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
          <CardTitle>Active Emergency Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((incident) => {
                  const siteDetails = getSiteById(incident.siteId);
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficerDetails = getPatrollingOfficerById(incident.attendedByPatrollingOfficerId);
                  const incidentDate = new Date(incident.incidentTime);
                  
                  return (
                    <TableRow key={incident.id}>
                      <TableCell>{siteDetails?.id || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        {siteDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{guardDetails?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficerDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{incidentDate.toLocaleDateString()}</TableCell>
                      <TableCell>{incidentDate.toLocaleTimeString()}</TableCell>
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
              No active emergency incidents. All systems are normal.
            </p>
          )}
        </CardContent>
      </Card>

      <AgencyAnalyticsDashboard
        guards={agencyGuards}
        sites={agencySites}
        patrollingOfficers={agencyPatrollingOfficers}
      />

      <IncidentStatusBreakdown incidents={monthlyFilteredIncidents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuardPerformanceBreakdown guards={agencyGuards} />
        <PatrollingOfficerPerformance patrollingOfficers={agencyPatrollingOfficers} sites={agencySites} />
      </div>

      <AgencyIncidentChart incidents={monthlyFilteredIncidents} />
    </div>
  );
}
