

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sites } from '@/lib/data/sites';
import { securityAgencies } from '@/lib/data/security-agencies';
import { incidents } from '@/lib/data/incidents';
import { guards } from '@/lib/data/guards';
import type { Incident, Guard } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, MapPin, Briefcase, ShieldAlert, FileDown, Users, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const chartConfig = {
  incidents: {
    label: "Incidents",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export default function SiteReportPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const siteId = params.siteId as string;
  const [selectedTableYear, setSelectedTableYear] = useState('all');
  const [selectedTableMonth, setSelectedTableMonth] = useState('all');
  
  const site = sites.find((s) => s.id === siteId);

  if (!site) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Site not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agency = securityAgencies.find((a) => a.siteIds.includes(site.id));
  const siteIncidents = incidents.filter(
    (incident) => incident.siteId === site.id
  );
  const siteGuards = guards.filter(g => site.guards.includes(g.id));
  
  const availableYears = useMemo(() => {
    const years = new Set(
      siteIncidents.map((incident) => new Date(incident.incidentTime).getFullYear().toString())
    );
    if (years.size > 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [siteIncidents]);
  
  const [selectedChartYear, setSelectedChartYear] = useState<string>(availableYears[0] || new Date().getFullYear().toString());

  const filteredIncidentsForTable = useMemo(() => {
    return siteIncidents.filter(incident => {
      const incidentDate = new Date(incident.incidentTime);
      const yearMatch = selectedTableYear === 'all' || incidentDate.getFullYear().toString() === selectedTableYear;
      const monthMatch = selectedTableMonth === 'all' || incidentDate.getMonth().toString() === selectedTableMonth;
      return yearMatch && monthMatch;
    });
  }, [siteIncidents, selectedTableYear, selectedTableMonth]);

  const monthlyIncidentData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthlyData: { month: string; incidents: number }[] = months.map(
      (month) => ({ month, incidents: 0 })
    );

    siteIncidents.forEach((incident) => {
      const incidentDate = new Date(incident.incidentTime);
      if (incidentDate.getFullYear().toString() === selectedChartYear) {
        const monthIndex = incidentDate.getMonth();
        monthlyData[monthIndex].incidents += 1;
      }
    });

    return monthlyData;
  }, [siteIncidents, selectedChartYear]);


  const handleDownloadReport = () => {
    toast({
      title: 'Report Generation Started',
      description: `Generating a detailed report for site ${site.name}.`,
    });
    // In a real app, this would trigger a download.
  };
  
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

  const getGuardById = (id: string) => guards.find(g => g.id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/towerco/sites">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Sites</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Site Report</h1>
            <p className="text-muted-foreground font-medium">Detailed overview for {site.name}.</p>
          </div>
        </div>
        <Button onClick={handleDownloadReport}>
          <FileDown className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <CardTitle className="text-2xl">{site.name}</CardTitle>
                <CardDescription>ID: {site.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mt-2 grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="font-medium text-muted-foreground">{site.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-semibold">Total Incidents</p>
                  <p className="font-medium text-muted-foreground">{siteIncidents.length}</p>
                </div>
              </div>
              {site.latitude && site.longitude && (
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe mt-0.5 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <div>
                    <p className="font-semibold">Coordinates</p>
                    <p className="font-medium text-muted-foreground">Latitude: {site.latitude}, Longitude: {site.longitude}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {agency && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/>Agency Details</CardTitle>
                <CardDescription>Security provider for this site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-semibold text-base">{agency.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">ID: {agency.id}</p>
                </div>
                <div className="text-sm space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${agency.phone}`} className="hover:underline">{agency.phone}</a></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${agency.email}`} className="hover:underline">{agency.email}</a></div>
                </div>
                 <Button asChild variant="link" className="p-0 h-auto font-medium">
                    <Link href={`/towerco/agencies/${agency.id}`}>View Full Agency Report</Link>
                </Button>
            </CardContent>
          </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Assigned Guards</CardTitle>
                <CardDescription>Guards currently assigned to {site.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                {siteGuards.length > 0 ? (
                    <div className="space-y-4">
                        {siteGuards.map(guard => (
                            <div key={guard.id} className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={guard.avatar} alt={guard.name} />
                                    <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">{guard.name}</p>
                                    <p className="text-sm text-muted-foreground font-medium">ID: {guard.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 font-medium">No guards are currently assigned to this site.</p>
                )}
            </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
                <CardTitle>Incident Trend</CardTitle>
                <CardDescription>Monthly incident counts for {site.name}.</CardDescription>
            </div>
            <Select value={selectedChartYear} onValueChange={setSelectedChartYear}>
                <SelectTrigger className="w-[120px] font-medium">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map((year) => (
                    <SelectItem key={year} value={year} className="font-medium">
                        {year}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                    <LineChart data={monthlyIncidentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="incidents" stroke="var(--color-incidents)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Incidents at {site.name}</CardTitle>
            <CardDescription className="font-medium">A log of all emergency incidents reported at this site.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
              {availableYears.length > 0 && (
                <Select value={selectedTableYear} onValueChange={setSelectedTableYear}>
                  <SelectTrigger className="w-[120px] font-medium">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year} className="font-medium">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={selectedTableMonth} onValueChange={setSelectedTableMonth}>
                <SelectTrigger className="w-[140px] font-medium">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="font-medium">
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncidentsForTable.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidentsForTable.map((incident) => {
                  const guard = getGuardById(incident.raisedByGuardId);
                  return (
                    <TableRow 
                      key={incident.id}
                      onClick={() => router.push(`/towerco/incidents/${incident.id}`)}
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground group"
                    >
                      <TableCell>
                        <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/towerco/incidents/${incident.id}`}>{incident.id}</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{new Date(incident.incidentTime).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{guard?.name || 'N/A'}</TableCell>
                      <TableCell>{getStatusIndicator(incident.status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4 font-medium">No emergency incidents have been reported for this site {selectedTableYear !== 'all' || selectedTableMonth !== 'all' ? 'in the selected period' : ''}.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
