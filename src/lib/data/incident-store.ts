// src/lib/data/incident-store.ts
import type { Incident } from '@/types';
import { incidents as initialIncidents } from './incidents';

/**
 * This is a simple in-memory store that uses localStorage for persistence
 * across page reloads. In a real-world application, this would be replaced
 * by API calls to a backend database.
 * 
 * FOR TESTING: You can clear the stored incident data by calling
 * `incidentStore.reset()` from your browser's developer console.
 */

const INCIDENTS_STORAGE_KEY = 'guardlink-incidents-state';

let incidentsState: Incident[] = [];

const listeners = new Set<() => void>();

function notifyListeners() {
    listeners.forEach(listener => listener());
}

function initializeState() {
  if (typeof window === 'undefined') {
    // We are on the server, use initial data without persistence.
    incidentsState = JSON.parse(JSON.stringify(initialIncidents));
    return;
  }

  try {
    const storedState = window.localStorage.getItem(INCIDENTS_STORAGE_KEY);
    if (storedState) {
      incidentsState = JSON.parse(storedState);
    } else {
      // If no state in localStorage, initialize with default data
      incidentsState = JSON.parse(JSON.stringify(initialIncidents));
      window.localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidentsState));
    }
  } catch (error) {
    console.error("Failed to initialize state from localStorage, using default.", error);
    incidentsState = JSON.parse(JSON.stringify(initialIncidents));
  }
}

function persistState() {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidentsState));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }
}

// Initialize the state when the module is first loaded
initializeState();


export const incidentStore = {
  getIncidents: (): Incident[] => {
    return incidentsState;
  },
  
  getIncidentById: (id: string): Incident | undefined => {
    return incidentsState.find(i => i.id === id);
  },

  updateIncident: (id: string, updates: Partial<Incident>): void => {
    let incidentUpdated = false;
    incidentsState = incidentsState.map(incident => {
      if (incident.id === id) {
        incidentUpdated = true;
        return { ...incident, ...updates };
      }
      return incident;
    });

    if (incidentUpdated) {
        persistState();
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
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(INCIDENTS_STORAGE_KEY);
        incidentsState = JSON.parse(JSON.stringify(initialIncidents));
        notifyListeners();
        console.log("Incident store has been reset to initial data.");
    }
  }
};

// Make the store accessible in the browser console for easy debugging
if (typeof window !== 'undefined') {
  (window as any).incidentStore = incidentStore;
}
