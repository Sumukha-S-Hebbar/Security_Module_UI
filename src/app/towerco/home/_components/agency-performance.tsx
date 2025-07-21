
'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
  metrics: {
    resolutionRate: number;
    perimeterAccuracy: number;
    selfieAccuracy: number;
    visitRate: number;
  };
}

const getPerformanceClass = (score: number) => {
  if (score >= 90) return 'bg-chart-2';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-destructive';
};

const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-chart-2';
    if (score >= 70) return 'text-yellow-500';
    return 'text-destructive';
}

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
        metrics: {
            resolutionRate: Math.round(incidentResolutionRate),
            perimeterAccuracy: Math.round(guardPerimeterAccuracy),
            selfieAccuracy: Math.round(guardSelfieAccuracy),
            visitRate: Math.round(officerSiteVisitRate),
        }
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
          Overall scores based on incidents, guard, and officer performance. Click an agency to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {performanceData.map((data, index) => (
            <li
              key={data.agency.id}
              onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex items-center gap-4">
                   <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                    {index + 1}
                   </div>
                   <Avatar className="h-12 w-12 border">
                     <AvatarImage src={data.agency.avatar} alt={data.name} />
                     <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="font-semibold text-card-foreground">{data.name}</p>
                     <p className="text-sm text-muted-foreground">ID: {data.agency.id}</p>
                   </div>
                </div>

                <div className="md:col-span-2 flex flex-col justify-center gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Overall Performance</p>
                        <p className={cn("text-lg font-bold", getScoreColorClass(data.performance))}>{data.performance}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                        <div>
                            <div className="flex justify-between text-muted-foreground mb-1">
                                <span>Incident Resolution</span>
                                <span>{data.metrics.resolutionRate}%</span>
                            </div>
                            <Progress value={data.metrics.resolutionRate} className="h-1.5" indicatorClassName={getPerformanceClass(data.metrics.resolutionRate)} />
                        </div>
                        <div>
                            <div className="flex justify-between text-muted-foreground mb-1">
                                <span>Perimeter Accuracy</span>
                                <span>{data.metrics.perimeterAccuracy}%</span>
                            </div>
                            <Progress value={data.metrics.perimeterAccuracy} className="h-1.5" indicatorClassName={getPerformanceClass(data.metrics.perimeterAccuracy)} />
                        </div>
                        <div>
                            <div className="flex justify-between text-muted-foreground mb-1">
                                <span>Selfie Accuracy</span>
                                <span>{data.metrics.selfieAccuracy}%</span>
                            </div>
                            <Progress value={data.metrics.selfieAccuracy} className="h-1.5" indicatorClassName={getPerformanceClass(data.metrics.selfieAccuracy)} />
                        </div>
                        <div>
                            <div className="flex justify-between text-muted-foreground mb-1">
                                <span>Site Visit Rate</span>
                                <span>{data.metrics.visitRate}%</span>
                            </div>
                            <Progress value={data.metrics.visitRate} className="h-1.5" indicatorClassName={getPerformanceClass(data.metrics.visitRate)} />
                        </div>
                    </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
