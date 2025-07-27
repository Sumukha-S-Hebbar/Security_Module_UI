
'use client';

import type { PatrollingOfficer, Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const getPerformanceColor = (value: number) => {
  if (value >= 95) {
    return 'hsl(var(--chart-2))'; // Green
  } else if (value >= 65) {
    return 'hsl(var(--chart-3))'; // Yellow
  } else {
    return 'hsl(var(--destructive))'; // Orange
  }
};

export function PatrollingOfficerPerformance({ 
    patrollingOfficers, 
    sites 
}: { 
    patrollingOfficers: PatrollingOfficer[],
    sites: Site[]
}) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  }, []);

  const performanceData = useMemo(() => {
    // NOTE: In a real application, you would filter based on selectedYear and selectedMonth here.
    const totalOfficers = patrollingOfficers.length;
    if (totalOfficers === 0) {
      return {
        avgSiteVisitAccuracy: 0,
        avgResponseTime: 0,
      };
    }

    const perf = patrollingOfficers.reduce(
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

    return {
      avgSiteVisitAccuracy: perf.totalSiteVisitAccuracy / totalOfficers,
      avgResponseTime: perf.totalResponseTime / totalOfficers,
    }
  }, [patrollingOfficers, sites, selectedYear, selectedMonth]);

  const roundedSiteVisitAccuracy = Math.round(performanceData.avgSiteVisitAccuracy);
  const siteVisitColor = getPerformanceColor(roundedSiteVisitAccuracy);

  const siteVisitAccuracyData = [
    { name: 'Accuracy', value: roundedSiteVisitAccuracy },
    { name: 'Remaining', value: 100 - roundedSiteVisitAccuracy },
  ];
  const COLORS_SITE_VISIT = [siteVisitColor, 'hsl(var(--muted))'];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Patrolling Officer Performance</CardTitle>
          <CardDescription>
            Average performance metrics across all patrolling officers.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                {availableYears.map((year) => (
                    <SelectItem key={year} value={year} className="font-medium">
                    {year}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] font-medium hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all" className="font-medium">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="font-medium">
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={siteVisitAccuracyData}
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="85%"
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {siteVisitAccuracyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_SITE_VISIT[index % COLORS_SITE_VISIT.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold" style={{ color: siteVisitColor }}>
                        {roundedSiteVisitAccuracy}%
                    </span>
                </div>
            </div>
            <p className="flex items-center gap-2 text-center font-medium">
              <Map className="w-4 h-4 text-primary" />
              Site Visit Accuracy
            </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center justify-between pt-2 w-full max-w-[200px]">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary" />
                    Avg. Response Time
                </h4>
                <span className="text-lg text-foreground font-semibold">{performanceData.avgResponseTime.toFixed(0)} mins</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
