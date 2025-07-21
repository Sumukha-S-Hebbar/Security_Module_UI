
'use client';

import { useState, useMemo } from 'react';
import type { Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Briefcase, Dot } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--destructive))'];

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const [activeSection, setActiveSection] = useState<'Assigned' | 'Unassigned'>('Assigned');

  const { assignedSites, unassignedSites, chartData, totalSites } = useMemo(() => {
    const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
    const assigned = sites.filter((site) => agencySiteIds.has(site.id));
    const unassigned = sites.filter((site) => !agencySiteIds.has(site.id));
    const data = [
      { name: 'Assigned', value: assigned.length, color: COLORS[0] },
      { name: 'Unassigned', value: unassigned.length, color: COLORS[1] },
    ];
    return {
      assignedSites: assigned,
      unassignedSites: unassigned,
      chartData: data,
      totalSites: sites.length,
    };
  }, [sites, agencies]);

  const getAgencyForSite = (siteId: string) => {
    return agencies.find(a => a.siteIds.includes(siteId));
  }
  
  const customTooltipContent = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }
    const data = props.payload[0].payload;
    const percentage = totalSites > 0 ? ((data.value / totalSites) * 100).toFixed(1) : 0;
    
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
        <div className="font-bold">{data.name}</div>
        <div>
          {data.value} Sites ({percentage}%)
        </div>
      </div>
    );
  };

  const renderActiveSection = () => {
    const isAssigned = activeSection === 'Assigned';
    const sitesToList = isAssigned ? assignedSites : unassignedSites;
    
    if (sitesToList.length === 0) {
      return (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
            <div className="text-center text-sm text-muted-foreground">
                <p>No {activeSection.toLowerCase()} sites found.</p>
            </div>
        </div>
      );
    }

    return (
        <ScrollArea className="h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                {isAssigned ? <TableHead>Agency</TableHead> : <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sitesToList.map(site => {
                const agency = isAssigned ? getAgencyForSite(site.id) : null;
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <Button variant="link" asChild className="p-0 h-auto font-medium text-left whitespace-normal">
                        <Link href={`/towerco/sites/${site.id}`}>{site.name}</Link>
                      </Button>
                      <p className="text-xs text-muted-foreground">{site.address}</p>
                    </TableCell>
                    <TableCell className={!isAssigned ? 'text-right' : ''}>
                      {isAssigned ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{agency?.name || 'N/A'}</span>
                        </div>
                      ) : (
                         <Button asChild size="sm">
                            <Link href={`/towerco/sites?focusSite=${site.id}`}>Assign Agency</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status Overview</CardTitle>
        <CardDescription>A real-time overview of site assignments.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center gap-6">
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={customTooltipContent} />
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="w-full flex justify-center gap-4">
                {chartData.map((entry) => (
                    <Button
                        key={entry.name}
                        variant={activeSection === entry.name ? "default" : "outline"}
                        onClick={() => setActiveSection(entry.name as 'Assigned' | 'Unassigned')}
                        className={cn(
                          "w-36",
                          activeSection === entry.name && entry.name === 'Assigned' && "bg-chart-2 hover:bg-chart-2/90 text-white",
                          activeSection === entry.name && entry.name === 'Unassigned' && "bg-destructive hover:bg-destructive/90 text-white"
                        )}
                    >
                        <Dot style={{ color: activeSection === entry.name ? 'white' : entry.color }} className="w-8 h-8 -ml-3"/>
                        <div>
                            {entry.name} ({entry.value})
                        </div>
                    </Button>
                ))}
             </div>
        </div>
        <div className="h-96">
            {renderActiveSection()}
        </div>
      </CardContent>
    </Card>
  );
}
