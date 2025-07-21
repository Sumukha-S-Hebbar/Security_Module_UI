
'use client';

import { useMemo, useState } from 'react';
import type { SecurityAgency, Site, Incident, Guard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Briefcase, ShieldCheck, UserCheck, CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
  incidentResolution: { rate: number; resolved: number; total: number };
  guardPerimeterAccuracy: { rate: number };
  guardSelfieAccuracy: { rate: number; taken: number; total: number };
  officerSiteVisit: { rate: number; visited: number; total: number };
}

const getPerformanceColor = (score: number) => {
  if (score >= 90) return 'hsl(var(--chart-2))'; // Green
  if (score >= 75) return 'hsl(var(--yellow-500, 38 92% 50%))'; // Amber/Yellow
  return 'hsl(var(--destructive))'; // Red
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
        incidentResolution: { rate: Math.round(incidentResolutionRate), resolved: resolvedIncidents, total: totalIncidents },
        guardPerimeterAccuracy: { rate: Math.round(guardPerimeterAccuracy) },
        guardSelfieAccuracy: { rate: Math.round(guardSelfieAccuracy), taken: totalSelfiesTaken, total: totalSelfieRequests },
        officerSiteVisit: { rate: Math.round(officerSiteVisitRate), visited: totalSiteVisits, total: totalSitesForOfficers },
      };
    });

    return data.sort((a, b) => b.performance - a.performance);
  }, [agencies, sites, incidents]);
  
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

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

  const MetricRow = ({
      id,
      icon: Icon,
      label,
      tooltip,
      rate,
      rawValue,
  }: {
      id: string;
      icon: React.ElementType;
      label: string;
      tooltip: string;
      rate: number;
      rawValue?: string;
  }) => (
      <div 
        className="rounded-md p-2 transition-colors hover:bg-muted/50"
        onMouseEnter={() => setHoveredMetric(id)}
        onMouseLeave={() => setHoveredMetric(null)}
      >
          <div className="flex justify-between items-center mb-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Icon className="w-3.5 h-3.5"/>
                  <span>{label}</span>
                  <Tooltip>
                      <TooltipTrigger>
                          <Info className="w-3 h-3 cursor-help"/>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>{tooltip}</p>
                      </TooltipContent>
                  </Tooltip>
              </div>
              <div className="font-bold w-24 text-right">
                  {hoveredMetric === id && rawValue ? (
                    <span className="text-primary">{rawValue}</span>
                  ) : (
                    <span>{rate}%</span>
                  )}
              </div>
          </div>
          <Progress value={rate} indicatorClassName={cn({
              'bg-chart-2': rate >= 90,
              'bg-destructive': rate < 75,
              'bg-yellow-500': rate >= 75 && rate < 90,
          })} className="h-1.5" />
      </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Overview</CardTitle>
        <CardDescription>
          Overall scores based on incidents, guard, and officer performance. Click a card to view details.
          <span className="text-xs text-muted-foreground block">Performance: Last 7 Days</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((data) => {
                const performanceColor = getPerformanceColor(data.performance);
                const complianceData = [
                    { name: 'Performance', value: data.performance },
                    { name: 'Remaining', value: 100 - data.performance },
                ];
                const COLORS = [performanceColor, 'hsl(var(--muted))'];

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
                                    <span className="text-2xl font-bold text-foreground" style={{ color: performanceColor }}>
                                      {data.performance}%
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2 pt-2">
                            <div className="text-sm space-y-1 pt-3 border-t">
                                <MetricRow
                                  id={`${data.agency.id}-incidents`}
                                  icon={CheckCircle}
                                  label="Incident Resolution"
                                  tooltip="Percentage of incidents marked as 'Resolved'."
                                  rate={data.incidentResolution.rate}
                                  rawValue={`${data.incidentResolution.resolved}/${data.incidentResolution.total}`}
                                />
                                <MetricRow
                                  id={`${data.agency.id}-perimeter`}
                                  icon={ShieldCheck}
                                  label="Guard Perimeter"
                                  tooltip="Average accuracy of guards staying within their assigned geofence."
                                  rate={data.guardPerimeterAccuracy.rate}
                                />
                                <MetricRow
                                  id={`${data.agency.id}-selfie`}
                                  icon={UserCheck}
                                  label="Guard Selfie"
                                  tooltip="Percentage of selfies successfully submitted upon request."
                                  rate={data.guardSelfieAccuracy.rate}
                                  rawValue={`${data.guardSelfieAccuracy.taken}/${data.guardSelfieAccuracy.total}`}
                                />
                                 <MetricRow
                                  id={`${data.agency.id}-visits`}
                                  icon={Briefcase}
                                  label="Officer Visits"
                                  tooltip="Percentage of sites visited by patrolling officers in the period."
                                  rate={data.officerSiteVisit.rate}
                                  rawValue={`${data.officerSiteVisit.visited}/${data.officerSiteVisit.total}`}
                                />
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

    