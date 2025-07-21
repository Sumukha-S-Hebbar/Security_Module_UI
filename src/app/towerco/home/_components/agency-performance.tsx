// src/app/towerco/home/_components/agency-performance.tsx
'use client';

import { useMemo, useState } from 'react';
import type { SecurityAgency, Site, Incident } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { guards } from '@/lib/data/guards';
import { patrollingOfficers } from '@/lib/data/patrolling-officers';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, User, Shield, Map, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface AgencyPerformanceData {
  agency: SecurityAgency;
  performance: {
    'Overall Performance': number;
    'Incident Resolution': number;
    'Guard Perimeter': number;
    'Guard Selfie': number;
    'Officer Visits': number;
  };
}

const getPerformanceColor = (score: number): string => {
  if (score >= 90) return 'hsl(var(--chart-2))';
  if (score >= 75) return 'hsl(var(--chart-4))';
  return 'hsl(var(--destructive))';
};

const CircularProgress = ({
  value,
  color,
}: {
  value: number;
  color: string;
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg className="h-full w-full" viewBox="0 0 120 120">
        <circle
          className="stroke-current text-muted"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="stroke-current transition-all duration-500"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );
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
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  const performanceData: AgencyPerformanceData[] = useMemo(() => {
    return agencies.map((agency) => {
      const agencySiteIds = new Set(agency.siteIds);
      const agencySites = sites.filter((s) => agencySiteIds.has(s.id));

      const agencyIncidents = incidents.filter((incident) =>
        agencySiteIds.has(incident.siteId)
      );
      const totalIncidents = agencyIncidents.length;
      const resolvedIncidents = agencyIncidents.filter(
        (i) => i.status === 'Resolved'
      ).length;
      const incidentResolutionRate =
        totalIncidents > 0
          ? (resolvedIncidents / totalIncidents) * 100
          : 100;

      const agencyGuardIds = new Set(agencySites.flatMap((s) => s.guards));
      const agencyGuards = guards.filter((g) => agencyGuardIds.has(g.id));
      let totalPerimeterAccuracy = 0;
      let totalSelfiesTaken = 0;
      let totalSelfieRequests = 0;

      if (agencyGuards.length > 0) {
        agencyGuards.forEach((guard) => {
          totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
          totalSelfiesTaken +=
            guard.totalSelfieRequests - guard.missedSelfieCount;
          totalSelfieRequests += guard.totalSelfieRequests;
        });
      }
      const guardPerimeterAccuracy =
        agencyGuards.length > 0
          ? totalPerimeterAccuracy / agencyGuards.length
          : 100;
      const guardSelfieAccuracy =
        totalSelfieRequests > 0
          ? (totalSelfiesTaken / totalSelfieRequests) * 100
          : 100;

      const agencyPatrollingOfficerIds = new Set(
        agencySites.map((s) => s.patrollingOfficerId).filter(Boolean)
      );
      const agencyPatrollingOfficers = patrollingOfficers.filter((po) =>
        agencyPatrollingOfficerIds.has(po.id)
      );
      let totalSiteVisits = 0;
      let totalSitesForOfficers = 0;
      if (agencyPatrollingOfficers.length > 0) {
        agencyPatrollingOfficers.forEach((po) => {
          const poSites = agencySites.filter(
            (s) => s.patrollingOfficerId === po.id
          );
          if (poSites.length > 0) {
            totalSiteVisits += poSites.filter((s) => s.visited).length;
            totalSitesForOfficers += poSites.length;
          }
        });
      }
      const officerSiteVisitRate =
        totalSitesForOfficers > 0
          ? (totalSiteVisits / totalSitesForOfficers) * 100
          : 100;

      const performanceComponents = [
        incidentResolutionRate,
        guardPerimeterAccuracy,
        guardSelfieAccuracy,
        officerSiteVisitRate,
      ];
      const overallPerformance =
        performanceComponents.reduce((a, b) => a + b, 0) /
        performanceComponents.length;

      return {
        agency,
        performance: {
          'Overall Performance': Math.round(overallPerformance),
          'Incident Resolution': Math.round(incidentResolutionRate),
          'Guard Perimeter': Math.round(guardPerimeterAccuracy),
          'Guard Selfie': Math.round(guardSelfieAccuracy),
          'Officer Visits': Math.round(officerSiteVisitRate),
        },
      };
    }).sort((a, b) => b.performance['Overall Performance'] - a.performance['Overall Performance']);
  }, [agencies, sites, incidents]);

  const subMetrics: {
    key: keyof Omit<AgencyPerformanceData['performance'], 'Overall Performance'>;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: 'Incident Resolution', label: 'Incident Resolution', icon: CheckCircle },
    { key: 'Guard Perimeter', label: 'Guard Perimeter', icon: Shield },
    { key: 'Guard Selfie', label: 'Guard Selfie', icon: User },
    { key: 'Officer Visits', label: 'Officer Visits', icon: Map },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance Overview</CardTitle>
        <CardDescription>
          Overall scores based on incidents, guard, and officer performance. Click a card to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceData.map((data) => {
            const overallScore = data.performance['Overall Performance'];
            const color = getPerformanceColor(overallScore);
            const isOpen = openCollapsible === data.agency.id;

            return (
              <Collapsible
                key={data.agency.id}
                open={isOpen}
                onOpenChange={() => setOpenCollapsible(isOpen ? null : data.agency.id)}
                className="rounded-lg border p-4 sm:p-6 space-y-4 transition-all"
              >
                <div
                  onClick={() => router.push(`/towerco/agencies/${data.agency.id}`)}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={data.agency.avatar} alt={data.agency.name} />
                      <AvatarFallback>{data.agency.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{data.agency.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {data.agency.id}</p>
                    </div>
                  </div>
                  <CircularProgress value={overallScore} color={color} />
                </div>

                <CollapsibleContent className="space-y-4 pt-4 border-t">
                  {subMetrics.map(({ key, label, icon: Icon }) => {
                    const value = data.performance[key];
                    return (
                        <div key={key}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                </div>
                                <span className="font-medium text-foreground">{value}%</span>
                            </div>
                            <Progress value={value} indicatorClassName="bg-primary" />
                        </div>
                    );
                  })}
                </CollapsibleContent>
                <div className="flex justify-center pt-2">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full flex items-center gap-1">
                            {isOpen ? 'Hide' : 'Show'} Details
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
