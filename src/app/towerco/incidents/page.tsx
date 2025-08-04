
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Incident, Guard, PatrollingOfficer, SecurityAgency, Site, Organization } from '@/types';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { IncidentStatusSummary } from './_components/incident-status-summary';
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

type IncidentListItem = {
    id: number;
    incident_id: string;
    tb_site_id: string;
    incident_time: string;
    incident_status: "Active" | "Under Review" | "Resolved";
    site_name: string;
    guard_name: string;
    incident_type: string;
    incident_description: string;
};

type PaginatedIncidentsResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: IncidentListItem[];
};

const ITEMS_PER_PAGE = 10;

export default function TowercoIncidentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [allIncidentsForSummary, setAllIncidentsForSummary] = useState<IncidentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);

  const statusFromQuery = searchParams.get('status');
  const siteIdFromQuery = searchParams.get('siteId');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStatus, setSelectedStatus] = useState(statusFromQuery || 'all');
  const [selectedSite, setSelectedSite] = useState(siteIdFromQuery || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orgData = localStorage.getItem('organization');
      if (orgData) {
        setLoggedInOrg(JSON.parse(orgData));
      }
    }
  }, []);

  useEffect(() => {
    if (!loggedInOrg) return;

    const fetchAllDataForSummary = async () => {
        const token = localStorage.getItem('token');
        const authHeader = { 'Authorization': `Token ${token}` };
        
        const summaryIncidentsUrl = `http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/incidents/list/`;
        const summaryData = await fetchData<PaginatedIncidentsResponse>(summaryIncidentsUrl, { headers: authHeader });
        setAllIncidentsForSummary(summaryData?.results || []);

        const sitesUrl = `http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/sites/list/`;
        const sitesData = await fetchData<{results: Site[]}>(sitesUrl, { headers: authHeader });
        setSites(sitesData?.results || []);
    };

    fetchAllDataForSummary();
  }, [loggedInOrg]);
  
   useEffect(() => {
    if (!loggedInOrg) return;

    const fetchFilteredIncidents = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const authHeader = { 'Authorization': `Token ${token}` };
      
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        const apiStatus = selectedStatus === 'under_review' 
            ? 'Under Review' 
            : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);
        params.append('incident_status', apiStatus);
      }
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSite !== 'all') params.append('site_id', selectedSite);
      if (selectedDate) params.append('date', format(selectedDate, 'yyyy-MM-dd'));
      params.append('page', currentPage.toString());
      params.append('page_size', ITEMS_PER_PAGE.toString());
      
      const incidentsUrl = `http://are.towerbuddy.tel:8000/security/api/orgs/${loggedInOrg.code}/incidents/list/?${params.toString()}`;

      try {
        const data = await fetchData<PaginatedIncidentsResponse>(incidentsUrl, { headers: authHeader });
        setIncidents(data?.results || []);
        setTotalCount(data?.count || 0);
      } catch (error) {
        console.error("Failed to fetch filtered incidents:", error);
        setIncidents([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredIncidents();
  }, [loggedInOrg, selectedStatus, searchQuery, selectedSite, selectedDate, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDate, selectedSite]);


  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);


  const handleStatusSelectFromSummary = (status: string) => {
    const newStatus = selectedStatus === status ? 'all' : status;
    setSelectedStatus(newStatus);
  };
  
  const getStatusIndicator = (status: IncidentListItem['incident_status']) => {
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


  if (!loggedInOrg) {
     return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-4 w-1/2" />
        </div>
     )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground font-medium">
          A log of all emergency incidents for sites managed by{' '}
          {loggedInOrg.name}.
        </p>
      </div>

      <IncidentStatusSummary 
        incidents={allIncidentsForSummary} 
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
                <SelectItem value="under_review" className="font-medium">Under Review</SelectItem>
                <SelectItem value="resolved" className="font-medium">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.tb_site_id} className="font-medium">{site.site_name}</SelectItem>
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
          {isLoading ? (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-foreground">Incident ID</TableHead>
                    <TableHead className="text-foreground">Incident Date</TableHead>
                    <TableHead className="text-foreground">Incident Time</TableHead>
                    <TableHead className="text-foreground">Site</TableHead>
                    <TableHead className="text-foreground">Guard</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {incidents && incidents.length > 0 ? (
                    incidents.map((incident) => (
                    <TableRow 
                        key={incident.id}
                        onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                    >
                        <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/towerco/incidents/${incident.id}`} className="text-accent group-hover:text-accent-foreground">{incident.incident_id}</Link>
                        </Button>
                        </TableCell>
                        <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{new Date(incident.incident_time).toLocaleTimeString()}</TableCell>
                        <TableCell className="font-medium">{incident.site_name || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{incident.guard_name || 'N/A'}</TableCell>
                        <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground font-medium py-10"
                    >
                        No incidents found for the current filter.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          )}
        </CardContent>
        {totalCount > 0 && !isLoading && (
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {incidents.length} of {totalCount} incidents.
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
        )}
      </Card>
    </div>
  );
}
