
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { guards } from '@/lib/data/guards';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { incidentStore } from '@/lib/data/incident-store';
import type { Incident, Guard, PatrollingOfficer, SecurityAgency, Site } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Search, Calendar as CalendarIcon, ShieldAlert, ChevronDown, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IncidentStatusSummary } from './_components/incident-status-summary';

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user
const ITEMS_PER_PAGE = 10;

export default function TowercoIncidentsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const monthFromQuery = searchParams.get('month');
  
  const [incidents, setIncidents] = useState(incidentStore.getIncidents());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(monthFromQuery || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setIncidents(incidentStore.getIncidents());
    });
    return () => unsubscribe();
  }, []);

  const towercoSiteIds = useMemo(() => {
    const towercoSites = sites.filter((site) => site.towerco === LOGGED_IN_TOWERCO);
    return new Set(towercoSites.map((site) => site.id));
  }, []);

  const getGuardById = (id: string): Guard | undefined => {
    return guards.find((g) => g.id === id);
  };

  const getPatrollingOfficerById = (id?: string): PatrollingOfficer | undefined => {
    if (!id) return undefined;
    return patrollingOfficers.find((s) => s.id === id);
  };

  const getAgencyForSite = (siteId: string): SecurityAgency | undefined => {
    return securityAgencies.find((a) => a.siteIds.includes(siteId));
  };
  
  const getSiteById = (id: string): Site | undefined => {
    return sites.find((s) => s.id === id);
  };

  const filteredIncidents = useMemo(() => {
    const filtered = incidents.filter((incident) => {
      // Basic filter: only show incidents for the logged-in TOWERCO
      if (!towercoSiteIds.has(incident.siteId)) {
        return false;
      }
      
      const site = getSiteById(incident.siteId);
      const guard = getGuardById(incident.raisedByGuardId);
      
      // An incident is valid if it has a site and a guard.
      if (!site || !guard) return false;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.id.toLowerCase().includes(searchLower) ||
        site.name.toLowerCase().includes(searchLower) ||
        guard.name.toLowerCase().includes(searchLower);

      const matchesStatus =
        selectedStatus === 'all' || incident.status.toLowerCase().replace(' ', '-') === selectedStatus;
      
      const incidentDate = new Date(incident.incidentTime);
      const matchesDate =
        !selectedDate ||
        format(incidentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      const matchesMonth =
        selectedMonth === 'all' ||
        (incidentDate.getMonth() + 1).toString() === selectedMonth;

      return matchesSearch && matchesStatus && matchesDate && matchesMonth;
    });
    setCurrentPage(1);
    return filtered;
  }, [searchQuery, selectedStatus, selectedDate, selectedMonth, incidents, towercoSiteIds]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredIncidents, currentPage]);

  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);

  const handleStatusSelectFromSummary = (status: string) => {
    // If clicking the same status card again, reset the filter
    if (selectedStatus === status) {
      setSelectedStatus('all');
    } else {
      setSelectedStatus(status);
    }
  }
  
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          A log of all emergency incidents for sites managed by{' '}
          {LOGGED_IN_TOWERCO}.
        </p>
      </div>

      <IncidentStatusSummary 
        incidents={incidents.filter(i => towercoSiteIds.has(i.siteId))} 
        onStatusSelect={handleStatusSelectFromSummary}
        selectedStatus={selectedStatus}
      />

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
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Patrolling Officer</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((incident) => {
                  const site = getSiteById(incident.siteId);
                  const agency = site ? getAgencyForSite(site.id) : undefined;
                  const guard = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficer = getPatrollingOfficerById(
                    incident.attendedByPatrollingOfficerId
                  );
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                      <TableCell>{site?.name || 'N/A'}</TableCell>
                      <TableCell>{agency?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No incidents found for the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">
                      Showing {paginatedIncidents.length} of {filteredIncidents.length} incidents.
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
