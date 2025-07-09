'use client';

import type { PatrollingOfficer, Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Map, Clock } from 'lucide-react';

export function PatrollingOfficerPerformance({ 
    patrollingOfficers, 
    sites 
}: { 
    patrollingOfficers: PatrollingOfficer[],
    sites: Site[]
}) {
  const totalOfficers = patrollingOfficers.length;

  const performanceData = patrollingOfficers.reduce(
    (acc, officer) => {
      const assignedSites = sites.filter(s => s.patrollingOfficerId === officer.id);
      const visitedSites = assignedSites.filter(s => s.visited).length;
      
      if (assignedSites.length > 0) {
        acc.totalSiteVisitAccuracy += (visitedSites / assignedSites.length) * 100;
      } else {
        // If officer has no sites, their accuracy is 100% for the average calculation
        acc.totalSiteVisitAccuracy += 100;
      }
      
      acc.totalResponseTime += officer.averageResponseTime || 0;
      
      return acc;
    },
    {
      totalSiteVisitAccuracy: 0,
      totalResponseTime: 0,
    }
  );

  const avgSiteVisitAccuracy = totalOfficers > 0 ? performanceData.totalSiteVisitAccuracy / totalOfficers : 0;
  const avgResponseTime = totalOfficers > 0 ? performanceData.totalResponseTime / totalOfficers : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patrolling Officer Performance</CardTitle>
        <CardDescription>
          Average performance metrics across all patrolling officers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium flex items-center gap-2 text-sm">
                <Map className="w-4 h-4 text-primary" />
                Site Visit Accuracy
            </h4>
            <span className="font-bold text-muted-foreground">{avgSiteVisitAccuracy.toFixed(1)}%</span>
          </div>
          <Progress value={avgSiteVisitAccuracy} className="h-2" />
        </div>
        <div className="flex items-center justify-between pt-2">
            <h4 className="font-medium flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                Average Response Time
            </h4>
            <span className="font-bold text-lg text-foreground">{avgResponseTime.toFixed(0)} mins</span>
        </div>
      </CardContent>
    </Card>
  );
}
