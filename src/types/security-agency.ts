

import type { Site } from './site';

type AssignedSiteDetail = {
    site_details: {
        id: number;
        tb_site_id: string;
        org_site_id: string;
        site_name: string;
        site_address_line1: string;
        city: string;
        region: string;
    };
    assigned_on: string;
    number_of_guards: number;
};

export type SecurityAgency = {
  id: number;
  subcon_id: string;
  name: string;
  logo: string | null;
  contact_person: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  registered_address_line1: string | null;
  registered_address_line2: string | null;
  registered_address_line3: string | null;
  created_at: string;
  updated_at: string;
  total_sites_assigned: number;
  total_number_of_incidents: number;
  assigned_sites_details: AssignedSiteDetail[];

  // Fields from original mock data that might not be in the final API
  // Kept for potential compatibility or future use.
  tb_agency_id?: string;
  agency_id?: string;
  agency_name?: string;
  communication_email?: string;
  address?: string;
  country?: string;
  avatar?: string;
  siteIds?: string[];
};

    