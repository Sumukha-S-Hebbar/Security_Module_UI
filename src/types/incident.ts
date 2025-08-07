
export type Incident = {
  id: string; // incident_id
  status: 'Active' | 'Under Review' | 'Resolved';
  description: string;
  resolutionNotes?: string;
  raisedByGuardId: string;
  siteId: string;
  incidentTime: string;
  resolvedTime?: string;
  attendedByPatrollingOfficerId?: string;
  resolvedByUserId?: string;
  initialIncidentMediaUrl: string[];
  resolvedIncidentMediaUrl?: string[];
  incidentType?: 'SOS' | 'Suspicious Activity' | 'Theft' | 'Vandalism' | 'Trespassing' | 'Safety Hazard' | 'Other';
};
