'use client';

import type { Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SiteStatusBreakdown({ sites }: { sites: Site[] }) {
  const totalSites = sites.length;
  const assignedSitesCount = sites.filter((site) => site.agencyId).length;
  const unassignedSitesCount = totalSites - assignedSitesCount;

  const assignedPercentage =
    totalSites > 0 ? (assignedSitesCount / totalSites) * 100 : 0;
  const unassignedPercentage =
    totalSites > 0 ? (unassignedSitesCount / totalSites) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full h-4 rounded-full overflow-hidden bg-muted">
          <div
            className="bg-chart-2"
            style={{ width: `${assignedPercentage}%` }}
            title={`Assigned: ${assignedSitesCount} (${assignedPercentage.toFixed(
              1
            )}%)`}
          />
          <div
            className="bg-destructive"
            style={{ width: `${unassignedPercentage}%` }}
            title={`Unassigned: ${unassignedSitesCount} (${unassignedPercentage.toFixed(
              1
            )}%)`}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-chart-2" />
            <span>Assigned ({assignedSitesCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive" />
            <span>Unassigned ({unassignedSitesCount})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
