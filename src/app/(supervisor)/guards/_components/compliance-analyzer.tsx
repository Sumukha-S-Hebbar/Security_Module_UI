'use client';

import type { Guard } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export function ComplianceAnalyzer({ guard }: { guard: Guard }) {
  const missedPercentage =
    guard.totalSelfieRequests > 0
      ? (guard.missedSelfieCount / guard.totalSelfieRequests) * 100
      : 0;

  const completionPercentage = 100 - missedPercentage;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={guard.avatar} alt={guard.name} />
            <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{guard.name}</CardTitle>
            <CardDescription>
              Missed {guard.missedSelfieCount} of {guard.totalSelfieRequests} requests
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="space-y-1">
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{missedPercentage.toFixed(0)}% missed</p>
         </div>
      </CardContent>
    </Card>
  );
}
