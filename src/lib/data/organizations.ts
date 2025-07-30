import type { Organization } from '@/types';

export const organizations: Organization[] = [
  {
    id: 1,
    name: 'TowerCo Alpha',
    code: 'TCOALPHA',
    role: 'TOWERCO',
    type: 'Tower Company',
    logo: 'https://placehold.co/100x100.png',
    member: {
        id: 1,
        employee_id: 'TCOA001',
        designation: 'Operations Head'
    }
  },
  {
    id: 2,
    name: 'MNO Beta',
    code: 'MNOBETA',
    role: 'MNO',
    type: 'Mobile Network Operator',
    logo: 'https://placehold.co/100x100.png',
     member: {
        id: 2,
        employee_id: 'MNOB001',
        designation: 'Regional Manager'
    }
  },
];
