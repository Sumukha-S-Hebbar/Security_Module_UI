
'use client';

import { useMemo, useState } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';


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
  const [openCollapsibleId, setOpenCollapsibleId] = useState<string | null>(null);

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
  
  const handleCollapsibleOpen = (id: string) => {
    setOpenCollapsibleId(prevId => prevId === id ? null : id);
  }

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
          Overall scores and detailed breakdown for each agency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {performanceData.map((data) => (
            <Collapsible 
              key={data.agency.id} 
              open={openCollapsibleId === data.agency.id}
              onOpenChange={() => handleCollapsibleOpen(data.agency.id)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer w-full text-left">
                  <div className="flex items-center gap-3 w-1/3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={data.agency.avatar} alt={data.name} />
                      <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-card-foreground truncate">{data.name}</p>
                  </div>
                  <div className="flex-1 relative">
                    <Progress value={data.performance} className="h-6" indicatorClassName={getPerformanceClass(data.performance)} />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white mix-blend-screen">
                      {data.performance}%
                    </span>
                  </div>
                   <ChevronDown className={cn("h-5 w-5 transition-transform", openCollapsibleId === data.agency.id && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 pl-16 bg-muted/30 rounded-b-lg">
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Incident Resolution</span>
                            <span className="font-medium">{data.metrics.resolutionRate}%</span>
                        </div>
                        <Progress value={data.metrics.resolutionRate} className="h-2" indicatorClassName={getPerformanceClass(data.metrics.resolutionRate)} />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Guard Perimeter Accuracy</span>
                            <span className="font-medium">{data.metrics.perimeterAccuracy}%</span>
                        </div>
                        <Progress value={data.metrics.perimeterAccuracy} className="h-2" indicatorClassName={getPerformanceClass(data.metrics.perimeterAccuracy)} />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Guard Selfie Accuracy</span>
                            <span className="font-medium">{data.metrics.selfieAccuracy}%</span>
                        </div>
                        <Progress value={data.metrics.selfieAccuracy} className="h-2" indicatorClassName={getPerformanceClass(data.metrics.selfieAccuracy)} />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Officer Site Visit Rate</span>
                            <span className="font-medium">{data.metrics.visitRate}%</span>
                        </div>
                        <Progress value={data.metrics.visitRate} className="h-2" indicatorClassName={getPerformanceClass(data.metrics.visitRate)} />
                    </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
