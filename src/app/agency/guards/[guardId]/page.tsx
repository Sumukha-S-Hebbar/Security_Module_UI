
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

export default function AgencyGuardReportPage() {
  const params = useParams();
  const { toast } = useToast();
  const guardId = params.guardId as string;

  const guard = guards.find((g) => g.id === guardId);

  if (!guard) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Guard not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const site = sites.find((s) => s.name === guard.site);
  const patrollingOfficer = site ? patrollingOfficers.find(p => p.id === site.patrollingOfficerId) : undefined;
  const guardIncidents = incidents.filter(i => i.raisedByGuardId === guard.id);

  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${guard.name}.`,
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
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/agency/guards">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Guards</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Guard Report</h1>
          <p className="text-muted-foreground">Detailed overview for {guard.name}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
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
                <a href={`tel:${guard.phone}`} className="hover:underline">{guard.phone}</a>
              </div>
            </div>
            {site && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Assigned Site</p>
                  <p>{site.name}</p>
                </div>
              </div>
            )}
            {patrollingOfficer && (
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Patrolling Officer</p>
                  <p>{patrollingOfficer.name}</p>
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
                          <span className="text-3xl font-bold text-foreground">{compliance}%</span>
                      </div>
                  </div>
                  <p className="font-medium text-lg text-center">Overall Compliance</p>
              </div>
              <div className="space-y-4 pt-6 border-t">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium flex items-center gap-2 text-sm">
                          Perimeter Accuracy
                      </h4>
                      <span className="font-bold text-muted-foreground">{perimeterAccuracy}%</span>
                    </div>
                    <Progress value={perimeterAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium flex items-center gap-2 text-sm">
                          Selfie Check-in Accuracy
                      </h4>
                      <span className="font-bold text-muted-foreground">{selfieAccuracy}%</span>
                    </div>
                    <Progress value={selfieAccuracy} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">{site.address}</p>
              {site.geofencePerimeter && (
                <p className="text-sm text-muted-foreground">Geofence: {site.geofencePerimeter}m</p>
              )}
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href={`/agency/sites/${site.id}`}>View Full Site Report</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>A log of emergency incidents involving {guard.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          {guardIncidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.id}</TableCell>
                    <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                    <TableCell>{incident.site}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent emergency incidents for this guard.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
