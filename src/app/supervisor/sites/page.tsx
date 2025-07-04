import { sites, guards } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SitesPage() {
  const getGuardById = (id: string) => guards.find((g) => g.id === id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Details of assigned sites and personnel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Card key={site.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1">
                <MapPin className="w-4 h-4" />
                {site.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Assigned Guards
              </h4>
              <div className="space-y-2">
                {site.guards.map((guardId) => {
                  const guard = getGuardById(guardId);
                  return guard ? (
                    <div key={guard.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={guard.avatar} alt={guard.name} />
                        <AvatarFallback>
                          {guard.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{guard.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {guard.id}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={site.reportUrl}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Site Report
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
