import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_BUSES } from '../data/buses';
import { CITY_CONFIG } from '../data/config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [buses, setBuses] = useState(MOCK_BUSES);
  const [events, setEvents] = useState([]);
  const [defects, setDefects] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [incidents, setIncidents] = useState([]);
  
  const [mapConfig, setMapConfig] = useState({ basemapUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" });

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/config`);
        const json = await res.json();
        if (json.basemap_url) {
          setMapConfig({ basemapUrl: json.basemap_url });
        }
      } catch (err) {
        console.error("Failed to fetch map config", err);
      }
    };
    fetchConfig();

    const fetchPredictions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/predictions`);
        const json = await res.json();
        if (json.success && json.data) {
          const apiEvents = json.data;
          
          if (apiEvents) {
            // Map legacy records to the new schema to prevent Leaflet crash
            const mappedEvents = apiEvents.map((item, idx) => ({
              ...item,
              id: item.id || item._id || `API_EVT_${idx}`,
              latitude: item.latitude || item.lang || 28.6139,
              longitude: item.longitude || item.long || 77.2090,
              type: item.type || "POTHOLE",
              severity: item.severity || "LOW"
            }));
            
            setEvents(mappedEvents);
            setDefects(mappedEvents.filter(e => e.category === 'ROAD_DEFECT'));
          }
        }
      } catch (err) {
        console.error("Failed to fetch predictions", err);
      }
    };
    fetchPredictions();
  }, []);
  
  // Selection drawers / modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [trackingVehicleIncident, setTrackingVehicleIncident] = useState(null);

  // Global search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [mapFilters, setMapFilters] = useState({
    eventType: 'ALL',
    severity: 'ALL',
    timeRange: 'TODAY',
    busId: 'ALL'
  });

  // Notifications & Toast system
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Derive live ticker feed from real events
  const liveTickerFeed = events.slice(0, 5).map(e => ({
    id: e.id,
    time: new Date(e.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    bus: e.busId || 'SYSTEM',
    type: e.type,
    location: e.location || 'Mapped Location'
  }));

  // Interactive Maintenance Workflow State Machine:
  // Detected -> Assigned -> In Progress -> Resolved
  const updateDefectStatus = async (defectId, newStatus, assignedCrew = '') => {
    setDefects(prev => prev.map(d => {
      if (d.id === defectId) {
        const updated = {
          ...d,
          status: newStatus,
          assignedTo: assignedCrew || d.assignedTo || 'Municipal Maintenance Crew 1'
        };
        if (selectedDefect && selectedDefect.id === defectId) {
          setSelectedDefect(updated);
        }
        return updated;
      }
      return d;
    }));

    showToast(`Defect ${defectId} status updated to '${newStatus}'`, 'success');

    // Asynchronously synchronize with backend work orders API
    try {
      const woId = `WO-2026-${defectId.replace(/[^a-zA-Z0-9]/g, '')}`;
      await fetch(`${API_BASE_URL}/api/work-orders/${woId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus.toUpperCase().replace(' ', '_'),
          assigned_crew: assignedCrew || undefined
        })
      });
    } catch (err) {
      console.warn("Backend sync notice:", err);
    }
  };

  // Incident Actions
  const acknowledgeIncident = (incidentId) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updated = { ...inc, status: 'Acknowledged' };
        if (selectedIncident && selectedIncident.id === incidentId) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));
    showToast(`Incident ${incidentId} acknowledged by Operator`, 'success');
  };

  const escalateIncident = (incidentId) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const updated = { ...inc, status: 'Escalated to Traffic Police' };
        if (selectedIncident && selectedIncident.id === incidentId) setSelectedIncident(updated);
        return updated;
      }
      return inc;
    }));
    showToast(`Incident ${incidentId} escalated to Traffic Police Command`, 'warning');
  };

  return (
    <AppContext.Provider value={{
      cityConfig: CITY_CONFIG,
      mapConfig,
      buses,
      events,
      defects,
      infrastructure,
      incidents,
      selectedEvent, setSelectedEvent,
      selectedBus, setSelectedBus,
      selectedDefect, setSelectedDefect,
      selectedIncident, setSelectedIncident,
      trackingVehicleIncident, setTrackingVehicleIncident,
      searchQuery, setSearchQuery,
      mapFilters, setMapFilters,
      liveTickerFeed,
      updateDefectStatus,
      acknowledgeIncident,
      escalateIncident,
      toast,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
