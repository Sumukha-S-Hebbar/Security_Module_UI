// src/lib/data/incident-store.ts
import type { Incident } from '@/types';
import { incidents as initialIncidents } from './incidents';

/**
 * This is a simple in-memory store to manage incident state across components.
 * In a real-world application, this would be replaced by a more robust state
 * management library (like Zustand or Redux) or by refetching data from the API.
 */

let incidentsState: Incident[] = [...initialIncidents.map(i => ({...i}))];

const listeners = new Set<() => void>();

export const incidentStore = {
  getIncidents: (): Incident[] => {
    return incidentsState;
  },
  
  getIncidentById: (id: string): Incident | undefined => {
    return incidentsState.find(i => i.id === id);
  },

  updateIncident: (id: string, updates: Partial<Incident>): void => {
    incidentsState = incidentsState.map(incident => 
      incident.id === id ? { ...incident, ...updates } : incident
    );
    listeners.forEach(listener => listener());
  },
  
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
