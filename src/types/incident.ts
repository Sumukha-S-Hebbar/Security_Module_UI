export type Incident = {
  id: string;
  status: 'Active' | 'Under Review' | 'Resolved';
  description: string;
  raisedByGuardId: string;
  siteId: string;
  incidentTime: string;
  attendedByPatrollingOfficerId?: string;
  resolvedByUserId?: string;
  initialIncidentMediaUrl: string[];
  resolvedIncidentMediaUrl?: string[];
};
