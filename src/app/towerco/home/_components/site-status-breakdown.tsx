
'use client';

import { useMemo } from 'react';
import type { Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--destructive))'];

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const { chartData, totalSites } = useMemo(() => {
    const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
    const assignedCount = sites.filter((site) => agencySiteIds.has(site.id)).length;
    const unassignedCount = sites.length - assignedCount;
    
    const data = [
      { name: 'Assigned', value: assignedCount, color: COLORS[0] },
      { name: 'Unassigned', value: unassignedCount, color: COLORS[1] },
    ];
    return {
      chartData: data,
      totalSites: sites.length,
    };
  }, [sites, agencies]);

  const customTooltipContent = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }
    const data = props.payload[0].payload;
    const percentage = totalSites > 0 ? ((data.value / totalSites) * 100).toFixed(1) : 0;
    
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
        <div className="font-bold">{data.name}</div>
        <div>
          {data.value} Sites ({percentage}%)
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status Overview</CardTitle>
        <CardDescription>A real-time overview of site assignments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={customTooltipContent} />
              <Legend verticalAlign="bottom" height={36}/>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
