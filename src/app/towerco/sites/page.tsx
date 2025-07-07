
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { sites, securityAgencies } from '@/lib/data';
import type { Site, SecurityAgency } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  MapPin,
  Upload,
  PlusCircle,
  Search,
  Building2,
  Briefcase,
  ShieldAlert,
  Loader2,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

const LOGGED_IN_TOWERCO = 'TowerCo Alpha'; // Simulate logged-in user

const uploadFormSchema = z.object({
  csvFile: z
    .any()
    .refine((files) => files?.length === 1, 'CSV file is required.')
    .refine(
      (files) => files?.[0]?.type === 'text/csv',
      'Only .csv files are accepted.'
    ),
});

const addSiteFormSchema = z.object({
  name: z.string().min(1, 'Site name is required.'),
  address: z.string().min(1, 'Address is required.'),
});

export default function TowercoSitesPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const { toast } = useToast();

  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [assignments, setAssignments] = useState<{ [siteId: string]: string }>(
    {}
  );

  const towercoSites = useMemo(
    () => sites.filter((site) => site.towerco === LOGGED_IN_TOWERCO),
    []
  );

  const assignedSites = useMemo(
    () => towercoSites.filter((site) => site.agencyId),
    [towercoSites]
  );

  const unassignedSites = useMemo(
    () => towercoSites.filter((site) => !site.agencyId),
    [towercoSites]
  );

  const uploadForm = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
  });

  const addSiteForm = useForm<z.infer<typeof addSiteFormSchema>>({
    resolver: zodResolver(addSiteFormSchema),
    defaultValues: { name: '', address: '' },
  });

  async function onUploadSubmit(values: z.infer<typeof uploadFormSchema>) {
    setIsUploading(true);
    console.log('Uploaded file:', values.csvFile[0]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Upload Successful',
      description: `File "${values.csvFile[0].name}" has been uploaded. Site profiles would be processed.`,
    });
    uploadForm.reset({ csvFile: undefined });
    setIsUploading(false);
    setIsUploadDialogOpen(false);
  }

  async function onAddSiteSubmit(values: z.infer<typeof addSiteFormSchema>) {
    setIsAddingSite(true);
    console.log('New site data:', { ...values, towerco: LOGGED_IN_TOWERCO });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: 'Site Added',
      description: `Site "${values.name}" has been created successfully.`,
    });
    addSiteForm.reset();
    setIsAddingSite(false);
    setIsAddSiteDialogOpen(false);
  }

  const handleDownloadReport = (siteName: string) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for site ${siteName}. This is a mock action.`,
    });
  };

  const handleAssignmentChange = (siteId: string, agencyId: string) => {
    setAssignments((prev) => ({ ...prev, [siteId]: agencyId }));
  };

  const handleAssignAgency = (siteId: string) => {
    const agencyId = assignments[siteId];
    if (!agencyId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agency to assign.',
      });
      return;
    }
    const siteName = sites.find((s) => s.id === siteId)?.name;
    const agencyName = securityAgencies.find((a) => a.id === agencyId)?.name;
    toast({
      title: 'Agency Assigned',
      description: `${agencyName} has been assigned to site ${siteName}. This change will be reflected on the next refresh.`,
    });
    // In a real app, this would be an API call.
  };

  const agenciesOnSites = useMemo(() => {
    const agencyIds = new Set(
      assignedSites.map((s) => s.agencyId).filter(Boolean)
    );
    return securityAgencies.filter((a) => agencyIds.has(a.id));
  }, [assignedSites]);

  const filteredAssignedSites = useMemo(() => {
    return assignedSites.filter((site) => {
      const searchLower = assignedSearchQuery.toLowerCase();
      const matchesSearch =
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower);

      const matchesAgency =
        selectedAgency === 'all' || site.agencyId === selectedAgency;

      return matchesSearch && matchesAgency;
    });
  }, [assignedSearchQuery, selectedAgency, assignedSites]);

  const filteredUnassignedSites = useMemo(() => {
    return unassignedSites.filter((site) => {
      const searchLower = unassignedSearchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(searchLower) ||
        site.address.toLowerCase().includes(searchLower)
      );
    });
  }, [unassignedSearchQuery, unassignedSites]);


  const getAgencyName = (agencyId?: string) => {
    return (
      securityAgencies.find((a) => a.id === agencyId)?.name || 'Unassigned'
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Add, view, and manage operational sites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Assigned Sites</CardTitle>
              <CardDescription>
                A list of all your sites with an assigned security agency for{' '}
                {LOGGED_IN_TOWERCO}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Site Profiles</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file to add multiple sites at once.
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
                              <FormLabel>Site CSV File</FormLabel>
                              <FormControl>
                                <Input
                                  id="csvFile-site-input"
                                  type="file"
                                  accept=".csv"
                                  disabled={isUploading}
                                  onChange={(e) =>
                                    field.onChange(e.target.files)
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                The CSV should contain columns: name, address.
                                The TowerCo will be set to {LOGGED_IN_TOWERCO}.
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
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" /> Upload CSV
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isAddSiteDialogOpen}
                onOpenChange={setIsAddSiteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Site
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Site</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to add a new site for{' '}
                      {LOGGED_IN_TOWERCO}.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addSiteForm}>
                    <form
                      onSubmit={addSiteForm.handleSubmit(onAddSiteSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={addSiteForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., North Tower"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addSiteForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 123 Main St, Anytown, USA"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isAddingSite}>
                          {isAddingSite ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                              Adding Site...
                            </>
                          ) : (
                            'Add Site'
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
                placeholder="Search assigned sites..."
                value={assignedSearchQuery}
                onChange={(e) => setAssignedSearchQuery(e.target.value)}
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredAssignedSites.length > 0 ? (
              filteredAssignedSites.map((site) => (
                <Card key={site.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{site.name}</CardTitle>
                        <CardDescription>ID: {site.id}</CardDescription>
                      </div>
                      <Badge
                        variant={site.agencyId ? 'secondary' : 'destructive'}
                      >
                        {site.agencyId ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                      <span>{site.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{site.towerco}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{getAgencyName(site.agencyId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                      <span>{site.incidents?.length || 0} Incidents</span>
                    </div>
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/towerco/sites/${site.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(site.name)}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No assigned sites found for the current filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription>
              Sites that need a security agency to be assigned.
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Assign Agency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnassignedSites.length > 0 ? (
                  filteredUnassignedSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="font-medium">{site.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {site.id}
                        </div>
                      </TableCell>
                      <TableCell>{site.address}</TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) =>
                            handleAssignmentChange(site.id, value)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select an agency" />
                          </SelectTrigger>
                          <SelectContent>
                            {securityAgencies.map((agency) => (
                              <SelectItem key={agency.id} value={agency.id}>
                                {agency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAssignAgency(site.id)}
                          disabled={!assignments[site.id]}
                        >
                          Assign Agency
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
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
