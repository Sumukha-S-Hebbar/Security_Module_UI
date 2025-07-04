import { alerts } from '@/lib/data';
import { EmergencyCallSummarizer } from './_components/emergency-call-summarizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const activeEmergencies = alerts.filter(
    (alert) => alert.type === 'Emergency' && alert.status === 'Active'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Supervisor. Here's what's happening.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <CardTitle>Current Emergency Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeEmergencies.length > 0 ? (
            activeEmergencies.map((alert) => (
              <EmergencyCallSummarizer key={alert.id} alert={alert} />
            ))
          ) : (
            <p className="text-muted-foreground">
              No active emergency calls. All systems are normal.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
