import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuardProfiles } from './_components/guard-profiles';
import { SelfieRequester } from './_components/selfie-requester';
import { ComplianceWatchlist } from './_components/compliance-watchlist';
import { guards } from '@/lib/data';

export default function GuardsPage() {
  const guardsWithComplianceIssues = guards.filter(
    (g) => g.missedSelfieCount > 0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Security Guard Management
        </h1>
        <p className="text-muted-foreground">
          Oversee your team, send requests, and track compliance.
        </p>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="profiles">Guard Profiles</TabsTrigger>
          <TabsTrigger value="requests">Selfie Requests</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles" className="mt-6">
          <GuardProfiles guards={guards} />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <SelfieRequester guards={guards} />
        </TabsContent>
        <TabsContent value="compliance" className="mt-6 space-y-6">
          <ComplianceWatchlist guards={guardsWithComplianceIssues} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
