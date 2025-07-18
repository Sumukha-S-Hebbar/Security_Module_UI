
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { incidents as initialIncidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import type { Incident, Guard, PatrollingOfficer, SecurityAgency, Site } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Eye, Search, Calendar as CalendarIcon, ShieldAlert, CheckCircle, ChevronDown } from 'lucide-react';
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

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

export default function TowercoIncidentsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const monthFromQuery = searchParams.get('month');
  
  // This state now holds the "source of truth" for incidents on this page.
  const [incidents, setIncidents] = useState(initialIncidents);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(monthFromQuery || 'all');

  const towercoSites = useMemo(
    () => sites.filter((site) => site.towerco === LOGGED_IN_TOWERCO),
    []
  );

  const towercoSiteIds = useMemo(
    () => new Set(towercoSites.map((site) => site.id)),
    [towercoSites]
  );

  const towercoIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          towercoSiteIds.has(incident.siteId)
      ),
    [towercoSiteIds, incidents]
  );
  
  const agenciesOnSites = useMemo(() => {
    const agencyIds = new Set<string>();
    securityAgencies.forEach(agency => {
        agency.siteIds.forEach(siteId => {
            if (towercoSiteIds.has(siteId)) {
                agencyIds.add(agency.id);
            }
        })
    });
    return securityAgencies.filter((a) => agencyIds.has(a.id));
  }, [towercoSiteIds]);

  const filteredIncidents = useMemo(() => {
    return towercoIncidents.filter((incident) => {
      const site = sites.find(s => s.id === incident.siteId);
      const agency = site ? securityAgencies.find(a => a.siteIds.includes(site.id)) : undefined;
      const guard = guards.find(g => g.id === incident.raisedByGuardId);
      if (!site || !guard) return false;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        incident.id.toLowerCase().includes(searchLower) ||
        site.name.toLowerCase().includes(searchLower) ||
        guard.name.toLowerCase().includes(searchLower);

      const matchesAgency =
        selectedAgency === 'all' || agency?.id === selectedAgency;

      const incidentDate = new Date(incident.incidentTime);
      const matchesDate =
        !selectedDate ||
        format(incidentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

      const matchesMonth =
        selectedMonth === 'all' ||
        (incidentDate.getMonth() + 1).toString() === selectedMonth;


      return matchesSearch && matchesAgency && matchesDate && matchesMonth;
    });
  }, [searchQuery, selectedAgency, selectedDate, selectedMonth, towercoIncidents]);

  const handleStatusChange = (incidentId: string, status: Incident['status']) => {
    // Update the state on this page. This change will be passed to the detail page.
    setIncidents((prevIncidents) =>
      prevIncidents.map((incident) =>
        incident.id === incidentId ? { ...incident, status } : incident
      )
    );
    toast({
      title: 'Status Updated',
      description: `Incident #${incidentId} status changed to ${status}.`,
    });
    // Redirect to the report page to add details.
    if (status === 'Under Review') {
        router.push(`/towerco/incidents/${incidentId}`);
    }
  };
  
  const getStatusBadge = (status: Incident['status']) => {
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          A log of all emergency incidents for sites managed by{' '}
          {LOGGED_IN_TOWERCO}.
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
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agenciesOnSites.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
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
                <TableHead>Report</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const site = getSiteById(incident.siteId);
                  const agency = site ? getAgencyForSite(site.id) : undefined;
                  const guard = getGuardById(incident.raisedByGuardId);
                  const patrollingOfficer = getPatrollingOfficerById(
                    incident.attendedByPatrollingOfficerId
                  );
                  const isResolved = incident.status === 'Resolved';
                  return (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">
                        {incident.id}
                      </TableCell>
                      <TableCell>{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                      <TableCell>{site?.name || 'N/A'}</TableCell>
                      <TableCell>{agency?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {patrollingOfficer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/towerco/incidents/${incident.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isResolved}>
                                Actions <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                onClick={() =>
                                    handleStatusChange(incident.id, 'Under Review')
                                }
                                disabled={
                                    incident.status === 'Under Review' || isResolved
                                }
                                >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Start Review
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onClick={() => handleStatusChange(incident.id, 'Resolved')}
                                disabled={isResolved}
                                >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Resolved
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
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
