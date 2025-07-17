

import { useMemo } from 'react';
import { incidents, guards, sites } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import type { Guard, Site } from '@/types';
import { SitesMap } from './_components/sites-map';
import { AnalyticsDashboard } from './_components/analytics-dashboard';

const LOGGED_IN_SUPERVISOR_ID = 'PO01'; // Simulate logged-in Supervisor

export default function HomePage() {
  const supervisorSites = useMemo(() => sites.filter(s => s.patrollingOfficerId === LOGGED_IN_SUPERVISOR_ID), []);
  const supervisorSiteIds = useMemo(() => new Set(supervisorSites.map(s => s.id)), [supervisorSites]);
  
  const supervisorGuards = useMemo(() => {
      const siteNames = new Set(supervisorSites.map(s => s.name));
      return guards.filter(g => siteNames.has(g.site));
  }, [supervisorSites]);
  
  const supervisorIncidents = useMemo(() => incidents.filter(i => supervisorSiteIds.has(i.siteId)), [supervisorSiteIds]);

  const activeEmergencies = supervisorIncidents.filter(
    (incident) => incident.status === 'Active'
  );

  const getGuardById = (id: string): Guard | undefined => {
    return supervisorGuards.find((g) => g.id === id);
  };
  
  const getSiteById = (id: string): Site | undefined => {
    return supervisorSites.find((s) => s.id === id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Supervisor. Here's what's happening.
        </p>
      </div>

      <AnalyticsDashboard guards={supervisorGuards} sites={supervisorSites} />

      <Card className="border-destructive bg-destructive/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <CardTitle>Current Emergency Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmergencies.map((incident) => {
                  const guardDetails = getGuardById(incident.raisedByGuardId);
                  const siteDetails = getSiteById(incident.siteId);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">
                        {siteDetails?.name}
                      </TableCell>
                      <TableCell>{guardDetails?.name}</TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Contact Guard
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No active emergency incidents. All systems are normal.
            </p>
          )}
        </CardContent>
      </Card>
      
      <SitesMap sites={supervisorSites} />
    </div>
  );
}
