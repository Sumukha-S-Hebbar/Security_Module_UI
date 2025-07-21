
'use client';

import { useMemo } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';

interface AgencyPerformanceData {
  agency: SecurityAgency;
  name: string;
  performance: number;
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
  const router = useRouter();

  const performanceData = useMemo(() => {
    const data: AgencyPerformanceData[] = agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter(s => agencySiteIds.has(s.id));
      
      const agencyIncidents = incidents.filter(
        (incident) => agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(i => i.status === 'Resolved').length;
      const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 100;

      const agencyGuardIds = new Set(agencySites.flatMap(s => s.guards));
      const agencyGuards = guards.filter(g => agencyGuardIds.has(g.id));
      let totalPerimeterAccuracy = 0;
      let totalSelfieAccuracy = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach(guard => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          const selfieAccuracy = guard.totalSelfieRequests > 0
            ? ((guard.totalSelfieRequests - guard.missedSelfieCount) / guard.totalSelfieRequests) * 100
            : 100;
          totalSelfieAccuracy += selfieAccuracy;
        });
      }
      const guardPerimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;
      const guardSelfieAccuracy = agencyGuards.length > 0 ? totalSelfieAccuracy / agencyGuards.length : 100;

      const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
      const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
      let totalSiteVisitRate = 0;
      if (agencyPatrollingOfficers.length > 0) {
          agencyPatrollingOfficers.forEach(po => {
              const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
              if (poSites.length > 0) {
                  const visitedCount = poSites.filter(s => s.visited).length;
                  totalSiteVisitRate += (visitedCount / poSites.length) * 100;
              } else {
                  totalSiteVisitRate += 100;
              }
          });
      }
      const officerSiteVisitRate = agencyPatrollingOfficers.length > 0 ? totalSiteVisitRate / agencyPatrollingOfficers.length : 100;
      
      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const performance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

      return {
        agency,
        name: agency.name,
        performance: Math.round(performance),
      };
    });

    return data.sort((a, b) => b.performance - a.performance);
  }, [agencies, sites, incidents]);

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agency Performance</CardTitle>
          <CardDescription>
            Overall score based on incidents, guard, and officer performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No performance data available for any agency.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Rankings</CardTitle>
        <CardDescription>
          Comparison of agencies by overall performance score. Click a row to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.map((data, index) => (
              <TableRow
                key={data.agency.id}
                onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="font-bold text-lg text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                      <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{data.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Progress value={data.performance} className="h-2" />
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {data.performance}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
