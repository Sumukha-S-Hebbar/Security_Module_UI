
import { sites } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

export default function AgencySitesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of all operational sites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sites</CardTitle>
          <CardDescription>
            A list of all sites managed by the agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>TowerCo</TableHead>
                <TableHead>Assigned Guards</TableHead>
                <TableHead>Open Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => {
                const openIncidents =
                  site.incidents?.filter((inc) => !inc.resolved).length || 0;
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>{site.towerco}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{site.guards.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={openIncidents > 0 ? 'destructive' : 'secondary'}
                      >
                        {openIncidents}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
