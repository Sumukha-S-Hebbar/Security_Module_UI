import type { Incident } from './incident';

export type Site = {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  guards: string[]; // Guard IDs
  reportUrl: string;
  coords: { x: number; y: number }; // As percentages for map placement
  visited: boolean;
  towerco: string;
  agencyId?: string;
  assignedOn?: string;
  patrollingOfficerId?: string;
  geofencePerimeter?: number;
  incidents?: Incident[];
};
