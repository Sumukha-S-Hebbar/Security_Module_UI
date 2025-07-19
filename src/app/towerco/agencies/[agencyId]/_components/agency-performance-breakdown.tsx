// src/app/towerco/agencies/[agencyId]/_components/agency-performance-breakdown.tsx

'use client';

import type { SecurityAgency, Site, Incident } from '@/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';

interface AgencyPerformanceData {
  performance: number;
  incidentResolutionRate: number;
  guardPerimeterAccuracy: number;
  guardSelfieAccuracy: number;
  officerSiteVisitRate: number;
}

export function AgencyPerformanceBreakdown({
  agency,
  sites,
  incidents,
}: {
  agency: SecurityAgency;
  sites: Site[];
  incidents: Incident[];
}) {
  const performanceData: AgencyPerformanceData = useMemo(() => {
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
    
    const performanceComponents = [
      incidentResolutionRate,
      guardPerimeterAccuracy,
      guardSelfieAccuracy,
      officerSiteVisitRate,
    ];
    const performance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

    return {
      performance: Math.round(performance),
      incidentResolutionRate: Math.round(incidentResolutionRate),
      guardPerimeterAccuracy: Math.round(guardPerimeterAccuracy),
      guardSelfieAccuracy: Math.round(guardSelfieAccuracy),
      officerSiteVisitRate: Math.round(officerSiteVisitRate),
    };
  }, [agency, sites, incidents]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance</CardTitle>
        <CardDescription>
          Overall score and breakdown of key performance indicators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between items-center">
                <p className="font-semibold">Overall Performance Score</p>
                <span className="font-bold text-2xl text-primary">{performanceData.performance}%</span>
            </div>
            <Progress value={performanceData.performance} className="h-2" />
        </div>
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Incident Resolution Rate</span>
                    <span className="font-medium">{performanceData.incidentResolutionRate}%</span>
                </div>
                <Progress value={performanceData.incidentResolutionRate} className="h-2" />
            </div>
            <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Guard Perimeter Accuracy</span>
                    <span className="font-medium">{performanceData.guardPerimeterAccuracy}%</span>
                </div>
                <Progress value={performanceData.guardPerimeterAccuracy} className="h-2" />
            </div>
            <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Guard Selfie Accuracy</span>
                    <span className="font-medium">{performanceData.guardSelfieAccuracy}%</span>
                </div>
                <Progress value={performanceData.guardSelfieAccuracy} className="h-2" />
            </div>
            <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Officer Site Visit Rate</span>
                    <span className="font-medium">{performanceData.officerSiteVisitRate}%</span>
                </div>
                <Progress value={performanceData.officerSiteVisitRate} className="h-2" />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
