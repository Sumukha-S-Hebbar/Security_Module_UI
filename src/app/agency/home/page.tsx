
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Organization } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { AgencyAnalyticsDashboard } from './_components/agency-analytics-dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IncidentStatusBreakdown } from './_components/incident-status-breakdown';
import { AgencyIncidentChart } from './_components/agency-incident-chart';
import { GuardPerformanceBreakdown } from './_components/guard-performance-breakdown';
import { PatrollingOfficerPerformance } from './_components/patrolling-officer-performance';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDataFetching } from '@/hooks/useDataFetching';

const ACTIVE_INCIDENTS_PER_PAGE = 4;

// Type definitions based on the new API response
export type BasicCounts = {
    active_incidents_count: number;
    total_sites_count: number;
    total_guards_count: number;
    total_patrol_officers_count: number;
};

export type ActiveIncident = {
    id: number;
    incident_id: string;
    site_details: { id: number; tb_site_id: string; site_name: string };
    patrol_officer_name: string;
    guard_name: string;
    incident_time: string;
    contact_details: { officer_phone: string | null; guard_phone: string | null };
};

export type GuardPerformanceData = {
    guard_checkin_accuracy: number;
    selfie_checkin_accuracy: number;
};

export type PatrollingOfficerPerformanceData = {
    site_visit_accuracy: number;
    average_response_time: string;
};

export type IncidentTrendData = {
    month: string;
    year: number;
    total: number;
    resolved: number;
    active: number;
    under_review: number;
    resolution_duration: string;
};

interface AgencyDashboardData {
    basic_counts: BasicCounts;
    active_incidents: {
        count: number;
        next: string | null;
        previous: string | null;
        results: ActiveIncident[];
    };
    guard_performance: GuardPerformanceData;
    patrol_officer_performance: PatrollingOfficerPerformanceData;
    incident_trend: IncidentTrendData[];
    all_incidents: {
        count: number;
        results: any[];
    }
}


async function getDashboardData(org: Organization | null): Promise<AgencyDashboardData | null> {
  if (!org) return null;
  
  let url = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/agency/${org.code}/agency-dashboard/`;
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error("No auth token found");
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Could not fetch dashboard data:', error);
    return null;
  }
}

export default function AgencyHomePage() {
  const router = useRouter();
  const [activeIncidentsCurrentPage, setActiveIncidentsCurrentPage] = useState(1);
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
      const orgData = localStorage.getItem('organization');
      if (orgData) {
        setOrg(JSON.parse(orgData));
      }
  }, []);

  const { data, isLoading } = useDataFetching<AgencyDashboardData | null>(
    () => getDashboardData(org), 
    [org]
  );
  
  const activeEmergencies = useMemo(() => {
    if (!data) return [];
    return data.active_incidents.results;
  }, [data]);

  const paginatedActiveEmergencies = useMemo(() => {
    const startIndex = (activeIncidentsCurrentPage - 1) * ACTIVE_INCIDENTS_PER_PAGE;
    return activeEmergencies.slice(startIndex, startIndex + ACTIVE_INCIDENTS_PER_PAGE);
  }, [activeEmergencies, activeIncidentsCurrentPage]);
  
  const totalActiveIncidentPages = Math.ceil((data?.active_incidents.count || 0) / ACTIVE_INCIDENTS_PER_PAGE);

  if (isLoading || !data || !org) {
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
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
          <CardTitle>Active Emergency Incidents ({data.active_incidents.count})</CardTitle>
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
                  const incidentDate = new Date(incident.incident_time);
                  
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                      className="cursor-pointer border-destructive/20 hover:bg-destructive/20"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/agency/incidents/${incident.id}`}>{incident.incident_id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        {incident.site_details?.site_name || 'N/A'}
                      </TableCell>
                      <TableCell>{incident.guard_name || 'N/A'}</TableCell>
                      <TableCell>
                        {incident.patrol_officer_name || 'N/A'}
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
                            {incident.contact_details.guard_phone && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${incident.contact_details.guard_phone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Guard
                                </a>
                              </DropdownMenuItem>
                            )}
                            {incident.contact_details.officer_phone && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${incident.contact_details.officer_phone}`}>
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

      <AgencyAnalyticsDashboard counts={data.basic_counts} />
      
      <IncidentStatusBreakdown allIncidents={data.all_incidents.results} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuardPerformanceBreakdown performance={data.guard_performance} />
        <PatrollingOfficerPerformance performance={data.patrol_officer_performance} />
      </div>

      <AgencyIncidentChart incidentTrend={data.incident_trend} />
    </div>
  );
}
