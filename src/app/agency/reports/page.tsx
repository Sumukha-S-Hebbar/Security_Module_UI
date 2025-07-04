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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const getIncidentsCount = (site: Site): number => {
    return site.incidents?.length || 0;
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

  const handleDownloadSupervisorReport = (supervisor: Supervisor) => {
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
      description: `Downloading report for ${supervisor.name} from ${format(
        date.from,
        'LLL dd, y'
      )} to ${format(date.to, 'LLL dd, y')}.`,
    });
    // In a real app, this would trigger a file download.
  };

  const getSitesCountForSupervisor = (supervisorId: string): number => {
    const sitesForSupervisor = new Set<string>();
    guards
      .filter((g) => g.supervisorId === supervisorId)
      .forEach((g) => {
        sitesForSupervisor.add(g.site);
      });
    return sitesForSupervisor.size;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Download detailed reports for sites and supervisors.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Report Date Range</Label>
        <div>
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

      <Card>
        <CardHeader>
          <CardTitle>Site Reports</CardTitle>
          <CardDescription>
            Download a detailed report for any site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Assigned Guards</TableHead>
                  <TableHead>Number of Incidents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => {
                  const supervisor = getSupervisorForSite(site.id);
                  const incidentsCount = getIncidentsCount(site);
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
                        <Badge variant="secondary">{incidentsCount}</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>Supervisor Reports</CardTitle>
          <CardDescription>
            Download performance reports for each supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Assigned Guards</TableHead>
                  <TableHead>Assigned Sites</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map((supervisor) => {
                  const assignedSitesCount = getSitesCountForSupervisor(
                    supervisor.id
                  );
                  return (
                    <TableRow key={supervisor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={supervisor.avatar}
                              alt={supervisor.name}
                            />
                            <AvatarFallback>
                              {supervisor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{supervisor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {supervisor.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {supervisor.assignedGuards.length} Guards
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {assignedSitesCount} Sites
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDownloadSupervisorReport(supervisor)
                          }
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
