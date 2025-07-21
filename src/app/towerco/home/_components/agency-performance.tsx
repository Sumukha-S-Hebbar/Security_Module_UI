
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';

interface AgencyPerformanceData {
  name: string;
  agencyId: string;
  'Overall Performance': number;
  'Incident Resolution': number;
  'Perimeter Accuracy': number;
  'Selfie Accuracy': number;
  'Site Visits': number;
}

const chartConfig = {
  'Overall Performance': {
    label: 'Overall Performance',
    color: 'hsl(var(--chart-1))',
  },
  'Incident Resolution': {
    label: 'Incident Resolution',
    color: 'hsl(var(--chart-2))',
  },
  'Perimeter Accuracy': {
    label: 'Perimeter Accuracy',
    color: 'hsl(var(--chart-3))',
  },
  'Selfie Accuracy': {
    label: 'Selfie Accuracy',
    color: 'hsl(var(--chart-4))',
  },
  'Site Visits': {
    label: 'Site Visits',
    color: 'hsl(var(--chart-5))',
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
        agencyId: agency.id,
        name: agency.name,
        'Overall Performance': Math.round(performance),
        'Incident Resolution': Math.round(incidentResolutionRate),
        'Perimeter Accuracy': Math.round(guardPerimeterAccuracy),
        'Selfie Accuracy': Math.round(guardSelfieAccuracy),
        'Site Visits': Math.round(officerSiteVisitRate),
      };
    });

    return data.sort((a, b) => b['Overall Performance'] - a['Overall Performance']);
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

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const agencyId = data.activePayload[0].payload.agencyId;
      if (agencyId) {
        router.push(`/towerco/agencies/${agencyId}`);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Comparison</CardTitle>
        <CardDescription>
          Side-by-side performance metrics for each security agency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart 
            accessibilityLayer 
            data={performanceData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleBarClick}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
            />
            <Legend />
            <Bar dataKey="Overall Performance" fill="var(--color-Overall Performance)" radius={4} />
            <Bar dataKey="Incident Resolution" fill="var(--color-Incident Resolution)" radius={4} />
            <Bar dataKey="Perimeter Accuracy" fill="var(--color-Perimeter Accuracy)" radius={4} />
            <Bar dataKey="Selfie Accuracy" fill="var(--color-Selfie Accuracy)" radius={4} />
            <Bar dataKey="Site Visits" fill="var(--color-Site Visits)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
