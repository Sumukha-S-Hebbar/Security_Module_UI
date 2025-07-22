
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Incident } from '@/types';
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
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';

const chartConfig = {
  total: {
    label: 'Total Incidents',
    color: 'hsl(var(--destructive))',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function AgencyIncidentChart({
  incidents,
}: {
  incidents: Incident[];
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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; total: number; resolved: number }[] = months.map(
      (month) => ({ month, total: 0, resolved: 0 })
    );

    incidents.forEach((incident) => {
      const incidentDate = new Date(incident.incidentTime);

      const yearMatch = incidentDate.getFullYear().toString() === selectedYear;

      if (yearMatch) {
        const monthIndex = incidentDate.getMonth();
        monthlyData[monthIndex].total += 1;
        if (incident.status === 'Resolved') {
          monthlyData[monthIndex].resolved += 1;
        }
      }
    });

    return monthlyData;
  }, [incidents, selectedYear]);

  const incidentsInSelectedMonth = useMemo(() => {
    if (selectedMonthIndex === null) return [];
    
    return incidents.filter(incident => {
        const incidentDate = new Date(incident.incidentTime);
        const yearMatch = incidentDate.getFullYear().toString() === selectedYear;
        const monthMatch = incidentDate.getMonth() === selectedMonthIndex;
        return yearMatch && monthMatch;
    });
  }, [selectedMonthIndex, selectedYear, incidents]);


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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Incidents Occurred</CardTitle>
          <CardDescription>
            Total vs. resolved emergency incidents per month. Click a bar to see details.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
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
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={monthlyIncidentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} onClick={handleBarClick} cursor="pointer" />
            <Bar dataKey="resolved" fill="var(--color-resolved)" radius={4} onClick={handleBarClick} cursor="pointer" />
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
                                <TableHead>Site ID</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incidentsInSelectedMonth.map(incident => (
                                <TableRow 
                                  key={incident.id}
                                  onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                                  className="cursor-pointer"
                                >
                                    <TableCell>
                                        <Button asChild variant="link" className="p-0 h-auto font-medium" onClick={(e) => e.stopPropagation()}>
                                          <Link href={`/agency/incidents/${incident.id}`}>{incident.id}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{new Date(incident.incidentTime).toLocaleDateString()}</TableCell>
                                    <TableCell>{incident.siteId}</TableCell>
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
