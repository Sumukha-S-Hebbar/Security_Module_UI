

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import type { Incident } from '@/types';
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
import { ArrowLeft, MapPin, UserCheck, ShieldAlert, FileDown, Fence, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgencySiteReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const siteId = params.siteId as string;
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const site = sites.find((s) => s.id === siteId);

  if (!site) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Site not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const siteIncidents = incidents.filter(
    (incident) => incident.siteId === site.id
  );
  
  const siteGuards = guards.filter(g => site.guards.includes(g.id));
  const patrollingOfficer = patrollingOfficers.find(p => p.id === site.patrollingOfficerId);

  const availableYears = useMemo(() => {
    const years = new Set(
      siteIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [siteIncidents]);

  const filteredIncidents = useMemo(() => {
    return siteIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || incidentDate.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [siteIncidents, selectedYear, selectedMonth]);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${site.name}.`,
    });
    // In a real app, this would trigger a download.
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

  const getGuardById = (id: string) => guards.find(g => g.id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/agency/sites">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Sites</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for {site.name}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport}>
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{site.name}</CardTitle>
              <CardDescription>ID: {site.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="font-medium text-muted-foreground">{site.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Patrolling Officer</p>
                <p className="font-medium text-muted-foreground">{patrollingOfficer ? patrollingOfficer.name : 'Unassigned'}</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <Fence className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Geofence Perimeter</p>
                <p className="font-medium text-muted-foreground">{site.geofencePerimeter ? `${site.geofencePerimeter}m` : 'Not set'}</p>
              </div>
            </div>
             <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold">Total Incidents</p>
                <p className="font-medium text-muted-foreground">{siteIncidents.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Assigned Guards</CardTitle>
            </CardHeader>
            <CardContent>
                {siteGuards.length > 0 ? (
                    <div className="space-y-3">
                        {siteGuards.map(guard => (
                            <div key={guard.id} className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={guard.avatar} alt={guard.name} />
                                    <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button asChild variant="link" className="p-0 h-auto text-base font-medium">
                                        <Link href={`/agency/guards/${guard.id}`}>{guard.name}</Link>
                                    </Button>
                                    <p className="text-sm text-muted-foreground font-medium">ID: {guard.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground font-medium">No guards are assigned to this site.</p>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-grow">
                <CardTitle>Incidents at {site.name}</CardTitle>
                <CardDescription className="font-medium">A log of all emergency incidents reported at this site.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                      <TableHead>Guard</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => {
                      const guard = getGuardById(incident.raisedByGuardId);
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
                          <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">{guard?.name || 'N/A'}</TableCell>
                          <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4 font-medium">No emergency incidents have been reported for this site {selectedYear !== 'all' || selectedMonth !== 'all' ? 'in the selected period' : ''}.</p>
              )}
            </CardContent>
          </Card>
      </div>

    </div>
  );
