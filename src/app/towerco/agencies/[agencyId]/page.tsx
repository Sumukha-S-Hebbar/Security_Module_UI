

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { securityAgencies } from '@/lib/data/security-agencies';
import { sites } from '@/lib/data/sites';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import { organizations } from '@/lib/data/organizations';
import type { Incident, Site, SecurityAgency } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Phone,
  Mail,
  MapPin,
  Users,
  Building2,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle,
  FileDown,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  Label,
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
import { useRouter } from 'next/navigation';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Progress } from '@/components/ui/progress';
import { ClientDate } from './_components/client-date';

const LOGGED_IN_ORG_ID = 'TCO01'; // Simulate logged-in user

const chartConfig = {
  incidentResolutionRate: {
    label: 'Incident Resolution',
    color: 'hsl(var(--chart-1))',
  },
  guardPerimeterAccuracy: {
    label: 'Guard Check-in Accuracy',
    color: 'hsl(var(--chart-2))',
  },
  guardSelfieAccuracy: {
    label: 'Selfie Check-in Accuracy',
    color: 'hsl(var(--chart-3))',
  },
  officerSiteVisitRate: {
    label: 'Site Visit Accuracy',
    color: 'hsl(var(--chart-5))',
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

  const agency = securityAgencies.find((a) => a.id === agencyId);
  const loggedInOrg = organizations.find((o) => o.id === LOGGED_IN_ORG_ID);


  if (!agency || !loggedInOrg) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Agency or Organization not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateReport = (name: string, type: string) => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for type ${name}.`,
    });
    // In a real app, this would trigger a download.
  };

  const agencySites = sites.filter(
    (site) =>
      agency.siteIds.includes(site.id) && site.towerco === loggedInOrg.name
  );
  const agencySiteIds = new Set(agencySites.map((site) => site.id));

  const agencyIncidents = incidents.filter(
    (incident) =>
      agencySiteIds.has(incident.siteId)
  );
  const totalIncidents = agencyIncidents.length;
  const resolvedIncidents = agencyIncidents.filter(
    (i) => i.status === 'Resolved'
  ).length;

    const performanceData = useMemo(() => {
    const agencySiteIds = new Set(agency.siteIds);
    const agencySites = sites.filter(s => agencySiteIds.has(s.id));
    
    // 1. Incident Resolution Rate
    const agencyIncidents = incidents.filter(
      (incident) => agencySiteIds.has(incident.siteId)
    );
    const totalIncidents = agencyIncidents.length;
    const resolvedIncidents = agencyIncidents.filter(i => i.status === 'Resolved').length;
    const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 100;

    // 2. Guard Performance
    const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
    const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
    let totalPerimeterAccuracy = 0;
    let totalSelfieAccuracy = 0;

    if (agencyGuards.length > 0) {
      agencyGuards.forEach(guard => {
        totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
        const selfieAccuracy = guard.totalSelfieRequests > 0
          ? ((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100
          : 100;
        totalSelfieAccuracy += selfieAccuracy;
      });
    }
    const guardPerimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;
    const guardSelfieAccuracy = agencyGuards.length > 0 ? totalSelfieAccuracy / agencyGuards.length : 100;

    // 3. Patrolling Officer Performance
    const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
    const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
    let totalSiteVisitRate = 0;
    if (agencyPatrollingOfficers.length > 0) {
        agencyPatrollingOfficers.forEach(po => {
            const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
            if (poSites.length > 0) {
                const visitedCount = poSites.filter(s => s.visited).length;
                totalSiteVisitRate += (visitedCount / poSites.length) * 100;
            } else {
                totalSiteVisitRate += 100; // If no sites, they haven't missed any.
            }
        });
    }
    const officerSiteVisitRate = agencyPatrollingOfficers.length > 0 ? totalSiteVisitRate / agencyPatrollingOfficers.length : 100;
    
    const performanceComponents = [
      incidentResolutionRate,
      guardPerimeterAccuracy,
      guardSelfieAccuracy,
      officerSiteVisitRate,
    ];
    const performance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

    return {
      performance: Math.round(performance),
      incidentResolutionRate: Math.round(incidentResolutionRate),
      guardPerimeterAccuracy: Math.round(guardPerimeterAccuracy),
      guardSelfieAccuracy: Math.round(guardSelfieAccuracy),
      officerSiteVisitRate: Math.round(officerSiteVisitRate),
    };
  }, [agency, sites, incidents]);
  
  const complianceData = [
    { name: 'performance', value: performanceData.performance },
    { name: 'Remaining', value: 100 - performanceData.performance },
  ];

  const performanceBreakdownChartData = [{
    name: 'Performance',
    incidentResolutionRate: performanceData.incidentResolutionRate,
    officerSiteVisitRate: performanceData.officerSiteVisitRate,
    guardPerimeterAccuracy: performanceData.guardPerimeterAccuracy,
    guardSelfieAccuracy: performanceData.guardSelfieAccuracy,
  }];
  
  const getPerformanceColor = () => {
    if (performanceData.performance >= 95) return 'hsl(var(--chart-2))';
    if (performanceData.performance >= 65) return 'hsl(var(--chart-3))';
    return 'hsl(var(--destructive))';
  };

  const COLORS = [getPerformanceColor(), 'hsl(var(--muted))'];

  
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
  
  const [historySelectedYear, setHistorySelectedYear] = useState<string>('all');
  const [historySelectedMonth, setHistorySelectedMonth] = useState<string>('all');

  const availableYears = useMemo(() => {
    const yearsFromIncidents = new Set(
      agencyIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    yearsFromIncidents.add(new Date().getFullYear().toString());
    return Array.from(yearsFromIncidents).sort((a, b) => parseInt(b) - parseInt(a));
  }, [agencyIncidents]);

  const filteredIncidents = useMemo(() => {
    return agencyIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = historySelectedYear === 'all' || incidentDate.getFullYear().toString() === historySelectedYear;
      const monthMatch = historySelectedMonth === 'all' || incidentDate.getMonth().toString() === historySelectedMonth;
      return yearMatch && monthMatch;
    });
  }, [agencyIncidents, historySelectedYear, historySelectedMonth]);

  const getSiteById = (id: string) => sites.find(s => s.id === id);
  const getGuardById = (id: string) => guards.find(g => g.id === id);

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
              <p className="text-muted-foreground font-medium">Detailed overview for {agency.name} on {loggedInOrg.name}.</p>
          </div>
        </div>
        <Button onClick={() => handleGenerateReport(agency.name, 'Agency')}>
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={agency.avatar} alt={agency.name} />
                  <AvatarFallback>{agency.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle className="text-2xl">{agency.name}</CardTitle>
                  <CardDescription>ID: {agency.id}</CardDescription>
              </div>
          </div>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="text-sm mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{agency.address}</span>
                  </div>
              </div>

              <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4 text-lg">
                      Operational Overview
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div>
                          <p className="font-bold text-lg">
                          {agencySites.length}
                          </p>
                          <p className="text-muted-foreground font-medium">Sites Assigned</p>
                      </div>
                      </div>
                      <div className="flex items-center gap-3">
                      <ShieldAlert className="h-8 w-8 text-primary" />
                      <div>
                          <p className="font-bold text-lg">{totalIncidents}</p>
                          <p className="text-muted-foreground font-medium">
                          Total Incidents
                          </p>
                      </div>
                      </div>
                      <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-primary" />
                      <div>
                          <p className="font-bold text-lg">
                          {resolvedIncidents}
                          </p>
                          <p className="text-muted-foreground font-medium">
                          Incidents Resolved
                          </p>
                      </div>
                      </div>
                  </div>
              </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Agency Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex flex-col items-center justify-center gap-4">
                <div className="w-56 h-56">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={complianceData}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                        >
                          {complianceData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-4xl font-bold"
                                    style={{ fill: getPerformanceColor() }}
                                  >
                                    {`${performanceData.performance}%`}
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <p className="text-lg font-medium text-center">Overall Performance</p>
              </div>
              <div className="md:col-span-2">
                <ChartContainer config={chartConfig} className="w-full h-64">
                  <ResponsiveContainer>
                    <BarChart
                      data={performanceBreakdownChartData}
                      layout="vertical"
                      margin={{ left: 50, right: 20 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" hide />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
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

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription className="font-medium">
            A detailed list of all sites assigned to {agency.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencySites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Assigned On</TableHead>
                  <TableHead className="text-center">Incidents</TableHead>
                  <TableHead className="text-center">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencySites.map((site) => {
                  const siteIncidents = incidents.filter(
                    (incident) =>
                      incident.siteId === site.id
                  );
                  const resolvedCount = siteIncidents.filter(
                    (incident) => incident.status === 'Resolved'
                  ).length;
                  return (
                    <TableRow key={site.id} className="hover:bg-accent hover:text-accent-foreground group">
                       <TableCell>
                          <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/towerco/sites/${site.id}`}>{site.id}</Link>
                          </Button>
                        </TableCell>
                      <TableCell>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium group-hover:text-accent-foreground">
                          <MapPin className="w-3 h-3" />
                          {site.address}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {site.assignedOn
                          ? new Date(site.assignedOn).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <Badge variant="secondary">
                          {siteIncidents.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <Badge className="bg-chart-2 text-primary-foreground hover:bg-chart-2/90">
                          {resolvedCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">
              No sites are currently assigned to this agency.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
                <CardTitle>Incidents History</CardTitle>
                <CardDescription className="font-medium">
                A log of emergency incidents at sites managed by {agency.name}.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={historySelectedYear} onValueChange={setHistorySelectedYear}>
                    <SelectTrigger className="w-[120px] font-medium">
                    <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all" className="font-medium">All Years</SelectItem>
                    {availableYears.map((year) => (
                        <SelectItem key={year} value={year} className="font-medium">
                        {year}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={historySelectedMonth} onValueChange={setHistorySelectedMonth}>
                    <SelectTrigger className="w-[140px] font-medium">
                    <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all" className="font-medium">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={(i).toString()} className="font-medium">
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const site = getSiteById(incident.siteId);
                  const guard = getGuardById(incident.raisedByGuardId);
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <ClientDate date={incident.incidentTime} />
                      </TableCell>
                      <TableCell className="font-medium">{site?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">
              No incidents found for the selected period.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
