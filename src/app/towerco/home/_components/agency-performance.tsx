
'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency, Guard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Button } from '@/components/ui/button';
import { ChevronDown, ShieldCheck, ShieldAlert, UserCheck, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Link from 'next/link';


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
        <CardTitle>Agency Performance</CardTitle>
        <CardDescription>
          Overall score based on incidents, guard, and officer performance. Click an agency to expand details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((data) => {
              const pieData = [
                { name: 'Performance', value: data.performance },
                { name: 'Remaining', value: 100 - data.performance },
              ];
              const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];
              const isOpen = openAgencyId === data.agency.id;

              return (
                <Collapsible key={data.agency.id} open={isOpen} onOpenChange={() => setOpenAgencyId(isOpen ? null : data.agency.id)}>
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                              <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{data.agency.name}</p>
                              <p className="text-sm text-muted-foreground">Performance Score</p>
                            </div>
                          </div>
                          <div className="w-20 h-20 relative flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius="70%"
                                  outerRadius="85%"
                                  paddingAngle={0}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-foreground">{data.performance}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-muted/50 p-4 border-t">
                        <h4 className="font-semibold mb-3 text-sm">Performance Breakdown</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <div className="flex-1 flex justify-between">
                              <span>Incident Resolution</span>
                              <span className="font-medium">{data.incidentResolutionRate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <div className="flex-1 flex justify-between">
                              <span>Guard Perimeter Accuracy</span>
                              <span className="font-medium">{data.guardPerimeterAccuracy}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" />
                            <div className="flex-1 flex justify-between">
                              <span>Guard Selfie Accuracy</span>
                              <span className="font-medium">{data.guardSelfieAccuracy}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Map className="w-4 h-4 text-primary" />
                            <div className="flex-1 flex justify-between">
                              <span>Officer Site Visit Rate</span>
                              <span className="font-medium">{data.officerSiteVisitRate}%</span>
                            </div>
                          </div>
                        </div>
                         <Button asChild variant="link" className="p-0 h-auto mt-4 text-sm">
                            <Link href={`/towerco/agencies/${data.agency.id}`}>View Full Report &rarr;</Link>
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
