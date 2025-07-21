
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
  incidentResolutionRate: number;
  guardPerimeterAccuracy: number;
  guardSelfieAccuracy: number;
  officerSiteVisitRate: number;
}

const getPerformanceClass = (score: number) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
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
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

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
        incidentResolutionRate: Math.round(incidentResolutionRate),
        guardPerimeterAccuracy: Math.round(guardPerimeterAccuracy),
        guardSelfieAccuracy: Math.round(guardSelfieAccuracy),
        officerSiteVisitRate: Math.round(officerSiteVisitRate),
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
          Overall performance scores for each security agency. Click to expand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {performanceData.map((data) => (
            <Collapsible key={data.agency.id} open={openCollapsible === data.agency.id} onOpenChange={() => setOpenCollapsible(prev => prev === data.agency.id ? null : data.agency.id)}>
                <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={data.agency.avatar} alt={data.name} />
                            <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="w-1/3 flex-grow" onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/towerco/agencies/${data.agency.id}`)
                        }}>
                            <p className="font-medium truncate">{data.name}</p>
                        </div>
                        <div className="flex-1 relative">
                             <Progress value={data.performance} indicatorClassName={getPerformanceClass(data.performance)} className="h-4 rounded-full" />
                             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{data.performance}%</div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsible === data.agency.id && "rotate-180")} />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 py-2 px-4 border-t">
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground w-1/3">Incident Resolution</span>
                            <Progress value={data.incidentResolutionRate} indicatorClassName={getPerformanceClass(data.incidentResolutionRate)} className="h-3 flex-1" />
                            <span className="font-medium w-12 text-right">{data.incidentResolutionRate}%</span>
                        </div>
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground w-1/3">Perimeter Accuracy</span>
                            <Progress value={data.guardPerimeterAccuracy} indicatorClassName={getPerformanceClass(data.guardPerimeterAccuracy)} className="h-3 flex-1" />
                            <span className="font-medium w-12 text-right">{data.guardPerimeterAccuracy}%</span>
                        </div>
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground w-1/3">Selfie Accuracy</span>
                            <Progress value={data.guardSelfieAccuracy} indicatorClassName={getPerformanceClass(data.guardSelfieAccuracy)} className="h-3 flex-1" />
                            <span className="font-medium w-12 text-right">{data.guardSelfieAccuracy}%</span>
                        </div>
                         <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground w-1/3">Site Visit Rate</span>
                            <Progress value={data.officerSiteVisitRate} indicatorClassName={getPerformanceClass(data.officerSiteVisitRate)} className="h-3 flex-1" />
                             <span className="font-medium w-12 text-right">{data.officerSiteVisitRate}%</span>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
