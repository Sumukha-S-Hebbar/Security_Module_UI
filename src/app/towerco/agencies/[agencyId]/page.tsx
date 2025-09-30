
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { Incident, Site, SecurityAgency, Organization } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle,
  FileDown,
  ArrowLeft,
  ShieldAlert,
  Search,
  Users,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientDate } from './_components/client-date';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

type PaginatedIncidents = {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
        id: number;
        incident_id: string;
        tb_site_id: string;
        incident_time: string;
        incident_status: "Active" | "Under Review" | "Resolved";
        site_details: {
            site_name: string;
        };
        raised_by_guard_details: {
            first_name: string;
            last_name: string | null;
        } | null;
        incident_type: string;
        incident_description: string;
    }[];
};

type AgencyReportData = {
    id: number;
    subcon_id: string;
    name: string;
    logo?: string | null;
    contact_person: string;
    email: string;
    phone: string;
    region: string;
    city: string;
    registered_address_line1: string;
    assigned_sites_count: number;
    total_incidents_count: number;
    resolved_incidents_count: number;
    performance: {
        filters_applied: string;
        overall_performance: number;
        incident_resolution: number;
        site_visit_accuracy: number;
        guard_checkin_accuracy: number;
        selfie_accuracy: number | null;
    };
    assigned_sites: {
        id: number;
        tb_site_id: string;
        org_site_id: string;
        site_name: string;
        registered_address_line1: string;
        assigned_on: string;
        number_of_guards: number;
        total_incidents_count: number;
        resolved_incidents_count: number;
    }[];
    incidents: PaginatedIncidents;
};

const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};


const parsePerformanceValue = (value: number | undefined | null): number => {
    if (typeof value !== 'number' || value === null) {
        return 0;
    }
    return value;
};

const chartConfig = {
  incidentResolution: {
    label: 'Incident Resolution',
    color: '#1B2A41',
  },
  siteVisit: {
    label: 'Site Visit Accuracy',
    color: '#3A506B',
  },
  checkin: {
    label: 'Guard Check-in Accuracy',
    color: '#5C7595',
  },
  selfie: {
    label: 'Selfie Check-in Accuracy',
    color: '#8E9BAF',
  },
} satisfies ChartConfig;


