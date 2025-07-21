
'use client';

import { useMemo, useState } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface AgencyPerformanceData {
  agency: SecurityAgency;
  performance: {
    'Overall Performance': number;
    'Incident Resolution': number;
    'Perimeter Accuracy': number;
    'Selfie Accuracy': number;
    'Site Visits': number;
  };
}

const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'bg-chart-2'; // Excellent (Theme Green)
  if (score >= 75) return 'bg-chart-4'; // Good (Theme Yellow/Gold)
  return 'bg-destructive'; // Needs attention (Theme Red)
};

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
  
  const performanceData: AgencyPerformanceData[] = useMemo(() => {
    const data = agencies.map((agency) => {
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
      let totalSelfiesTaken = 0;
      let totalSelfieRequests = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach(guard => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          totalSelfiesTaken += guard.totalSelfieRequests - guard.missedSelfieCount;
          totalSelfieRequests += guard.totalSelfieRequests;
        });
      }
      const guardPerimeterAccuracy = agencyGuards.length > 0 ? totalPerimeterAccuracy / agencyGuards.length : 100;
      const guardSelfieAccuracy = totalSelfieRequests > 0 ? (totalSelfiesTaken / totalSelfieRequests) * 100 : 100;

      const agencyPatrollingOfficerIds = new Set(agencySites.map(s => s.patrollingOfficerId).filter(Boolean));
      const agencyPatrollingOfficers = patrollingOfficers.filter(po => agencyPatrollingOfficerIds.has(po.id));
      let totalSiteVisits = 0;
      let totalSitesForOfficers = 0;
      if (agencyPatrollingOfficers.length > 0) {
          agencyPatrollingOfficers.forEach(po => {
              const poSites = agencySites.filter(s => s.patrollingOfficerId === po.id);
              if (poSites.length > 0) {
                  totalSiteVisits += poSites.filter(s => s.visited).length;
                  totalSitesForOfficers += poSites.length;
              }
          });
      }
      const officerSiteVisitRate = totalSitesForOfficers > 0 ? (totalSiteVisits / totalSitesForOfficers) * 100 : 100;
      
      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const overallPerformance = performanceComponents.reduce((a, b) => a + b, 0) / performanceComponents.length;

      return {
        agency,
        performance: {
            'Overall Performance': Math.round(overallPerformance),
            'Incident Resolution': Math.round(incidentResolutionRate),
            'Perimeter Accuracy': Math.round(guardPerimeterAccuracy),
            'Selfie Accuracy': Math.round(guardSelfieAccuracy),
            'Site Visits': Math.round(officerSiteVisitRate),
        }
      };
    });

    return data.sort((a, b) => b.performance['Overall Performance'] - a.performance['Overall Performance']);
  }, [agencies, sites, incidents]);

  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(
    performanceData.length > 0 ? performanceData[0].agency.id : null
  );
  
  const selectedAgencyData = performanceData.find(d => d.agency.id === selectedAgencyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Leaderboard</CardTitle>
        <CardDescription>
          A quick overview of security agency performance. Click an agency to see details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
                {performanceData.map((data) => {
                  const performanceValue = data.performance['Overall Performance'];
                  return (
                    <button
                        key={data.agency.id}
                        onClick={() => setSelectedAgencyId(data.agency.id)}
                        className={cn(
                            "w-full text-left p-2 rounded-lg border transition-all relative h-14 flex items-center gap-3 overflow-hidden",
                            selectedAgencyId === data.agency.id 
                                ? "bg-primary/10 border-primary ring-2 ring-primary" 
                                : "hover:bg-muted/50"
                        )}
                    >
                        <Progress value={performanceValue} className="absolute top-0 left-0 h-full w-full -z-10" indicatorClassName={cn("opacity-20", getPerformanceColor(performanceValue))} />
                        <div className="relative flex items-center gap-3 w-full">
                           <Avatar className="h-10 w-10 border-2 border-background">
                              <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                              <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{data.agency.name}</span>
                          <span className="ml-auto font-bold text-lg text-foreground pr-2">{performanceValue}%</span>
                        </div>
                    </button>
                )})}
            </div>

            <div className="md:col-span-2">
                {selectedAgencyData ? (
                    <div className="border rounded-lg p-4 h-full bg-muted/30">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                             <h3 className="text-lg font-bold">{selectedAgencyData.agency.name}</h3>
                             <p className="text-sm text-muted-foreground">Performance Breakdown</p>
                           </div>
                           <Button size="sm" variant="outline" onClick={() => router.push(`/towerco/agencies/${selectedAgencyData.agency.id}`)}>
                             View Full Report
                           </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {(Object.entries(selectedAgencyData.performance) as [keyof AgencyPerformanceData['performance'], number][]).map(([metric, value]) => (
                                <div key={metric}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <p className="font-medium text-muted-foreground">{metric}</p>
                                        <p className="font-semibold">{value}%</p>
                                    </div>
                                    <Progress value={value} indicatorClassName={getPerformanceColor(value)} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center border rounded-lg h-full min-h-[200px] bg-muted/30">
                        <div className="text-center text-muted-foreground">
                            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p>Select an agency to see details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
