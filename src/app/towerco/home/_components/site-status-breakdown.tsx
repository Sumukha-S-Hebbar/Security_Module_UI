
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
import { ChevronDown, Building2, Briefcase } from 'lucide-react';

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
  
  const assignedSites = sites.filter((site) => agencySiteIds.has(site.id));
  const unassignedSites = sites.filter((site) => !agencySiteIds.has(site.id));
  
  const assignedSitesCount = assignedSites.length;
  const unassignedSitesCount = unassignedSites.length;

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
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
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
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
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
                                <Link href="/towerco/sites">Assign Agency</Link>
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
