'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Phone } from 'lucide-react';
import type { Alert, Guard } from '@/types';
import { guards } from '@/lib/data';

export function EmergencyCallSummarizer({ alert }: { alert: Alert }) {
  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const guard = getGuardByName(alert.guard);

  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-lg">Emergency at {alert.site}</CardTitle>
        <CardDescription>
          Reported by {alert.guard} on {alert.date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alert.callDetails && (
          <p className="text-sm text-muted-foreground italic">
            "{alert.callDetails}"
          </p>
        )}
      </CardContent>
      <CardFooter>
        {guard ? (
          <Button asChild>
            <a href={`tel:${guard.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Contact Guard
            </a>
          </Button>
        ) : (
          <Button disabled>
            <Phone className="mr-2 h-4 w-4" />
            Contact Guard (Info not available)
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
