

'use client';

import { useMemo, useState, useRef } from 'react';
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
  CardFooter
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
const ACTIVE_INCIDENTS_PER_PAGE = 4;

export default function AgencyHomePage() {
  const router = useRouter();
  const guardsRef = useRef<HTMLDivElement>(null);
  const officersRef = useRef<HTMLDivElement>(null);
  const sitesRef = useRef<HTMLDivElement>(null);
  const [activeIncidentsCurrentPage, setActiveIncidentsCurrentPage] = useState(1);

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
  
  const paginatedActiveEmergencies = useMemo(() => {
    const startIndex = (activeIncidentsCurrentPage - 1) * ACTIVE_INCIDENTS_PER_PAGE;
    return activeEmergencies.slice(startIndex, startIndex + ACTIVE_INCIDENTS_PER_PAGE);
  }, [activeEmergencies, activeIncidentsCurrentPage]);
  
  const totalActiveIncidentPages = Math.ceil(activeEmergencies.length / ACTIVE_INCIDENTS_PER_PAGE);

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

  const handleDashboardCardClick = (refId: 'guards' | 'officers' | 'sites') => {
    if (refId === 'guards') {
      router.push('/agency/guards');
    } else if (refId === 'officers') {
      router.push('/agency/patrolling-officers');
    } else if (refId === 'sites') {
      router.push('/agency/sites');
    }
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
          <CardTitle>Active Emergency Incidents ({activeEmergencies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-destructive/20">
                  <TableHead className="text-foreground">Incident ID</TableHead>
                  <TableHead className="text-foreground">Site Name</TableHead>
                  <TableHead className="text-foreground">Guard</TableHead>
                  <TableHead className="text-foreground">Patrolling Officer</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Incident Time</TableHead>
                  <TableHead className="text-foreground">Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActiveEmergencies.map((incident) => {
                  const siteDetails = getSiteById(incident.siteId);
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficerDetails = getPatrollingOfficerById(incident.attendedByPatrollingOfficerId);
                  const incidentDate = new Date(incident.incidentTime);
                  
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                      className="cursor-pointer border-destructive/20 hover:bg-destructive/20"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/agency/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell>
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
            <p className="text-center py-4 font-medium">
              No active emergency incidents. All systems are normal.
            </p>
          )}
        </CardContent>
         {activeEmergencies.length > 0 && (
            <CardFooter>
                 <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-destructive font-medium">
                        Showing {paginatedActiveEmergencies.length} of {activeEmergencies.length} active incidents.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveIncidentsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={activeIncidentsCurrentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium text-destructive">Page {activeIncidentsCurrentPage} of {totalActiveIncidentPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveIncidentsCurrentPage(prev => Math.min(prev + 1, totalActiveIncidentPages))}
                            disabled={activeIncidentsCurrentPage === totalActiveIncidentPages || totalActiveIncidentPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
          )}
      </Card>

      <AgencyAnalyticsDashboard
        guards={agencyGuards}
        sites={agencySites}
        patrollingOfficers={agencyPatrollingOfficers}
        onCardClick={handleDashboardCardClick}
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
