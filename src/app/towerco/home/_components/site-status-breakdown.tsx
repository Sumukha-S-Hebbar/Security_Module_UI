
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteStatusData } from '../page';

const COLORS = {
  assigned: 'hsl(var(--chart-2))',
  unassigned: 'hsl(var(--destructive))',
};

const ITEMS_PER_PAGE = 5;

export function SiteStatusBreakdown({ siteStatusData }: { siteStatusData: SiteStatusData }) {
  const [selectedSection, setSelectedSection] = useState<'assigned' | 'unassigned'>('assigned');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { chartData, totalSites, assignedSites, unassignedSites } = useMemo(() => {
    const assigned = siteStatusData.assigned_sites?.results || [];
    const unassigned = siteStatusData.unassigned_sites?.results || [];
    
    const data = [
      { name: 'Assigned', value: siteStatusData.assigned_sites_count, color: COLORS.assigned, key: 'assigned' },
      { name: 'Unassigned', value: siteStatusData.unassigned_sites_count, color: COLORS.unassigned, key: 'unassigned' },
    ];
    return {
      chartData: data,
      totalSites: siteStatusData.assigned_sites_count + siteStatusData.unassigned_sites_count,
      assignedSites: assigned,
      unassignedSites: unassigned,
    };
  }, [siteStatusData]);

  const handlePieClick = (data: any) => {
    const section = data.payload.key as 'assigned' | 'unassigned';
    setSelectedSection(section);
    setCurrentPage(1); // Reset page when section changes
  };
  
  const selectedSites = selectedSection === 'assigned' ? assignedSites : unassignedSites;
  
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return selectedSites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [selectedSites, currentPage]);

  const totalPages = Math.ceil(selectedSites.length / ITEMS_PER_PAGE);

  const customTooltipContent = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }
    const data = props.payload[0].payload;
    const percentage = totalSites > 0 ? ((data.value / totalSites) * 100).toFixed(1) : 0;
    
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-sm font-medium">
        <div className="font-bold">{data.name}</div>
        <div>
          {data.value} Sites ({percentage}%)
        </div>
      </div>
    );
  };
  
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.value}:{' '}
              <span className="font-bold">{entry.payload.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status Overview</CardTitle>
        <CardDescription className="font-medium">A real-time overview of site assignments. Click a slice to see details.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
            <div className="w-full h-80 md:h-auto md:col-span-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={customTooltipContent} />
                  <Legend
                    verticalAlign="bottom"
                    content={renderLegend}
                  />
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
                    style={{ outline: 'none' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} name={entry.name} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2 border-l border-border pl-4 md:pl-8 flex flex-col">
              {selectedSection ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                     <Building2 className="h-5 w-5" />
                     <h3 className="text-lg font-semibold">{selectedSection === 'assigned' ? 'Assigned Sites' : 'Unassigned Sites'} ({selectedSites.length})</h3>
                  </div>
                  <ScrollArea className="h-80 flex-grow">
                    {selectedSection === 'assigned' ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-foreground px-2">Towerbuddy ID</TableHead>
                            <TableHead className="text-foreground px-2">Site ID</TableHead>
                            <TableHead className="text-foreground px-2">Site Name</TableHead>
                            <TableHead className="text-foreground px-2">Region</TableHead>
                            <TableHead className="text-foreground px-2">Agency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSites.map(site => (
                            <TableRow 
                              key={site.id} 
                              onClick={() => router.push(`/towerco/sites/${site.id}`)}
                              className="group cursor-pointer hover:bg-[#00B4D8] hover:text-accent-foreground"
                            >
                              <TableCell className="group-hover:text-accent-foreground px-2 font-medium">{site.tb_site_id}</TableCell>
                              <TableCell className="group-hover:text-accent-foreground px-2 font-medium">{site.org_site_id}</TableCell>
                              <TableCell className="group-hover:text-accent-foreground px-2">
                                <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                      <Link href={`/towerco/sites/${site.id}`}>{site.site_name}</Link>
                                </Button>
                              </TableCell>
                              <TableCell className="group-hover:text-accent-foreground px-2">
                                <Badge variant="outline" className="font-medium group-hover:border-accent-foreground/50 group-hover:text-accent-foreground">{site.region}</Badge>
                              </TableCell>
                              <TableCell className="font-medium group-hover:text-accent-foreground px-2">
                                  {site.agency_name || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                       <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-foreground px-2">Towerbuddy ID</TableHead>
                            <TableHead className="text-foreground px-2">Site ID</TableHead>
                            <TableHead className="text-foreground px-2">Site Name</TableHead>
                            <TableHead className="text-foreground px-2">Region</TableHead>
                            <TableHead className="text-right text-foreground px-2">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSites.map((site) => (
                            <TableRow 
                              key={site.id} 
                              className="group hover:bg-[#00B4D8] hover:text-accent-foreground"
                            >
                              <TableCell className="group-hover:text-accent-foreground px-2 font-medium">{site.tb_site_id}</TableCell>
                               <TableCell className="group-hover:text-accent-foreground px-2 font-medium">{site.org_site_id}</TableCell>
                              <TableCell className="group-hover:text-accent-foreground px-2">
                                <Button asChild variant="link" className="p-0 h-auto font-medium group-hover:text-accent-foreground" onClick={(e) => e.stopPropagation()}>
                                      <Link href={`/towerco/sites/${site.id}`}>{site.site_name}</Link>
                                </Button>
                              </TableCell>
                              <TableCell className="group-hover:text-accent-foreground px-2">
                                <Badge variant="outline" className="font-medium group-hover:border-accent-foreground/50 group-hover:text-accent-foreground">{site.region}</Badge>
                              </TableCell>
                              <TableCell className="text-right px-2">
                                <Button 
                                  size="sm"
                                  className="bg-[#00B4D8] hover:bg-[#00a2c2] text-white"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/towerco/sites?focusSite=${site.id}`);
                                  }}
                                >
                                  Assign Agency
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                   <div className="flex items-center justify-between w-full pt-4">
                        <div className="text-sm text-muted-foreground font-medium">
                            Showing {paginatedSites.length} of {selectedSites.length} sites.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Building2 className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Select a section of the chart</p>
                    <p className="text-sm font-medium">Click on a pie slice to view the list of sites.</p>
                </div>
              )}
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
