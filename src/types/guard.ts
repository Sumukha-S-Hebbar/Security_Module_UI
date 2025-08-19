

import type { Site, PatrollingOfficer } from '@/types';

export type Guard = {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string;
  profile_picture?: string | null;
  site: (Omit<Site, 'guards' | 'patrollingOfficerId'> & { id: number, site_name: string }) | null;
  patrolling_officer: {
      id: number;
      user: string;
      email: string;
      first_name: string;
      last_name: string | null;
      phone: string;
      profile_picture: string | null;
  } | null;
  incident_count: number;

  // Mock data fields that may not be in final API response
  name?: string;
  location?: string;
  avatar?: string;
  missedSelfieCount?: number;
  totalSelfieRequests?: number;
  performance?: {
    perimeterAccuracy: number;
    leaveDays: number;
  };
  patrollingOfficerId?: string;
  city?: string;
};
