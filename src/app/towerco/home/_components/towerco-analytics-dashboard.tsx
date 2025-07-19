
import Link from 'next/link';
import type { Site, SecurityAgency, Incident } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, ShieldAlert } from 'lucide-react';

export function TowercoAnalyticsDashboard({
  sites,
  agencies,
  incidents,
}: {
  sites: Site[];
  agencies: SecurityAgency[];
  incidents: Incident[];
}) {
  const activeIncidents = incidents.filter(i => i.status === 'Active').length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeIncidents}</div>
          <p className="text-xs text-muted-foreground">
            Ongoing emergency incidents
          </p>
        </CardContent>
      </Card>
      <Link href="/towerco/sites">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              All sites under your portfolio.
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/towerco/agencies">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Agencies
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
            <p className="text-xs text-muted-foreground">
              Contracted security partners
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
