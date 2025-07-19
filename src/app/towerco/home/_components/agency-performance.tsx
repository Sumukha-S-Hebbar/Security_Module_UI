
'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency, Guard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';


interface AgencyPerformanceData {
  agency: SecurityAgency;
  performance: number;
  incidentResolutionRate: number;
  guardPerimeterAccuracy: number;
  guardSelfieAccuracy: number;
  officerSiteVisitRate: number;
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
  const [openAgencyId, setOpenAgencyId] = useState<string | null>(null);

  const performanceData = useMemo(() => {
    const data: AgencyPerformanceData[] = agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter(s => agencySiteIds.has(s.id));
      
      // 1. Incident Resolution Rate
      const agencyIncidents = incidents.filter(
        (incident) => agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(i => i.status === 'Resolved').length;
      const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 100;

      // 2. Guard Performance
      const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
      const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
      let totalPerimeterAccuracy = 0;
      let totalSelfieAccuracy = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach(guard => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          const selfieAccuracy = guard.totalSelfieRequests > 0
            ? ((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100
            : 100;
          totalSelfieAccuracy += selfieAccuracy;
        });
      }
      const guardPerimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;
      const guardSelfieAccuracy = agencyGuards.length > 0 ? totalSelfieAccuracy / agencyGuards.length : 100;

      // 3. Patrolling Officer Performance
      const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
      const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
      let totalSiteVisitRate = 0;
      if (agencyPatrollingOfficers.length > 0) {
          agencyPatrollingOfficers.forEach(po => {
              const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
              if (poSites.length > 0) {
                  const visitedCount = poSites.filter(s => s.visited).length;
                  totalSiteVisitRate += (visitedCount / poSites.length) * 100;
              } else {
                  totalSiteVisitRate += 100; // If no sites, they haven't missed any.
              }
          });
      }
      const officerSiteVisitRate = agencyPatrollingOfficers.length > 0 ? totalSiteVisitRate / agencyPatrollingOfficers.length : 100;
      
      // 4. Combined Performance Score (equal weighting for this example)
      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const performance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

      return {
        agency,
        performance: Math.round(performance),
        incidentResolutionRate: Math.round(incidentResolutionRate),
        guardPerimeterAccuracy: Math.round(guardPerimeterAccuracy),
        guardSelfieAccuracy: Math.round(guardSelfieAccuracy),
        officerSiteVisitRate: Math.round(officerSiteVisitRate),
      };
    });

    // Sort by performance descending
    return data.sort((a, b) => b.performance - a.performance);
  }, [agencies, sites, incidents]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Agency Performance</CardTitle>
                <CardDescription>
                Overall score based on incidents, guard, and officer performance. Click to expand.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {performanceData.length > 0 ? (
          performanceData.map((data) => (
            <Collapsible key={data.agency.id} open={openAgencyId === data.agency.id} onOpenChange={() => setOpenAgencyId(openAgencyId === data.agency.id ? null : data.agency.id)}>
              <CollapsibleTrigger asChild>
                <div className="space-y-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                                <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{data.agency.name}</p>
                                <p className="text-sm text-muted-foreground">Overall Performance Score</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-2xl">{data.performance}%</span>
                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ChevronDown className={cn('h-4 w-4 transition-transform', openAgencyId === data.agency.id && 'rotate-180')} />
                            </Button>
                        </div>
                    </div>
                    <Progress value={data.performance} className="h-2" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                  <div className="pt-4 px-4 pb-2 space-y-3 border border-t-0 rounded-b-lg">
                      <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">Incident Resolution Rate</span>
                              <span className="font-medium">{data.incidentResolutionRate}%</span>
                          </div>
                          <Progress value={data.incidentResolutionRate} className="h-2" />
                      </div>
                      <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">Guard Perimeter Accuracy</span>
                              <span className="font-medium">{data.guardPerimeterAccuracy}%</span>
                          </div>
                          <Progress value={data.guardPerimeterAccuracy} className="h-2" />
                      </div>
                      <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">Guard Selfie Accuracy</span>
                              <span className="font-medium">{data.guardSelfieAccuracy}%</span>
                          </div>
                          <Progress value={data.guardSelfieAccuracy} className="h-2" />
                      </div>
                      <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-muted-foreground">Officer Site Visit Rate</span>
                              <span className="font-medium">{data.officerSiteVisitRate}%</span>
                          </div>
                          <Progress value={data.officerSiteVisitRate} className="h-2" />
                      </div>
                  </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No performance data available for any agency.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
