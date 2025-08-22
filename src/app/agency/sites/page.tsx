
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Site, PatrollingOfficer, Guard, Organization } from '@/types';
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
  Search,
  ShieldAlert,
  Users,
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
import { fetchData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgencySitesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [sites, setSites] = useState<Site[]>([]);
  const [patrollingOfficers, setPatrollingOfficers] = useState<PatrollingOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInOrg, setLoggedInOrg] = useState<Organization | null>(null);
  
  // State for Assigned Sites filters
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');
  const [assignedSelectedRegion, setAssignedSelectedRegion] = useState('all');
  const [assignedSelectedCity, setAssignedSelectedCity] = useState('all');

  // State for Unassigned Sites filters
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [unassignedSelectedRegion, setUnassignedSelectedRegion] = useState('all');
  const [unassignedSelectedCity, setUnassignedSelectedCity] = useState('all');

  const [assignment, setAssignment] = useState<{ [siteId: string]: { patrollingOfficerId?: string; guardIds?: string[]; geofencePerimeter?: string; } }>({});


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setLoggedInOrg(JSON.parse(orgData));
        }
    }
  }, []);

  const fetchPageData = useCallback(async () => {
    if (!loggedInOrg) return;
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const authHeader = { 'Authorization': `Token ${token}` };

    try {
        const sitesResponse = await fetchData<{results: Site[]}>(`/security/api/agency/${loggedInOrg.code}/sites/list/`, { headers: authHeader });
        setSites(sitesResponse?.results || []);

        const poResponse = await fetchData<{results: any[]}>(`/security/api/agency/${loggedInOrg.code}/patrol_officers/list/`, { headers: authHeader });
        const formattedPOs = poResponse?.results.map(po => ({
            id: po.id.toString(),
            name: `${po.first_name} ${po.last_name || ''}`.trim(),
            email: po.email,
            phone: po.phone,
            avatar: po.profile_picture,
        })) || [];
        setPatrollingOfficers(formattedPOs);
        

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load site data.'
        });
    } finally {
        setIsLoading(false);
    }
  }, [loggedInOrg, toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);


  const assignedSites = useMemo(
    () => sites.filter((site) => site.personnel_assignment_status === 'Assigned'),
    [sites]
  );
  const unassignedSites = useMemo(
    () =>
      sites.filter((site) => site.personnel_assignment_status === 'Unassigned'),
    [sites]
  );
  
  // Set default geofence value for unassigned sites
  useEffect(() => {
    const defaultGuards = unassignedSites.reduce((acc, site) => {
      acc[site.id.toString()] = { 
        patrollingOfficerId: '', 
        guardIds: [],
        geofencePerimeter: site.geofencePerimeter?.toString() || ''
      };
      return acc;
    }, {} as { [key: string]: { patrollingOfficerId?: string; guardIds?: string[]; geofencePerimeter?: string; } });
    setAssignment(defaultGuards);
  }, [unassignedSites]);


  const assignedSitesPatrollingOfficers = useMemo(() => {
    const officers = new Map<string, PatrollingOfficer>();
    assignedSites.forEach((site) => {
      site.patrol_officer_details?.forEach(po => {
        if (!officers.has(po.id.toString())) {
            officers.set(po.id.toString(), {
                id: po.id.toString(),
                name: `${po.first_name} ${po.last_name || ''}`.trim(),
                email: po.email,
                phone: po.phone,
                avatar: po.profile_picture || '',
            });
        }
      })
    });
    return Array.from(officers.values());
  }, [assignedSites]);
  
  const assignedRegions = useMemo(() => [...new Set(assignedSites.map((site) => site.region))].sort(), [assignedSites]);
  const assignedCities = useMemo(() => {
    if (assignedSelectedRegion === 'all') return [];
    return [...new Set(assignedSites.filter((site) => site.region === assignedSelectedRegion).map((site) => site.city))].sort();
  }, [assignedSelectedRegion, assignedSites]);

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

  const handlePatrollingOfficerSelect = (siteId: string, patrollingOfficerId: string) => {
    setAssignment((prev) => ({
      ...prev,
      [siteId]: { ...prev[siteId], patrollingOfficerId },
    }));
  };
  
  const handleAssignmentChange = (siteId: string, key: 'geofencePerimeter', value: string) => {
    setAssignment(prev => ({
        ...prev, 
        [siteId]: {
          ...prev[siteId],
          [key]: value
        }
    }));
  }

  const handleGuardSelect = (siteId: string, guardId: string) => {
    setAssignment((prev) => {
      const currentSelection = prev[siteId]?.guardIds || [];
      const newSelection = currentSelection.includes(guardId)
        ? currentSelection.filter((id) => id !== guardId)
        : [...currentSelection, guardId];
      return { ...prev, [siteId]: { ...prev[siteId], guardIds: newSelection } };
    });
  };

  const handleAssign = async (siteId: string) => {
    if (!loggedInOrg) return;
    const assignmentDetails = assignment[siteId];
    const patrollingOfficerId = assignmentDetails?.patrollingOfficerId;
    const guardIds = assignmentDetails?.guardIds || [];
    const geofence = assignmentDetails?.geofencePerimeter;

    if (!patrollingOfficerId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a patrolling officer.' });
      return;
    }
    if (guardIds.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select at least one guard.' });
      return;
    }

    const token = localStorage.getItem('token');
    const API_URL = `${process.env.NEXT_PUBLIC_DJANGO_API_URL}/security/api/agency/${loggedInOrg.code}/sites/${siteId}/assign/`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({
                patrolling_officer: parseInt(patrollingOfficerId, 10),
                guards: guardIds.map(id => parseInt(id, 10)),
                geofence_perimeter: geofence ? parseInt(geofence, 10) : undefined,
            })
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.detail || 'Failed to assign site.');
        }

        toast({
          title: 'Site Assigned Successfully',
          description: responseData.message,
        });

        fetchPageData();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Assignment Failed',
            description: error.message,
        });
    }
  };

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.site_name.toLowerCase().includes(searchLower) ||
        site.org_site_id.toLowerCase().includes(searchLower);

      const matchesPatrollingOfficer =
        selectedPatrollingOfficerFilter === 'all' ||
        (site.patrol_officer_details && site.patrol_officer_details.some(po => po.id.toString() === selectedPatrollingOfficerFilter));

      const matchesRegion = assignedSelectedRegion === 'all' || site.region === assignedSelectedRegion;
      const matchesCity = assignedSelectedCity === 'all' || site.city === assignedSelectedCity;

      return matchesSearch && matchesPatrollingOfficer && matchesRegion && matchesCity;
    });
  }, [
    assignedSearchQuery,
    selectedPatrollingOfficerFilter,
    assignedSites,
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

  
  const renderPatrollingOfficerSelection = (site: Site) => {
     const officersInCity = patrollingOfficers.filter(po => po.city === site.city);
     const officersNotInCity = patrollingOfficers.filter(po => po.city !== site.city);
     
     const renderItems = (officerList: PatrollingOfficer[]) => officerList.map((po) => {
       const officerName = `${po.first_name} ${po.last_name || ''}`.trim();
       return (
        <SelectItem
          key={po.id}
          value={po.id.toString()}
          className="font-medium"
        >
          {officerName}
        </SelectItem>
     )});

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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
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
                  <SelectItem key={po.id} value={po.id.toString()} className="font-medium">
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
                <TableHead className="text-foreground">Towerbuddy ID</TableHead>
                <TableHead className="text-foreground">Site ID</TableHead>
                <TableHead className="text-foreground">Site Name</TableHead>
                <TableHead className="text-foreground">Location</TableHead>
                <TableHead className="text-foreground">Patrolling Officer</TableHead>
                <TableHead className="text-foreground">Guards</TableHead>
                <TableHead className="text-foreground">Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => {
                return (
                  <TableRow 
                    key={site.id} 
                    onClick={() => router.push(`/agency/sites/${site.id}`)}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                  >
                    <TableCell>
                       <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/agency/sites/${site.id}`}>{site.tb_site_id}</Link>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{site.org_site_id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{site.site_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{site.city}, {site.region}</p>
                    </TableCell>
                    <TableCell className="font-medium">{site.patrol_officer_details?.map(po => `${po.first_name} ${po.last_name || ''}`.trim()).join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                        <span>{site.guard_details?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                        <span>{site.total_incidents}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10 font-medium">
                  No assigned sites found for the current filter.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      
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
                  <TableHead className="text-foreground">Towerbuddy ID</TableHead>
                  <TableHead className="text-foreground">Site ID</TableHead>
                  <TableHead className="text-foreground">Site Name</TableHead>
                  <TableHead className="text-foreground">Location</TableHead>
                  <TableHead className="text-foreground">Geofence Perimeter</TableHead>
                  <TableHead className="text-foreground">Assign Patrolling Officer</TableHead>
                  <TableHead className="text-foreground">Assign Guards</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                  <TableRow key={site.id}>
                     <TableCell className="font-medium">
                      {site.tb_site_id}
                    </TableCell>
                     <TableCell className="font-medium">
                      {site.org_site_id}
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="font-medium">{site.site_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{site.city}, {site.region}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="in meters"
                        className="w-[140px]"
                        value={assignment[site.id.toString()]?.geofencePerimeter || ''}
                        onChange={(e) => handleAssignmentChange(site.id.toString(), 'geofencePerimeter', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Select
                        value={assignment[site.id.toString()]?.patrollingOfficerId || ''}
                        onValueChange={(value) =>
                          handlePatrollingOfficerSelect(site.id.toString(), value)
                        }
                      >
                        <SelectTrigger className="w-[180px] font-medium">
                          <SelectValue placeholder="Select Patrolling Officer" />
                        </SelectTrigger>
                        {renderPatrollingOfficerSelection(site)}
                      </Select>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className='flex flex-col items-start gap-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[180px] font-medium">
                              <Users className="mr-2 h-4 w-4" />
                              Select Guards ({assignment[site.id.toString()]?.guardIds?.length || 0})
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                             <DropdownMenuLabel>No guards available</DropdownMenuLabel>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(site.id.toString())}
                        disabled={
                          !assignment[site.id.toString()]?.patrollingOfficerId ||
                          !assignment[site.id.toString()]?.guardIds?.length
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
                    <TableCell colSpan={8} className="text-center text-muted-foreground font-medium py-10">
                        No unassigned sites found for the current filter.
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
