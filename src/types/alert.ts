export type Alert = {
  id: string;
  type: 'Missed Selfie' | 'Guard Out of Premises';
  date: string;
  site: string;
  guard: string;
  status: 'Active' | 'Resolved' | 'Under Review';
};
