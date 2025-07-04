export type Guard = {
  id: string;
  name: string;
  site: string;
  phone: string;
  location: string;
  avatar: string;
  missedSelfieCount: number;
  totalSelfieRequests: number;
};

export type Site = {
  id: string;
  name: string;
  address: string;
  guards: string[]; // Guard IDs
  reportUrl: string;
  coords: { x: number; y: number }; // As percentages for map placement
  visited: boolean;
};

export type Alert = {
  id: string;
  type: 'Emergency' | 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Investigating';
  callDetails?: string;
  images?: string[];
};
