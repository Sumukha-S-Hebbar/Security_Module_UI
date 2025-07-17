
'use client';

import { useState, useEffect, useMemo } from 'react';
import type {
  Guard,
  PatrollingOfficer,
  SecurityAgency,
  Site,
  Incident,
} from '@/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { securityAgencies as mockAgencies } from '@/lib/data/security-agencies';
import { incidents as mockIncidents } from '@/lib/data/incidents';
import { guards as mockGuards } from '@/lib/data/guards';
import { patrollingOfficers as mockPatrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites as mockSites } from '@/lib/data/sites';


const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

interface DashboardData {
  sites: Site[];
  agencies: SecurityAgency[];
  incidents: Incident[];
  guards: Guard[];
  patrollingOfficers: PatrollingOfficer[];
}

async function getDashboardData(): Promise<DashboardData> {
  // TODO: Replace with your actual API endpoint.
  // This endpoint should return all the necessary data for the dashboard,
  // filtered for the logged-in TOWERCO user.
  const API_URL = '/api/v1/towerco/dashboard/';
  try {
    // const res = await fetch(API_URL);
    // if (!res.ok) {
    //   throw new Error('Failed to fetch dashboard data');
    // }
    // return res.json();
    
    // Simulating network delay and returning mock data for now.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const towercoSites = mockSites.filter(
      (site) => site.towerco === LOGGED_IN_TOWERCO
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
    };

  } catch (error) {
    console.error('Could not fetch dashboard data:', error);
    return { sites: [], agencies: [], incidents: [], guards: [], patrollingOfficers: [] };
  }
}

export default function TowercoHomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const getGuardById = (id: string): Guard | undefined => {
    return data?.guards.find((g) => g.id === id);
  };

  const getPatrollingOfficerById = (id?: string): PatrollingOfficer | undefined => {
      if (!id || !data) return undefined;
      return data.patrollingOfficers.find((p) => p.id === id);
  };

  const getAgencyById = (id?: string): SecurityAgency | undefined => {
    if (!id || !data) return undefined;
    return data.agencies.find((a) => a.id === id);
  };

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
            <CardHeader className="flex flex-row items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <p>Could not load dashboard data.</p>
        </div>
    )
  }

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
          <CardTitle>Active Emergency Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Patrolling Officer</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((incident) => {
                  const siteDetails = getSiteById(incident.siteId);
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficerDetails = getPatrollingOfficerById(
                    incident.attendedByPatrollingOfficerId
                  );
                  const agencyDetails = getAgencyById(siteDetails?.agencyId);
                  const incidentDate = new Date(incident.incidentTime);

                  return (
                    <TableRow key={incident.id}>
                       <TableCell>{incident.siteId}</TableCell>
                      <TableCell className="font-medium">
                        {siteDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{agencyDetails?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficerDetails?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{guardDetails?.name || 'N/A'}</TableCell>
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
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <div className="flex items-center gap-2">
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>Guard: {guardDetails.phone}</span>
                                </div>
                              </DropdownMenuItem>
                            )}
                            {patrollingOfficerDetails && (
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <div className="flex items-center gap-2">
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>P. Officer: {patrollingOfficerDetails.phone}</span>
                                </div>
                              </DropdownMenuItem>
                            )}
                            {agencyDetails && (
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                               <div className="flex items-center gap-2">
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>Agency: {agencyDetails.phone}</span>
                                </div>
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

      <TowercoAnalyticsDashboard
        sites={data.sites}
        agencies={data.agencies}
        incidents={activeEmergencies}
      />

      <SiteStatusBreakdown sites={data.sites} />

      <AgencyPerformance
        agencies={data.agencies}
        sites={data.sites}
        incidents={data.incidents}
      />

      <IncidentChart
        incidents={data.incidents}
        sites={data.sites}
        securityAgencies={data.agencies}
      />
    </div>
  );
}
