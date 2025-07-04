import type { Guard, Site, Alert, EmergencyCall } from '@/types';

export const guards: Guard[] = [
  {
    id: 'GL001',
    name: 'John Doe',
    site: 'Downtown Mall',
    phone: '555-123-4567',
    location: 'Gate 4, Sector B',
    avatar: 'https://placehold.co/100x100.png',
    missedSelfieCount: 1,
    totalSelfieRequests: 20,
  },
  {
    id: 'GL002',
    name: 'Jane Smith',
    site: 'Tech Park One',
    phone: '555-987-6543',
    location: 'Building A, Lobby',
    avatar: 'https://placehold.co/100x100.png',
    missedSelfieCount: 0,
    totalSelfieRequests: 25,
  },
  {
    id: 'GL003',
    name: 'Mike Johnson',
    site: 'City Waterfront',
    phone: '555-555-1212',
    location: 'Pier 3, North End',
    avatar: 'https://placehold.co/100x100.png',
    missedSelfieCount: 8,
    totalSelfieRequests: 22,
  },
  {
    id: 'GL004',
    name: 'Emily Williams',
    site: 'Tech Park One',
    phone: '555-333-4444',
    location: 'Building C, Entrance',
    avatar: 'https://placehold.co/100x100.png',
    missedSelfieCount: 0,
    totalSelfieRequests: 18,
  },
];

export const sites: Site[] = [
  {
    id: 'SITE01',
    name: 'Tech Park One',
    address: '123 Innovation Drive, Silicon Valley, CA',
    guards: ['GL002', 'GL004'],
    reportUrl: '#',
  },
  {
    id: 'SITE02',
    name: 'Downtown Mall',
    address: '456 Market Street, Metro City, NY',
    guards: ['GL001'],
    reportUrl: '#',
  },
  {
    id: 'SITE03',
    name: 'City Waterfront',
    address: '789 Ocean Avenue, Bay City, FL',
    guards: ['GL003'],
    reportUrl: '#',
  },
];

export const alerts: Alert[] = [
  {
    id: 'A001',
    type: 'Emergency',
    date: '2024-07-20 14:30',
    site: 'Downtown Mall',
    guard: 'John Doe',
    status: 'Active',
  },
  {
    id: 'A002',
    type: 'Missed Selfie',
    date: '2024-07-20 08:05',
    site: 'City Waterfront',
    guard: 'Mike Johnson',
    status: 'Investigating',
  },
  {
    id: 'A003',
    type: 'Guard Out of Premises',
    date: '2024-07-19 22:00',
    site: 'Tech Park One',
    guard: 'Jane Smith',
    status: 'Resolved',
  },
  {
    id: 'A004',
    type: 'Missed Selfie',
    date: '2024-07-18 16:00',
    site: 'City Waterfront',
    guard: 'Mike Johnson',
    status: 'Resolved',
  },
];

export const emergencyCalls: EmergencyCall[] = [
  {
    id: 'EC001',
    guardName: 'John Doe',
    siteName: 'Downtown Mall',
    time: '14:30',
    callDetails:
      'This is John Doe at Downtown Mall, Gate 4. We have a potential break-in situation at the west entrance near the electronics store. Requesting immediate backup. I see two individuals acting suspiciously. The time is approximately 2:30 PM.',
  },
  {
    id: 'EC002',
    guardName: 'Sarah Connor',
    siteName: 'Cyberdyne Systems',
    time: '02:14',
    callDetails:
      'Fire alarm activated on the third floor, R&D department. I am proceeding to the location to investigate. All personnel are being evacuated. Time is 2:14 AM. No smoke visible yet.',
  },
];
