import type { PatrollingOfficer } from '@/types';

export const patrollingOfficers: PatrollingOfficer[] = [
  {
    id: 'PO01',
    name: 'Michael Scott',
    phone: '555-100-2000',
    email: 'michael.s@guardlink.com',
    avatar: 'https://placehold.co/100x100.png',
    routes: ['Downtown Route', 'Waterfront Route'],
    averageResponseTime: 15,
  },
  {
    id: 'PO02',
    name: 'Jessica Pearson',
    phone: '555-100-2001',
    email: 'jessica.p@guardlink.com',
    avatar: 'https://placehold.co/100x100.png',
    routes: ['Tech Park Route', 'Cyberdyne Route'],
    averageResponseTime: 12,
  },
  {
    id: 'PO03',
    name: 'Harvey Specter',
    phone: '555-100-2002',
    email: 'harvey.s@guardlink.com',
    avatar: 'https://placehold.co/100x100.png',
    routes: ['Industrial Zone Route'],
    averageResponseTime: 18,
  },
];
