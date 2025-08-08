

import type { Incident } from './incident';
import type { SecurityAgency } from './security-agency';

export type Site = {
  id: string; // The database primary key & tb_site_id
  tb_site_id: string; // The unique Tower Buddy site ID
  org_site_id: string; // The organization-specific site ID
  org_name?: string;
  site_name: string;
  site_status?: 'Assigned' | 'Unassigned';
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  
  // From API
  site_address_line1: string;
  site_address_line2?: string | null;
  site_address_line3?: string | null;
  site_zip_code?: string;
  assigned_agency?: SecurityAgency | null;
  total_incidents?: number;
  
  // These fields were in the mock data and may or may not be in the final API.
  // Kept for potential compatibility or future use.
  guards?: string[];
  country?: string;
  reportUrl?: string;
  coords?: { x: number; y: number };
  visited?: boolean;
  towerco?: string;
  agencyId?: string;
  assignedOn?: string;
  patrollingOfficerId?: string;
  geofencePerimeter?: number;
  incidents?: Incident[];
  guardsRequired?: number;
};

export type PaginatedSitesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Site[];
};

    
