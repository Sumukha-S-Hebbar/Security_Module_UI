
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { IncidentsPageClient } from './_components/incidents-page-client';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

function IncidentsPageSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-24 md:h-20 w-full" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
                        <Skeleton className="h-10 w-full sm:w-[180px]" />
                        <Skeleton className="h-10 w-full sm:w-[180px]" />
                        <Skeleton className="h-10 w-full sm:w-[240px]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function TowercoIncidentsPage() {
  return (
    <Suspense fallback={<IncidentsPageSkeleton />}>
      <IncidentsPageClient />
    </Suspense>
  );
}
