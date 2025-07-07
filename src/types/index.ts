export type Guard = {
  id: string;
  name: string;
  site: string;
  phone: string;
  location: string;
  avatar: string;
  missedSelfieCount: number;
  totalSelfieRequests: number;
  patrollingOfficerId?: string;
  performance?: {
    perimeterAccuracy: number;
    leaveDays: number;
  };
};

export type Site = {
  id: string;
  name: string;
  address: string;
  guards: string[]; // Guard IDs
  reportUrl: string;
  coords: { x: number; y: number }; // As percentages for map placement
  visited: boolean;
  towerco: string;
  incidents?: Incident[];
  assignedOn?: string;
  agencyId?: string;
  geofencePerimeter?: number;
};

export type Alert = {
  id: string;
  type: 'Emergency' | 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Investigating';
  callDetails?: string;
  images?: string[];
};

export type PatrollingOfficer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  assignedGuards: string[]; // Guard IDs
  routes?: string[];
};

export type Incident = {
  id: string;
  date: string;
  type: 'Break-in' | 'Fire Alarm' | 'Vandalism' | 'Medical';
  details: string;
  resolved: boolean;
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
