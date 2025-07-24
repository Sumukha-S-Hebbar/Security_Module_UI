
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Incident, Site, SecurityAgency } from '@/types';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, LineChart, Line } from 'recharts';
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
      color: 'hsl(var(--chart-3))',
  },
  avgClosure: {
    label: 'Avg. Closure (hrs)',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

const formatClosureTime = (hours: number | null): string => {
    if (hours === null || hours === 0) return 'N/A';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (days > 0) {
        return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
};


export function IncidentChart({
  incidents,
  sites,
  securityAgencies,
}: {
  incidents: Incident[];
  sites: Site[];
  securityAgencies: SecurityAgency[];
}) {
  const router = useRouter();
  const availableYears = useMemo(() => {
    const years = new Set(
      incidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [incidents]);

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { 
        month: string; 
        total: number; 
        resolved: number; 
        underReview: number;
        avgClosure: number | null;
        closureTimeFormatted: string;
    }[] = months.map(
      (month) => ({ month, total: 0, resolved: 0, underReview: 0, avgClosure: null, closureTimeFormatted: 'N/A' })
    );

    const siteToAgencyMap = new Map<string, string | undefined>();
    securityAgencies.forEach((agency) => {
        agency.siteIds.forEach(siteId => {
            siteToAgencyMap.set(siteId, agency.id);
        });
    });

    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.incidentTime);
      const incidentAgencyId = siteToAgencyMap.get(incident.siteId);

      const yearMatch = incidentDate.getFullYear().toString() === selectedYear;
      const companyMatch =
        selectedCompany === 'all' || incidentAgencyId === selectedCompany;

      if (yearMatch && companyMatch) {
        const monthIndex = incidentDate.getMonth();
        monthlyData[monthIndex].total += 1;
        if (incident.status === 'Resolved') {
          monthlyData[monthIndex].resolved += 1;
        }
        if (incident.status === 'Under Review') {
            monthlyData[monthIndex].underReview += 1;
        }
      }
    });

    // Calculate average closure time for each month
    for (let i = 0; i < 12; i++) {
        const monthIncidents = incidents.filter(incident => {
            const incidentDate = new Date(incident.incidentTime);
            const incidentAgencyId = siteToAgencyMap.get(incident.siteId);
            const companyMatch = selectedCompany === 'all' || incidentAgencyId === selectedCompany;

            return incidentDate.getFullYear().toString() === selectedYear && 
                   incidentDate.getMonth() === i && 
                   companyMatch &&
                   incident.status === 'Resolved' && 
                   incident.resolvedTime;
        });

        if (monthIncidents.length > 0) {
            const totalClosureMillis = monthIncidents.reduce((acc, inc) => {
                const startTime = new Date(inc.incidentTime).getTime();
                const endTime = new Date(inc.resolvedTime!).getTime();
                return acc + (endTime - startTime);
            }, 0);
            const avgClosureHours = (totalClosureMillis / monthIncidents.length) / (1000 * 60 * 60);
            monthlyData[i].avgClosure = avgClosureHours;
            monthlyData[i].closureTimeFormatted = formatClosureTime(avgClosureHours);
        }
    }

    return monthlyData;
  }, [incidents, securityAgencies, selectedYear, selectedCompany]);
  
  const incidentsInSelectedMonth = useMemo(() => {
    if (selectedMonthIndex === null) return [];
    
    const siteToAgencyMap = new Map<string, string | undefined>();
    securityAgencies.forEach((agency) => {
        agency.siteIds.forEach(siteId => {
            siteToAgencyMap.set(siteId, agency.id);
        });
    });

    return incidents.filter(incident => {
        const incidentDate = new Date(incident.incidentTime);
        const incidentAgencyId = siteToAgencyMap.get(incident.siteId);

        const yearMatch = incidentDate.getFullYear().toString() === selectedYear;
        const companyMatch = selectedCompany === 'all' || incidentAgencyId === selectedCompany;
        const monthMatch = incidentDate.getMonth() === selectedMonthIndex;
        
        return yearMatch && companyMatch && monthMatch;
    });
  }, [selectedMonthIndex, selectedYear, selectedCompany, incidents, securityAgencies]);

  const handleBarClick = (data: any, index: number) => {
    if (selectedMonthIndex === index) {
      setSelectedMonthIndex(null); // Collapse if clicking the same month
    } else {
      setSelectedMonthIndex(index);
    }
  };

  useEffect(() => {
    if (selectedMonthIndex !== null && collapsibleRef.current) {
        setTimeout(() => {
            collapsibleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); 
    }
  }, [selectedMonthIndex]);

  const getSiteName = (siteId: string) => sites.find(s => s.id === siteId)?.name || 'N/A';
  const getAgencyName = (siteId: string) => {
      const agency = securityAgencies.find(a => a.siteIds.includes(siteId));
      return agency?.name || 'N/A';
  }
  
  const getStatusIndicator = (status: Incident['status']) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
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
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {securityAgencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                    {year}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={monthlyIncidentData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} barGap={6}>
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
              cursor={false}
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
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-underReview)' }}></span>
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
            <Bar yAxisId="left" dataKey="total" fill="var(--color-total)" radius={4} onClick={handleBarClick} cursor="pointer">
                <LabelList dataKey="total" position="top" offset={5} fontSize={12} />
            </Bar>
            <Bar yAxisId="left" dataKey="resolved" fill="var(--color-resolved)" radius={4} onClick={handleBarClick} cursor="pointer">
                <LabelList dataKey="resolved" position="top" offset={5} fontSize={12} />
            </Bar>
             <Bar yAxisId="left" dataKey="underReview" fill="var(--color-underReview)" radius={4} onClick={handleBarClick} cursor="pointer">
                <LabelList dataKey="underReview" position="top" offset={5} fontSize={12} />
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="avgClosure" stroke="var(--color-avgClosure)" strokeWidth={2} dot={{ r: 4 }}>
                <LabelList dataKey="closureTimeFormatted" position="top" offset={8} fontSize={10} />
            </Line>
          </BarChart>
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
                {incidentsInSelectedMonth.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Incident ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Agency</TableHead>
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
                                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{getSiteName(incident.siteId)}</TableCell>
                                    <TableCell>{getAgencyName(incident.siteId)}</TableCell>
                                    <TableCell>{getStatusIndicator(incident.status)}</TableCell>
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
