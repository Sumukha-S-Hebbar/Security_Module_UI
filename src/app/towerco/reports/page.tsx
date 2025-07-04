'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Phone, Mail, MapPin } from 'lucide-react';
import { securityAgencies, sites, alerts } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Alert } from '@/types';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleGenerateReport = (agencyName: string) => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for ${agencyName}.`,
    });
    // In a real app, this would trigger a download.
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Investigating':
        return <Badge variant="default">Investigating</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download detailed reports for your assets.
        </p>
      </div>

      <Tabs defaultValue="agency">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="agency">Agency Reports</TabsTrigger>
          <TabsTrigger value="site">Site Reports</TabsTrigger>
          <TabsTrigger value="guard">Guard Reports</TabsTrigger>
          <TabsTrigger value="supervisor">Supervisor Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="agency" className="mt-6 space-y-6">
          {securityAgencies.map((agency) => {
            const agencySites = sites.filter(
              (site) => site.agencyId === agency.id
            );
            const agencySiteNames = agencySites.map((site) => site.name);
            const agencyIncidents = alerts.filter(
              (alert) =>
                agencySiteNames.includes(alert.site) &&
                alert.type === 'Emergency'
            );

            return (
              <Card key={agency.id}>
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <CardTitle>{agency.name}</CardTitle>
                      <CardDescription>
                        Performance and incident report
                      </CardDescription>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{agency.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{agency.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{agency.address}</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleGenerateReport(agency.name)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Recent Incidents</h4>
                  {agencyIncidents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Incident ID</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Guard</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agencyIncidents.map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>{incident.id}</TableCell>
                            <TableCell>{incident.site}</TableCell>
                            <TableCell>{incident.date}</TableCell>
                            <TableCell>{incident.guard}</TableCell>
                            <TableCell>
                              {getStatusBadge(incident.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent emergency incidents reported for this agency.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Activity Reports</CardTitle>
              <CardDescription>
                Generate reports on individual site activity and incidents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Choose a site and a date range to generate a report.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Site Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guard Performance Reports</CardTitle>
              <CardDescription>
                Generate reports on individual guard performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a guard and date range for a detailed report.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Guard Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supervisor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supervisor Activity Reports</CardTitle>
              <CardDescription>
                Generate reports summarizing supervisor activities and team
                performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a supervisor for an overview of their managed assets.
              </p>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Generate Supervisor Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
