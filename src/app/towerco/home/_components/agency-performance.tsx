// src/app/towerco/home/_components/agency-performance.tsx
'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';

const chartConfig = {
  score: {
    label: 'Performance Score',
  },
} satisfies ChartConfig;

const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'hsl(var(--chart-2))';
  if (score >= 75) return 'hsl(var(--chart-4))';
  return 'hsl(var(--destructive))';
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

  const performanceData = useMemo(() => {
    return agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter((s) => agencySiteIds.has(s.id));

      const agencyIncidents = incidents.filter((incident) =>
        agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(
        (i) => i.status === 'Resolved'
      ).length;
      const incidentResolutionRate =
        totalIncidents > 0
          ? (resolvedIncidents / totalIncidents) * 100
          : 100;

      const agencyGuardIds = new Set(agencySites.flatMap((s) => s.guards));
      const agencyGuards = guards.filter((g) => agencyGuardIds.has(g.id));
      let totalPerimeterAccuracy = 0;
      let totalSelfiesTaken = 0;
      let totalSelfieRequests = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach((guard) => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          totalSelfiesTaken +=
            guard.totalSelfieRequests - guard.missedSelfieCount;
          totalSelfieRequests += guard.totalSelfieRequests;
        });
      }
      const guardPerimeterAccuracy =
        agencyGuards.length > 0
          ? totalPerimeterAccuracy / agencyGuards.length
          : 100;
      const guardSelfieAccuracy =
        totalSelfieRequests > 0
          ? (totalSelfiesTaken / totalSelfieRequests) * 100
          : 100;

      const agencyPatrollingOfficerIds = new Set(
        agencySites.map((s) => s.patrollingOfficerId).filter(Boolean)
      );
      const agencyPatrollingOfficers = patrollingOfficers.filter((po) =>
        agencyPatrollingOfficerIds.has(po.id)
      );
      let totalSiteVisits = 0;
      let totalSitesForOfficers = 0;
      if (agencyPatrollingOfficers.length > 0) {
        agencyPatrollingOfficers.forEach((po) => {
          const poSites = agencySites.filter(
            (s) => s.patrollingOfficerId === po.id
          );
          if (poSites.length > 0) {
            totalSiteVisits += poSites.filter((s) => s.visited).length;
            totalSitesForOfficers += poSites.length;
          }
        });
      }
      const officerSiteVisitRate =
        totalSitesForOfficers > 0
          ? (totalSiteVisits / totalSitesForOfficers) * 100
          : 100;

      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const overallPerformance =
        performanceComponents.reduce((a, b) => a + b, 0) /
        performanceComponents.length;

      return {
        id: agency.id,
        name: agency.name,
        score: Math.round(overallPerformance),
        fill: getPerformanceColor(overallPerformance),
      };
    }).sort((a, b) => b.score - a.score);
  }, [agencies, sites, incidents]);

  const handleBarClick = (data: any) => {
    if (data && data.id) {
      router.push(`/towerco/agencies/${data.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Overview</CardTitle>
        <CardDescription>
          Overall scores based on incidents, guard, and officer performance. Click a bar to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={performanceData}
              layout="vertical"
              margin={{ left: 10, right: 30 }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
                className="font-medium"
              />
              <XAxis dataKey="score" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="score"
                radius={5}
                background={{ fill: 'hsl(var(--muted))', radius: 5 }}
                onClick={handleBarClick}
                className="cursor-pointer"
              >
                <LabelList
                  position="right"
                  offset={10}
                  className="fill-foreground font-bold"
                  fontSize={12}
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
