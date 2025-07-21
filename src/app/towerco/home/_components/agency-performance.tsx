
'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
}

const getPerformanceClass = (score: number) => {
  if (score >= 90) return 'bg-chart-2';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-destructive';
};

export function AgencyPerformance({
  agencies,
  sites,
  incidents,
}: {
  agencies: SecurityAgency[];
  sites: Site[];
  incidents: Incident[];
}) {
  const router = useRouter();

  const performanceData: AgencyPerformanceData[] = useMemo(() => {
    const data = agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter(s => agencySiteIds.has(s.id));
      
      const agencyIncidents = incidents.filter(
        (incident) => agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(i => i.status === 'Resolved').length;
      const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 100;

      const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
      const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
      let totalPerimeterAccuracy = 0;
      let totalSelfiesTaken = 0;
      let totalSelfieRequests = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach(guard => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          totalSelfiesTaken += guard.totalSelfieRequests - guard.missedSelfieCount;
          totalSelfieRequests += guard.totalSelfieRequests;
        });
      }
      const guardPerimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;
      const guardSelfieAccuracy = totalSelfieRequests > 0 ? (totalSelfiesTaken / totalSelfieRequests) * 100 : 100;

      const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
      const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
      let totalSiteVisits = 0;
      let totalSitesForOfficers = 0;
      if (agencyPatrollingOfficers.length > 0) {
          agencyPatrollingOfficers.forEach(po => {
              const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
              if (poSites.length > 0) {
                  totalSiteVisits += poSites.filter(s => s.visited).length;
                  totalSitesForOfficers += poSites.length;
              }
          });
      }
      const officerSiteVisitRate = totalSitesForOfficers > 0 ? (totalSiteVisits / totalSitesForOfficers) * 100 : 100;
      
      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const performance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

      return {
        agency,
        name: agency.name,
        performance: Math.round(performance),
      };
    });

    return data.sort((a, b) => b.performance - a.performance);
  }, [agencies, sites, incidents]);

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agency Performance</CardTitle>
          <CardDescription>
            No performance data available for any agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Assign sites to agencies to see performance metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Rankings</CardTitle>
        <CardDescription>
          Overall scores based on incidents, guard, and officer performance. Click a bar to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceData.map((data) => (
            <div
              key={data.agency.id}
              className="group relative cursor-pointer"
              onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
            >
              <div
                className={cn(
                  'absolute left-0 top-0 h-full rounded-md transition-all duration-300 ease-in-out',
                  getPerformanceClass(data.performance)
                )}
                style={{ width: `${data.performance}%` }}
              ></div>
               <div className="relative flex items-center justify-between p-3 bg-muted/50 rounded-md group-hover:bg-muted transition-colors">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-10 w-10 border-2 border-background">
                     <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                     <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="font-semibold text-foreground">{data.name}</p>
                     <p className="text-sm text-muted-foreground">ID: {data.agency.id}</p>
                   </div>
                 </div>
                 <div className="text-lg font-bold text-foreground">
                   {data.performance}%
                 </div>
               </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
