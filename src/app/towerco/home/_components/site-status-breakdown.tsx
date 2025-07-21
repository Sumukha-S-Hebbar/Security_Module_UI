
'use client';

import { useMemo, useState } from 'react';
import type { Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

const COLORS = {
  assigned: 'hsl(var(--chart-2))',
  unassigned: 'hsl(var(--destructive))',
};

export function SiteStatusBreakdown({ sites, agencies }: { sites: Site[]; agencies: SecurityAgency[] }) {
  const [selectedSection, setSelectedSection] = useState<'assigned' | 'unassigned' | null>(null);

  const { chartData, totalSites, assignedSites, unassignedSites } = useMemo(() => {
    const agencySiteIds = new Set(agencies.flatMap(a => a.siteIds));
    const assigned = sites.filter((site) => agencySiteIds.has(site.id));
    const unassigned = sites.filter((site) => !agencySiteIds.has(site.id));
    
    const data = [
      { name: 'Assigned', value: assigned.length, color: COLORS.assigned, key: 'assigned' },
      { name: 'Unassigned', value: unassigned.length, color: COLORS.unassigned, key: 'unassigned' },
    ];
    return {
      chartData: data,
      totalSites: sites.length,
      assignedSites: assigned,
      unassignedSites: unassigned,
    };
  }, [sites, agencies]);

  const handlePieClick = (data: any) => {
    const section = data.key as 'assigned' | 'unassigned';
    setSelectedSection(prev => (prev === section ? null : section));
  };
  
  const selectedSites = selectedSection === 'assigned' ? assignedSites : unassignedSites;
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status Overview</CardTitle>
        <CardDescription>A real-time overview of site assignments. Click a slice to see details.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={customTooltipContent} />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    onClick={handlePieClick}
                    className="cursor-pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="border-l border-border pl-4 md:pl-8">
              {selectedSection ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                     <Building2 className="h-5 w-5" />
                     <h3 className="text-lg font-semibold">{selectedSection === 'assigned' ? 'Assigned Sites' : 'Unassigned Sites'} ({selectedSites.length})</h3>
                  </div>
                  <ScrollArea className="h-80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site Name</TableHead>
                          <TableHead>Region</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSites.map(site => (
                          <TableRow key={site.id}>
                            <TableCell>
                              <p className="font-medium">{site.name}</p>
                              <p className="text-xs text-muted-foreground">{site.address}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{site.region}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Building2 className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Select a section of the chart</p>
                    <p className="text-sm">Click on a pie slice to view the list of sites.</p>
                </div>
              )}
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
