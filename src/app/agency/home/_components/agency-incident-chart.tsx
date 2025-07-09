'use client';

import { useState, useMemo } from 'react';
import type { Alert } from '@/types';
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
  alerts,
}: {
  alerts: Alert[];
}) {
  const router = useRouter();
  const availableYears = useMemo(() => {
    const years = new Set(
      alerts.map((alert) => new Date(alert.date).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [alerts]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; total: number; resolved: number }[] = months.map(
      (month) => ({ month, total: 0, resolved: 0 })
    );

    alerts.forEach((alert) => {
      const alertDate = new Date(alert.date);

      const yearMatch = alertDate.getFullYear().toString() === selectedYear;

      if (yearMatch && alert.type === 'Emergency') {
        const monthIndex = alertDate.getMonth();
        monthlyData[monthIndex].total += 1;
        if (alert.status === 'Resolved') {
          monthlyData[monthIndex].resolved += 1;
        }
      }
    });

    return monthlyData;
  }, [alerts, selectedYear]);

  const handleBarClick = (data: any, index: number) => {
    router.push(`/agency/incidents?month=${index}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Incidents Occurred</CardTitle>
          <CardDescription>
            Total vs. resolved emergency incidents per month.
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
    </Card>
  );
}
