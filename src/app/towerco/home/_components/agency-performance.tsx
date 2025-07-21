
'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
}

const chartConfig = {
  performance: {
    label: 'Performance',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

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
        name: agency.name,
        performance: Math.round(performance),
      };
    });

    return data.sort((a, b) => a.performance - b.performance);
  }, [agencies, sites, incidents]);
  
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const agencyId = data.activePayload[0].payload.agency.id;
      router.push(`/towerco/agencies/${agencyId}`);
    }
  };

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
          Comparison of agencies by overall performance score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[400px]">
          <BarChart
            data={performanceData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleBarClick}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
              width={120}
            />
            <XAxis dataKey="performance" type="number" domain={[0, 100]} unit="%" />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="performance"
              fill="var(--color-performance)"
              radius={4}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
