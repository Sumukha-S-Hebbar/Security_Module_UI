
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
import { ArrowLeft, FileDown, Phone, Mail, MapPin, Users, ShieldAlert, Map, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgencyPatrollingOfficerReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const patrollingOfficerId = params.patrollingOfficerId as string;
  const [selectedMonth, setSelectedMonth] = useState('all');

  const patrollingOfficer = patrollingOfficers.find((p) => p.id === patrollingOfficerId);

  if (!patrollingOfficer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Patrolling Officer not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedSites = sites.filter(site => site.patrollingOfficerId === patrollingOfficerId);
  const assignedSiteIds = new Set(assignedSites.map(s => s.id));
  const assignedGuards = guards.filter(guard => {
    const site = sites.find(s => s.name === guard.site);
    return site && site.patrollingOfficerId === patrollingOfficerId;
  });
  const assignedIncidents = incidents.filter(incident => assignedSiteIds.has(incident.siteId));
  
  const filteredIncidents = useMemo(() => {
    if (selectedMonth === 'all') {
      return assignedIncidents;
    }
    return assignedIncidents.filter(incident => {
        const incidentDate = new Date(incident.incidentTime);
        return incidentDate.getMonth() === parseInt(selectedMonth, 10);
    });
  }, [assignedIncidents, selectedMonth]);

  const visitedSites = assignedSites.filter(s => s.visited).length;
  const siteVisitAccuracy = assignedSites.length > 0 ? (visitedSites / assignedSites.length) * 100 : 100;
  const averageResponseTime = patrollingOfficer.averageResponseTime || 0;


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${patrollingOfficer.name}.`,
    });
  };

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/agency/patrolling-officers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Patrolling Officers</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patrolling Officer Report</h1>
          <p className="text-muted-foreground">Detailed overview for {patrollingOfficer.name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={patrollingOfficer.avatar} alt={patrollingOfficer.name} />
                <AvatarFallback>{patrollingOfficer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{patrollingOfficer.name}</CardTitle>
                <CardDescription>ID: {patrollingOfficer.id}</CardDescription>
              </div>
            </div>
            <Button onClick={handleDownloadReport}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <a href={`tel:${patrollingOfficer.phone}`} className="hover:underline">{patrollingOfficer.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a href={`mailto:${patrollingOfficer.email}`} className="hover:underline">{patrollingOfficer.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Total Guards</p>
                <p>{assignedGuards.length}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Total Sites</p>
                <p>{assignedSites.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
           <CardDescription>
            Key performance indicators for this patrolling officer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                  <Map className="w-4 h-4 text-primary" />
                  Site Visit Accuracy
              </h4>
              <span className="font-bold text-muted-foreground">{siteVisitAccuracy.toFixed(1)}%</span>
            </div>
            <Progress value={siteVisitAccuracy} className="h-2" />
          </div>
          <div className="flex items-center justify-between pt-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  Average Response Time
              </h4>
              <span className="font-bold text-lg text-foreground">{averageResponseTime.toFixed(0)} mins</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/>Assigned Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedSites.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Site Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Guards</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedSites.map(site => (
                            <TableRow key={site.id}>
                                <TableCell className="font-medium">{site.name}</TableCell>
                                <TableCell>{site.address}</TableCell>
                                <TableCell>{site.guards.length}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">No sites are assigned to this patrolling officer.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Guards Under Him</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedGuards.length > 0 ? (
                <div className="space-y-3">
                    {assignedGuards.map(guard => (
                        <div key={guard.id} className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={guard.avatar} alt={guard.name} />
                                <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{guard.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {guard.id} | Site: {guard.site}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No guards are assigned to this patrolling officer's sites.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>A log of emergency incidents at sites managed by {patrollingOfficer.name}.</CardDescription>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {new Date(0, i).toLocaleString('default', {
                    month: 'long',
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => {
                    const site = sites.find(s => s.id === incident.siteId);
                    const guard = guards.find(g => g.id === incident.raisedByGuardId);
                    return (
                        <TableRow key={incident.id}>
                            <TableCell>{incident.id}</TableCell>
                            <TableCell>{new Date(incident.incidentTime).toLocaleString()}</TableCell>
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
            <p className="text-muted-foreground text-center py-4">No recent incidents for this patrolling officer's sites {selectedMonth !== 'all' && 'in the selected month'}.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

    