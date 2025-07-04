import type { Guard, Site, Alert } from '@/types';

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
  {
    id: 'GL005',
    name: 'Sarah Connor',
    site: 'Cyberdyne Systems',
    phone: '555-867-5309',
    location: 'R&D Dept',
    avatar: 'https://placehold.co/100x100.png',
    missedSelfieCount: 0,
    totalSelfieRequests: 10,
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
  {
    id: 'SITE04',
    name: 'Cyberdyne Systems',
    address: '2144 Kramer Street, Sunnyvale, CA',
    guards: ['GL005'],
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
    callDetails:
      'This is John Doe at Downtown Mall, Gate 4. We have a potential break-in situation at the west entrance near the electronics store. Requesting immediate backup. I see two individuals acting suspiciously. The time is approximately 2:30 PM.',
    images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
  },
  {
    id: 'A005',
    type: 'Emergency',
    date: '2024-07-21 02:14',
    site: 'Cyberdyne Systems',
    guard: 'Sarah Connor',
    status: 'Active',
    callDetails:
      'Fire alarm activated on the third floor, R&D department. I am proceeding to the location to investigate. All personnel are being evacuated. Time is 2:14 AM. No smoke visible yet.',
    images: ['https://placehold.co/600x400.png'],
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
