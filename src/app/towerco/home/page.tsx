
'use client';

import { useState, useEffect, Suspense } from 'react';
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
import { AlertTriangle, ChevronDown, Phone, Loader2 } from 'lucide-react';
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
import { fetchData } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';


export type BasicCounts = {
  active_incidents_count: number;
  total_guards_count: number;
  total_sites_count: number;
  total_agencies_count: number;
};

export type IncidentListItem = {
    id: number;
    incident_id: string;
    tb_site_id: string;
    incident_time: string;
    incident_status: "Active" | "Under Review" | "Resolved";
    site_name: string;
    guard_name: string;
    incident_type: string;
    incident_description: string;
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

type PaginatedActiveIncidents = {
    count: number;
    next: string | null;
    previous: string | null;
    results: ActiveIncident[];
};

export type AgencyPerformanceData = {
    agency_name: string;
    agency_id: number;
    performance: {
        incident_resolution: number;
        site_visit_accuracy: number;
        guard_checkin_accuracy: number;
        selfie_accuracy: number;
    };
};

export type SiteListItem = {
    id: number;
    tb_site_id: string;
    org_site_id: string;
    site_name: string;
    region: string;
    agency_name?: string;
};

export type SiteStatusData = {
    assigned_sites_count: number;
    unassigned_sites_count: number;
    assigned_sites: { count: number; next: string | null; previous: string | null; results: SiteListItem[] };
    unassigned_sites: { count: number; next: string | null; previous: string | null; results: SiteListItem[] } | null;
};

export type IncidentTrendData = {
    month: string;
    total: number;
    resolved: number;
    active: number;
    under_review: number;
    resolution_duration: string;
};

interface DashboardData {
    basic_counts: BasicCounts;
    active_incidents: PaginatedActiveIncidents;
    agency_performance: AgencyPerformanceData[];
    site_status: SiteStatusData;
    incident_trend: IncidentTrendData[];
}

function PageSkeleton() {
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

function TowercoHomePageContent() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIncidentsLoading, setIsIncidentsLoading] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrg = localStorage.getItem('organization');
      if (savedOrg) {
        setOrg(JSON.parse(savedOrg));
      } else {
        router.replace('/');
      }
    }
  }, [router]);

  useEffect(() => {
    if (org) {
      const token = localStorage.getItem('token') || undefined;
      const getDashboardData = async () => {
        let url = `/security/api/orgs/${org.code}/security-dashboard/`;
        try {
          const dashboardData = await fetchData<DashboardData>(url, token);
          setData(dashboardData);
        } catch (error) {
          console.error(error);
          setData(null);
        } finally {
          setIsLoading(false);
        }
      }
      getDashboardData();
    }
  }, [org]);
  
  const handleIncidentPagination = async (url: string | null) => {
    if (!url || !data) return;
    setIsIncidentsLoading(true);
    try {
        const token = localStorage.getItem('token') || undefined;
        const incidentData = await fetchData<PaginatedActiveIncidents>(url, token);
        if (incidentData) {
            setData({ ...data, active_incidents: incidentData });
        }
    } catch(error) {
        console.error("Failed to fetch active incidents", error);
    } finally {
        setIsIncidentsLoading(false);
    }
  }

  if (isLoading || !data || !org) {
    return <PageSkeleton />;
  }
  
  const portalName = org.role === 'T' ? 'TOWERCO' : 'MNO';
  const activeIncidents = data.active_incidents;

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
          <CardTitle>Active Emergency Incidents ({activeIncidents.count})</CardTitle>
          </CardHeader>
          <CardContent>
          {isIncidentsLoading ? (
             <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : activeIncidents.results.length > 0 ? (
              <ScrollArea className="h-72">
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
                          {activeIncidents.results.map((incident) => {
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
              </ScrollArea>
          ) : (
              <p className="text-center py-4 font-medium">
              No active emergency incidents. All systems are normal.
              </p>
          )}
          </CardContent>
          {activeIncidents.count > 0 && (
            <CardFooter>
                 <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-destructive font-medium">
                        Showing {activeIncidents.results.length} of {activeIncidents.count} active incidents.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncidentPagination(activeIncidents.previous)}
                            disabled={!activeIncidents.previous || isIncidentsLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncidentPagination(activeIncidents.next)}
                            disabled={!activeIncidents.next || isIncidentsLoading}
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
      
      <AgencyPerformance />
      <SiteStatusBreakdown siteStatusData={data.site_status} />
      <IncidentChart incidentTrend={data.incident_trend} agencies={data.agency_performance} orgCode={org.code.toString()} />
    </div>
  );
}

export default function TowercoHomePage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <TowercoHomePageContent />
        </Suspense>
    )
}
