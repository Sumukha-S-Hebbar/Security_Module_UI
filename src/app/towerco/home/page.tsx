

'use client';

import { useState, useEffect, useMemo } from 'react';
import type {
  Guard,
  PatrollingOfficer,
  SecurityAgency,
  Site,
  Incident,
  Organization,
} from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Skeleton } from '@/components/ui/skeleton';
import { securityAgencies as mockAgencies } from '@/lib/data/security-agencies';
import { incidents as mockIncidents } from '@/lib/data/incidents';
import { guards as mockGuards } from '@/lib/data/guards';
import { patrollingOfficers as mockPatrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites as mockSites } from '@/lib/data/sites';
import { organizations as mockOrganizations } from '@/lib/data/organizations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LOGGED_IN_ORG_ID = 'TCO01'; // Simulate logged-in user
const ACTIVE_INCIDENTS_PER_PAGE = 4;

interface DashboardData {
  sites: Site[];
  agencies: SecurityAgency[];
  incidents: Incident[];
  guards: Guard[];
  patrollingOfficers: PatrollingOfficer[];
  currentUserOrg: Organization | undefined;
}

async function getDashboardData(): Promise<DashboardData> {
  // TODO: Replace with your actual API endpoint.
  // This endpoint should return all the necessary data for the dashboard,
  // filtered for the logged-in TOWERCO/MNO user.
  const API_URL = '/api/v1/towerco/dashboard/';
  try {
    // const res = await fetch(API_URL);
    // if (!res.ok) {
    //   throw new Error('Failed to fetch dashboard data');
    // }
    // return res.json();
    
    // Simulating network delay and returning mock data for now.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUserOrg = mockOrganizations.find(org => org.id === LOGGED_IN_ORG_ID);
    if (!currentUserOrg) {
        throw new Error("Logged in organization not found");
    }

    const towercoSites = mockSites.filter(
      (site) => site.towerco === currentUserOrg.name
    );
    const towercoSiteIds = new Set(towercoSites.map((site) => site.id));
    const towercoIncidents = mockIncidents.filter((incident) =>
      towercoSiteIds.has(incident.siteId)
    );
    
    const towercoGuardIds = new Set(towercoSites.flatMap(s => s.guards));
    const towercoGuards = mockGuards.filter(guard => towercoGuardIds.has(guard.id));

    const towercoPatrollingOfficerIds = new Set(towercoSites.map(s => s.patrollingOfficerId).filter(Boolean));
    const towercoPatrollingOfficers = mockPatrollingOfficers.filter(po => towercoPatrollingOfficerIds.has(po.id));

    return {
      sites: towercoSites,
      agencies: mockAgencies, // Return all agencies
      incidents: towercoIncidents,
      guards: towercoGuards,
      patrollingOfficers: towercoPatrollingOfficers,
      currentUserOrg
    };

  } catch (error) {
    console.error('Could not fetch dashboard data:', error);
    return { sites: [], agencies: [], incidents: [], guards: [], patrollingOfficers: [], currentUserOrg: undefined };
  }
}