export default function AgencyReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agencyId = params.agencyId as string;

  const [reportData, setReportData] = useState<AgencyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  const [performanceSelectedYear, setPerformanceSelectedYear] = useState<string>('all');
  const [performanceSelectedMonth, setPerformanceSelectedMonth] = useState<string>('all');
  
  const [incidentsStatusFilter, setIncidentsStatusFilter] = useState('all');
  const [incidentsYearFilter, setIncidentsYearFilter] = useState('all');
  const [incidentsMonthFilter, setIncidentsMonthFilter] = useState<string>('all');

  const assignedSitesRef = useRef<HTMLDivElement>(null);
  const incidentsHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
    }
  }, []);

  useEffect(() => {
      if (!loggedInOrg || !agencyId) return;

      const fetchReportData = async () => {
          setIsLoading(true);
          const token = localStorage.getItem('token') || undefined;
          const orgCode = loggedInOrg.code;
          
          let url = `/security/api/orgs/${orgCode}/security-agencies/${agencyId}/`;
          
          const queryParams = new URLSearchParams();
          if (performanceSelectedYear !== 'all') queryParams.append('year', performanceSelectedYear);
          if (performanceSelectedMonth !== 'all') queryParams.append('month', (parseInt(performanceSelectedMonth) + 1).toString());

          if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
          }

          try {
              const response = await fetchData<{ data: AgencyReportData }>(url, token);
              setReportData(response?.data || null);
          } catch (error) {
              console.error("Failed to fetch agency report:", error);
              toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not load agency report data.",
              });
          } finally {
              setIsLoading(false);
          }
      };

      fetchReportData();
  }, [loggedInOrg, agencyId, toast, performanceSelectedYear, performanceSelectedMonth]);

  const performanceMetrics = useMemo(() => {
    if (!reportData) return null;
    const { performance } = reportData;
    return {
      overall: parsePerformanceValue(performance.overall_performance),
      incidentResolution: parsePerformanceValue(performance.incident_resolution),
      siteVisit: parsePerformanceValue(performance.site_visit_accuracy),
      checkin: parsePerformanceValue(performance.guard_checkin_accuracy),
      selfie: parsePerformanceValue(performance.selfie_accuracy),
    };
  }, [reportData]);
  
  const overallPerformanceChartData = useMemo(() => {
    if (!performanceMetrics) return null;
    const overall = performanceMetrics.overall;
    return {
        data: [{ name: 'Overall', value: overall }, { name: 'Remaining', value: 100 - overall }],
        color: getPerformanceColor(overall)
    };
  }, [performanceMetrics]);

  const performanceBreakdownChartData = useMemo(() => {
    if (!performanceMetrics) return [];
    return [
      { name: "incidentResolution", label: "Incident Resolution", value: performanceMetrics.incidentResolution },
      { name: "siteVisit", label: "Site Visit Accuracy", value: performanceMetrics.siteVisit },
      { name: "checkin", label: "Guard Check-in Accuracy", value: performanceMetrics.checkin },
      { name: "selfie", label: "Selfie Check-in Accuracy", value: performanceMetrics.selfie },
    ];
  }, [performanceMetrics]);
  
  const incidentAvailableYears = useMemo(() => {
    if (!reportData || !reportData.incidents || !reportData.incidents.results) return [];
    const years = new Set(
      reportData.incidents.results.map((incident) => new Date(incident.incident_time).getFullYear().toString())
    );
    if (years.size === 0) {
        years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [reportData]);
  
  const filteredIncidents = useMemo(() => {
    if (!reportData || !reportData.incidents || !reportData.incidents.results) return [];
    return reportData.incidents.results.filter(incident => {
        const incidentDate = new Date(incident.incident_time);
        
        const statusMatch = incidentsStatusFilter === 'all' || incident.incident_status.toLowerCase().replace(' ', '_') === incidentsStatusFilter.replace('-', '_');
        const yearMatch = incidentsYearFilter === 'all' || incidentDate.getFullYear().toString() === incidentsYearFilter;
        const monthMatch = incidentsMonthFilter === 'all' || incidentDate.getMonth().toString() === incidentsMonthFilter;

        return statusMatch && yearMatch && monthMatch;
    });
  }, [reportData, incidentsStatusFilter, incidentsYearFilter, incidentsMonthFilter]);


  const getStatusIndicator = (status: "Active" | "Under Review" | "Resolved") => {
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

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    const element = ref.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight-row');
        setTimeout(() => {
            element.classList.remove('highlight-row');
        }, 2000);
    }
  };
  
   if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!reportData || !loggedInOrg) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Agency or Organization data could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    name,
    email,
    phone,
    registered_address_line1,
    city,
    region,
    assigned_sites_count,
    total_incidents_count,
    resolved_incidents_count,
    assigned_sites,
    incidents,
  } = reportData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/towerco/agencies">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Agencies</span>
            </Link>
          </Button>
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Agency Report</h1>
              <p className="text-muted-foreground font-medium">Detailed overview for {name} on {loggedInOrg.name}.</p>
          </div>
        </div>
        <Button onClick={() => {}} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
          <div className="flex items-center gap-4">
              {/* <Avatar className="h-16 w-16">
                  <AvatarImage src={reportData.logo || undefined} alt={name || ''} />
                  <AvatarFallback>{name ? name.charAt(0) : 'A'}</AvatarFallback>
              </Avatar> */}
              <div>
                  <CardTitle className="text-2xl">{name}</CardTitle>
                  <p className="font-medium text-foreground">ID: {reportData.subcon_id}</p>
              </div>
          </div>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="text-sm mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${email}`} className="font-medium hover:underline">{email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${phone}`} className="font-medium hover:underline">{phone}</a>
                  </div>
                  {registered_address_line1 && <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{`${registered_address_line1}, ${city}, ${region}`}</span>
                  </div>}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4 text-lg">Operational Overview</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <button
                    onClick={() => handleScrollTo(assignedSitesRef)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <Building2 className="h-8 w-8 text-primary" />
                    <p className="font-medium text-[#00B4D8] group-hover:underline">Sites Assigned</p>
                    <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{assigned_sites_count}</p>
                  </button>
                  <button
                    onClick={() => handleScrollTo(incidentsHistoryRef)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    <p className="font-medium text-[#00B4D8] group-hover:underline">Total Incidents</p>
                    <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{total_incidents_count}</p>
                  </button>
                  <div
                    className="flex flex-col items-center gap-1"
                  >
                    <CheckCircle className="h-8 w-8 text-primary" />
                    <p className="font-medium text-muted-foreground">Incidents Resolved</p>
                    <p className="font-bold text-lg">{resolved_incidents_count}</p>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Agency Performance</CardTitle>
                <CardDescription>{reportData.performance.filters_applied}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={performanceSelectedYear} onValueChange={setPerformanceSelectedYear}>
                    <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">All Time</SelectItem>
                      {[...new Array(5)].map((_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() - i).toString()} className="font-medium">
                          {new Date().getFullYear() - i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <Select value={performanceSelectedMonth} onValueChange={setPerformanceSelectedMonth}>
                    <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-medium">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()} className="font-medium">
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
           <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {performanceMetrics && overallPerformanceChartData && (
                <>
                  <div className="flex flex-col items-center gap-2 md:col-span-1">
                    <div className="w-40 h-40 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overallPerformanceChartData.data}
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="85%"
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill={overallPerformanceChartData.color} />
                            <Cell fill="hsl(var(--muted))" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold" style={{ color: overallPerformanceChartData.color }}>
                          {performanceMetrics.overall}%
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-center mt-2">Overall Performance</p>
                  </div>
                  <div className="md:col-span-2">
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                       <ResponsiveContainer>
                        <BarChart layout="vertical" data={performanceBreakdownChartData} margin={{ left: 120, right:30}}>
                          <YAxis 
                            dataKey="label" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false}
                            width={120}
                            tick={{ fontSize: 12 }}
                          />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <Bar dataKey="value" radius={4}>
                             {performanceBreakdownChartData.map((entry) => (
                                <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                            ))}
                            <LabelList dataKey="value" position="right" offset={8} formatter={(value: number) => `${value}%`} />
                          </Bar>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card ref={assignedSitesRef}>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription className="font-medium flex-1">
            A detailed list of all sites assigned to {name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assigned_sites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Towerbuddy ID</TableHead>
                  <TableHead className="text-foreground">Site ID</TableHead>
                  <TableHead className="text-foreground">Site</TableHead>
                  <TableHead className="text-foreground">Assigned On</TableHead>
                  <TableHead className="text-center text-foreground">Guards Requested</TableHead>
                  <TableHead className="text-center text-foreground">Incidents</TableHead>
                  <TableHead className="text-center text-foreground">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned_sites.map((site) => (
                    <TableRow key={site.id} onClick={() => router.push(`/towerco/sites/${site.id}`)} className="cursor-pointer hover:bg-accent hover:text-accent-foreground group">
                        <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/towerco/sites/${site.id}`}>{site.tb_site_id}</Link>
                          </Button>
                        </TableCell>
                       <TableCell className="font-medium">
                          {site.org_site_id}
                        </TableCell>
                      <TableCell>
                        <div className="font-medium">{site.site_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium group-hover:text-accent-foreground">
                          <MapPin className="w-3 h-3" />
                          {site.registered_address_line1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <ClientDate date={site.assigned_on} format="date" />
                      </TableCell>
                       <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 font-medium">
                            <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                            <span>{site.number_of_guards}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 font-medium">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                            <span>{site.total_incidents_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 font-medium">
                          <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                          <span>{site.resolved_incidents_count}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">
              No sites are currently assigned to this agency.
            </p>
          )}
        </CardContent>
      </Card>
      <Card ref={incidentsHistoryRef}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Incidents Log</CardTitle>
              <CardDescription className="font-medium flex-1">
                A log of emergency incidents at sites managed by {name}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={incidentsStatusFilter} onValueChange={setIncidentsStatusFilter}>
                  <SelectTrigger className="w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
                      <SelectItem value="active" className="font-medium">Active</SelectItem>
                      <SelectItem value="under-review" className="font-medium">Under Review</SelectItem>
                      <SelectItem value="resolved" className="font-medium">Resolved</SelectItem>
                  </SelectContent>
              </Select>
              <Select value={incidentsYearFilter} onValueChange={setIncidentsYearFilter}>
                <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">All Years</SelectItem>
                  {incidentAvailableYears.map((year) => (
                    <SelectItem key={year} value={year} className="font-medium">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={incidentsMonthFilter} onValueChange={setIncidentsMonthFilter}>
                <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="font-medium">
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Incident ID</TableHead>
                  <TableHead className="text-foreground">Incident Date</TableHead>
                  <TableHead className="text-foreground">Incident Time</TableHead>
                  <TableHead className="text-foreground">Site</TableHead>
                  <TableHead className="text-foreground">Guard</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const guardName = incident.raised_by_guard_details
                    ? `${incident.raised_by_guard_details.first_name} ${incident.raised_by_guard_details.last_name || ''}`.trim()
                    : 'N/A';
                  return (
                    <TableRow key={incident.id} onClick={() => router.push(`/towerco/incidents/${incident.id}`)} className="cursor-pointer hover:bg-accent hover:text-accent-foreground group">
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                         <Link href={`/towerco/incidents/${incident.id}`}>{incident.incident_id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <ClientDate date={incident.incident_time} format="date" />
                      </TableCell>
                      <TableCell className="font-medium">
                        <ClientDate date={incident.incident_time} format="time" />
                      </TableCell>
                      <TableCell className="font-medium">{incident.site_details.site_name}</TableCell>
                      <TableCell className="font-medium">{guardName}</TableCell>
                      <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">
              No incidents found for this agency based on the current filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
