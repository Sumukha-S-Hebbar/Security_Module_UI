
'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency, Guard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


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

  const performanceData = useMemo(() => {
    const data: AgencyPerformanceData[] = agencies.map((agency) => {
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
                  totalSiteVisitRate += 100;
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
        agency,
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
                      Overall score based on incidents, guard, and officer performance.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground text-center py-4">
                      No performance data available for any agency.
                  </p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Overview</CardTitle>
        <CardDescription>
          Ranked list of agencies by overall performance score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((data, index) => {
              const chartData = [
                { name: 'Score', value: data.performance },
                { name: 'Remaining', value: 100 - data.performance },
              ];
              const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];
              
              return (
                <Card key={data.agency.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12">
                                <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                                <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <CardTitle className="text-lg">{data.agency.name}</CardTitle>
                                <CardDescription>Rank #{index + 1}</CardDescription>
                            </div>
                        </div>
                        <div className="w-20 h-20 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="70%"
                                        outerRadius="85%"
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-foreground">{data.performance}%</span>
                            </div>
                        </div>
                    </div>
                  </CardHeader>
                   <CardContent className="flex-grow space-y-3 text-sm">
                        <p className="font-semibold text-muted-foreground">Performance Breakdown:</p>
                        <div className="space-y-1 text-muted-foreground">
                            <div className="flex justify-between"><span>Incident Resolution:</span> <span className="font-medium text-foreground">{data.incidentResolutionRate}%</span></div>
                            <div className="flex justify-between"><span>Guard Perimeter Accuracy:</span> <span className="font-medium text-foreground">{data.guardPerimeterAccuracy}%</span></div>
                            <div className="flex justify-between"><span>Guard Selfie Accuracy:</span> <span className="font-medium text-foreground">{data.guardSelfieAccuracy}%</span></div>
                            <div className="flex justify-between"><span>Officer Site Visit Rate:</span> <span className="font-medium text-foreground">{data.officerSiteVisitRate}%</span></div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" className="w-full">
                            <Link href={`/towerco/agencies/${data.agency.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Full Report
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
              )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
