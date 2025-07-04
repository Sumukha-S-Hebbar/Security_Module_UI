
import { sites } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, FileText, AlertTriangle, TowerControl } from 'lucide-react';
import Link from 'next/link';

export default function AgencySitesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of all operational sites.
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
            <CardContent className="flex-grow space-y-4">
              <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold flex items-center gap-2">
                      <TowerControl className="w-4 h-4 text-muted-foreground" />
                      TowerCo
                  </div>
                  <Badge variant="secondary">{site.towerco}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Assigned Guards
                  </div>
                  <Badge variant="outline">{site.guards.length}</Badge>
              </div>
               <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      Open Incidents
                  </div>
                  <Badge variant="destructive">{site.incidents?.filter(inc => !inc.resolved).length || 0}</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="#">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Report
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
