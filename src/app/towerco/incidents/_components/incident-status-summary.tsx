// src/app/towerco/incidents/_components/incident-status-summary.tsx
'use client';

import type { Incident } from '@/types';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, ShieldQuestion, CheckCircle2 } from 'lucide-react';

export function IncidentStatusSummary({ incidents }: { incidents: Incident[] }) {
  const summary = useMemo(() => {
    return incidents.reduce(
      (acc, incident) => {
        if (incident.status === 'Active') acc.active++;
        if (incident.status === 'Under Review') acc.underReview++;
        if (incident.status === 'Resolved') acc.resolved++;
        return acc;
      },
      { active: 0, underReview: 0, resolved: 0 }
    );
  }, [incidents]);

  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <div>
                <p className="text-sm text-destructive font-semibold">Active</p>
                <p className="text-2xl font-bold">{summary.active}</p>
            </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10">
            <ShieldQuestion className="h-8 w-8 text-primary" />
            <div>
                <p className="text-sm text-primary font-semibold">Under Review</p>
                <p className="text-2xl font-bold">{summary.underReview}</p>
            </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-chart-2/10">
            <CheckCircle2 className="h-8 w-8 text-chart-2" />
            <div>
                <p className="text-sm text-chart-2 font-semibold">Resolved</p>
                <p className="text-2xl font-bold">{summary.resolved}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
