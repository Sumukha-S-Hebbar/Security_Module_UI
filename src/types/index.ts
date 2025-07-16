
export type Guard = {
  id: string;
  name: string;
  site: string;
  phone: string;
  location: string;
  avatar: string;
  missedSelfieCount: number;
  totalSelfieRequests: number;
  performance?: {
    perimeterAccuracy: number;
    leaveDays: number;
  };
  patrollingOfficerId?: string;
};

export type Site = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  guards: string[]; // Guard IDs
  reportUrl: string;
  coords: { x: number; y: number }; // As percentages for map placement
  visited: boolean;
  towerco: string;
  assignedOn?: string;
  agencyId?: string;
  patrollingOfficerId?: string;
  geofencePerimeter?: number;
  incidents?: Incident[];
};

export type Alert = {
  id: string;
  type: 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Under Review';
};

export type PatrollingOfficer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  routes?: string[];
  averageResponseTime?: number;
};

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

export type SecurityAgency = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
  city: string;
  state: string;
  country: string;
};
