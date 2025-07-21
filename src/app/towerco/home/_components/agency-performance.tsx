'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
}

const getPerformanceClass = (score: number) => {
  if (score >= 90) return 'from-green-400 to-green-600 border-green-500';
  if (score >= 70) return 'from-yellow-400 to-yellow-600 border-yellow-500';
  return 'from-red-400 to-red-600 border-red-500';
};

const getPerformanceBgClass = (score: number) => {
  if (score >= 90) return 'bg-green-500/10';
  if (score >= 70) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
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
        <CardTitle>Agency Performance</CardTitle>
        <CardDescription>
          Overall performance scores for each security agency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="flex justify-around items-end gap-4 h-64 pt-10">
            {performanceData.map((data) => (
                <Tooltip key={data.agency.id}>
                    <TooltipTrigger asChild>
                        <div
                            onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
                            className="flex flex-col items-center gap-2 w-full h-full cursor-pointer group"
                        >
                            <div className="relative w-full h-full flex items-end justify-center">
                                {/* Ghost Bar */}
                                <div className={cn("absolute bottom-0 w-12 rounded-t-lg transition-all", getPerformanceBgClass(data.performance))} style={{ height: '100%' }}></div>
                                
                                {/* Main Bar */}
                                <div
                                className={cn(
                                    'relative w-12 rounded-t-lg bg-gradient-to-t transition-all duration-500',
                                    getPerformanceClass(data.performance)
                                )}
                                style={{ height: `${data.performance}%` }}
                                >
                                    {/* Score Bubble */}
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center">
                                        <div className="absolute w-full h-full bg-background rounded-full scale-90 group-hover:scale-100 transition-transform"></div>
                                        <div className={cn("absolute w-full h-full rounded-full bg-gradient-to-t opacity-20", getPerformanceClass(data.performance))}></div>
                                        <div className="absolute w-12 h-12 bg-background rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-foreground z-10">{data.performance}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Avatar className="h-10 w-10 border-2 border-background -mt-4 z-10">
                                    <AvatarImage src={data.agency.avatar} alt={data.name} />
                                    <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium text-center mt-2 truncate max-w-24">{data.name}</p>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{data.name} - {data.performance}%</p>
                    </TooltipContent>
                </Tooltip>
            ))}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
