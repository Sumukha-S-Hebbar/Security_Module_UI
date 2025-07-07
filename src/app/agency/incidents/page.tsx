
'use client';

import { useState, useMemo } from 'react';
import { alerts as initialAlerts, guards, patrollingOfficers, sites } from '@/lib/data';
import type { Alert, Guard, PatrollingOfficer } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileDown, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencyIncidentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState('all');

  const agencySites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID), []);
  const agencySiteNames = useMemo(() => new Set(agencySites.map(site => site.name)), [agencySites]);

  const agencyAlerts = useMemo(() => initialAlerts.filter(
    (alert) => alert.type === 'Emergency' && agencySiteNames.has(alert.site)
  ), [agencySiteNames]);

  const filteredIncidents = useMemo(() => {
    return agencyAlerts.filter((incident) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.id.toLowerCase().includes(searchLower) ||
        incident.site.toLowerCase().includes(searchLower) ||
        incident.guard.toLowerCase().includes(searchLower);

      const matchesStatus =
        selectedStatus === 'all' || incident.status.toLowerCase().replace(' ', '-') === selectedStatus;
      
      const incidentDate = new Date(incident.date);
      const matchesDate =
        !selectedDate ||
        format(incidentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      const matchesMonth =
        selectedMonth === 'all' ||
        incidentDate.getMonth() === parseInt(selectedMonth, 10);

      return matchesSearch && matchesStatus && matchesDate && matchesMonth;
    });
  }, [searchQuery, selectedStatus, selectedDate, selectedMonth, agencyAlerts]);

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Under Review':
        return <Badge variant="default">Under Review</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const getPatrollingOfficerByGuardName = (
    guardName: string
  ): PatrollingOfficer | undefined => {
    const guard = getGuardByName(guardName);
    if (!guard) return undefined;
    const site = sites.find(s => s.name === guard.site);
    if (!site || !site.patrollingOfficerId) {
      return undefined;
    }
    return patrollingOfficers.find((s) => s.id === site.patrollingOfficerId);
  };

  const handleDownloadReport = (incident: Alert) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for incident #${incident.id}.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          A log of all emergency incidents reported across your sites.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>
            Review and monitor all high-priority alerts.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(0, i).toLocaleString('default', {
                      month: 'long',
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full sm:w-[240px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead>Patrolling Officer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const patrollingOfficer = getPatrollingOfficerByGuardName(incident.guard);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">
                        {incident.id}
                      </TableCell>
                      <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                      <TableCell>{incident.site}</TableCell>
                      <TableCell>{incident.guard}</TableCell>
                      <TableCell>
                        {patrollingOfficer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/agency/incidents/${incident.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(incident)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No incidents found for the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
