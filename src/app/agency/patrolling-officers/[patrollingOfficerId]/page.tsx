
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites } from '@/lib/data/sites';
import { guards } from '@/lib/data/guards';
import { incidents } from '@/lib/data/incidents';
import type { Incident, Guard, Site, PatrollingOfficer } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, FileDown, Phone, Mail, MapPin, Users, ShieldAlert, Map, Clock, ChevronDown, Building2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState, useRef, Fragment } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};

export default function AgencyPatrollingOfficerReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patrollingOfficerId = params.patrollingOfficerId as string;
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [performanceSelectedYear, setPerformanceSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [performanceSelectedMonth, setPerformanceSelectedMonth] = useState<string>('all');
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);

  const incidentsTableRef = useRef<HTMLDivElement>(null);
  const assignedSitesTableRef = useRef<HTMLDivElement>(null);

  const patrollingOfficer = patrollingOfficers.find((p) => p.id === patrollingOfficerId);

  const assignedSites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID && site.patrollingOfficerId === patrollingOfficerId), [patrollingOfficerId]);
  
  const assignedSiteIds = useMemo(() => new Set(assignedSites.map(s => s.id)), [assignedSites]);
  
  const assignedGuards = useMemo(() => {
    const siteNames = new Set(assignedSites.map(s => s.site_name));
    return guards.filter(guard => siteNames.has(guard.site));
  }, [assignedSites]);

  const assignedIncidents = useMemo(() => incidents.filter(incident => assignedSiteIds.has(incident.siteId)), [assignedSiteIds]);
  
  const availableYears = useMemo(() => {
    const years = new Set(
      assignedIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [assignedIncidents]);
  
  const performanceAvailableYears = useMemo(() => {
    // In a real app, this would be derived from available data time ranges
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const filteredIncidents = useMemo(() => {
    return assignedIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || incidentDate.getMonth().toString() === selectedMonth;
      const statusMatch = selectedStatus === 'all' || incident.status.toLowerCase().replace(' ', '-') === selectedStatus;
      return yearMatch && monthMatch && statusMatch;
    });
  }, [assignedIncidents, selectedYear, selectedMonth, selectedStatus]);

  const visitedSites = assignedSites.filter(s => s.visited).length;
  const siteVisitAccuracy = assignedSites.length > 0 ? (visitedSites / assignedSites.length) * 100 : 100;
  const averageResponseTime = patrollingOfficer?.averageResponseTime || 0;
  
  const roundedSiteVisitAccuracy = Math.round(siteVisitAccuracy);
  const siteVisitColor = getPerformanceColor(roundedSiteVisitAccuracy);

  const siteVisitAccuracyData = [
    { name: 'Accuracy', value: roundedSiteVisitAccuracy },
    { name: 'Remaining', value: 100 - roundedSiteVisitAccuracy },
  ];
  const COLORS_SITE_VISIT = [siteVisitColor, 'hsl(var(--muted))'];

  if (!patrollingOfficer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Patrolling Officer not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${patrollingOfficer.name}.`,
    });
  };

  const handleScrollToIncidents = () => {
    const element = incidentsTableRef.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight-row');
        setTimeout(() => {
            element.classList.remove('highlight-row');
        }, 2000);
    }
  };

  const handleScrollToAssignedSites = () => {
    const element = assignedSitesTableRef.current;
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('highlight-row');
        setTimeout(() => {
            element.classList.remove('highlight-row');
        }, 2000);
    }
  };
  
  const handleExpandClick = (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();
    setExpandedSiteId(prevId => prevId === siteId ? null : siteId);
  }

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/agency/patrolling-officers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Patrolling Officers</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for {patrollingOfficer.name}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
              <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={patrollingOfficer.avatar} alt={patrollingOfficer.name} />
                        <AvatarFallback>{patrollingOfficer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{patrollingOfficer.name}</CardTitle>
                        <p className="font-medium text-foreground">ID: {patrollingOfficer.id}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm mt-2 space-y-2">
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-1 text-primary" />
                        <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline font-medium">{patrollingOfficer.phone}</a>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 mt-1 text-primary" />
                        <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline font-medium">{patrollingOfficer.email}</a>
                      </div>
                    </div>
                     <div className="pt-4 mt-4 border-t">
                      <h4 className="font-semibold mb-4 text-lg">Operational Overview</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div className="flex flex-col items-center gap-1">
                              <Users className="h-8 w-8 text-primary" />
                              <p className="font-medium text-muted-foreground">Total Guards</p>
                              <p className="font-bold text-lg">{assignedGuards.length}</p>
                          </div>
                          <button
                            onClick={handleScrollToAssignedSites}
                            className="flex flex-col items-center gap-1 group"
                          >
                              <Building2 className="h-8 w-8 text-primary" />
                              <p className="font-medium text-[#00B4D8] group-hover:underline">Total Sites</p>
                              <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{assignedSites.length}</p>
                          </button>
                          <button
                            onClick={handleScrollToIncidents}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <ShieldAlert className="h-8 w-8 text-primary" />
                            <p className="font-medium text-[#00B4D8] group-hover:underline">Total Incidents</p>
                            <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{assignedIncidents.length}</p>
                          </button>
                        </div>
                    </div>
                  </CardContent>
              </Card>
          </div>
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Patrolling Officer Performance</CardTitle>
                    <CardDescription className="font-medium">
                        Key performance indicators for this patrolling officer.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={performanceSelectedYear} onValueChange={setPerformanceSelectedYear}>
                        <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                        {performanceAvailableYears.map((year) => (
                            <SelectItem key={year} value={year} className="font-medium">
                            {year}
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center pt-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={siteVisitAccuracyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="85%"
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {siteVisitAccuracyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_SITE_VISIT[index % COLORS_SITE_VISIT.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold" style={{ color: siteVisitColor }}>
                                {roundedSiteVisitAccuracy}%
                            </span>
                        </div>
                    </div>
                    <p className="flex items-center gap-2 text-center font-medium">
                    <Map className="w-4 h-4 text-primary" />
                    Site Visit Accuracy
                    </p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 text-foreground">
                        <Clock className="w-12 h-12 text-primary" />
                        <div>
                            <span className="text-4xl font-bold">{averageResponseTime.toFixed(0)}</span>
                            <span className="text-lg text-muted-foreground ml-1">mins</span>
                        </div>
                    </div>
                    <p className="text-center font-medium mt-2">
                        Average Response Time
                    </p>
                </div>
            </CardContent>
          </Card>
      </div>

      <Card ref={assignedSitesTableRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Assigned Sites</CardTitle>
          <CardDescription className="font-medium">A detailed list of all sites assigned to {patrollingOfficer.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedSites.length > 0 ? (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Site ID</TableHead>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Guards</TableHead>
                          <TableHead>Incidents</TableHead>
                          <TableHead>Resolved</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {assignedSites.map(site => {
                          const siteGuards = guards.filter(g => g.site === site.site_name);
                          const isExpanded = expandedSiteId === site.id;
                          const siteIncidents = incidents.filter(i => i.siteId === site.id);
                          const resolvedCount = siteIncidents.filter(i => i.status === 'Resolved').length;

                          return (
                            <Fragment key={site.id}>
                              <TableRow className="hover:bg-accent hover:text-accent-foreground group">
                                  <TableCell>
                                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground">
                                          <Link href={`/agency/sites/${site.id}`}>{site.id}</Link>
                                      </Button>
                                  </TableCell>
                                  <TableCell className="font-medium">{site.site_name}</TableCell>
                                  <TableCell className="font-medium">{site.site_address_line1}</TableCell>
                                  <TableCell>
                                     <Button
                                      variant="link"
                                      className="p-0 h-auto flex items-center gap-2 text-accent group-hover:text-accent-foreground"
                                      onClick={(e) => handleExpandClick(e, site.id)}
                                      disabled={siteGuards.length === 0}
                                    >
                                      <Users className="h-4 w-4" />
                                      {siteGuards.length}
                                      <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                    </Button>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                      <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                                      <span>{siteIncidents.length}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                      <CheckCircle className="h-4 w-4 text-chart-2" />
                                      <span>{resolvedCount}</span>
                                    </div>
                                  </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableCell colSpan={6} className="p-0">
                                        <div className="p-4">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b-primary/20 hover:bg-transparent">
                                                        <TableHead className="text-foreground">Guard ID</TableHead>
                                                        <TableHead className="text-foreground">Guard</TableHead>
                                                        <TableHead className="text-foreground">Contact</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {siteGuards.map(guard => (
                                                        <TableRow key={guard.id} className="hover:bg-accent hover:text-accent-foreground group cursor-pointer" onClick={() => router.push(`/agency/guards/${guard.id}`)}>
                                                            <TableCell>
                                                                <Button asChild variant="link" className="p-0 h-auto text-sm font-medium text-accent group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                                                  <Link href={`/agency/guards/${guard.id}`}>{guard.id}</Link>
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={guard.avatar} alt={guard.name} />
                                                                        <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <p className="font-semibold">{guard.name}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="h-4 w-4" />
                                                                    <a href={`tel:${guard.phone}`} className="hover:underline font-medium">{guard.phone}</a>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          )
                      })}
                  </TableBody>
              </Table>
          ) : (
              <p className="text-sm text-muted-foreground font-medium">No sites are assigned to this patrolling officer.</p>
          )}
        </CardContent>
      </Card>
      
      <Card ref={incidentsTableRef}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>Incidents Log</CardTitle>
            <CardDescription className="font-medium">A log of emergency incidents at sites managed by {patrollingOfficer.name}.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            {availableYears.length > 0 && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
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
            )}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] font-medium">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()} className="font-medium">
                    {new Date(0, i).toLocaleString('default', {
                      month: 'long',
                    })}
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
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Incident Time</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => {
                    const site = sites.find(s => s.id === incident.siteId);
                    const guard = guards.find(g => g.id === incident.raisedByGuardId);
                    return (
                        <TableRow 
                          key={incident.id}
                          onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                        >
                            <TableCell>
                              <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                <Link href={`/agency/incidents/${incident.id}`}>{incident.id}</Link>
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleTimeString()}</TableCell>
                            <TableCell className="font-medium">{site?.site_name || 'N/A'}</TableCell>
                            <TableCell className="font-medium">{guard?.name || 'N/A'}</TableCell>
                            <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">No recent incidents for this patrolling officer's sites {selectedYear !== 'all' || selectedMonth !== 'all' ? 'in the selected period' : ''}.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
