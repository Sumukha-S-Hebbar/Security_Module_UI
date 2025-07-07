'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Site, Guard, PatrollingOfficer } from '@/types';
import { guards, patrollingOfficers, sites } from '@/lib/data';
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
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Upload, Loader2, Search, Building, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const [selectedPatrollingOfficers, setSelectedPatrollingOfficers] = useState<{ [key: string]: string; }>({});
  const [selectedSites, setSelectedSites] = useState<{ [key: string]: string; }>({});
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');

  const assignedGuards = useMemo(() => guards.filter((guard) => guard.patrollingOfficerId), []);
  const unassignedGuards = useMemo(() => guards.filter((guard) => !guard.patrollingOfficerId), []);
  
  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });

  async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
    setIsUploading(true);
    console.log('Uploaded file:', values.csvFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.csvFile[0].name}" has been uploaded. Guard profiles would be processed.`,
    });
    uploadForm.reset({ csvFile: undefined });
    const fileInput = document.getElementById('csvFile-guard-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  }

  const getPatrollingOfficerById = (id?: string) => patrollingOfficers.find((s) => s.id === id);

  const handlePatrollingOfficerSelect = (guardId: string, patrollingOfficerId: string) => {
    setSelectedPatrollingOfficers((prev) => ({ ...prev, [guardId]: patrollingOfficerId }));
    setSelectedSites((prev) => {
      const newState = { ...prev };
      delete newState[guardId];
      return newState;
    });
  };

  const handleSiteSelect = (guardId: string, siteId: string) => {
    setSelectedSites((prev) => ({ ...prev, [guardId]: siteId }));
  };

  const handleAssign = (guardId: string) => {
    const patrollingOfficerId = selectedPatrollingOfficers[guardId];
    const siteId = selectedSites[guardId];
    if (!patrollingOfficerId || !siteId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a patrolling officer and a site.' });
      return;
    }
    const guardName = guards.find((g) => g.id === guardId)?.name;
    const patrollingOfficerName = patrollingOfficers.find((s) => s.id === patrollingOfficerId)?.name;
    const siteName = sites.find((s) => s.id === siteId)?.name;
    toast({
      title: 'Guard Assigned',
      description: `${guardName} has been assigned to ${siteName} under patrolling officer ${patrollingOfficerName}. The guard will be moved to the assigned list on next refresh.`,
    });
  };

  const handleDownloadReport = (guard: Guard) => {
    toast({ title: 'Report Download Started', description: `Downloading report for ${guard.name}.` });
  };
  
  const siteToPatrollingOfficerMap: Record<string, string> = {};
  sites.forEach((site) => {
    const firstAssignedGuard = guards.find((g) => g.patrollingOfficerId && g.site === site.name);
    if (firstAssignedGuard) siteToPatrollingOfficerMap[site.id] = firstAssignedGuard.patrollingOfficerId!;
  });
  const unassignedSitesList = sites.filter((site) => !siteToPatrollingOfficerMap[site.id]);
  const patrollingOfficerToAvailableSitesMap: Record<string, Site[]> = patrollingOfficers.reduce((acc, patrollingOfficer) => {
    const managedSites = sites.filter((site) => siteToPatrollingOfficerMap[site.id] === patrollingOfficer.id);
    acc[patrollingOfficer.id] = [...managedSites, ...unassignedSitesList].sort((a, b) => a.name.localeCompare(b.name));
    return acc;
  }, {} as Record<string, Site[]>);

  const filteredAssignedGuards = useMemo(() => {
    return assignedGuards.filter((guard) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        guard.name.toLowerCase().includes(searchLower) ||
        guard.id.toLowerCase().includes(searchLower) ||
        guard.site.toLowerCase().includes(searchLower);

      const matchesSite = selectedSiteFilter === 'all' || guard.site === selectedSiteFilter;
      const matchesPatrollingOfficer = selectedPatrollingOfficerFilter === 'all' || guard.patrollingOfficerId === selectedPatrollingOfficerFilter;

      return matchesSearch && matchesSite && matchesPatrollingOfficer;
    });
  }, [searchQuery, selectedSiteFilter, selectedPatrollingOfficerFilter, assignedGuards]);

  const uniqueSites = useMemo(() => [...new Set(assignedGuards.map(g => g.site))], [assignedGuards]);
  const uniquePatrollingOfficers = useMemo(() => {
    const poIds = new Set(assignedGuards.map(g => g.patrollingOfficerId));
    return patrollingOfficers.filter(po => poIds.has(po.id));
  }, [assignedGuards]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Guard Management</h1>
        <p className="text-muted-foreground">Add, view, and manage guard profiles and their assignments.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                  <CardTitle>Assigned Security Guards</CardTitle>
                  <CardDescription>A list of all guards with an assigned patrolling officer.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                      <DialogTrigger asChild>
                          <Button>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload CSV
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                          <DialogTitle>Upload Guard Profiles</DialogTitle>
                          <DialogDescription>
                              Upload a CSV file to add multiple security guard profiles at once.
                          </DialogDescription>
                          </DialogHeader>
                          <Form {...uploadForm}>
                              <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)}>
                                  <div className="grid gap-4 py-4">
                                      <FormField
                                          control={uploadForm.control}
                                          name="csvFile"
                                          render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Guard CSV File</FormLabel>
                                              <FormControl>
                                              <Input
                                                  id="csvFile-guard-input"
                                                  type="file"
                                                  accept=".csv"
                                                  disabled={isUploading}
                                                  onChange={(e) => field.onChange(e.target.files)}
                                              />
                                              </FormControl>
                                              <FormDescription>
                                              The CSV should contain columns: name, phone, site, patrollingOfficerId.
                                              </FormDescription>
                                              <FormMessage />
                                          </FormItem>
                                          )}
                                      />
                                  </div>
                                  <DialogFooter>
                                      <Button type="submit" disabled={isUploading}>
                                      {isUploading ? (
                                          <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Uploading...
                                          </>
                                      ) : (
                                          <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          Upload CSV
                                          </>
                                      )}
                                      </Button>
                                  </DialogFooter>
                              </form>
                          </Form>
                      </DialogContent>
                  </Dialog>
              </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search guards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
            </div>
             <Select value={selectedSiteFilter} onValueChange={setSelectedSiteFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by site" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {uniqueSites.map((site) => (
                        <SelectItem key={site} value={site}>
                            {site}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedPatrollingOfficerFilter} onValueChange={setSelectedPatrollingOfficerFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Patrolling Officer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Patrolling Officers</SelectItem>
                    {uniquePatrollingOfficers.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                            {po.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredAssignedGuards.length > 0 ? (
              filteredAssignedGuards.map((guard) => {
                const patrollingOfficer = getPatrollingOfficerById(guard.patrollingOfficerId);
                const selfieAccuracy = guard.totalSelfieRequests > 0 ? Math.round(((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100) : 100;

                return (
                  <Card key={guard.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={guard.avatar} alt={guard.name} />
                                <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{guard.name}</CardTitle>
                                <CardDescription>ID: {guard.id}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span>{guard.site}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCheck className="h-4 w-4 flex-shrink-0" />
                        <span>{patrollingOfficer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Perimeter Accuracy: {guard.performance?.perimeterAccuracy}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Selfie Accuracy: {selfieAccuracy}%</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(guard)} className="w-full">
                          <FileDown className="mr-2 h-4 w-4" />
                          Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                  No assigned guards found for the current filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {unassignedGuards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Security Guards</CardTitle>
            <CardDescription>Assign a patrolling officer and site to a guard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assign Patrolling Officer</TableHead>
                  <TableHead>Assign Site</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedGuards.map((guard) => {
                  const selectedPatrollingOfficerId = selectedPatrollingOfficers[guard.id];
                  const availableSites = selectedPatrollingOfficerId ? patrollingOfficerToAvailableSitesMap[selectedPatrollingOfficerId] : [];
                  return (
                    <TableRow key={guard.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={guard.avatar} alt={guard.name} />
                            <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{guard.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {guard.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{guard.phone}</TableCell>
                      <TableCell>
                        <Select value={selectedPatrollingOfficers[guard.id] || ''} onValueChange={(value) => handlePatrollingOfficerSelect(guard.id, value)}>
                          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Patrolling Officer" /></SelectTrigger>
                          <SelectContent>{patrollingOfficers.map((patrollingOfficer) => (<SelectItem key={patrollingOfficer.id} value={patrollingOfficer.id}>{patrollingOfficer.name}</SelectItem>))}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={selectedSites[guard.id] || ''} onValueChange={(value) => handleSiteSelect(guard.id, value)} disabled={!selectedPatrollingOfficerId}>
                          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Site" /></SelectTrigger>
                          <SelectContent>
                            {availableSites.length > 0 ? (availableSites.map((site) => (<SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>))) : (<SelectItem value="no-sites" disabled>Select patrolling officer first</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button size="sm" onClick={() => handleAssign(guard.id)} disabled={!selectedPatrollingOfficers[guard.id] || !selectedSites[guard.id]}>Assign</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
