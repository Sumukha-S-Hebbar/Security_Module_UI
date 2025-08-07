

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { incidentStore } from '@/lib/data/incident-store';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import type { Incident, Guard, PatrollingOfficer, Site } from '@/types';
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
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IncidentStatusSummary } from './_components/incident-status-summary';
import { Eye, FileDown, Search, Calendar as CalendarIcon, CheckCircle, ChevronDown, ShieldAlert } from 'lucide-react';


const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency
const ITEMS_PER_PAGE = 10;

export default function AgencyIncidentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const agencySiteIds = useMemo(() => {
    const agency = securityAgencies.find(a => a.id === LOGGED_IN_AGENCY_ID);
    return new Set(agency ? agency.siteIds : []);
  }, []);

  const getSiteById = (id: string): Site | undefined => {
    return sites.find(s => s.id === id);
  }
  
  const getGuardById = (id: string): Guard | undefined => {
    return guards.find(g => g.id === id);
  }
  
  const getPatrollingOfficerById = (id?: string): PatrollingOfficer | undefined => {
    if (!id) return undefined;
    return patrollingOfficers.find(p => p.id === id);
  }

  const filteredIncidents = useMemo(() => {
    const filtered = incidents.filter((incident) => {
      if (!agencySiteIds.has(incident.siteId)) {
        return false;
      }

      const site = getSiteById(incident.siteId);
      const guard = getGuardById(incident.raisedByGuardId);
      if (!site || !guard) return false;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.id.toLowerCase().includes(searchLower) ||
        site.name.toLowerCase().includes(searchLower) ||
        guard.name.toLowerCase().includes(searchLower);

      let statusMatch = true;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'under-review') {
            statusMatch = incident.status === 'Under Review';
        } else {
            statusMatch = incident.status.toLowerCase() === selectedStatus;
        }
      }
      
      const incidentDate = new Date(incident.incidentTime);
      const matchesDate =
        !selectedDate ||
        format(incidentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      const matchesMonth =
        selectedMonth === 'all' ||
        (incidentDate.getMonth() + 1).toString() === selectedMonth;

      return matchesSearch && statusMatch && matchesDate && matchesMonth;
    });
    setCurrentPage(1);
    return filtered;
  }, [searchQuery, selectedStatus, selectedDate, selectedMonth, incidents, agencySiteIds]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredIncidents, currentPage]);

  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);

  const handleStatusSelectFromSummary = (status: string) => {
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
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground font-medium">
          A log of all emergency incidents reported across your sites.
        </p>
      </div>

      <IncidentStatusSummary 
        incidents={incidents.filter(i => agencySiteIds.has(i.siteId))} 
        onStatusSelect={handleStatusSelectFromSummary}
        selectedStatus={selectedStatus}
      />

      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription className="font-medium">
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
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Statuses</SelectItem>
                <SelectItem value="active" className="font-medium">Active</SelectItem>
                <SelectItem value="under-review" className="font-medium">Under Review</SelectItem>
                <SelectItem value="resolved" className="font-medium">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value)}>
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-medium">
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
                    'w-full sm:w-[240px] justify-start text-left font-medium hover:bg-accent hover:text-accent-foreground',
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
                <TableHead>Guard</TableHead>
                <TableHead>Patrolling Officer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((incident) => {
                  const site = getSiteById(incident.siteId);
                  const guard = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficer = getPatrollingOfficerById(incident.attendedByPatrollingOfficerId);
                  return (
                    <TableRow 
                      key={incident.id} 
                      onClick={() => router.push(`/agency/incidents/${incident.id}`)}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/agency/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{site?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{guard?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        {patrollingOfficer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground font-medium"
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
                <div className="text-sm text-muted-foreground font-medium">
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
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
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
