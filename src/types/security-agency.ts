export type SecurityAgency = {
  id: number;
  tb_agency_id: string;
  agency_id: string;
  agency_name: string;
  contact_person: string;
  communication_email: string;
  phone: string;

  // Fields from original mock data
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  avatar?: string;
  siteIds?: string[];
};
