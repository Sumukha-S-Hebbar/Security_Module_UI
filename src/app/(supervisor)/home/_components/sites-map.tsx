'use client';

import Image from 'next/image';
import type { Site } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Map, MapPin } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function SitesMap({ sites: initialSites }: { sites: Site[] }) {
  const [sites, setSites] = useState<Site[]>(initialSites);

  const handleMarkAsVisited = (siteId: string) => {
    setSites((currentSites) =>
      currentSites.map((site) =>
        site.id === siteId ? { ...site, visited: true } : site
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-6 h-6" />
          Supervised Sites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="Map of supervised sites"
              fill
              className="object-cover"
              data-ai-hint="world map"
            />
            {sites.map((site) => (
              <Tooltip key={site.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${site.coords.x}%`,
                      top: `${site.coords.y}%`,
                    }}
                  >
                    <MapPin
                      className={cn(
                        'w-8 h-8',
                        site.visited
                          ? 'text-green-500 fill-green-500/50'
                          : 'text-destructive fill-destructive/50'
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{site.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {site.address}
                  </p>
                  {!site.visited && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleMarkAsVisited(site.id)}
                    >
                      Mark as Visited
                    </Button>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
