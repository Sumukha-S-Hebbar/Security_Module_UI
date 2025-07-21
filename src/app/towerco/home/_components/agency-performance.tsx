
'use client';

import { useMemo, useState } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  performance: {
    'Overall Performance': number;
    'Incident Resolution': number;
    'Perimeter Accuracy': number;
    'Selfie Accuracy': number;
    'Site Visits': number;
  };
}

const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'hsl(var(--chart-2))';
  if (score >= 75) return 'hsl(var(--chart-4))';
  return 'hsl(var(--destructive))';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">
          Performance:
          <span className="ml-2 font-medium text-foreground">{`${payload[0].value}%`}</span>
        </p>
      </div>
    );
  }

  return null;
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
        agency,
        performance: {
          'Overall Performance': Math.round(overallPerformance),
          'Incident Resolution': Math.round(incidentResolutionRate),
          'Perimeter Accuracy': Math.round(guardPerimeterAccuracy),
          'Selfie Accuracy': Math.round(guardSelfieAccuracy),
          'Site Visits': Math.round(officerSiteVisitRate),
        },
      };
    });

    return data.sort(
      (a, b) =>
        b.performance['Overall Performance'] -
        a.performance['Overall Performance']
    );
  }, [agencies, sites, incidents]);

  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    performanceData.length > 0 ? performanceData[0].agency.id : null
  );

  const selectedAgencyData = performanceData.find(
    (d) => d.agency.id === selectedAgencyId
  );
  
  const chartData = useMemo(() => {
    return performanceData.map(data => ({
      name: data.agency.name,
      id: data.agency.id,
      performance: data.performance['Overall Performance'],
    }));
  }, [performanceData]);

  // Each agency bar group needs roughly 80px.
  const chartWidth = Math.max(chartData.length * 80, 500); 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Leaderboard</CardTitle>
        <CardDescription>
          Comparison of security agencies. Click a bar for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[350px] overflow-x-auto">
            <div style={{ width: `${chartWidth}px`, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
                    <Bar 
                    dataKey="performance" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    onClick={(data) => setSelectedAgencyId(data.id)}
                    >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.performance)} className="cursor-pointer" />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-1">
            {selectedAgencyData ? (
              <div className="border rounded-lg p-4 h-full bg-muted/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedAgencyData.agency.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Performance Breakdown
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/towerco/agencies/${selectedAgencyData.agency.id}`
                      )
                    }
                  >
                    View Report
                  </Button>
                </div>

                <div className="space-y-4">
                  {(
                    Object.entries(selectedAgencyData.performance) as [
                      keyof AgencyPerformanceData['performance'],
                      number
                    ][]
                  ).map(([metric, value]) => (
                    <div key={metric}>
                       <div className="flex justify-between items-center mb-1">
                         <p className="text-sm font-medium text-muted-foreground">
                           {metric}
                         </p>
                         <p className="text-sm font-semibold">{value}%</p>
                       </div>
                      <Progress
                        value={value}
                        indicatorClassName={getPerformanceColor(value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center border rounded-lg h-full min-h-[200px] bg-muted/30">
                <p className="text-sm text-muted-foreground">Select an agency to see details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
