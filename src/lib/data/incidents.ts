
import type { Incident } from '@/types';

export const incidents: Incident[] = [
    { 
      id: 'INC001', 
      incidentTime: '2024-07-20T14:30:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL001', 
      siteId: 'SITE02', 
      initialIncidentMediaUrl: ['https://placehold.co/600x400.png'],
      attendedByPatrollingOfficerId: 'PO01',
      incidentType: 'SOS'
    },
    { 
      id: 'INC002', 
      incidentTime: '2024-07-21T09:00:00Z', 
      description: 'False fire alarm triggered by dust near sensor in Lobby.', 
      resolutionNotes: 'Confirmed with site maintenance that sensor was cleaned. No actual fire hazard. Closed.',
      status: 'Resolved', 
      raisedByGuardId: 'GL002', 
      siteId: 'SITE01',
      initialIncidentMediaUrl: [],
      resolvedIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO02',
      resolvedByUserId: 'PO02',
      incidentType: 'Safety Hazard'
    },
    { 
      id: 'INC003', 
      incidentTime: '2024-06-15T22:05:00Z', 
      description: 'Graffiti on the north wall of Pier 3.', 
      status: 'Under Review', 
      raisedByGuardId: 'GL003', 
      siteId: 'SITE03',
      initialIncidentMediaUrl: ['https://placehold.co/600x400.png'],
      attendedByPatrollingOfficerId: 'PO01',
      incidentType: 'Vandalism'
    },
    { 
      id: 'INC004', 
      incidentTime: '2024-05-10T11:00:00Z', 
      description: 'Guard reported feeling unwell, requested relief.', 
      resolutionNotes: 'Relief guard dispatched and arrived on site. Original guard was relieved and went home.',
      status: 'Resolved', 
      raisedByGuardId: 'GL005', 
      siteId: 'SITE04',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO02',
      resolvedByUserId: 'AGY02',
      incidentType: 'Other'
    },
    { 
      id: 'INC005', 
      incidentTime: '2024-04-01T02:15:00Z', 
      description: 'Successful break-in at R&D department, items stolen.', 
      resolutionNotes: 'Police report filed (Case #12345). Site security protocols reviewed and updated. Door access system upgraded.',
      status: 'Resolved', 
      raisedByGuardId: 'GL006', 
      siteId: 'SITE04',
      initialIncidentMediaUrl: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
      resolvedIncidentMediaUrl: ['https://placehold.co/600x400.png'],
      attendedByPatrollingOfficerId: 'PO02',
      resolvedByUserId: 'AGY02',
      incidentType: 'Theft'
    },
    { 
      id: 'INC006', 
      incidentTime: '2024-07-22T10:00:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL009', 
      siteId: 'SITE08',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO01',
      incidentType: 'SOS'
    },
    { 
      id: 'INC007', 
      incidentTime: '2024-07-23T11:00:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL007', 
      siteId: 'SITE05',
      initialIncidentMediaUrl: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'],
      attendedByPatrollingOfficerId: 'PO03',
      incidentType: 'SOS'
    },
    { 
      id: 'INC008', 
      incidentTime: '2024-07-23T15:00:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL004', 
      siteId: 'SITE01',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO02',
      incidentType: 'SOS'
    },
    { 
      id: 'INC009', 
      incidentTime: '2024-07-18T18:45:00Z', 
      description: 'Suspicious individual reported near the perimeter fence of Industrial Zone 7.', 
      status: 'Under Review', 
      raisedByGuardId: 'GL008', 
      siteId: 'SITE06',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO03',
      incidentType: 'Suspicious Activity'
    },
     { 
      id: 'INC010', 
      incidentTime: '2024-07-19T12:00:00Z', 
      description: 'Main gate access panel is malfunctioning.', 
      status: 'Under Review', 
      raisedByGuardId: 'GL002', 
      siteId: 'SITE01',
      initialIncidentMediaUrl: ['https://placehold.co/600x400.png'],
      attendedByPatrollingOfficerId: 'PO02',
      incidentType: 'Safety Hazard'
    },
    { 
      id: 'INC011', 
      incidentTime: '2024-07-24T08:00:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL004', 
      siteId: 'SITE01',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO02',
      incidentType: 'SOS'
    },
    { 
      id: 'INC012', 
      incidentTime: '2024-07-24T09:30:00Z', 
      description: '', 
      status: 'Active', 
      raisedByGuardId: 'GL007', 
      siteId: 'SITE05',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO03',
      incidentType: 'SOS'
    },
    { 
      id: 'INC013', 
      incidentTime: '2024-07-22T14:00:00Z', 
      description: 'A water pipe has burst in the server room.', 
      status: 'Under Review', 
      raisedByGuardId: 'GL001', 
      siteId: 'SITE02',
      initialIncidentMediaUrl: [],
      attendedByPatrollingOfficerId: 'PO01',
      incidentType: 'Safety Hazard'
    }
];
