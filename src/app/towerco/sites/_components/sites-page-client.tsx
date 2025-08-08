
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { incidents } from '@/lib/data/incidents';
import { securityAgencies } from '@/lib/data/security-agencies';
import type { Site, PatrollingOfficer, Guard, SecurityAgency } from '@/types';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileDown,
  MapPin,
  Fence,
  Search,
  UserCheck,
  ShieldAlert,
  Users,
  Eye,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const LOGGED_IN_AGENCY_ID = 'AGY01'; // This is likely incorrect for a TOWERCO page, but we'll adapt

export function SitesPageClient() {
  const [selectedPatrollingOfficers, setSelectedPatrollingOfficers] = useState<{
    [key: string]: string;
  }>({});
  const [geofencePerimeters, setGeofencePerimeters] = useState<{
    [key: string]: string;
  }>({});
  const [selectedGuards, setSelectedGuards] = useState<{
    [key: string]: string[];
  }>({});
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusSite = searchParams.get('focusSite');

  // State for Assigned Sites filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');
  const [assignedSelectedRegion, setAssignedSelectedRegion] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('all');

  // State for Unassigned Sites filters
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [unassignedSelectedRegion, setUnassignedSelectedRegion] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  const [assignment, setAssignment] = useState<{ [siteId: string]: string }>({});
  
  const unassignedSitesRef = useRef(new Map<string, HTMLTableRowElement | null>());

  useEffect(() => {
    const el = focusSite ? unassignedSitesRef.current.get(focusSite) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-row');
      setTimeout(() => {
        el.classList.remove('highlight-row');
      }, 2000);
    }
  }, [focusSite]);

  // TowerCo sees all sites, so no agency filter needed at this level.
  const allSites = sites;
  const allAgencies = securityAgencies;
  const allPatrollingOfficers = patrollingOfficers;

  const siteDetailsMap = useMemo(() => {
    return allSites.reduce((acc, site) => {
        acc[site.id] = site;
        return acc;
    }, {} as {[key: string]: Site});
  }, [allSites]);

  const assignedSites = useMemo(
    () => allSites.filter((site) => site.agencyId),
    [allSites]
  );
  const unassignedSites = useMemo(
    () => allSites.filter((site) => !site.agencyId),
    [allSites]
  );
  
  // Set default geofence value for unassigned sites
  useEffect(() => {
    const defaultGeofences = unassignedSites.reduce((acc, site) => {
      acc[site.id] = '20';
      return acc;
    }, {} as { [key: string]: string });
    setGeofencePerimeters(defaultGeofences);
  }, [unassignedSites]);


  // Location filters data for ASSIGNED sites
  const assignedRegions = useMemo(() => [...new Set(assignedSites.map((site) => site.region))].sort(), [assignedSites]);
  const assignedCities = useMemo(() => {
    if (assignedSelectedRegion === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.region === assignedSelectedRegion).map((site) => site.city))].sort();
  }, [assignedSelectedRegion, assignedSites]);

  // Location filters data for UNASSIGNED sites
  const unassignedRegions = useMemo(() => [...new Set(unassignedSites.map((site) => site.region))].sort(), [unassignedSites]);
  const unassignedCities = useMemo(() => {
    if (unassignedSelectedRegion === 'all') return [];
    return [...new Set(unassignedSites.filter((site) => site.region === unassignedSelectedRegion).map((site) => site.city))].sort();
  }, [unassignedSelectedRegion, unassignedSites]);


  const handleAssignedRegionChange = (region: string) => {
    setAssignedSelectedRegion(region);
    setAssignedSelectedCity('all');
  };

  const handleUnassignedRegionChange = (region: string) => {
    setUnassignedSelectedRegion(region);
    setUnassignedSelectedCity('all');
  };

  const handleAssignmentChange = (siteId: string, agencyId: string) => {
      setAssignment(prev => ({...prev, [siteId]: agencyId}));
  }

  const handleAssignAgency = (siteId: string) => {
    const agencyId = assignment[siteId];
    if (!agencyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agency to assign.',
      });
      return;
    }

    const siteName = allSites.find(s => s.id === siteId)?.site_name;
    const agencyName = allAgencies.find(a => a.id.toString() === agencyId)?.name;

    toast({
      title: 'Site Assigned',
      description: `Site "${siteName}" has been assigned to ${agencyName}. This will update on next refresh.`,
    });
  };

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const agency = allAgencies.find(a => a.agency_id === site.agencyId);

      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower) ||
        (agency && agency.name.toLowerCase().includes(searchLower));

      const matchesAgency = selectedAgencyFilter === 'all' || site.agencyId === selectedAgencyFilter;
      const matchesRegion = assignedSelectedRegion === 'all' || site.region === assignedSelectedRegion;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesAgency && matchesRegion && matchesCity;
    });
  }, [
    assignedSearchQuery,
    assignedSites,
    allAgencies,
    selectedAgencyFilter,
    assignedSelectedRegion,
    assignedSelectedCity,
  ]);
  
  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower);

      const matchesRegion = unassignedSelectedRegion === 'all' || site.region === unassignedSelectedRegion;
      const matchesCity = unassignedSelectedCity === 'all' || site.city === unassignedSelectedCity;

      return matchesSearch && matchesRegion && matchesCity;
    });
  }, [unassignedSearchQuery, unassignedSites, unassignedSelectedRegion, unassignedSelectedCity]);

  const siteIncidentsCount = useMemo(() => {
    const counts: { [siteId: string]: number } = {};
    incidents.forEach((incident) => {
        if (!counts[incident.siteId]) {
          counts[incident.siteId] = 0;
        }
        counts[incident.siteId]++;
    });
    return counts;
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
          <p className="text-muted-foreground font-medium">
            Assign security agencies and manage your portfolio of sites.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                <FileDown className="mr-2 h-4 w-4" />
                Download Site Report
            </Button>
            <Button className="bg-[#00B4D8] hover:bg-[#00B4D8]/90">
                <FileDown className="mr-2 h-4 w-4" />
                Download All Reports
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites ({filteredAssignedSites.length})</CardTitle>
          <CardDescription className="font-medium">
            A list of all sites that have been assigned to a security agency.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assigned sites..."
                value={assignedSearchQuery}
                onChange={(e) => setAssignedSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
             <Select
              value={selectedAgencyFilter}
              onValueChange={setSelectedAgencyFilter}
            >
              <SelectTrigger className="w-full sm:w-[220px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Agencies</SelectItem>
                {allAgencies.map((agency) => (
                  <SelectItem key={agency.agency_id} value={agency.agency_id} className="font-medium">
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignedSelectedRegion}
              onValueChange={handleAssignedRegionChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                {assignedRegions.map((region) => (
                  <SelectItem key={region} value={region} className="font-medium">
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assignedSelectedCity}
              onValueChange={setAssignedSelectedCity}
              disabled={assignedSelectedRegion === 'all'}
            >
              <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                {assignedCities.map((city) => (
                  <SelectItem key={city} value={city} className="font-medium">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Site ID</TableHead>
                <TableHead className="text-foreground">Site Name</TableHead>
                <TableHead className="text-foreground">Assigned Agency</TableHead>
                <TableHead className="text-foreground">Location</TableHead>
                <TableHead className="text-foreground">Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => {
                const agency = allAgencies.find(a => a.agency_id === site.agencyId);
                const incidentsCount = siteIncidentsCount[site.id] || 0;
                return (
                  <TableRow 
                    key={site.id} 
                    onClick={() => router.push(`/towerco/sites/${site.id}`)}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                  >
                    <TableCell>
                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/towerco/sites/${site.id}`}>{site.org_site_id}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{site.site_name}</p>
                    </TableCell>
                    <TableCell>
                      {agency ? (
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/agencies/${agency.id}`}>{agency.name}</Link>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground font-medium">N/A</span>
                      )}
                    </TableCell>
                     <TableCell>
                      <p className="font-medium">{site.city}, {site.region}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                        <span>{incidentsCount}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10 font-medium">
                  No assigned sites found for the current filter.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites ({filteredUnassignedSites.length})</CardTitle>
            <CardDescription className="font-medium">
              A list of sites that do not have a security agency assigned.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-4">
                <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search unassigned sites..."
                    value={unassignedSearchQuery}
                    onChange={(e) => setUnassignedSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  />
                </div>
                <Select value={unassignedSelectedRegion} onValueChange={handleUnassignedRegionChange}>
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Regions</SelectItem>
                    {unassignedRegions.map((region) => (
                      <SelectItem key={region} value={region} className="font-medium">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={unassignedSelectedCity}
                  onValueChange={setUnassignedSelectedCity}
                  disabled={unassignedSelectedRegion === 'all'}
                >
                  <SelectTrigger className="w-full sm:w-[180px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Cities</SelectItem>
                    {unassignedCities.map((city) => (
                      <SelectItem key={city} value={city} className="font-medium">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Site ID</TableHead>
                  <TableHead className="text-foreground">Site Name</TableHead>
                  <TableHead className="text-foreground">Location</TableHead>
                  <TableHead className="text-foreground">Assign Agency</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                        <TableRow 
                          key={site.id} 
                          ref={el => {
                            if (unassignedSitesRef.current) {
                                unassignedSitesRef.current.set(site.id, el);
                            }
                          }}
                        >
                          <TableCell className="font-medium">{site.org_site_id}</TableCell>
                          <TableCell>
                             <div className="font-medium">{site.site_name}</div>
                          </TableCell>
                          <TableCell className="font-medium">{site.city}, {site.region}</TableCell>
                          <TableCell>
                             <div onClick={(e) => e.stopPropagation()}>
                              <Select
                                onValueChange={(value) =>
                                  handleAssignmentChange(site.id.toString(), value)
                                }
                             >
                               <SelectTrigger className="w-[200px] font-medium">
                                 <SelectValue placeholder="Select an agency" />
                               </SelectTrigger>
                               <SelectContent>
                                {allAgencies.map(agency => (
                                    <SelectItem key={agency.id} value={agency.id.toString()}>{agency.name}</SelectItem>
                                ))}
                               </SelectContent>
                              </Select>
                             </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button
                                size="sm"
                                onClick={() => handleAssignAgency(site.id)}
                                disabled={!assignment[site.id]}
                                className="bg-[#00B4D8] hover:bg-[#00B4D8]/90"
                              >
                                Assign
                              </Button>
                          </TableCell>
                        </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground font-medium py-10">
                        No unassigned sites found for the current filter.
                    </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
