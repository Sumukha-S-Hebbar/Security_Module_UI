
'use client';

import type { Incident } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function IncidentStatusBreakdown({ incidents }: { incidents: Incident[] }) {
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(
    (incident) => incident.status === 'Active'
  ).length;
  const underReviewIncidents = incidents.filter(
    (incident) => incident.status === 'Under Review'
  ).length;
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === 'Resolved'
  ).length;

  const activePercentage =
    totalIncidents > 0 ? (activeIncidents / totalIncidents) * 100 : 0;
  const underReviewPercentage =
    totalIncidents > 0 ? (underReviewIncidents / totalIncidents) * 100 : 0;
  const resolvedPercentage =
    totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Status Breakdown</CardTitle>
        <CardDescription>
          A breakdown of all emergency incidents by their current status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full h-4 rounded-full overflow-hidden bg-muted">
          <div
            className="bg-destructive"
            style={{ width: `${activePercentage}%` }}
            title={`Active: ${activeIncidents} (${activePercentage.toFixed(
              1
            )}%)`}
          />
          <div
            className="bg-primary"
            style={{ width: `${underReviewPercentage}%` }}
            title={`Under Review: ${underReviewIncidents} (${underReviewPercentage.toFixed(
              1
            )}%)`}
          />
          <div
            className="bg-chart-2"
            style={{ width: `${resolvedPercentage}%` }}
            title={`Resolved: ${resolvedIncidents} (${resolvedPercentage.toFixed(
              1
            )}%)`}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive" />
            <span>Active ({activeIncidents})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span>Under Review ({underReviewIncidents})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-chart-2" />
            <span>Resolved ({resolvedIncidents})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
