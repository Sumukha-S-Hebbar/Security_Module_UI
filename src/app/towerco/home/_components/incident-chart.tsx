
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

const chartConfig = {
  total: {
    label: 'Total Incidents',
    color: 'hsl(var(--chart-1))',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(var(--chart-2))',
  },
  underReview: {
      label: 'Under Review',
      color: '#FFC107',
  },
  avgClosure: {
    label: 'Avg. Closure (hrs)',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

type IncidentTrendData = {
    month: string;
    total: number;
    resolved: number;
    active: number;
    under_review: number;
    resolution_duration: string;
};

export function IncidentChart({
  incidentTrend
}: {
  incidentTrend: IncidentTrendData[];
}) {
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);

  const monthlyIncidentData = useMemo(() => {
    return incidentTrend.map(monthData => ({
        month: monthData.month,
        total: monthData.total,
        resolved: monthData.resolved,
        underReview: monthData.under_review,
        avgClosure: null, // This part is tricky without raw incident data.
        closureTimeFormatted: monthData.resolution_duration,
    }));
  }, [incidentTrend]);
  
  // Note: incidentsInSelectedMonth cannot be calculated without raw incident data.
  // The collapsible section will be disabled for now.
  const incidentsInSelectedMonth: any[] = []; 

  const handleBarClick = (data: any) => {
    // Disabled since we don't have the raw incidents to show details.
    // const index = data.activeTooltipIndex;
    // if (selectedMonthIndex === index) {
    //   setSelectedMonthIndex(null); // Collapse if clicking the same month
    // } else {
    //   setSelectedMonthIndex(index);
    // }
  };

  useEffect(() => {
    if (selectedMonthIndex !== null && collapsibleRef.current) {
        setTimeout(() => {
            collapsibleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); 
    }
  }, [selectedMonthIndex]);

  return (
    <Card ref={collapsibleRef}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <CardTitle>Incident Trend</CardTitle>
                <CardDescription>
                    Monthly total vs. resolved incidents.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            <Select value={selectedCompany} onValueChange={setSelectedCompany} disabled>
                <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all" className="font-medium">All Companies</SelectItem>
                </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear} disabled>
                <SelectTrigger className="w-full sm:w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                 <SelectItem value={new Date().getFullYear().toString()} className="font-medium">{new Date().getFullYear()}</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart 
              data={monthlyIncidentData} 
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              onClick={handleBarClick}
              onMouseEnter={(data) => {
                if (data.activePayload?.[0]?.payload.month) {
                    setHoveredBar(data.activePayload[0].payload.month);
                }
              }}
              onMouseLeave={() => {
                  setHoveredBar(null);
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tick={{ fill: '#2F2F2F' }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                fontSize={12}
                tick={{ fill: '#2F2F2F' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}h`}
                allowDecimals={false}
                fontSize={12}
                tick={{ fill: '#2F2F2F' }}
              />
              <ChartTooltip
                cursor={true}
                  content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                          const data = monthlyIncidentData.find(d => d.month === label);
                          if (!data) return null;
                          return (
                              <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
                                  <div className="font-semibold">{label}</div>
                                  <div className="grid gap-1.5">
                                      <div className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-total)' }}></span>
                                          <span>Total: {data.total}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-resolved)' }}></span>
                                          <span>Resolved: {data.resolved}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#FFC107' }}></span>
                                          <span>Under Review: {data.underReview}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-avgClosure)' }}></span>
                                          <span>Avg. Closure: {data.closureTimeFormatted}</span>
                                      </div>
                                  </div>
                              </div>
                          )
                      }
                      return null;
                  }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar yAxisId="left" dataKey="total" fill="var(--color-total)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData[monthlyIncidentData.findIndex(d => d.month === hoveredBar)].month ? 0.5 : 1}>
                  <LabelList dataKey="total" position="top" offset={5} fontSize={12} />
              </Bar>
              <Bar yAxisId="left" dataKey="resolved" fill="var(--color-resolved)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData[monthlyIncidentData.findIndex(d => d.month === hoveredBar)].month ? 0.5 : 1}>
                  <LabelList dataKey="resolved" position="top" offset={5} fontSize={12} />
              </Bar>
              <Bar yAxisId="left" dataKey="underReview" fill="var(--color-underReview)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData[monthlyIncidentData.findIndex(d => d.month === hoveredBar)].month ? 0.5 : 1}>
                  <LabelList dataKey="underReview" position="top" offset={5} fontSize={12} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="avgClosure" stroke="var(--color-avgClosure)" strokeWidth={2} dot={{ r: 4 }}>
                  <LabelList dataKey="closureTimeFormatted" position="top" offset={8} fontSize={10} />
              </Line>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <Collapsible open={selectedMonthIndex !== null}>
        <CollapsibleContent>
            <CardHeader>
                <CardTitle>
                    Incidents in {selectedMonthIndex !== null ? monthlyIncidentData[selectedMonthIndex].month : ''} {selectedYear}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center">Detailed incident view is not available in this summary.</p>
            </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
