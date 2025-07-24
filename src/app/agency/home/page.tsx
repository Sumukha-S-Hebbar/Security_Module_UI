
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencyHomePage() {
  const router = useRouter();

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
          <p className="text-muted-foreground font-medium">
            Welcome! Here's a high-level overview of your operations.
          </p>
        </div>
      </div>

      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <CardTitle style={{color: '#2F2F2F'}} className='font-bold'>Active Emergency Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-destructive/20">
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Incident ID</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Site Name</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Guard</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Patrolling Officer</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Date</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Time</TableHead>
                  <TableHead style={{color: '#2F2F2F'}} className="font-bold">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((incident) => {
                  const siteDetails = getSiteById(incident.siteId);
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficerDetails = getPatrollingOfficerById(incident.attendedByPatrollingOfficerId);
                  const incidentDate = new Date(incident.incidentTime);
                  
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                      className="cursor-pointer border-destructive/20"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto" style={{color: '#2F2F2F'}} onClick={(e) => e.stopPropagation()}>
                          <Link href={`/agency/incidents/${incident.id}`} className='font-medium'>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell style={{color: '#2F2F2F'}} className='font-medium'>
                        {siteDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell style={{color: '#2F2F2F'}} className='font-medium'>{guardDetails?.name || 'N/A'}</TableCell>
                      <TableCell style={{color: '#2F2F2F'}} className='font-medium'>
                        {patrollingOfficerDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell style={{color: '#2F2F2F'}} className='font-medium'>{incidentDate.toLocaleDateString()}</TableCell>
                      <TableCell style={{color: '#2F2F2F'}} className='font-medium'>{incidentDate.toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                              Contact <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
            <p className="text-center py-4 font-medium" style={{color: '#2F2F2F'}}>
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

      <IncidentStatusBreakdown incidents={agencyIncidents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuardPerformanceBreakdown guards={agencyGuards} />
        <PatrollingOfficerPerformance patrollingOfficers={agencyPatrollingOfficers} sites={agencySites} />
      </div>

      <AgencyIncidentChart incidents={agencyIncidents} />
    </div>
  );
}
