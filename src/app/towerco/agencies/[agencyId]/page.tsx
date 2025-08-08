

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


type AgencyReportData = {
    id: number;
    tb_agency_id: string;
    agency_name: string;
    contact_person: string;
    communication_email: string;
    phone: string;
    registered_address_line1: string;
    registered_address_line2: string | null;
    registered_address_line3: string | null;
    region: string;
    city: string;
    logo: string | null;
    assigned_sites_count: number;
    total_incidents_count: number;
    resolved_incidents_count: number;
    performance: {
        filters_applied: string;
        overall_performance: string;
        incident_resolution_rate: string;
        site_visit_accuracy: string;
        guard_checkin_accuracy: string;
        selfie_checkin_accuracy: string;
    };
    assigned_sites: {
        id: number;
        tb_site_id: string;
        org_site_id: string;
        site_name: string;
        registered_address_line1: string;
        registered_address_line2: string | null;
        registered_address_line3: string | null;
        assigned_on: string;
        number_of_guards: number;
        total_incidents_count: number;
        resolved_incidents_count: number;
    }[];
    incidents: {
        id: number;
        incident_id: string;
        tb_site_id: string;
        incident_time: string;
        incident_status: "Active" | "Under Review" | "Resolved";
        site_name: string;
        guard_name: string;
        incident_type: string;
        incident_description: string;
    }[];
};

