import { guards, sites, supervisors } from '@/lib/data';
import { AgencyAnalyticsDashboard } from './_components/agency-analytics-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgencyHomePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here's a high-level overview of your operations.
        </p>
      </div>

      <AgencyAnalyticsDashboard
        guards={guards}
        sites={sites}
        supervisors={supervisors}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Recent activity feed will be displayed here.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lists of unassigned guards and sites will be shown here.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
