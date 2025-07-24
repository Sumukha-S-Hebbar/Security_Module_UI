// src/app/towerco/home/_components/agency-performance.tsx
'use client';

import { useMemo, useState } from 'react';
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
  CartesianGrid,
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';

const chartConfig = {
  incidentResolution: {
    label: 'Incident Resolution',
    color: 'hsl(var(--chart-3))',
  },
  siteVisits: {
    label: 'Site Visit Accuracy',
    color: 'hsl(var(--chart-1))',
  },
  perimeterAccuracy: {
    label: 'Guard Check-in Accuracy',
    color: 'hsl(var(--chart-2))',
  },
  selfieAccuracy: {
    label: 'Selfie Check-in Accuracy',
    color: 'hsl(var(--chart-4))',
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
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const availableYears = useMemo(() => {
    const years = new Set(
      incidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [incidents]);

  const performanceData = useMemo(() => {
    return agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      
      const dateFilteredIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.incidentTime);
        const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === 'all' || (incidentDate.getMonth()).toString() === selectedMonth;
        return yearMatch && monthMatch;
      });
      
      const agencySites = sites.filter((s) => agencySiteIds.has(s.id));

      // 1. Incident Resolution
      const agencyIncidents = dateFilteredIncidents.filter((incident) =>
        agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(
        (i) => i.status === 'Resolved'
      ).length;
      const incidentResolution =
        totalIncidents > 0
          ? (resolvedIncidents / totalIncidents) * 100
          : 100;

      // 2. Guard Check-in Accuracy
      const agencyGuardIds = new Set(agencySites.flatMap((s) => s.guards));
      const agencyGuards = guards.filter((g) => agencyGuardIds.has(g.id));
      const totalPerimeterAccuracy = agencyGuards.reduce((acc, guard) => acc + (guard.performance?.perimeterAccuracy || 0), 0);
      const perimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;

      // 3. Selfie Check-in Accuracy
      const { totalSelfiesTaken, totalSelfieRequests } = agencyGuards.reduce(
        (acc, guard) => {
          acc.totalSelfiesTaken += guard.totalSelfieRequests - guard.missedSelfieCount;
          acc.totalSelfieRequests += guard.totalSelfieRequests;
          return acc;
        },
        { totalSelfiesTaken: 0, totalSelfieRequests: 0 }
      );
      const selfieAccuracy =
        totalSelfieRequests > 0
          ? (totalSelfiesTaken / totalSelfieRequests) * 100
          : 100;

      // 4. Site Visit Accuracy
      const agencyPatrollingOfficerIds = new Set(
        agencySites.map((s) => s.patrollingOfficerId).filter(Boolean)
      );
      const agencyPatrollingOfficers = patrollingOfficers.filter((po) =>
        agencyPatrollingOfficerIds.has(po.id)
      );
      const { totalSiteVisits, totalSitesForOfficers } = agencyPatrollingOfficers.reduce(
          (acc, po) => {
            const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
            acc.totalSitesForOfficers += poSites.length;
            acc.totalSiteVisits += poSites.filter(s => s.visited).length;
            return acc;
          }, { totalSiteVisits: 0, totalSitesForOfficers: 0 }
      );
      const siteVisits =
        totalSitesForOfficers > 0
          ? (totalSiteVisits / totalSitesForOfficers) * 100
          : 100;

      return {
        id: agency.id,
        name: agency.name,
        incidentResolution: Math.round(incidentResolution),
        perimeterAccuracy: Math.round(perimeterAccuracy),
        selfieAccuracy: Math.round(selfieAccuracy),
        siteVisits: Math.round(siteVisits),
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [agencies, sites, incidents, selectedYear, selectedMonth]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const agencyId = data.activePayload[0].payload.id;
      if (agencyId) {
        router.push(`/towerco/agencies/${agencyId}`);
      }
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Agency Performance Breakdown</CardTitle>
              <CardDescription>
                Comparison of key performance indicators across all agencies.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year} className="font-medium">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} className="font-medium">
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={performanceData} margin={{ top: 20 }} onClick={handleBarClick}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              
              <Bar dataKey="incidentResolution" fill="var(--color-incidentResolution)" radius={4} cursor="pointer">
                 <LabelList dataKey="incidentResolution" position="top" offset={5} fontSize={12} formatter={(value: number) => `${value}%`} />
              </Bar>
              <Bar dataKey="siteVisits" fill="var(--color-siteVisits)" radius={4} cursor="pointer">
                 <LabelList dataKey="siteVisits" position="top" offset={5} fontSize={12} formatter={(value: number) => `${value}%`} />
              </Bar>
              <Bar dataKey="perimeterAccuracy" fill="var(--color-perimeterAccuracy)" radius={4} cursor="pointer">
                 <LabelList dataKey="perimeterAccuracy" position="top" offset={5} fontSize={12} formatter={(value: number) => `${value}%`} />
              </Bar>
              <Bar dataKey="selfieAccuracy" fill="var(--color-selfieAccuracy)" radius={4} cursor="pointer">
                <LabelList dataKey="selfieAccuracy" position="top" offset={5} fontSize={12} formatter={(value: number) => `${value}%`} />
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
