
// src/lib/data/incident-store.ts
import type { Incident } from '@/types';
import { incidents as initialIncidents } from './incidents';

/**
 * This is a simple in-memory store. For this prototype, it resets to the
 * initial data on each page load to ensure a consistent testing experience.
 * In a real-world application, this would be replaced by API calls to a
 * backend database, and localStorage might be used for optimistic UI updates.
 */

let incidentsState: Incident[] = [];

const listeners = new Set<() => void>();

function notifyListeners() {
    listeners.forEach(listener => listener());
}

function initializeState() {
  // Always deep copy the initial data to avoid mutations across sessions.
  incidentsState = JSON.parse(JSON.stringify(initialIncidents));
}

// Initialize the state when the module is first loaded
initializeState();


export const incidentStore = {
  getIncidents: (): Incident[] => {
    return incidentsState;
  },
  
  getIncidentById: (id: number): Incident | undefined => {
    return incidentsState.find(i => i.id === id);
  },

  updateIncident: (id: number, updates: Partial<Incident>): void => {
    let incidentUpdated = false;
    incidentsState = incidentsState.map(incident => {
      if (incident.id === id) {
        incidentUpdated = true;
        return { ...incident, ...updates };
      }
      return incident;
    });

    if (incidentUpdated) {
        notifyListeners();
    }
  },
  
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    // Immediately notify the new listener with the current state
    listener();
    return () => listeners.delete(listener);
  },

  // Helper for development/testing to reset the data
  reset: () => {
    initializeState();
    notifyListeners();
    console.log("Incident store has been reset to initial data.");
  }
};

// Make the store accessible in the browser console for easy debugging
if (typeof window !== 'undefined') {
  (window as any).incidentStore = incidentStore;
}
