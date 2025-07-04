import type { Guard } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplianceAnalyzer } from './compliance-analyzer';
import { CameraOff } from 'lucide-react';

export function ComplianceWatchlist({ guards }: { guards: Guard[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CameraOff className="w-6 h-6 text-muted-foreground" />
          <CardTitle>Selfie Misses Watchlist</CardTitle>
        </div>
        <CardDescription>
          Guards with missed selfie requests. Analysis powered by AI.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 grid gap-4 md:grid-cols-2">
        {guards.length > 0 ? (
          guards.map((guard) => (
            <ComplianceAnalyzer key={guard.id} guard={guard} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full">
            No compliance issues found. All guards are up-to-date with selfie requests.
          </p>
        )}
      </div>
    </Card>
  );
}
