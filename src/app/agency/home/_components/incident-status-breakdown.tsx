

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Incident, Guard, Site } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { guards } from '@/lib/data/guards';
import { sites } from '@/lib/data/sites';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function IncidentStatusBreakdown({
  incidents,
}: {
  incidents: Incident[];
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<
    Incident['status'] | null
  >(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  const availableYears = useMemo(() => {
    const years = new Set(
      incidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [incidents]);

  const filteredByDateIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedYear === 'all' || incidentDate.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || incidentDate.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [incidents, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    return filteredByDateIncidents.reduce(
      (acc, incident) => {
        if (incident.status === 'Active') acc.active++;
        if (incident.status === 'Under Review') acc.underReview++;
        if (incident.status === 'Resolved') acc.resolved++;
        return acc;
      },
      { active: 0, underReview: 0, resolved: 0 }
    );
  }, [filteredByDateIncidents]);

  const filteredIncidents = useMemo(() => {
    if (!selectedStatus) return [];
    return filteredByDateIncidents.filter((incident) => incident.status === selectedStatus);
  }, [filteredByDateIncidents, selectedStatus]);

  const getSiteName = (siteId: string) =>
    sites.find((s) => s.id === siteId)?.name || 'N/A';
  const getGuardName = (guardId: string) =>
    guards.find((g) => g.id === guardId)?.name || 'N/A';

  const getStatusIndicator = (status: Incident['status']) => {
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
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3"></span>
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

  const handleStatusClick = (status: Incident['status']) => {
    setSelectedStatus((prevStatus) => (prevStatus === status ? null : status));
  };

  const statusCards = [
    {
      status: 'Active',
      count: summary.active,
      icon: ShieldAlert,
      className: 'bg-destructive/10 text-destructive',
      ring: 'ring-destructive',
    },
    {
      status: 'Under Review',
      count: summary.underReview,
      icon: ShieldQuestion,
      className: 'bg-chart-3/10 text-chart-3',
      ring: 'ring-chart-3',
    },
    {
      status: 'Resolved',
      count: summary.resolved,
      icon: CheckCircle2,
      className: 'bg-chart-2/10 text-chart-2',
      ring: 'ring-chart-2',
    },
  ] as const;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Incident Status Breakdown</CardTitle>
            <CardDescription className="font-medium">
            Click a status to see the list of incidents.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {availableYears.length > 0 && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px] font-medium">
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
              )}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] font-medium">
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusCards.map((item) => (
            <div
              key={item.status}
              onClick={() => handleStatusClick(item.status)}
              role="button"
              tabIndex={0}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all',
                item.className,
                selectedStatus === item.status && `ring-2 ${item.ring}`
              )}
            >
              <item.icon className="h-8 w-8" />
              <div>
                <p className="font-medium">{item.status}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Collapsible open={!!selectedStatus}>
        <CollapsibleContent>
          <CardHeader>
            <CardTitle>Incidents: {selectedStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      onClick={() =>
                        router.push(`/agency/incidents/${incident.id}`)
                      }
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Button
                          asChild
                          variant="link"
                          className="h-auto p-0 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/agency/incidents/${incident.id}`}>
                            {incident.id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Date(incident.incidentTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{getSiteName(incident.siteId)}</TableCell>
                      <TableCell className="font-medium">{getGuardName(incident.raisedByGuardId)}</TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground font-medium">
                No incidents with status "{selectedStatus}" {selectedYear !== 'all' || selectedMonth !== 'all' ? 'in the selected period' : ''}.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
