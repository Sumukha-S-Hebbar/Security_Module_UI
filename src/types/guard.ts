export type Guard = {
  id: string;
  name: string;
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
