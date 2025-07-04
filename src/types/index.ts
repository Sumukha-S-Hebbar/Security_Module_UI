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
};

export type Alert = {
  id: string;
  type: 'Emergency' | 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Investigating';
};

export type EmergencyCall = {
  id: string;
  guardName: string;
  siteName: string;
  time: string;
  callDetails: string;
};