export default function TowercoHomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeIncidentsCurrentPage, setActiveIncidentsCurrentPage] = useState(1);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const activeEmergencies = useMemo(() => {
    if (!data) return [];
    return data.incidents.filter(
      (incident) => incident.status === 'Active'
    );
  }, [data]);

  const paginatedActiveEmergencies = useMemo(() => {
    const startIndex = (activeIncidentsCurrentPage - 1) * ACTIVE_INCIDENTS_PER_PAGE;
    return activeEmergencies.slice(startIndex, startIndex + ACTIVE_INCIDENTS_PER_PAGE);
  }, [activeEmergencies, activeIncidentsCurrentPage]);

  const totalActiveIncidentPages = Math.ceil(activeEmergencies.length / ACTIVE_INCIDENTS_PER_PAGE);


  const getGuardById = (id: string): Guard | undefined => {
    return data?.guards.find((g) => g.id === id);
  };

  const getPatrollingOfficerById = (id?: string): PatrollingOfficer | undefined => {
      if (!id || !data) return undefined;
      return data.patrollingOfficers.find((p) => p.id === id);
  };

  const getAgencyForSite = (siteId: string): SecurityAgency | undefined => {
    if (!data) return undefined;
    return data.agencies.find(a => a.siteIds.includes(siteId));
  }

  const getSiteById = (id: string): Site | undefined => {
      if (!data) return undefined;
      return data.sites.find(s => s.id === id);
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data || !data.currentUserOrg) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <p className="font-medium">Could not load dashboard data for your organization.</p>
        </div>
    )
  }
  
  const portalName = data.currentUserOrg.role === 'TOWERCO' ? 'TOWERCO' : 'MNO';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{portalName} Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            Welcome, {data.currentUserOrg.name}! Here's a high-level overview of your assets.
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
              <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                          <TableRow className="border-destructive/20">
                          <TableHead>Incident ID</TableHead>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Agency</TableHead>
                          <TableHead>Patrolling Officer</TableHead>
                          <TableHead>Guard</TableHead>
                          <TableHead>Incident Time</TableHead>
                          <TableHead>Contact</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {paginatedActiveEmergencies.map((incident) => {
                          const siteDetails = getSiteById(incident.siteId);
                          const guardDetails = getGuardById(incident.raisedByGuardId);
                          const patrollingOfficerDetails = getPatrollingOfficerById(
                              incident.attendedByPatrollingOfficerId
                          );
                          const agencyDetails = siteDetails ? getAgencyForSite(siteDetails.id) : undefined;
                          const incidentDate = new Date(incident.incidentTime);

                          return (
                              <TableRow 
                                key={incident.id}
                                onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                                className="cursor-pointer border-destructive/20 hover:bg-destructive/20"
                              >
                              <TableCell>
                                <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                  <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                                </Button>
                              </TableCell>
                              <TableCell>
                                  {siteDetails?.name || 'N/A'}
                              </TableCell>
                              <TableCell>{agencyDetails?.name || 'N/A'}</TableCell>
                              <TableCell>
                                  {patrollingOfficerDetails?.name || 'N/A'}
                              </TableCell>
                              <TableCell>{guardDetails?.name || 'N/A'}</TableCell>
                              <TableCell>{incidentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
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
                                          <a href={`tel:${guardDetails.phone}`} className="flex items-center gap-2 w-full">
                                              <Phone className="mr-2 h-4 w-4" />
                                              <span>Guard: {guardDetails.phone}</span>
                                          </a>
                                      </DropdownMenuItem>
                                      )}
                                      {patrollingOfficerDetails && (
                                      <DropdownMenuItem asChild>
                                          <a href={`tel:${patrollingOfficerDetails.phone}`} className="flex items-center gap-2 w-full">
                                              <Phone className="mr-2 h-4 w-4" />
                                              <span>P. Officer: {patrollingOfficerDetails.phone}</span>
                                          </a>
                                      </DropdownMenuItem>
                                      )}
                                      {agencyDetails && (
                                      <DropdownMenuItem asChild>
                                          <a href={`tel:${agencyDetails.phone}`} className="flex items-center gap-2 w-full">
                                              <Phone className="mr-2 h-4 w-4" />
                                              <span>Agency: {agencyDetails.phone}</span>
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
              </div>
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
      
      <TowercoAnalyticsDashboard
        sites={data.sites}
        agencies={data.agencies}
        incidents={data.incidents}
        guards={data.guards}
      />
      
      <AgencyPerformance
        agencies={data.agencies}
        sites={data.sites}
        incidents={data.incidents}
      />
      <SiteStatusBreakdown sites={data.sites} agencies={data.agencies} />

      <IncidentChart
        incidents={data.incidents}
        sites={data.sites}
        securityAgencies={data.agencies}
      />
    </div>
  );
}
