
'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import type { IncidentTrendData, IncidentListItem, AgencyPerformanceData } from '../page';
import { useDataFetching } from '@/hooks/useDataFetching';
import { Loader2 } from 'lucide-react';
import { Organization } from '@/types';
import { fetchData } from '@/lib/api';

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

type PaginatedIncidentsResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: IncidentListItem[];
};


export function IncidentChart({
  incidentTrend,
  agencies,
  selectedAgency,
  setSelectedAgency,
  selectedYear,
  setSelectedYear,
}: {
  incidentTrend: IncidentTrendData[] | undefined;
  agencies: AgencyPerformanceData[];
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}) {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);
  
  const [incidentsInSelectedMonth, setIncidentsInSelectedMonth] = useState<IncidentListItem[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const orgData = localStorage.getItem('organization');
    if (orgData) {
      setOrg(JSON.parse(orgData));
    }
  }, []);

  const monthlyIncidentData = useMemo(() => {
    if (!incidentTrend) return [];
    return incidentTrend.map(monthData => ({
        month: monthData.month,
        total: monthData.total,
        resolved: monthData.resolved,
        underReview: monthData.under_review,
        avgClosure: null, // This part is tricky without raw incident data.
        closureTimeFormatted: monthData.resolution_duration,
    }));
  }, [incidentTrend]);
  
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const fetchMonthIncidents = useCallback(async (monthIndex: number) => {
    if (org === null) return;
    setIsDetailsLoading(true);

    const token = localStorage.getItem('token');
    const month = monthIndex + 1;
    let url = `/security/api/orgs/${org.code}/incidents/list/?year=${selectedYear}&month=${month}`;

    if (selectedAgency !== 'all') {
      url += `&agency_name=${encodeURIComponent(selectedAgency)}`;
    }

    try {
        const data = await fetchData<PaginatedIncidentsResponse>(url, {
            headers: { 'Authorization': `Token ${token}` }
        });
        setIncidentsInSelectedMonth(data?.results || []);
    } catch(e) {
        console.error("Failed to fetch incidents for month", e);
        setIncidentsInSelectedMonth([]);
    } finally {
        setIsDetailsLoading(false);
    }
  }, [org, selectedYear, selectedAgency]);

  const handleBarClick = useCallback((data: any, index: number) => {
    if (selectedMonthIndex === index) {
      setSelectedMonthIndex(null);
      setIncidentsInSelectedMonth([]);
    } else {
      setSelectedMonthIndex(index);
      fetchMonthIncidents(index);
    }
  }, [selectedMonthIndex, fetchMonthIncidents]);

  useEffect(() => {
    if (selectedMonthIndex !== null && collapsibleRef.current) {
        setTimeout(() => {
            collapsibleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); 
    }
  }, [selectedMonthIndex]);

  const getStatusIndicator = (status: "Active" | "Under Review" | "Resolved") => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
    }
  };


  return (
    <Card ref={collapsibleRef}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <CardTitle>Incident Trend</CardTitle>
                <CardDescription>
                    Monthly total vs. resolved incidents. Click a bar to see details.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all" className="font-medium">All Agencies</SelectItem>
                 {agencies.map(agency => (
                    <SelectItem key={agency.agency_name} value={agency.agency_name} className="font-medium">
                        {agency.agency_name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year} className="font-medium">{year}</SelectItem>
                  ))}
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
              onClick={(data, index) => handleBarClick(data, index)}
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
              <Bar yAxisId="left" dataKey="total" fill="var(--color-total)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData.find(d => d.month === hoveredBar)?.month ? 0.5 : 1}>
                  <LabelList dataKey="total" position="top" offset={5} fontSize={12} />
              </Bar>
              <Bar yAxisId="left" dataKey="resolved" fill="var(--color-resolved)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData.find(d => d.month === hoveredBar)?.month ? 0.5 : 1}>
                  <LabelList dataKey="resolved" position="top" offset={5} fontSize={12} />
              </Bar>
              <Bar yAxisId="left" dataKey="underReview" fill="var(--color-underReview)" radius={4} cursor="pointer" opacity={hoveredBar && hoveredBar !== monthlyIncidentData.find(d => d.month === hoveredBar)?.month ? 0.5 : 1}>
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
                    Incidents in {monthlyIncidentData && selectedMonthIndex !== null && monthlyIncidentData.length > selectedMonthIndex ? monthlyIncidentData[selectedMonthIndex].month : ''} {selectedYear}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isDetailsLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : incidentsInSelectedMonth.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Incident ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Site Name</TableHead>
                                <TableHead>Guard</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incidentsInSelectedMonth.map(incident => (
                                <TableRow 
                                  key={incident.id}
                                  onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                                  className="cursor-pointer"
                                >
                                    <TableCell>
                                        <Button asChild variant="link" className="p-0 h-auto" onClick={(e) => e.stopPropagation()}>
                                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.incident_id}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{new Date(incident.incident_time).toLocaleDateString()}</TableCell>
                                    <TableCell>{incident.site_name}</TableCell>
                                    <TableCell>{incident.guard_name}</TableCell>
                                    <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No incidents recorded for this month.</p>
                )}
            </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

    
