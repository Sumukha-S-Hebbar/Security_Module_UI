'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import {
  ChartContainer
} from '@/components/ui/chart';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface PerformanceMetric {
  name: string;
  value: number;
  color: string;
  x: number;
  y: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function OverallPerformanceChart({
  agencies,
  sites,
  incidents,
}: {
  agencies: SecurityAgency[];
  sites: Site[];
  incidents: Incident[];
}) {

  const performanceData: PerformanceMetric[] = useMemo(() => {
    let totalIncidentResolutionRate = 0;
    let totalGuardPerimeterAccuracy = 0;
    let totalGuardSelfieAccuracy = 0;
    let totalOfficerSiteVisitRate = 0;
    let agenciesWithData = 0;

    agencies.forEach((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter(s => agencySiteIds.has(s.id));
      if (agencySites.length === 0) return;

      agenciesWithData++;
      
      const agencyIncidents = incidents.filter(
        (incident) => agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(i => i.status === 'Resolved').length;
      const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 100;

      const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
      const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
      let perimeterAccuracy = 0;
      let selfieAccuracy = 0;

      if (agencyGuards.length > 0) {
        let guardPerimeterSum = 0;
        let guardSelfieSum = 0;
        agencyGuards.forEach(guard => {
          guardPerimeterSum += guard.performance?.perimeterAccuracy || 0;
          const accuracy = guard.totalSelfieRequests > 0
            ? ((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100
            : 100;
          guardSelfieSum += accuracy;
        });
        perimeterAccuracy = guardPerimeterSum / agencyGuards.length;
        selfieAccuracy = guardSelfieSum / agencyGuards.length;
      } else {
        perimeterAccuracy = 100;
        selfieAccuracy = 100;
      }
      
      const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
      const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
      let officerSiteVisitRate = 0;
      if(agencyPatrollingOfficers.length > 0) {
        let poVisitRateSum = 0;
        agencyPatrollingOfficers.forEach(po => {
            const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
            if (poSites.length > 0) {
                const visitedCount = poSites.filter(s => s.visited).length;
                poVisitRateSum += (visitedCount / poSites.length) * 100;
            } else {
                poVisitRateSum += 100;
            }
        });
        officerSiteVisitRate = poVisitRateSum / agencyPatrollingOfficers.length;
      } else {
        officerSiteVisitRate = 100;
      }

      totalIncidentResolutionRate += incidentResolutionRate;
      totalGuardPerimeterAccuracy += perimeterAccuracy;
      totalGuardSelfieAccuracy += selfieAccuracy;
      totalOfficerSiteVisitRate += officerSiteVisitRate;
    });

    if (agenciesWithData === 0) return [];

    const data = [
      { name: 'Incident Resolution', value: Math.round(totalIncidentResolutionRate / agenciesWithData), color: COLORS[0], x: 40, y: 55 },
      { name: 'Perimeter Accuracy', value: Math.round(totalGuardPerimeterAccuracy / agenciesWithData), color: COLORS[1], x: 65, y: 40 },
      { name: 'Selfie Accuracy', value: Math.round(totalGuardSelfieAccuracy / agenciesWithData), color: COLORS[2], x: 70, y: 70 },
      { name: 'Officer Visits', value: Math.round(totalOfficerSiteVisitRate / agenciesWithData), color: COLORS[3], x: 30, y: 30 },
    ];
    
    return data;
  }, [agencies, sites, incidents]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
          <p className="font-bold">{`${payload[0].payload.name}: ${payload[0].payload.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
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
        <CardTitle>Overall Performance Snapshot</CardTitle>
        <CardDescription>
          Aggregated performance across all security agencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" hide domain={[0,100]} />
              <YAxis type="number" dataKey="y" hide domain={[0,100]} />
              <ZAxis type="number" dataKey="value" range={[500, 4000]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{paddingTop: '40px'}}/>
              <Scatter data={performanceData}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
