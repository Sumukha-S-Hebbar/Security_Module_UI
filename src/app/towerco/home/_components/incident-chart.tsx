

'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency } from '@/types';
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
  // Get unique years from the incidents data
  const availableYears = useMemo(() => {
    const years = new Set(
      incidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [incidents]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; total: number; resolved: number }[] = months.map(
      (month) => ({ month, total: 0, resolved: 0 })
    );

    const siteToAgencyMap = new Map<string, string | undefined>();
    sites.forEach((site) => {
      siteToAgencyMap.set(site.id, site.agencyId);
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
      }
    });

    return monthlyData;
  }, [incidents, sites, selectedYear, selectedCompany]);

  const handleBarClick = (data: any, index: number) => {
    router.push(`/towerco/incidents?month=${index + 1}`);
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
            <Bar dataKey="total" fill="var(--color-total)" radius={4} onClick={handleBarClick} cursor="pointer" />
            <Bar dataKey="resolved" fill="var(--color-resolved)" radius={4} onClick={handleBarClick} cursor="pointer" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
