'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { sites, guards } from '@/lib/data';
import type { Site, Incident } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type GeneratedSiteReport = {
  site: Site;
  dateRange: DateRange;
  incidents: Incident[];
};

export default function AgencyReportsPage() {
  const [siteId, setSiteId] = useState<string>('');
  const [guardId, setGuardId] = useState<string>('');
  const [siteDate, setSiteDate] = useState<DateRange | undefined>();
  const [guardDate, setGuardDate] = useState<DateRange | undefined>();
  const [generatedSiteReport, setGeneratedSiteReport] =
    useState<GeneratedSiteReport | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = (type: 'site' | 'guard') => {
    if (type === 'site') {
      if (!siteId || !siteDate?.from || !siteDate?.to) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description:
            'Please select a site and a date range to generate a report.',
        });
        setGeneratedSiteReport(null);
        return;
      }

      const site = sites.find((s) => s.id === siteId);
      if (!site) return;

      // In a real app, you would filter incidents by date range.
      const siteIncidents = site.incidents || [];

      setGeneratedSiteReport({
        site: site,
        dateRange: siteDate,
        incidents: siteIncidents,
      });

      toast({
        title: 'Report Generated',
        description: `Site report for ${site.name} is now available below.`,
      });
    } else {
      // Guard report generation logic
      const entityName = guards.find((g) => g.id === guardId)?.name;

      if (!guardId || !guardDate?.from || !guardDate?.to) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description:
            'Please select a guard and a date range to generate a report.',
        });
        return;
      }
      toast({
        title: 'Report Generation Not Implemented',
        description: `Generating guard reports is not yet available.`,
      });
    }
  };

  const handleDownload = () => {
    if (!generatedSiteReport) return;
    toast({
      title: 'Download Started',
      description: `Downloading report for ${generatedSiteReport.site.name}.`,
    });
    // In a real app, this would trigger a file download.
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view detailed reports for sites and guards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Site Report</CardTitle>
            <CardDescription>
              Select a site and date range for a performance report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-select">Site</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id="site-select">
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !siteDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {siteDate?.from ? (
                      siteDate.to ? (
                        <>
                          {format(siteDate.from, 'LLL dd, y')} -{' '}
                          {format(siteDate.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(siteDate.from, 'LLL dd, y')
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
                    defaultMonth={siteDate?.from}
                    selected={siteDate}
                    onSelect={setSiteDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleGenerateReport('site')}>
              <FileDown className="mr-2 h-4 w-4" />
              Generate Site Report
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate Guard Report</CardTitle>
            <CardDescription>
              Select a guard and date range for a compliance report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guard-select">Guard</Label>
              <Select value={guardId} onValueChange={setGuardId}>
                <SelectTrigger id="guard-select">
                  <SelectValue placeholder="Select a guard" />
                </SelectTrigger>
                <SelectContent>
                  {guards.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !guardDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {guardDate?.from ? (
                      guardDate.to ? (
                        <>
                          {format(guardDate.from, 'LLL dd, y')} -{' '}
                          {format(guardDate.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(guardDate.from, 'LLL dd, y')
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
                    defaultMonth={guardDate?.from}
                    selected={guardDate}
                    onSelect={setGuardDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleGenerateReport('guard')}>
              <FileDown className="mr-2 h-4 w-4" />
              Generate Guard Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {generatedSiteReport ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                Site Report: {generatedSiteReport.site.name}
              </CardTitle>
              <CardDescription>
                {generatedSiteReport.dateRange.from &&
                  format(generatedSiteReport.dateRange.from, 'LLL dd, y')}{' '}
                -{' '}
                {generatedSiteReport.dateRange.to &&
                  format(generatedSiteReport.dateRange.to, 'LLL dd, y')}
              </CardDescription>
            </div>
            <Button onClick={handleDownload} className="flex-shrink-0">
              <FileDown className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Site Details</h3>
              <div className="text-sm border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <p>
                  <span className="font-medium text-muted-foreground">
                    Site ID:
                  </span>{' '}
                  {generatedSiteReport.site.id}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">
                    Address:
                  </span>{' '}
                  {generatedSiteReport.site.address}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">
                    TowerCo:
                  </span>{' '}
                  {generatedSiteReport.site.towerco}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">
                    Assigned Guards:
                  </span>{' '}
                  {generatedSiteReport.site.guards.length}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Incidents Log</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedSiteReport.incidents.length > 0 ? (
                    generatedSiteReport.incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.id}</TableCell>
                        <TableCell>{incident.date}</TableCell>
                        <TableCell>{incident.type}</TableCell>
                        <TableCell>{incident.details}</TableCell>
                        <TableCell>
                          <Badge
                            variant={incident.resolved ? 'secondary' : 'destructive'}
                          >
                            {incident.resolved ? 'Resolved' : 'Open'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground h-24"
                      >
                        No incidents recorded for this site.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>Your generated reports will appear here.</p>
              <p className="text-xs">
                Generate a report above to view details.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
