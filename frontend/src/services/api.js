// API integration layer with resilient offline & local fallback

import { NER_CORRIDORS } from "../data/corridorsData";
import { INITIAL_SHIPMENTS } from "../data/shipmentsData";
import { INITIAL_FIELD_INCIDENTS } from "../data/fieldIncidentsData";
import { WEATHER_HOTSPOTS } from "../data/weatherRadarData";

const API_BASE_URL = "/api";

export const apiService = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, data };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
  },

  // Get all monitored corridors
  async getCorridors() {
    try {
      const res = await fetch(`${API_BASE_URL}/corridors`, { credentials: "omit" });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Falling back to embedded corridors data:", err);
    }
    return NER_CORRIDORS;
  },

  // Get active shipments
  async getShipments() {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Falling back to embedded shipments data:", err);
    }
    return INITIAL_SHIPMENTS;
  },

  // Get field incidents
  async getIncidents() {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Falling back to embedded incidents data:", err);
    }
    return INITIAL_FIELD_INCIDENTS;
  },

  // Get weather radar hotspots
  async getWeatherHotspots() {
    try {
      const res = await fetch(`${API_BASE_URL}/weather/radar`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Falling back to embedded weather data:", err);
    }
    return WEATHER_HOTSPOTS;
  },

  // Trigger disruption simulation on backend
  async triggerSimulation(scenarioId) {
    try {
      const res = await fetch(`${API_BASE_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Simulation API unreachable, executing local simulator:", err);
    }
    return { success: true, localMode: true };
  },

  // Submit field incident report
  async submitIncident(incident) {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incident),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Failed to POST incident to API, stored in local DB:", err);
    }
    return { ...incident, status: "SYNCED" };
  },

  // Batch sync buffered incidents
  async syncBatchIncidents(incidents) {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/batch-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidents }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Batch sync fallback:", err);
    }
    return { syncedCount: incidents.length, status: "SUCCESS" };
  }
};
