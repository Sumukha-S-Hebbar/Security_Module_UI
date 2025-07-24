
import Link from 'next/link';
import type { Guard, Site, PatrollingOfficer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, UserCheck } from 'lucide-react';

export function AgencyAnalyticsDashboard({
  guards,
  sites,
  patrollingOfficers,
}: {
  guards: Guard[];
  sites: Site[];
  patrollingOfficers: PatrollingOfficer[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Link href="/agency/patrolling-officers">
        <Card className="transition-all hover:bg-accent hover:text-accent-foreground group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patrolling Officers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patrollingOfficers.length}</div>
            <p className="text-xs text-muted-foreground font-medium group-hover:text-accent-foreground">
              Team leaders managing guards
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/agency/guards">
        <Card className="transition-all hover:bg-accent hover:text-accent-foreground group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guards</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guards.length}</div>
            <p className="text-xs text-muted-foreground font-medium group-hover:text-accent-foreground">
              Personnel across all sites
            </p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/agency/sites">
        <Card className="transition-all hover:bg-accent hover:text-accent-foreground group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground font-medium group-hover:text-accent-foreground">
              Locations under contract
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
