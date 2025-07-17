
'use client';

import { useState, useMemo } from 'react';
import type { Incident, Site, SecurityAgency } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  performance: number;
  totalIncidents: number;
  resolvedIncidents: number;
}

export function AgencyPerformance({
  agencies,
  sites,
  incidents,
}: {
  agencies: SecurityAgency[];
  sites: Site[];
  incidents: Incident[];
}) {
  const [selectedAgency, setSelectedAgency] = useState('all');

  const performanceData = useMemo(() => {
    const data: AgencyPerformanceData[] = agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencyIncidents = incidents.filter(
        (incident) => agencySiteIds.has(incident.siteId)
      );
      
      const totalIncidents = agencyIncidents.length;
      if (totalIncidents === 0) {
        return {
          agency,
          performance: 100,
          totalIncidents: 0,
          resolvedIncidents: 0,
        };
      }

      const resolvedIncidents = agencyIncidents.filter(
        (incident) => incident.status === 'Resolved'
      ).length;
      
      const performance = Math.round((resolvedIncidents / totalIncidents) * 100);

      return {
        agency,
        performance,
        totalIncidents,
        resolvedIncidents,
      };
    });

    // Sort by performance descending
    return data.sort((a, b) => b.performance - a.performance);
  }, [agencies, incidents]);

  const filteredPerformanceData = useMemo(() => {
    if (selectedAgency === 'all') {
      return performanceData;
    }
    return performanceData.filter(
      (data) => data.agency.id === selectedAgency
    );
  }, [performanceData, selectedAgency]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Agency Performance</CardTitle>
                <CardDescription>
                Incident resolution rate by security agency.
                </CardDescription>
            </div>
            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filter by agency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredPerformanceData.length > 0 ? (
          filteredPerformanceData.map((data) => (
            <div key={data.agency.id} className="space-y-2 p-3 rounded-lg border">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                            <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{data.agency.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {data.resolvedIncidents} of {data.totalIncidents} incidents resolved
                            </p>
                        </div>
                    </div>
                     <span className="font-bold text-lg">{data.performance}%</span>
                </div>
                 <Progress value={data.performance} className="h-2" />
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No performance data available for the selected agency.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
