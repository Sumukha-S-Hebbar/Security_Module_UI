'use client';

import type { Guard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, UserCheck } from 'lucide-react';

export function GuardPerformanceBreakdown({ guards }: { guards: Guard[] }) {
  const totalGuards = guards.length;

  const performanceData = guards.reduce(
    (acc, guard) => {
      acc.totalPerimeterAccuracy += guard.performance?.perimeterAccuracy || 0;
      acc.totalSelfieRequests += guard.totalSelfieRequests;
      acc.totalSelfiesTaken += guard.totalSelfieRequests - guard.missedSelfieCount;
      return acc;
    },
    {
      totalPerimeterAccuracy: 0,
      totalSelfieRequests: 0,
      totalSelfiesTaken: 0,
    }
  );

  const avgPerimeterAccuracy = totalGuards > 0 ? performanceData.totalPerimeterAccuracy / totalGuards : 0;
  const avgSelfieAccuracy =
    performanceData.totalSelfieRequests > 0
      ? (performanceData.totalSelfiesTaken / performanceData.totalSelfieRequests) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guard Performance Overview</CardTitle>
        <CardDescription>
          Average performance metrics across all assigned guards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Perimeter Accuracy
            </h4>
            <span className="font-bold text-muted-foreground">{avgPerimeterAccuracy.toFixed(1)}%</span>
          </div>
          <Progress value={avgPerimeterAccuracy} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-primary" />
                Selfie Check-in Accuracy
            </h4>
            <span className="font-bold text-muted-foreground">{avgSelfieAccuracy.toFixed(1)}%</span>
          </div>
          <Progress value={avgSelfieAccuracy} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
