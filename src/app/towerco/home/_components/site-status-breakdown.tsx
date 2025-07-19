
'use client';

import { useState } from 'react';
import type { Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
  
  const assignedSites = sites.filter((site) => agencySiteIds.has(site.id));
  const unassignedSites = sites.filter((site) => !agencySiteIds.has(site.id));
  
  const totalSites = sites.length;
  const assignedSitesCount = assignedSites.length;
  const unassignedSitesCount = unassignedSites.length;
  
  const assignedData = totalSites > 0 ? [
    { name: 'Assigned', value: assignedSitesCount },
    { name: 'Other', value: totalSites - assignedSitesCount },
  ] : [];

  const unassignedData = totalSites > 0 ? [
    { name: 'Unassigned', value: unassignedSitesCount },
    { name: 'Other', value: totalSites - unassignedSitesCount },
  ] : [];

  const ASSIGNED_COLORS = ['hsl(var(--chart-2))', 'hsl(var(--muted))'];
  const UNASSIGNED_COLORS = ['hsl(var(--destructive))', 'hsl(var(--muted))'];

  const getAgencyForSite = (siteId: string) => {
    return agencies.find(a => a.siteIds.includes(siteId));
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status Breakdown</CardTitle>
        <CardDescription>A real-time overview of site assignments. Click a section to expand.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        
        <Collapsible open={openSection === 'assigned'} onOpenChange={() => toggleSection('assigned')}>
          <CollapsibleTrigger asChild>
            <div className="flex w-full items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={assignedData}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="100%"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {assignedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ASSIGNED_COLORS[index % ASSIGNED_COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <span className="font-medium">Assigned Sites</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{assignedSitesCount}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSection === 'assigned' && 'rotate-180'}`} />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-60 mt-2 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Agency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedSites.map(site => {
                    const agency = getAgencyForSite(site.id);
                    return (
                      <TableRow key={site.id}>
                        <TableCell>
                          <Button variant="link" asChild className="p-0 h-auto font-medium text-left">
                            <Link href={`/towerco/sites/${site.id}`}>{site.name}</Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">{site.address}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            {agency?.name || 'N/A'}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible open={openSection === 'unassigned'} onOpenChange={() => toggleSection('unassigned')}>
           <CollapsibleTrigger asChild>
             <div className="flex w-full items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={unassignedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="100%"
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {unassignedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={UNASSIGNED_COLORS[index % UNASSIGNED_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                  <span className="font-medium">Unassigned Sites</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{unassignedSitesCount}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronDown className={`h-4 w-4 transition-transform ${openSection === 'unassigned' && 'rotate-180'}`} />
                    </Button>
                </div>
            </div>
          </CollapsibleTrigger>
           <CollapsibleContent>
            <ScrollArea className="h-60 mt-2 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedSites.map(site => (
                      <TableRow key={site.id}>
                        <TableCell>
                           <Button variant="link" asChild className="p-0 h-auto font-medium text-left">
                            <Link href={`/towerco/sites/${site.id}`}>{site.name}</Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">{site.address}</p>
                        </TableCell>
                        <TableCell>{site.region}</TableCell>
                        <TableCell className="text-right">
                            <Button asChild size="sm">
                                <Link href={`/towerco/sites?focusSite=${site.id}`}>Assign Agency</Link>
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
}
