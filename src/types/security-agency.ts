export type SecurityAgency = {
  id: number;
  tb_agency_id: string;
  agency_id: string;
  agency_name: string;
  contact_person: string;
  communication_email: string;
  phone: string;
  address: string;
  city: string;
  region: string;

  // Fields from original mock data that might not be in the final API
  name?: string;
  email?: string;
  country?: string;
  avatar?: string;
  siteIds?: string[];
};
