

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
import { ArrowLeft, FileDown, Phone, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AgencyGuardReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const guardId = params.guardId as string;
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

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

  const site = sites.find((s) => s.name === guard.site);
  const patrollingOfficer = site ? patrollingOfficers.find(p => p.id === site.patrollingOfficerId) : undefined;
  const guardIncidents = incidents.filter(i => i.raisedByGuardId === guard.id);
  
  const availableYears = useMemo(() => {
    const years = new Set(
      guardIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [guardIncidents]);

  const filteredIncidents = useMemo(() => {
    return guardIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || incidentDate.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [guardIncidents, selectedYear, selectedMonth]);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${guard.name}.`,
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
  
  const selfieAccuracy = guard.totalSelfieRequests > 0 ? Math.round(((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100) : 100;
  const perimeterAccuracy = guard.performance?.perimeterAccuracy || 0;
  const compliance = Math.round((perimeterAccuracy + selfieAccuracy) / 2);
  const complianceData = [
    { name: 'Compliance', value: compliance },
    { name: 'Remaining', value: 100 - compliance },
  ];
  const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--muted))'];


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
            <p className="text-muted-foreground font-medium">Detailed overview for ${guard.name}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport} className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

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
          <div className="text-sm mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Phone</p>
                <a href={`tel:${guard.phone}`} className="hover:underline text-muted-foreground font-medium">{guard.phone}</a>
              </div>
            </div>
            {site && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold">Assigned Site</p>
                  <p className="text-muted-foreground font-medium">{site.name}</p>
                </div>
              </div>
            )}
            {patrollingOfficer && (
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold">Patrolling Officer</p>
                  <p className="text-muted-foreground font-medium">{patrollingOfficer.name}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Performance Metrics</CardTitle>
          </CardHeader>
           <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="w-32 h-32 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={complianceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="70%"
                                  outerRadius="85%"
                                  paddingAngle={0}
                                  dataKey="value"
                                  stroke="none"
                              >
                                  {complianceData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">{compliance}%</span>
                      </div>
                  </div>
                  <p className="text-lg text-center font-medium">Overall Compliance</p>
              </div>
              <div className="space-y-4 pt-6 border-t">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                          Guard Check-in Accuracy
                      </h4>
                      <span className="text-muted-foreground font-medium">{perimeterAccuracy}%</span>
                    </div>
                    <Progress value={perimeterAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                          Selfie Check-in Accuracy
                      </h4>
                      <span className="text-muted-foreground font-medium">{selfieAccuracy}%</span>
                    </div>
                    <Progress value={selfieAccuracy} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                      <p>Total Selfie Requests: {guard.totalSelfieRequests}</p>
                      <p>Missed Selfies: {guard.missedSelfieCount}</p>
                  </div>
              </div>
          </CardContent>
        </Card>
        
        {site && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Site Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{site.name}</p>
              <p className="text-sm text-muted-foreground font-medium">{site.address}</p>
              {site.geofencePerimeter && (
                <p className="text-sm text-muted-foreground font-medium">Geofence: {site.geofencePerimeter}m</p>
              )}
              <Button asChild variant="link" className="p-0 h-auto font-medium">
                <Link href={`/agency/sites/${site.id}`}>View Full Site Report</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-grow">
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription className="font-medium">A log of emergency incidents involving {guard.name}.</CardDescription>
          </div>
           <div className="flex items-center gap-2 flex-shrink-0">
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
                  <TableHead>Date & Time</TableHead>
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
                    <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleString()}</TableCell>
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
