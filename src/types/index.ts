
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
};

export type Alert = {
  id: string;
  type: 'Emergency' | 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Under Review';
  callDetails?: string;
  images?: string[];
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
  date: string;
  type: 'Break-in' | 'Fire Alarm' | 'Vandalism' | 'Medical';
  details: string;
  status: 'Active' | 'Resolved' | 'Under Review';
  guard: string;
  site: string;
  images?: string[];
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
