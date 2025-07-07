
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
import { FileDown, Upload, Loader2, Search, Building, UserCheck, Info, Eye } from 'lucide-react';
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
import Link from 'next/link';

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine((files) => files?.[0]?.type === 'text/csv', 'Only .csv files are accepted.'),
});

const LOGGED_IN_AGENCY_ID = 'AGY01'; // Simulate logged-in agency

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedPatrollingOfficerFilter, setSelectedPatrollingOfficerFilter] = useState('all');

  const agencySites = useMemo(() => sites.filter(site => site.agencyId === LOGGED_IN_AGENCY_ID), []);
  const agencySiteNames = useMemo(() => new Set(agencySites.map(site => site.name)), [agencySites]);

  const agencyGuards = useMemo(() => guards.filter(guard => agencySiteNames.has(guard.site)), [agencySiteNames]);

  const agencyPatrollingOfficers = useMemo(() => {
    const poIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
    return patrollingOfficers.filter(po => poIds.has(po.id));
  }, [agencySites]);

  const getPatrollingOfficerForGuard = (guard: Guard): PatrollingOfficer | undefined => {
    const site = agencySites.find(s => s.name === guard.site);
    if (!site || !site.patrollingOfficerId) return undefined;
    return agencyPatrollingOfficers.find(po => po.id === site.patrollingOfficerId);
  };
  
  const assignedGuards = useMemo(() => agencyGuards.filter((guard) => getPatrollingOfficerForGuard(guard)), [agencyGuards, getPatrollingOfficerForGuard]);
  const unassignedGuards = useMemo(() => agencyGuards.filter((guard) => !getPatrollingOfficerForGuard(guard)), [agencyGuards, getPatrollingOfficerForGuard]);

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

  const handleDownloadReport = (guard: Guard) => {
    toast({ title: 'Report Download Started', description: `Downloading report for ${guard.name}.` });
  };

  const filteredAssignedGuards = useMemo(() => {
    return assignedGuards.filter((guard) => {
      const searchLower = searchQuery.toLowerCase();
      const patrollingOfficer = getPatrollingOfficerForGuard(guard);
      const matchesSearch =
        guard.name.toLowerCase().includes(searchLower) ||
        guard.id.toLowerCase().includes(searchLower) ||
        guard.site.toLowerCase().includes(searchLower);

      const matchesSite = selectedSiteFilter === 'all' || guard.site === selectedSiteFilter;
      const matchesPatrollingOfficer = selectedPatrollingOfficerFilter === 'all' || patrollingOfficer?.id === selectedPatrollingOfficerFilter;

      return matchesSearch && matchesSite && matchesPatrollingOfficer;
    });
  }, [searchQuery, selectedSiteFilter, selectedPatrollingOfficerFilter, assignedGuards, getPatrollingOfficerForGuard]);
  
  const filteredUnassignedGuards = useMemo(() => {
    return unassignedGuards.filter((guard) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        guard.name.toLowerCase().includes(searchLower) ||
        guard.id.toLowerCase().includes(searchLower) ||
        guard.site.toLowerCase().includes(searchLower);

      const matchesSite = selectedSiteFilter === 'all' || guard.site === selectedSiteFilter;
      
      return matchesSearch && matchesSite;
    });
  }, [searchQuery, selectedSiteFilter, unassignedGuards]);

  const uniqueSites = useMemo(() => [...new Set(agencyGuards.map(g => g.site))], [agencyGuards]);
  const uniquePatrollingOfficers = useMemo(() => {
    const poIds = new Set(assignedGuards.map(g => getPatrollingOfficerForGuard(g)?.id).filter(Boolean));
    return agencyPatrollingOfficers.filter(po => poIds.has(po.id));
  }, [assignedGuards, agencyPatrollingOfficers, getPatrollingOfficerForGuard]);


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
                  <CardTitle>Security Guards</CardTitle>
                  <CardDescription>A list of all guards in your agency.</CardDescription>
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
                                              The CSV should contain columns: name, phone, site.
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium tracking-tight">Assigned Guards</h3>
              <p className="text-sm text-muted-foreground">Guards on sites with an assigned patrolling officer.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {filteredAssignedGuards.length > 0 ? (
                  filteredAssignedGuards.map((guard) => {
                    const patrollingOfficer = getPatrollingOfficerForGuard(guard);
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
                        <CardFooter className="grid grid-cols-2 gap-2">
                           <Button asChild variant="outline" size="sm">
                              <Link href={`/agency/guards/${guard.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Report
                              </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReport(guard)}>
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
            </div>

            {unassignedGuards.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium tracking-tight">Unassigned Guards</h3>
                 <p className="text-sm text-muted-foreground">
                  Guards on sites without an assigned patrolling officer.
                </p>
                 <div className="mt-4 p-4 bg-secondary text-secondary-foreground rounded-md flex items-center gap-3 text-sm">
                  <Info className="h-5 w-5"/>
                  <div>
                    To assign a patrolling officer, go to the <Button variant="link" asChild className="p-0 h-auto"><Link href="/agency/sites">Sites page</Link></Button> and assign one to the respective site.
                  </div>
                </div>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guard</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnassignedGuards.length > 0 ? (
                      filteredUnassignedGuards.map((guard) => (
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
                          <TableCell>{guard.site}</TableCell>
                          <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                  <Link href={`/agency/guards/${guard.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Report
                                  </Link>
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No unassigned guards found for the current filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    