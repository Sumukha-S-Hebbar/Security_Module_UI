

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
};

export type SecurityAgency = {
  id: number;
  tb_agency_id: string;
  agency_id: string;
  agency_name: string;
  contact_person: string;
  communication_email: string;
  phone: string;
  registered_address_line1: string;
  registered_address_line2: string | null;
  registered_address_line3: string | null;
  city: string;
  region: string;
  logo: string | null;
  associated_org?: string;
  total_sites_assigned: number;
  total_number_of_incidents: number;
  assigned_sites_details: AssignedSiteDetail[];

  // Fields from original mock data that might not be in the final API
  name: string; // a bit redundant with agency_name
  email: string; // a bit redundant with communication_email
  address: string;
  country?: string;
  avatar?: string;
  siteIds?: string[];
};
