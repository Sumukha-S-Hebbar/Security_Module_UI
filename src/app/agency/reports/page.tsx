'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { sites, guards, supervisors } from '@/lib/data';
import type { Site, Supervisor } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AgencyReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const { toast } = useToast();

  const getSupervisorForSite = (siteId: string): Supervisor | null => {
    const site = sites.find((s) => s.id === siteId);
    if (!site || site.guards.length === 0) {
      return null;
    }
    // Assumption: all guards at a site have the same supervisor. We'll use the first guard.
    const guardId = site.guards[0];
    const guard = guards.find((g) => g.id === guardId);
    if (!guard || !guard.supervisorId) {
      return null;
    }
    return supervisors.find((s) => s.id === guard.supervisorId) || null;
  };

  const getOpenIncidentsCount = (site: Site): number => {
    return site.incidents?.filter((incident) => !incident.resolved).length || 0;
  };

  const handleDownloadReport = (site: Site) => {
    if (!date?.from || !date?.to) {
      toast({
        variant: 'destructive',
        title: 'Date Range Required',
        description: 'Please select a date range to download the report.',
      });
      return;
    }
    toast({
      title: 'Report Download Started',
      description: `Downloading report for ${site.name} from ${format(
        date.from,
        'LLL dd, y'
      )} to ${format(date.to, 'LLL dd, y')}.`,
    });
    // In a real app, this would trigger a file download (e.g., CSV or PDF).
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Download detailed reports for each site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Reports</CardTitle>
          <CardDescription>
            Select a date range and download a report for any site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Label>Report Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full sm:w-[300px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y')} -{' '}
                          {format(date.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Assigned Guards</TableHead>
                  <TableHead>Open Incidents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => {
                  const supervisor = getSupervisorForSite(site.id);
                  const openIncidents = getOpenIncidentsCount(site);
                  return (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {site.address}
                        </div>
                      </TableCell>
                      <TableCell>{supervisor?.name || 'Unassigned'}</TableCell>
                      <TableCell>{site.guards.length}</TableCell>
                      <TableCell>
                        {openIncidents > 0 ? (
                          <Badge variant="destructive">{openIncidents}</Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleDownloadReport(site)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
