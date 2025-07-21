
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--destructive))'];

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const [activeSection, setActiveSection] = useState<'Assigned' | 'Unassigned' | null>('Assigned');

  const { assignedSites, unassignedSites, chartData } = useMemo(() => {
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
    };
  }, [sites, agencies]);

  const getAgencyForSite = (siteId: string) => {
    return agencies.find(a => a.siteIds.includes(siteId));
  }

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col gap-2">
        {payload.map((entry: any, index: number) => (
          <li
            key={`item-${index}`}
            onClick={() => setActiveSection(entry.value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors",
              activeSection === entry.value ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <span style={{ backgroundColor: entry.color }} className="w-3 h-3 rounded-full inline-block" />
            <span className="font-medium">{entry.value}</span>
            <span className="ml-auto text-muted-foreground">{entry.payload.value} sites</span>
          </li>
        ))}
      </ul>
    );
  };
  
  const renderActiveSection = () => {
    if (!activeSection) {
      return (
         <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a category to see details.</p>
         </div>
      );
    }
    
    const isAssigned = activeSection === 'Assigned';
    const sitesToList = isAssigned ? assignedSites : unassignedSites;
    
    return (
        <div>
            <h3 className="font-semibold text-lg mb-4">{activeSection} Sites</h3>
             <ScrollArea className="h-80 border rounded-md">
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
                          <Button variant="link" asChild className="p-0 h-auto font-medium text-left">
                            <Link href={`/towerco/sites/${site.id}`}>{site.name}</Link>
                          </Button>
                          <p className="text-xs text-muted-foreground">{site.address}</p>
                        </TableCell>
                        <TableCell className={!isAssigned ? 'text-right' : ''}>
                          {isAssigned ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              {agency?.name || 'N/A'}
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
        </div>
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
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend content={<CustomLegend />} wrapperStyle={{width: '80%'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="h-full">
            {renderActiveSection()}
        </div>
      </CardContent>
    </Card>
  );
}
