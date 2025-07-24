

'use client';

import type { Incident } from '@/types';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, ShieldQuestion, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IncidentStatusSummary({ 
  incidents,
  onStatusSelect,
  selectedStatus,
}: { 
  incidents: Incident[];
  onStatusSelect: (status: string) => void;
  selectedStatus: string;
}) {
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

  const statusCards = [
    {
      status: 'active',
      count: summary.active,
      label: 'Active',
      icon: ShieldAlert,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      ring: 'ring-destructive'
    },
    {
      status: 'under-review',
      count: summary.underReview,
      label: 'Under Review',
      icon: ShieldQuestion,
      color: 'text-[#FFC107]',
      bg: 'bg-[#FFC107]/10',
      ring: 'ring-[#FFC107]'
    },
    {
      status: 'resolved',
      count: summary.resolved,
      label: 'Resolved',
      icon: CheckCircle2,
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
      ring: 'ring-chart-2'
    }
  ] as const;

  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map(item => (
            <div 
            key={item.status}
            className={cn(
                'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all',
                item.bg,
                selectedStatus === item.status ? `ring-2 ${item.ring} shadow-md` : 'hover:bg-muted/80'
            )}
            onClick={() => onStatusSelect(item.status)}
            role="button"
            tabIndex={0}
            >
                <item.icon className={cn('h-8 w-8', item.color)} />
                <div>
                    <p className={cn('text-sm font-semibold', item.color)}>{item.label}</p>
                    <p className="text-2xl font-bold">{item.count}</p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
