
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  ShieldAlert,
  FileDown,
  Users,
  Phone,
  Mail,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchData } from '@/lib/api';
import type { Site, SecurityAgency, Incident, Guard, Organization } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  incidents: {
    label: 'Incidents',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type SiteReportData = {
    id: number;
    tb_site_id: string;
    org_site_id: string;
    site_name: string;
    site_status: string;
    lat: number;
    lng: number;
    site_address_line1: string;
    site_address_line2?: string | null;
    site_address_line3?: string | null;
    site_zip_code: string;
    region: string;
    city: string;
    total_incidents_count: number;
    resolved_incidents_count: number;
    agency_details: SecurityAgency | null;
    guard_details: Guard[];
    incident_trend: { month: string; count: number }[];
    incidents: {
        count: number;
        next: string | null;
        previous: string | null;
        results: any[]; // Using any to accommodate the new structure for now
    };
};


export default function SiteReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const siteId = params.siteId as string;
  
  const [reportData, setReportData] = useState<SiteReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  const [incidentsCurrentPage, setIncidentsCurrentPage] = useState(1);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
    }
  }, []);

  useEffect(() => {
    if (!loggedInOrg || !siteId) return;

    const fetchReportData = async (page = 1) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const url = `http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/site/${siteId}/?page=${page}`;

        try {
            const data = await fetchData<SiteReportData>(url, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch site report:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load site report data.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchReportData(incidentsCurrentPage);
  }, [loggedInOrg, siteId, incidentsCurrentPage, toast]);
  
  const totalIncidentPages = useMemo(() => {
    if (!reportData) return 1;
    return Math.ceil(reportData.incidents.count / 10); // Assuming 10 items per page from backend
  }, [reportData]);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${reportData?.site_name}.`,
    });
  };

  const getStatusIndicator = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
        </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Site not found or could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { site_name, org_site_id, site_address_line1, lat, lng, total_incidents_count, agency_details, guard_details, incident_trend, incidents } = reportData;
  const fullAddress = `${site_address_line1}, ${reportData.city}, ${reportData.region}`;


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/towerco/sites">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Sites</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for {site_name}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl">{site_name}</CardTitle>
                <p className="font-medium">ID: {org_site_id}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mt-2 grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="font-medium">{fullAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe mt-0.5 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <div>
                    <p className="font-semibold">Coordinates</p>
                    <p className="font-medium">Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}</p>
                  </div>
              </div>
               <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 text-primary" />
                <div>
                  <span className="font-semibold">Total Incidents</span>
                  <p className="font-medium text-base">{total_incidents_count}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {agency_details ? (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/>Agency Details</CardTitle>
                <CardDescription>Security provider for this site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-semibold text-base">{agency_details.agency_name}</p>
                    <p className="font-medium">ID: {agency_details.agency_id}</p>
                </div>
                <div className="text-sm space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${agency_details.phone}`} className="hover:underline">{agency_details.phone}</a></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${agency_details.communication_email}`} className="hover:underline">{agency_details.communication_email}</a></div>
                </div>
                 <Button asChild variant="link" className="p-0 h-auto font-medium">
                    <Link href={`/towerco/agencies/${agency_details.id}`}>View Full Agency Report</Link>
                </Button>
            </CardContent>
          </Card>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/>Agency Details</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground text-center py-4 font-medium">No security agency is assigned to this site.</p>
                </CardContent>
             </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Assigned Guards</CardTitle>
                <CardDescription>Guards currently assigned to {site_name}.</CardDescription>
            </CardHeader>
            <CardContent>
                {guard_details.length > 0 ? (
                    <div className="space-y-4">
                        {guard_details.map(guard => (
                            <div key={guard.id} className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={guard.avatar} alt={guard.name} />
                                    <AvatarFallback>{guard.name ? guard.name.charAt(0) : 'G'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">{guard.name}</p>
                                    <p className="font-medium"><a href={`tel:${guard.phone}`} className="text-accent hover:underline">{guard.phone}</a></p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 font-medium">No guards are currently assigned to this site.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Incidents Reported Monthly</CardTitle>
            <CardDescription>A monthly breakdown of incidents reported at {site_name}.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                    <LineChart data={incident_trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" name="Incidents" stroke="var(--color-incidents)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Incidents Log</CardTitle>
            <CardDescription className="font-medium">A log of all emergency incidents reported at this site.</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Incident Time</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.results.map((incident) => {
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.incident_id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleTimeString()}</TableCell>
                      <TableCell className="font-medium">{incident.guard_name || 'N/A'}</TableCell>
                      <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">No emergency incidents have been reported for this site.</p>
          )}
        </CardContent>
        {incidents.count > 10 && (
             <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {incidents.results.length} of {incidents.count} incidents.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIncidentsCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={incidentsCurrentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {incidentsCurrentPage} of {totalIncidentPages || 1}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIncidentsCurrentPage(prev => Math.min(prev + 1, totalIncidentPages))}
                            disabled={incidentsCurrentPage === totalIncidentPages || totalIncidentPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
