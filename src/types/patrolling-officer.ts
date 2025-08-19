

export type PatrollingOfficer = {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  sites_assigned_count: number;
  incidents_count: number;
  avatar?: string;
  name?: string;
  site_details?: {
      id: number;
      tb_site_id: string;
      org_site_id: string;
      site_name: string;
  } | null;
  assigned_sites_details?: any[];

  // Mock data fields that might not be in final API response
  routes?: string[];
  averageResponseTime?: number;
  city?: string;
};
