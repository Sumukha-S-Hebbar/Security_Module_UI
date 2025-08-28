

export type Incident = {
  id: number; 
  incident_id?: string;
  status: 'Active' | 'Under Review' | 'Resolved';
  description: string;
  resolutionNotes?: string;
  raisedByGuardId: number;
  siteId: number;
  incidentTime: string;
  resolvedTime?: string;
  attendedByPatrollingOfficerId?: number;
  resolvedByUserId?: string;
  initialIncidentMediaUrl: (string | null)[];
  resolvedIncidentMediaUrl?: (string | null)[];
  incidentType?: 'SOS' | 'Suspicious Activity' | 'Theft' | 'Vandalism' | 'Trespassing' | 'Safety Hazard' | 'Other';
};
