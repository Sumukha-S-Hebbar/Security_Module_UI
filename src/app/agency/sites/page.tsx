

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { incidents } from '@/lib/data/incidents';
import { securityAgencies } from '@/lib/data/security-agencies';
import type { Site, PatrollingOfficer, Guard } from '@/types';
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

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencySitesPage() {
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
  
  // State for Assigned Sites filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');
  const [assignedSelectedRegion, setAssignedSelectedRegion] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');

  // State for Unassigned Sites filters
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [unassignedSelectedRegion, setUnassignedSelectedRegion] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  const agencySites = useMemo(
    () => sites.filter((site) => site.agencyId === LOGGED_IN_AGENCY_ID),
    []
  );
  
  const siteDetailsMap = useMemo(() => {
    return sites.reduce((acc, site) => {
        acc[site.site_name] = site;
        return acc;
    }, {} as {[key: string]: Site});
  }, []);

  const unassignedGuards = useMemo(
    () => guards.filter(guard => {
      const site = agencySites.find(s => s.guards?.includes(guard.id));
      return !site?.patrollingOfficerId;
    }), [agencySites]
  );
  
  const allAgencyPatrollingOfficers = useMemo(() => {
    // In a real app, this might be a separate API call for all patrolling officers in the agency
    return patrollingOfficers.filter(po => po); // Simplified for demo
  }, []);

  const getPatrollingOfficerForSite = useCallback(
    (siteId: string) => {
      const site = agencySites.find((s) => s.id === siteId);
      if (!site || !site.patrollingOfficerId) return null;
      return allAgencyPatrollingOfficers.find(
        (s) => s.id === site.patrollingOfficerId
      );
    },
    [agencySites, allAgencyPatrollingOfficers]
  );

  const assignedSites = useMemo(
    () => agencySites.filter((site) => site.patrollingOfficerId),
    [agencySites]
  );
  const unassignedSites = useMemo(
    () =>
      agencySites.filter((site) => !site.patrollingOfficerId),
    [agencySites]
  );
  
  // Set default geofence value for unassigned sites
  useEffect(() => {
    const defaultGeofences = unassignedSites.reduce((acc, site) => {
      acc[site.id] = '20';
      return acc;
    }, {} as { [key: string]: string });
    setGeofencePerimeters(defaultGeofences);
  }, [unassignedSites]);


  const assignedSitesPatrollingOfficers = useMemo(() => {
    const officers = new Map<string, PatrollingOfficer>();
    assignedSites.forEach((site) => {
      const po = getPatrollingOfficerForSite(site.id);
      if (po && !officers.has(po.id)) {
        officers.set(po.id, po);
      }
    });
    return Array.from(officers.values());
  }, [assignedSites, getPatrollingOfficerForSite]);
  
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


  const handlePatrollingOfficerSelect = (
    siteId: string,
    patrollingOfficerId: string
  ) => {
    setSelectedPatrollingOfficers((prev) => ({
      ...prev,
      [siteId]: patrollingOfficerId,
    }));
  };

  const handleGeofenceChange = (siteId: string, value: string) => {
    setGeofencePerimeters((prev) => ({
      ...prev,
      [siteId]: value,
    }));
  };

  const handleGuardSelect = (siteId: string, guardId: string) => {
    setSelectedGuards((prev) => {
      const currentSelection = prev[siteId] || [];
      const newSelection = currentSelection.includes(guardId)
        ? currentSelection.filter((id) => id !== guardId)
        : [...currentSelection, guardId];
      return { ...prev, [siteId]: newSelection };
    });
  };

  const handleAssign = (siteId: string) => {
    const patrollingOfficerId = selectedPatrollingOfficers[siteId];
    const perimeter = geofencePerimeters[siteId];
    const guardIds = selectedGuards[siteId] || [];

    if (!patrollingOfficerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a patrolling officer.',
      });
      return;
    }
    if (guardIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one guard.',
      });
      return;
    }
    if (!perimeter || Number(perimeter) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid geofence perimeter.',
      });
      return;
    }
    const siteName = unassignedSites.find((s) => s.id === siteId)?.site_name;
    const patrollingOfficerName = allAgencyPatrollingOfficers.find(
      (s) => s.id === patrollingOfficerId
    )?.name;

    toast({
      title: 'Site Assigned',
      description: `${patrollingOfficerName} and ${guardIds.length} guard(s) have been assigned to ${siteName} with a ${perimeter}m geofence. The site will be moved to the assigned list on next refresh.`,
    });
  };

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

      const patrollingOfficer = getPatrollingOfficerForSite(site.id);
      const matchesPatrollingOfficer =
        selectedPatrollingOfficerFilter === 'all' ||
        (patrollingOfficer &&
          patrollingOfficer.id === selectedPatrollingOfficerFilter);

      const matchesRegion = assignedSelectedRegion === 'all' || site.region === assignedSelectedRegion;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesPatrollingOfficer && matchesRegion && matchesCity;
    });
  }, [
    assignedSearchQuery,
    selectedPatrollingOfficerFilter,
    assignedSites,
    getPatrollingOfficerForSite,
    assignedSelectedRegion,
    assignedSelectedCity,
  ]);
  
  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

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
  }, [incidents]);
  
  const patrollingOfficerLocations = useMemo(() => {
    const poCities: {[key: string]: Set<string>} = {};
    allAgencyPatrollingOfficers.forEach(po => {
        poCities[po.id] = new Set();
    });
    
    agencySites.forEach(site => {
        if (site.patrollingOfficerId && poCities[site.patrollingOfficerId]) {
            poCities[site.patrollingOfficerId].add(site.city);
        }
    });

    return poCities;
  }, [allAgencyPatrollingOfficers, agencySites]);

  const renderGuardSelection = (site: Site) => {
    const guardsInCity = unassignedGuards.filter(guard => {
        const guardSite = siteDetailsMap[guard.site];
        return guardSite && guardSite.city === site.city;
    });
    const guardsNotInCity = unassignedGuards.filter(guard => {
        const guardSite = siteDetailsMap[guard.site];
        return !guardSite || guardSite.city !== site.city;
    });

    const renderItems = (guardList: Guard[]) => guardList.map((guard) => {
        const isChecked = selectedGuards[site.id]?.includes(guard.id);
        const limitReached = (selectedGuards[site.id]?.length || 0) >= (site.guardsRequired || 0);
        return (
          <DropdownMenuCheckboxItem
            key={guard.id}
            checked={isChecked}
            disabled={!isChecked && limitReached}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => handleGuardSelect(site.id, guard.id)}
          >
            {guard.name}
          </DropdownMenuCheckboxItem>
        )
      });
      
    return (
        <DropdownMenuContent className="w-64 font-medium">
            <DropdownMenuLabel>Available Guards</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {guardsInCity.length > 0 && (
                <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">In {site.city}</DropdownMenuLabel>
                    {renderItems(guardsInCity)}
                </>
            )}
            {guardsNotInCity.length > 0 && (
                <>
                     {guardsInCity.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">Other Cities</DropdownMenuLabel>
                    {renderItems(guardsNotInCity)}
                </>
            )}
            {unassignedGuards.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground font-medium">No unassigned guards</div>
            )}
      </DropdownMenuContent>
    )
  }
  
  const renderPatrollingOfficerSelection = (site: Site) => {
     const officersInCity = allAgencyPatrollingOfficers.filter(po => 
        patrollingOfficerLocations[po.id]?.has(site.city)
     );
     const officersNotInCity = allAgencyPatrollingOfficers.filter(po => 
        !patrollingOfficerLocations[po.id]?.has(site.city)
     );
     
     const renderItems = (officerList: PatrollingOfficer[]) => officerList.map((po) => (
        <SelectItem
          key={po.id}
          value={po.id}
          className="font-medium"
        >
          {po.name}
        </SelectItem>
     ));

     return (
        <SelectContent>
            {officersInCity.length > 0 && (
                <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">In {site.city}</DropdownMenuLabel>
                    {renderItems(officersInCity)}
                </>
            )}
            {officersNotInCity.length > 0 && (
                 <>
                    {officersInCity.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">Other Cities</DropdownMenuLabel>
                    {renderItems(officersNotInCity)}
                 </>
            )}
        </SelectContent>
     )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground font-medium">
          Comprehensive overview of all operational sites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Sites</CardTitle>
          <CardDescription className="font-medium">
            A list of all sites with an assigned patrolling officer.
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
              value={selectedPatrollingOfficerFilter}
              onValueChange={setSelectedPatrollingOfficerFilter}
            >
              <SelectTrigger className="w-full sm:w-[220px] font-medium hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Filter by Patrolling Officer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Patrolling Officers</SelectItem>
                {assignedSitesPatrollingOfficers.map((po) => (
                  <SelectItem key={po.id} value={po.id} className="font-medium">
                    {po.name}
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
                <TableHead className="text-foreground">Patrolling Officer</TableHead>
                <TableHead className="text-foreground">Guards</TableHead>
                <TableHead className="text-foreground">Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => {
                const patrollingOfficer = getPatrollingOfficerForSite(site.id);
                const incidentsCount = siteIncidentsCount[site.id] || 0;
                return (
                  <TableRow 
                    key={site.id} 
                    onClick={() => router.push(`/agency/sites/${site.id}`)}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                  >
                    <TableCell>
                      <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/agency/sites/${site.id}`}>{site.id}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{site.site_name}</p>
                      <p className="text-sm text-muted-foreground font-medium group-hover:text-accent-foreground">{site.address}</p>
                    </TableCell>
                    <TableCell className="font-medium">{patrollingOfficer?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                        <span>{site.guards?.length || 0}</span>
                      </div>
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
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription className="font-medium">
              A list of sites that do not have a patrolling officer assigned.
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
                  <TableHead className="text-foreground">Site</TableHead>
                  <TableHead className="text-foreground">Geofence (m)</TableHead>
                  <TableHead className="text-foreground">Assign Guards</TableHead>
                  <TableHead className="text-foreground">Assign Patrolling Officer</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="align-top py-4">
                      <div className="font-medium">{site.site_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Input
                        type="number"
                        placeholder="20"
                        className="w-[120px]"
                        value={geofencePerimeters[site.id] || ''}
                        onChange={(e) =>
                          handleGeofenceChange(site.id, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className='flex flex-col items-start gap-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[180px] font-medium">
                              <Users className="mr-2 h-4 w-4" />
                              Select Guards ({selectedGuards[site.id]?.length || 0})
                            </Button>
                          </DropdownMenuTrigger>
                          {renderGuardSelection(site)}
                        </DropdownMenu>
                        {site.guardsRequired && <p className="text-xs text-muted-foreground font-medium">Guards Required: <span className="font-bold">{site.guardsRequired}</span></p>}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Select
                        value={selectedPatrollingOfficers[site.id] || ''}
                        onValueChange={(value) =>
                          handlePatrollingOfficerSelect(site.id, value)
                        }
                      >
                        <SelectTrigger className="w-[180px] font-medium">
                          <SelectValue placeholder="Select Patrolling Officer" />
                        </SelectTrigger>
                        {renderPatrollingOfficerSelection(site)}
                      </Select>
                    </TableCell>
                    <TableCell className="align-top py-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(site.id)}
                        disabled={
                          !selectedPatrollingOfficers[site.id] ||
                          !geofencePerimeters[site.id] ||
                          !selectedGuards[site.id]?.length
                        }
                        className="bg-[#00B4D8] hover:bg-[#00B4D8]/90"
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground font-medium">
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
