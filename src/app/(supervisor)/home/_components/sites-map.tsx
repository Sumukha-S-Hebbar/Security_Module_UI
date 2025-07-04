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

export function SitesMap({ sites }: { sites: Site[] }) {
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
                    <MapPin className="w-8 h-8 text-primary fill-primary/50" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{site.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {site.address}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
