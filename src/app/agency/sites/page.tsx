
import { sites, guards, supervisors } from '@/lib/data';
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
import { MapPin } from 'lucide-react';

export default function AgencySitesPage() {
  const getSupervisorForSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (!site || site.guards.length === 0) {
      return null;
    }
    // Assumption: all guards at a site have the same supervisor. We'll use the first guard.
    const guardId = site.guards[0];
    const guard = guards.find((g) => g.id === guardId);
    if (!guard || !guard.supervisorId) {
      return null;
    }
    return supervisors.find((s) => s.id === guard.supervisorId);
  };

  const unassignedSites = sites.filter(
    (site) => !getSupervisorForSite(site.id)
  );

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
                <TableHead>Site ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>TowerCo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => {
                const supervisor = getSupervisorForSite(site.id);
                return (
                  <TableRow key={site.id}>
                    <TableCell>{site.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>{supervisor?.name || 'Unassigned'}</TableCell>
                    <TableCell>{site.towerco}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {unassignedSites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Sites</CardTitle>
            <CardDescription>
              A list of sites that do not have a supervisor assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>TowerCo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell>{site.towerco}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
