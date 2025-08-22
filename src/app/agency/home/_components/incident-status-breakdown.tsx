
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

export function IncidentStatusBreakdown({
  allIncidents,
}: {
  allIncidents: any[];
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const summary = useMemo(() => {
    return allIncidents.reduce(
      (acc, incident) => {
        if (incident.incident_status === 'Active') acc.active++;
        if (incident.incident_status === 'Under Review') acc.underReview++;
        if (incident.incident_status === 'Resolved') acc.resolved++;
        return acc;
      },
      { active: 0, underReview: 0, resolved: 0 }
    );
  }, [allIncidents]);

  const filteredIncidents = useMemo(() => {
    if (!selectedStatus) return [];
    const statusMap: {[key: string]: string} = {
        'active': 'Active',
        'under-review': 'Under Review',
        'resolved': 'Resolved'
    };
    return allIncidents.filter((incident) => incident.incident_status === statusMap[selectedStatus]);
  }, [allIncidents, selectedStatus]);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span>Active</span>
          </div>
        );
      case 'Under Review':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFC107]"></span>
            </span>
            <span>Under Review</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
            </span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
            </span>
            <span>{status}</span>
          </div>
        );
    }
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus((prevStatus) => (prevStatus === status ? null : status));
  };

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
                'flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-all',
                item.className,
                selectedStatus === item.status && `ring-2 ${item.ring}`
              )}
            >
              <item.icon className="h-8 w-8" />
              <div>
                <p className="font-medium">{item.status.replace('-', ' ')}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Collapsible open={!!selectedStatus}>
        <CollapsibleContent>
          <CardHeader>
            <CardTitle>Incidents: {selectedStatus?.replace('-', ' ')}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      onClick={() =>
                        router.push(`/agency/incidents/${incident.id}`)
                      }
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <Button
                          asChild
                          variant="link"
                          className="h-auto p-0 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/agency/incidents/${incident.id}`}>
                            {incident.incident_id}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Date(incident.incident_time).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{incident.site_name}</TableCell>
                      <TableCell className="font-medium">{incident.guard_name}</TableCell>
                      <TableCell>{getStatusIndicator(incident.incident_status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground font-medium">
                No incidents with status "{selectedStatus}" found.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
