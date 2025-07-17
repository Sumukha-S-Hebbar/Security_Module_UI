
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuardProfiles } from './_components/guard-profiles';
import { SelfieRequester } from './_components/selfie-requester';
import { ComplianceWatchlist } from './_components/compliance-watchlist';
import { guards, sites } from '@/lib/data';

const LOGGED_IN_SUPERVISOR_ID = 'PO01'; // Simulate logged-in Supervisor

export default function GuardsPage() {
  const supervisorSites = useMemo(() => sites.filter(s => s.patrollingOfficerId === LOGGED_IN_SUPERVISOR_ID), []);
  const supervisorSiteNames = useMemo(() => new Set(supervisorSites.map(s => s.name)), [supervisorSites]);
  const supervisorGuards = useMemo(() => guards.filter(g => supervisorSiteNames.has(g.site)), [supervisorSiteNames]);

  const guardsWithComplianceIssues = supervisorGuards.filter(
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
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="profiles">Guard Profiles</TabsTrigger>
          <TabsTrigger value="requests">Selfie Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles" className="mt-6">
          <GuardProfiles guards={supervisorGuards} />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SelfieRequester guards={supervisorGuards} />
            <ComplianceWatchlist guards={guardsWithComplianceIssues} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
