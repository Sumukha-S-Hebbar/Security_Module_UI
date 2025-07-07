'use client';

import { useState, useMemo } from 'react';
import type { Alert, Site, SecurityAgency } from '@/types';
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

const chartConfig = {
  incidents: {
    label: 'Incidents',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export function IncidentChart({
  alerts,
  sites,
  securityAgencies,
}: {
  alerts: Alert[];
  sites: Site[];
  securityAgencies: SecurityAgency[];
}) {
  // Get unique years from the alerts data
  const availableYears = useMemo(() => {
    const years = new Set(
      alerts.map((alert) => new Date(alert.date).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [alerts]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; incidents: number }[] = months.map(
      (month) => ({ month, incidents: 0 })
    );

    const siteToAgencyMap = new Map<string, string | undefined>();
    sites.forEach((site) => {
      siteToAgencyMap.set(site.name, site.agencyId);
    });

    alerts.forEach((alert) => {
      const alertDate = new Date(alert.date);
      const alertAgencyId = siteToAgencyMap.get(alert.site);

      const yearMatch = alertDate.getFullYear().toString() === selectedYear;
      const companyMatch =
        selectedCompany === 'all' || alertAgencyId === selectedCompany;

      if (yearMatch && companyMatch && alert.type === 'Emergency') {
        const monthIndex = alertDate.getMonth();
        monthlyData[monthIndex].incidents += 1;
      }
    });

    return monthlyData;
  }, [alerts, sites, selectedYear, selectedCompany]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Incidents Occurred</CardTitle>
          <CardDescription>
            Total emergency incidents per month for the selected filters.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px]">
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
            <Bar dataKey="incidents" fill="var(--color-incidents)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
