
export type Guard = {
  id: string; // The guard_id, e.g. 'GL001'
  name: string;
  first_name: string;
  last_name: string | null;
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
