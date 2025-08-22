
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldAlert, ShieldQuestion } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IncidentTrendData } from '../page';


export function IncidentStatusBreakdown({
  incidentTrend,
}: {
  incidentTrend: IncidentTrendData[];
}) {
  const router = useRouter();
  
  const summary = useMemo(() => {
    return incidentTrend.reduce(
      (acc, month) => {
        acc.active += month.active;
        acc.underReview += month.under_review;
        acc.resolved += month.resolved;
        return acc;
      },
      { active: 0, underReview: 0, resolved: 0 }
    );
  }, [incidentTrend]);


  const statusCards = [
    {
      status: 'active',
      count: summary.active,
      icon: ShieldAlert,
      className: 'bg-destructive/10 text-destructive',
      ring: 'ring-destructive',
    },
    {
      status: 'under-review',
      count: summary.underReview,
      icon: ShieldQuestion,
      className: 'bg-[#FFC107]/10 text-[#FFC107]',
      ring: 'ring-[#FFC107]',
    },
    {
      status: 'resolved',
      count: summary.resolved,
      icon: CheckCircle2,
      className: 'bg-chart-2/10 text-chart-2',
      ring: 'ring-chart-2',
    },
  ] as const;

  const handleStatusClick = (status: string) => {
    router.push(`/agency/incidents?status=${status}`);
  };

  return (
    <Card>
      <CardHeader>
            <CardTitle>Incident Status Breakdown</CardTitle>
            <CardDescription className="font-medium">
            Click a status to see the list of incidents.
            </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusCards.map((item) => (
            <div
              key={item.status}
              onClick={() => handleStatusClick(item.status)}
              role="button"
              tabIndex={0}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all hover:shadow-md',
                item.className
              )}
            >
              <item.icon className="h-8 w-8" />
              <div>
                <p className="font-medium capitalize">{item.status.replace('-', ' ')}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
