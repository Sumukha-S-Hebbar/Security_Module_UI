
'use client';

import type { PatrollingOfficer, Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Map, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const totalOfficers = patrollingOfficers.length;

  const performanceData = useMemo(() => {
    // NOTE: In a real application, you would filter based on selectedYear and selectedMonth here.
    return patrollingOfficers.reduce(
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
  }, [patrollingOfficers, sites, selectedYear, selectedMonth]);

  const avgSiteVisitAccuracy = totalOfficers > 0 ? performanceData.totalSiteVisitAccuracy / totalOfficers : 0;
  const avgResponseTime = totalOfficers > 0 ? performanceData.totalResponseTime / totalOfficers : 0;

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
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="flex items-center gap-2 text-sm font-medium">
                <Map className="w-4 h-4 text-primary" />
                Site Visit Accuracy
            </h4>
            <span className="text-muted-foreground font-medium">{avgSiteVisitAccuracy.toFixed(1)}%</span>
          </div>
          <Progress value={avgSiteVisitAccuracy} className="h-2" />
        </div>
        <div className="flex items-center justify-between pt-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-primary" />
                Average Response Time
            </h4>
            <span className="text-lg text-foreground font-medium">{avgResponseTime.toFixed(0)} mins</span>
        </div>
      </CardContent>
    </Card>
  );
}
