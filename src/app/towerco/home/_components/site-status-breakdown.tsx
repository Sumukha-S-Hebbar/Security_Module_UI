
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

  const totalSites = sites.length;
  const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
  
  const assignedSites = sites.filter((site) => agencySiteIds.has(site.id));
  const unassignedSites = sites.filter((site) => !agencySiteIds.has(site.id));
  
  const assignedSitesCount = assignedSites.length;
  const unassignedSitesCount = unassignedSites.length;

  const assignedPercentage = totalSites > 0 ? (assignedSitesCount / totalSites) * 100 : 0;
  const unassignedPercentage = totalSites > 0 ? (unassignedSitesCount / totalSites) * 100 : 0;

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
            <div className="cursor-pointer">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-chart-2" />
                      <span>Assigned ({assignedSitesCount})</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronDown className={`h-4 w-4 transition-transform ${openSection === 'assigned' && 'rotate-180'}`} />
                  </Button>
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-chart-2"
                  style={{ width: `${assignedPercentage}%` }}
                  title={`Assigned: ${assignedSitesCount} (${assignedPercentage.toFixed(1)}%)`}
                />
                <div
                  className="bg-muted"
                  style={{ width: `${unassignedPercentage}%` }}
                />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-60 mt-4 border rounded-md">
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
                          <Button variant="link" asChild className="p-0 h-auto font-medium">
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
              <div className="cursor-pointer">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-destructive" />
                        <span>Unassigned ({unassignedSitesCount})</span>
                    </div>
                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronDown className={`h-4 w-4 transition-transform ${openSection === 'unassigned' && 'rotate-180'}`} />
                    </Button>
                </div>
                <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-destructive"
                    style={{ width: `${unassignedPercentage}%` }}
                    title={`Unassigned: ${unassignedSitesCount} (${unassignedPercentage.toFixed(1)}%)`}
                  />
                  <div
                    className="bg-muted"
                    style={{ width: `${assignedPercentage}%` }}
                  />
                </div>
              </div>
          </CollapsibleTrigger>
           <CollapsibleContent>
            <ScrollArea className="h-60 mt-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedSites.map(site => (
                      <TableRow key={site.id}>
                        <TableCell>
                           <Button variant="link" asChild className="p-0 h-auto font-medium">
                            <Link href={`/towerco/sites/${site.id}`}>{site.name}</Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">{site.address}</p>
                        </TableCell>
                        <TableCell>{site.region}</TableCell>
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
