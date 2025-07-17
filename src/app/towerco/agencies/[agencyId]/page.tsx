
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { securityAgencies } from '@/lib/data/security-agencies';
import { sites } from '@/lib/data/sites';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import type { Incident, Site } from '@/types';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

const chartConfig = {
  incidents: {
    label: 'Incidents',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export default function AgencyReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const agencyId = params.agencyId as string;

  const agency = securityAgencies.find((a) => a.id === agencyId);

  if (!agency) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Agency not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateReport = (name: string, type: string) => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${type} ${name}.`,
    });
    // In a real app, this would trigger a download.
  };

  const agencySites = sites.filter(
    (site) =>
      agency.siteIds.includes(site.id) && site.towerco === LOGGED_IN_TOWERCO
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

  const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
  const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
  const agencyPatrollingOfficerIds = new Set(
    agencySites.map((s) => s.patrollingOfficerId).filter(Boolean)
  );
  const totalWorkforce = agencyGuards.length + agencyPatrollingOfficerIds.size;

  const assignmentDates = agencySites
    .map((s) => s.assignedOn)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d));
  const firstAssignedDate =
    assignmentDates.length > 0
      ? new Date(Math.min(...assignmentDates.map((d) => d.getTime())))
      : null;
      
  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Under Review':
        return <Badge variant="default">Under Review</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const availableYears = useMemo(() => {
    const years = new Set(
      agencyIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size === 0) {
      years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [agencyIncidents]);

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; incidents: number }[] = months.map(
      (month) => ({ month, incidents: 0 })
    );

    agencyIncidents.forEach((incident) => {
      const incidentDate = new Date(incident.incidentTime);
      if (incidentDate.getFullYear().toString() === selectedYear) {
        const monthIndex = incidentDate.getMonth();
        monthlyData[monthIndex].incidents += 1;
      }
    });

    return monthlyData;
  }, [agencyIncidents, selectedYear]);

  const getSiteById = (id: string) => sites.find(s => s.id === id);
  const getGuardById = (id: string) => guards.find(g => g.id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/towerco/agencies">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Agencies</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Agency Report</h1>
            <p className="text-muted-foreground">Detailed overview for {agency.name} on {LOGGED_IN_TOWERCO}.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
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
            <Button onClick={() => handleGenerateReport(agency.name, 'Agency')}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground mt-2 space-y-2">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{agency.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{agency.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{agency.address}</span>
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
                        <p className="text-muted-foreground">Sites Assigned</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-bold text-lg">
                        {totalWorkforce}
                        </p>
                        <p className="text-muted-foreground">
                        Total Workforce
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-bold text-lg">{totalIncidents}</p>
                        <p className="text-muted-foreground">
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
                        <p className="text-muted-foreground">
                        Incidents Resolved
                        </p>
                    </div>
                    </div>
                    {firstAssignedDate && (
                    <>
                        <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary" />
                        <div>
                            <p className="font-bold text-lg">
                            {firstAssignedDate.toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">
                            First Assignment
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                            <p className="font-bold text-lg">
                            {formatDistanceToNow(firstAssignedDate, {
                                addSuffix: true,
                            })}
                            </p>
                            <p className="text-muted-foreground">
                            Assignment Duration
                            </p>
                        </div>
                        </div>
                    </>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Incident Trend</CardTitle>
            <CardDescription>
              Monthly emergency incidents for {selectedYear}.
            </CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              data={monthlyIncidentData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                fontSize={12}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="var(--color-incidents)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription>
            A detailed list of all sites assigned to {agency.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencySites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Assigned On</TableHead>
                  <TableHead>Assignment Duration</TableHead>
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
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {site.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        {site.assignedOn
                          ? new Date(site.assignedOn).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {site.assignedOn
                          ? formatDistanceToNow(new Date(site.assignedOn), {
                              addSuffix: true,
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {siteIncidents.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
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
            <p className="text-muted-foreground text-center py-4">
              No sites are currently assigned to this agency.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            A log of emergency incidents at sites managed by {agency.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agencyIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencyIncidents.map((incident) => {
                  const site = getSiteById(incident.siteId);
                  const guard = getGuardById(incident.raisedByGuardId);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell>{incident.id}</TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                      <TableCell>{site?.name || 'N/A'}</TableCell>
                      <TableCell>{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent incidents for this agency's sites.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
