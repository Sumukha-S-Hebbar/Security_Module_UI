
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Organization } from '@/types';
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDataFetching } from '@/hooks/useDataFetching';

const ACTIVE_INCIDENTS_PER_PAGE = 4;

// New type definitions based on the API response
type BasicCounts = {
    active_incidents_count: number;
    total_guards_count: number;
    total_sites_count: number;
    total_agencies_count: number;
};

type ActiveIncident = {
    id: number;
    incident_id: string;
    site_details: { id: number; tb_site_id: string; site_name: string };
    agency_details: { id: number; tb_agency_id: string; agency_name: string };
    patrol_officer_name: string;
    guard_name: string;
    incident_time: string;
    contact_details: { agency_phone: string | null; officer_phone: string | null; guard_phone: string | null };
};

type AgencyPerformanceData = {
    agency_name: string;
    performance: {
        incident_resolution: number;
        site_visit_accuracy: number;
        guard_checkin_accuracy: number;
        selfie_accuracy: number;
    };
};

type SiteStatusData = {
    assigned_sites_count: number;
    unassigned_sites_count: number;
    assigned_sites: { results: { id: number; tb_site_id: string; site_name: string; region: string; agency_name: string }[] };
    unassigned_sites: any; // Assuming it can be null or an object
};

type IncidentTrendData = {
    month: string;
    total: number;
    resolved: number;
    active: number;
    under_review: number;
    resolution_duration: string;
};

interface DashboardData {
    basic_counts: BasicCounts;
    active_incidents: {
        count: number;
        next: string | null;
        previous: string | null;
        results: ActiveIncident[];
    };
    agency_performance: AgencyPerformanceData[];
    site_status: SiteStatusData;
    incident_trend: IncidentTrendData[];
}


async function getDashboardData(org: Organization | null): Promise<DashboardData | null> {
  if (!org) return null;
  
  const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/orgs/${org.code}/security-dashboard/`;
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error("No auth token found");
    return null;
  }

  try {
    const response = await fetch(API_URL, {
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

export default function TowercoHomePage() {
  const [activeIncidentsCurrentPage, setActiveIncidentsCurrentPage] = useState(1);
  const router = useRouter();
  
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
      const orgData = localStorage.getItem('organization');
      if (orgData) {
        setOrg(JSON.parse(orgData));
      }
  }, []);

  const { data, isLoading } = useDataFetching<DashboardData | null>(() => getDashboardData(org), [org]);

  const activeEmergencies = useMemo(() => {
    if (!data) return [];
    return data.active_incidents.results;
  }, [data]);

  const paginatedActiveEmergencies = useMemo(() => {
    const startIndex = (activeIncidentsCurrentPage - 1) * ACTIVE_INCIDENTS_PER_PAGE;
    return activeEmergencies.slice(startIndex, startIndex + ACTIVE_INCIDENTS_PER_PAGE);
  }, [activeEmergencies, activeIncidentsCurrentPage]);

  const totalActiveIncidentPages = Math.ceil((data?.active_incidents.count || 0) / ACTIVE_INCIDENTS_PER_PAGE);


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

  if (!data || !org) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <p className="font-medium">Could not load dashboard data for your organization.</p>
        </div>
    )
  }
  
  const portalName = org.role === 'T' ? 'TOWERCO' : 'MNO';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{portalName} Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            Welcome, {org.name}! Here's a high-level overview of your assets.
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
                            const incidentDate = new Date(incident.incident_time);
                            return (
                                <TableRow 
                                  key={incident.id}
                                  onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                                  className="cursor-pointer border-destructive/20 hover:bg-destructive/20"
                                >
                                <TableCell>
                                  <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/towerco/incidents/${incident.id}`}>{incident.incident_id}</Link>
                                  </Button>
                                </TableCell>
                                <TableCell>
                                    {incident.site_details.site_name || 'N/A'}
                                </TableCell>
                                <TableCell>{incident.agency_details?.agency_name || 'N/A'}</TableCell>
                                <TableCell>
                                    {incident.patrol_officer_name}
                                </TableCell>
                                <TableCell>{incident.guard_name}</TableCell>
                                <TableCell>{incidentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
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
                                            <a href={`tel:${incident.contact_details.guard_phone}`} className="flex items-center gap-2 w-full">
                                                <Phone className="mr-2 h-4 w-4" />
                                                <span>Guard: {incident.contact_details.guard_phone}</span>
                                            </a>
                                        </DropdownMenuItem>
                                        )}
                                        {incident.contact_details.officer_phone && (
                                        <DropdownMenuItem asChild>
                                            <a href={`tel:${incident.contact_details.officer_phone}`} className="flex items-center gap-2 w-full">
                                                <Phone className="mr-2 h-4 w-4" />
                                                <span>P. Officer: {incident.contact_details.officer_phone}</span>
                                            </a>
                                        </DropdownMenuItem>
                                        )}
                                        {incident.contact_details.agency_phone && (
                                        <DropdownMenuItem asChild>
                                            <a href={`tel:${incident.contact_details.agency_phone}`} className="flex items-center gap-2 w-full">
                                                <Phone className="mr-2 h-4 w-4" />
                                                <span>Agency: {incident.contact_details.agency_phone}</span>
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
        counts={data.basic_counts}
      />
      
      <AgencyPerformance
        performanceData={data.agency_performance}
      />
      <SiteStatusBreakdown siteStatusData={data.site_status} />

      <IncidentChart
        incidentTrend={data.incident_trend}
      />
    </div>
  );
}
