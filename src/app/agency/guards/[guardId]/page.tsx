
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { guards } from '@/lib/data/guards';
import { sites } from '@/lib/data/sites';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, FileDown, Phone, MapPin, UserCheck, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};


export default function AgencyGuardReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const guardId = params.guardId as string;
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [performanceSelectedYear, setPerformanceSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [performanceSelectedMonth, setPerformanceSelectedMonth] = useState<string>('all');
  const incidentsTableRef = useRef<HTMLDivElement>(null);

  const guard = guards.find((g) => g.id === guardId);

  if (!guard) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Guard not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const site = sites.find((s) => s.site_name === guard.site);
  const patrollingOfficer = site ? patrollingOfficers.find(p => p.id === site.patrollingOfficerId) : undefined;
  const guardIncidents = incidents.filter(i => i.raisedByGuardId === guard.id);
  const resolvedIncidents = guardIncidents.filter(i => i.status === 'Resolved').length;
  
  const availableYears = useMemo(() => {
    const years = new Set(
      guardIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [guardIncidents]);
  
  const performanceAvailableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const filteredIncidents = useMemo(() => {
    return guardIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || incidentDate.getMonth().toString() === selectedMonth;
      const statusMatch = selectedStatus === 'all' || incident.status.toLowerCase().replace(' ', '-') === selectedStatus;
      return yearMatch && monthMatch && statusMatch;
    });
  }, [guardIncidents, selectedYear, selectedMonth, selectedStatus]);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${guard.name}.`,
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
  
  const selfieAccuracy = guard.totalSelfieRequests > 0 ? Math.round(((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100) : 100;
  const perimeterAccuracy = guard.performance?.perimeterAccuracy || 0;
  
  const perimeterAccuracyData = [
    { name: 'Accuracy', value: perimeterAccuracy },
    { name: 'Remaining', value: 100 - perimeterAccuracy },
  ];
  
  const selfieAccuracyData = [
    { name: 'Accuracy', value: selfieAccuracy },
    { name: 'Remaining', value: 100 - selfieAccuracy },
  ];

  const perimeterColor = getPerformanceColor(perimeterAccuracy);
  const selfieColor = getPerformanceColor(selfieAccuracy);
  
  const COLORS_CHECKIN = [perimeterColor, 'hsl(var(--muted))'];
  const COLORS_SELFIE = [selfieColor, 'hsl(var(--muted))'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/agency/guards">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Guards</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Guard Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for {guard.name}.</p>
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
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={guard.avatar} alt={guard.name} />
                <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{guard.name}</CardTitle>
                <CardDescription>ID: {guard.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mt-2 space-y-2">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-primary" />
                <a href={`tel:${guard.phone}`} className="hover:underline font-medium">{guard.phone}</a>
              </div>
            </div>
             <div className="pt-4 mt-4 border-t">
              <h4 className="font-semibold mb-4 text-lg">Operational Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <button onClick={handleScrollToIncidents} className="flex flex-col items-center gap-1 group">
                      <ShieldAlert className="h-8 w-8 text-primary" />
                      <p className="font-medium text-[#00B4D8] group-hover:underline">Total Incidents</p>
                      <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{guardIncidents.length}</p>
                  </button>
                   <button onClick={handleScrollToIncidents} className="flex flex-col items-center gap-1 group">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                      <p className="font-medium text-[#00B4D8] group-hover:underline">Incidents Resolved</p>
                      <p className="font-bold text-lg text-[#00B4D8] group-hover:underline">{resolvedIncidents}</p>
                  </button>
                </div>
            </div>
          </CardContent>
        </Card>

        {site && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Assigned Site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-base">{site.site_name}</p>
                <p className="font-medium">ID: {site.id}</p>
              </div>
              <div className="text-sm space-y-1 pt-2 border-t">
                <p className="font-semibold">Address</p>
                <p className="font-medium text-muted-foreground">
                  {site.site_address_line1}
                </p>
              </div>
              <Button asChild variant="link" className="p-0 h-auto font-medium">
                <Link href={`/agency/sites/${site.id}`}>
                  View Full Site Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {patrollingOfficer && (
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5"/>Patrolling Officer</CardTitle>
                <CardDescription>Officer overseeing this site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-semibold text-base">{patrollingOfficer.name}</p>
                    <p className="font-medium">ID: {patrollingOfficer.id}</p>
                </div>
                <div className="text-sm space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline">{patrollingOfficer.phone}</a></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline">{patrollingOfficer.email}</a></div>
                </div>
                 <Button asChild variant="link" className="p-0 h-auto font-medium">
                    <Link href={`/agency/patrolling-officers/${patrollingOfficer.id}`}>View Full Officer Report</Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </div>

       <Card>
          <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Guard Performance</CardTitle>
                <CardDescription>Key performance indicators for this guard.</CardDescription>
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
           <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
                  <div className="flex flex-col items-center gap-2">
                      <div className="w-32 h-32 relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={perimeterAccuracyData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="70%"
                                      outerRadius="85%"
                                      paddingAngle={0}
                                      dataKey="value"
                                      stroke="none"
                                  >
                                      {perimeterAccuracyData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS_CHECKIN[index % COLORS_CHECKIN.length]} />
                                      ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-3xl font-bold" style={{ color: perimeterColor }}>
                                  {perimeterAccuracy}%
                              </span>
                          </div>
                      </div>
                      <p className="flex items-center gap-2 text-center font-medium">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Guard Check-in Accuracy
                      </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                      <div className="w-32 h-32 relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={selfieAccuracyData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="70%"
                                      outerRadius="85%"
                                      paddingAngle={0}
                                      dataKey="value"
                                      stroke="none"
                                  >
                                      {selfieAccuracyData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS_SELFIE[index % COLORS_SELFIE.length]} />
                                      ))}
                                  </Pie>
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-3xl font-bold" style={{ color: selfieColor }}>
                                  {selfieAccuracy}%
                              </span>
                          </div>
                      </div>
                      <p className="flex items-center gap-2 text-center font-medium">
                        <UserCheck className="w-4 h-4 text-primary" />
                        Selfie Check-in Accuracy
                      </p>
                      <div className="text-sm text-muted-foreground font-medium text-center mt-1">
                          <p>Total Requests: {guard.totalSelfieRequests} | Missed: {guard.missedSelfieCount}</p>
                      </div>
                  </div>
              </div>
          </CardContent>
        </Card>

      <Card ref={incidentsTableRef}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>Incidents Log</CardTitle>
            <CardDescription className="font-medium">A log of emergency incidents involving {guard.name}.</CardDescription>
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
                  <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
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
        <CardContent>
          {filteredIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Incident Time</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
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
                    <TableCell className="font-medium">{incident.siteId}</TableCell>
                    <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">No recent emergency incidents for this guard {selectedYear !== 'all' || selectedMonth !== 'all' ? 'in the selected period' : ''}.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

    