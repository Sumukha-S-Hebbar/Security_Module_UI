'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { sites, guards } from '@/lib/data';
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

export default function AgencyReportsPage() {
  const [siteId, setSiteId] = useState<string>('');
  const [guardId, setGuardId] = useState<string>('');
  const [siteDate, setSiteDate] = useState<DateRange | undefined>();
  const [guardDate, setGuardDate] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const handleGenerateReport = (type: 'site' | 'guard') => {
    const entityId = type === 'site' ? siteId : guardId;
    const entityName =
      type === 'site'
        ? sites.find((s) => s.id === entityId)?.name
        : guards.find((g) => g.id === entityId)?.name;
    const dateRange = type === 'site' ? siteDate : guardDate;

    if (!entityId || !dateRange?.from || !dateRange?.to) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please select a target and a date range to generate a report.',
      });
      return;
    }

    toast({
      title: 'Report Generation Started',
      description: `Generating ${type} report for ${entityName}. This will be available in the "Recent Reports" section shortly.`,
    });
    // In a real app, this would trigger a background job and update the list below.
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Your generated reports will appear here.</p>
            <p className="text-xs">No reports generated yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
