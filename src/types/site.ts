

import type { Guard, PatrollingOfficer } from '@/types';

export type Site = {
  id: number; // The database primary key
  tb_site_id: string; // The unique Tower Buddy site ID
  org_site_id: string; // The organization-specific site ID
  org_name?: string;
  site_name: string;
  site_status: 'Assigned' | 'Unassigned';
  personnel_assignment_status: 'Assigned' | 'Unassigned';
  region: string;
  city: string;
  lat?: number;
  lng?: number;
  
  // From API
  site_address_line1: string;
  site_address_line2?: string | null;
  site_address_line3?: string | null;
  site_zip_code?: string;
  assigned_agency?: {
    id: number;
    subcon_id: string;
    name: string;
    role: string;
    contact_person: string;
    email: string;
    phone: string;
  } | null;
  total_incidents?: number;
  total_guards_requested?: number;
  total_guards_assigned?: number;
  
  guard_details: (Partial<Guard> & { profile_picture?: string })[];
  patrol_officer_details: (Partial<PatrollingOfficer> & {id: number, first_name: string, last_name: string | null, email: string, phone: string, profile_picture?: string})[];


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
  guardsRequired?: number;
  latitude?: number;
  longitude?: number;
};

export type PaginatedSitesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Site[];
};
