
'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Briefcase, ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
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
        <CardTitle>Agency Performance Overview</CardTitle>
        <CardDescription>
          Overall scores based on incidents, guard, and officer performance. Click a card to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((data) => {
                const complianceData = [
                    { name: 'Performance', value: data.performance },
                    { name: 'Remaining', value: 100 - data.performance },
                ];
                const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

                return (
                    <Card 
                        key={data.agency.id} 
                        className="cursor-pointer hover:border-primary transition-all flex flex-col"
                        onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
                    >
                        <CardHeader className="flex-row items-start gap-4 space-y-0">
                            <Avatar className="w-12 h-12 border">
                                <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                                <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {data.agency.id}</p>
                            </div>
                            <div className="w-20 h-20 relative -mt-4 -mr-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={complianceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="70%"
                                            outerRadius="85%"
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {complianceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-foreground">{data.performance}%</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 pt-2">
                            <div className="text-sm space-y-3 pt-3 border-t">
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <h4 className="font-medium text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/>Incident Resolution</h4>
                                        <span className="font-bold">{data.incidentResolutionRate}%</span>
                                    </div>
                                    <Progress value={data.incidentResolutionRate} className="h-1.5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <h4 className="font-medium text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/>Guard Perimeter</h4>
                                        <span className="font-bold">{data.guardPerimeterAccuracy}%</span>
                                    </div>
                                    <Progress value={data.guardPerimeterAccuracy} className="h-1.5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <h4 className="font-medium text-muted-foreground flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5"/>Guard Selfie</h4>
                                        <span className="font-bold">{data.guardSelfieAccuracy}%</span>
                                    </div>
                                    <Progress value={data.guardSelfieAccuracy} className="h-1.5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <h4 className="font-medium text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/>Officer Visits</h4>
                                        <span className="font-bold">{data.officerSiteVisitRate}%</span>
                                    </div>
                                    <Progress value={data.officerSiteVisitRate} className="h-1.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}