const chartConfig = {
  incidentResolutionRate: {
    label: 'Incident Resolution',
    color: '#1B2A41',
  },
  officerSiteVisitRate: {
    label: 'Site Visit Accuracy',
    color: '#3A506B',
  },
  guardPerimeterAccuracy: {
    label: 'Guard Check-in Accuracy',
    color: '#5C7595',
  },
  guardSelfieAccuracy: {
    label: 'Selfie Check-in Accuracy',
    color: '#8E9BAF',
  },
  performance: {
    label: 'Performance',
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
          const token = localStorage.getItem('token');
          const orgCode = loggedInOrg.code;
          
          let url = `http://are.towerbuddy.tel:8000/security/api/orgs/${orgCode}/security-agencies/${agencyId}/`;
          
          const queryParams = new URLSearchParams();
          if (performanceSelectedYear !== 'all') queryParams.append('year', performanceSelectedYear);
          if (performanceSelectedMonth !== 'all') queryParams.append('month', (parseInt(performanceSelectedMonth) + 1).toString());

          if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
          }

          try {
              const data = await fetchData<AgencyReportData>(url, {
                  headers: { 'Authorization': `Token ${token}` }
              });
              setReportData(data);
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
      overall: parseInt(performance.overall_performance.replace('%', '')),
      incidentResolution: parseInt(performance.incident_resolution_rate.replace('%', '')),
      siteVisit: parseInt(performance.site_visit_accuracy.replace('%', '')),
      checkin: parseInt(performance.guard_checkin_accuracy.replace('%', '')),
      selfie: parseInt(performance.selfie_checkin_accuracy.replace('%', '')),
    };
  }, [reportData]);

  const incidentAvailableYears = useMemo(() => {
    if (!reportData) return [];
    const years = new Set(
      reportData.incidents.map((incident) => new Date(incident.incident_time).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [reportData]);
  
  const filteredIncidents = useMemo(() => {
    if (!reportData) return [];
    return reportData.incidents.filter(incident => {
        const incidentDate = new Date(incident.incident_time);
        
        const statusMatch = incidentsStatusFilter === 'all' || incident.incident_status.toLowerCase().replace(' ', '_') === incidentsStatusFilter.replace('-', '_');
        const yearMatch = incidentsYearFilter === 'all' || incidentDate.getFullYear().toString() === incidentsYearFilter;
        const monthMatch = incidentsMonthFilter === 'all' || incidentDate.getMonth().toString() === incidentsMonthFilter;

        return statusMatch && yearMatch && monthMatch;
    });
  }, [reportData, incidentsStatusFilter, incidentsYearFilter, incidentsMonthFilter]);


  const complianceData = useMemo(() => [
    { name: 'performance', value: performanceMetrics?.overall || 0 },
    { name: 'Remaining', value: 100 - (performanceMetrics?.overall || 0) },
  ], [performanceMetrics]);

  const performanceBreakdownChartData = useMemo(() => [{
    name: 'Performance',
    incidentResolutionRate: performanceMetrics?.incidentResolution || 0,
    officerSiteVisitRate: performanceMetrics?.siteVisit || 0,
    guardPerimeterAccuracy: performanceMetrics?.checkin || 0,
    guardSelfieAccuracy: performanceMetrics?.selfie || 0,
  }], [performanceMetrics]);

  const getPerformanceColor = () => {
    if (!performanceMetrics) return 'hsl(var(--muted))';
    if (performanceMetrics.overall >= 95) return 'hsl(var(--chart-2))';
    if (performanceMetrics.overall >= 65) return 'hsl(var(--chart-3))';
    return 'hsl(var(--destructive))';
  };

  const COLORS = [getPerformanceColor(), 'hsl(var(--muted))'];

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
    agency_name,
    communication_email,
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
              <p className="text-muted-foreground font-medium">Detailed overview for {agency_name} on {loggedInOrg.name}.</p>
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
              <Avatar className="h-16 w-16">
                  <AvatarImage src={reportData.logo || undefined} alt={agency_name || ''} />
                  <AvatarFallback>{agency_name ? agency_name.charAt(0) : 'A'}</AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle className="text-2xl">{agency_name}</CardTitle>
                  <p className="font-medium text-foreground">ID: {reportData.tb_agency_id}</p>
              </div>
          </div>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="text-sm mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${communication_email}`} className="font-medium hover:underline">{communication_email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${phone}`} className="font-medium hover:underline">{phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{`${registered_address_line1}, ${city}, ${region}`}</span>
                  </div>
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
              <CardTitle>Agency Performance</CardTitle>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full max-w-[250px] aspect-square mx-auto">
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie data={complianceData} cx="50%" cy="50%" innerRadius="70%" outerRadius="85%" paddingAngle={0} dataKey="value" stroke="none">
                          {complianceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold" style={{ color: getPerformanceColor() }}>
                        {performanceMetrics?.overall}%
                    </span>
                </div>
                <p className="text-lg font-medium text-center mt-2">Overall Performance</p>
            </div>
            <div className="h-full">
              <ChartContainer config={chartConfig} className="w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={performanceBreakdownChartData} layout="vertical" margin={{ left: 50, right: 40 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="incidentResolutionRate" fill="var(--color-incidentResolutionRate)" radius={4}>
                      <LabelList dataKey="incidentResolutionRate" position="right" offset={8} formatter={(v: number) => `${v}%`} />
                    </Bar>
                    <Bar dataKey="officerSiteVisitRate" fill="var(--color-officerSiteVisitRate)" radius={4}>
                      <LabelList dataKey="officerSiteVisitRate" position="right" offset={8} formatter={(v: number) => `${v}%`} />
                    </Bar>
                    <Bar dataKey="guardPerimeterAccuracy" fill="var(--color-guardPerimeterAccuracy)" radius={4}>
                      <LabelList dataKey="guardPerimeterAccuracy" position="right" offset={8} formatter={(v: number) => `${v}%`} />
                    </Bar>
                    <Bar dataKey="guardSelfieAccuracy" fill="var(--color-guardSelfieAccuracy)" radius={4}>
                      <LabelList dataKey="guardSelfieAccuracy" position="right" offset={8} formatter={(v: number) => `${v}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card ref={assignedSitesRef}>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription className="font-medium flex-1">
            A detailed list of all sites assigned to {agency_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assigned_sites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Site ID</TableHead>
                  <TableHead className="text-foreground">Site</TableHead>
                  <TableHead className="text-foreground">Assigned On</TableHead>
                  <TableHead className="text-center text-foreground">Guards</TableHead>
                  <TableHead className="text-center text-foreground">Incidents</TableHead>
                  <TableHead className="text-center text-foreground">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned_sites.map((site) => (
                    <TableRow key={site.id} onClick={() => router.push(`/towerco/sites/${site.id}`)} className="cursor-pointer hover:bg-accent hover:text-accent-foreground group">
                       <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/towerco/sites/${site.id}`}>{site.org_site_id}</Link>
                          </Button>
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
                A log of emergency incidents at sites managed by {agency_name}.
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
                      <SelectItem value="under_review" className="font-medium">Under Review</SelectItem>
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
                {filteredIncidents.map((incident) => (
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
                      <TableCell className="font-medium">{incident.site_name}</TableCell>
                      <TableCell className="font-medium">{incident.guard_name}</TableCell>
                      <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                    </TableRow>
                  ))}
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
