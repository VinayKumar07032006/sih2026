import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_BUSES } from '../data/buses';
import { MOCK_EVENTS } from '../data/events';
import { MOCK_DEFECTS } from '../data/defects';
import { MOCK_INFRASTRUCTURE } from '../data/infrastructure';
import { MOCK_INCIDENTS } from '../data/incidents';
import { CITY_CONFIG } from '../data/config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [buses, setBuses] = useState(MOCK_BUSES);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [defects, setDefects] = useState(MOCK_DEFECTS);
  const [infrastructure, setInfrastructure] = useState(MOCK_INFRASTRUCTURE);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  
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
          const apiEvents = json.data.map((item, idx) => ({
            id: item._id || `API_EVT_${idx}`,
            type: "POTHOLE", 
            location: "Live Detection Hotspot",
            latitude: item.lang || 28.6139,
            longitude: item.long || 77.2090,
            severity: item.no_of_predicted > 0 ? "CRITICAL" : "LOW",
            timestamp: item.created_at || new Date().toISOString(),
            confidence: 0.92,
            busId: "USER_UPLOAD",
            description: `User-uploaded media prediction. Detected objects: ${item.no_of_predicted}`,
            evidenceImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"
          }));

          const apiDefects = json.data.map((item, idx) => ({
            id: item._id || `API_DEF_${idx}`,
            type: "Prediction",
            location: "Mapped Location",
            latitude: item.lang || 28.6139,
            longitude: item.long || 77.2090,
            severity: item.no_of_predicted > 0 ? "HIGH" : "LOW",
            detectedAt: item.created_at || new Date().toISOString(),
            status: "Detected",
            description: `Predicted items: ${item.no_of_predicted}`
          }));
          
          setEvents([...apiEvents, ...MOCK_EVENTS]);
          setDefects([...apiDefects, ...MOCK_DEFECTS]);
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

  // Simulated live event ticker feed
  const [liveTickerFeed, setLiveTickerFeed] = useState([
    { id: 'TICK_01', time: '10:32:14', bus: 'BUS_17', type: 'Pothole', location: 'MG Road' },
    { id: 'TICK_02', time: '10:31:52', bus: 'BUS_12', type: 'Waterlogging', location: 'Sector 14' },
    { id: 'TICK_03', time: '10:30:41', bus: 'BUS_31', type: 'Traffic Jam', location: 'Dhaula Kuan' },
    { id: 'TICK_04', time: '10:29:17', bus: 'BUS_07', type: 'Missing Divider', location: 'NH-48' }
  ]);

  // Simulate new incoming event telemetry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBus = buses[Math.floor(Math.random() * buses.length)];
      const eventTypes = [
        { type: 'Pothole detected', category: 'ROAD_DEFECT', severity: 'HIGH' },
        { type: 'Traffic bottleneck detected', category: 'TRAFFIC', severity: 'MEDIUM' },
        { type: 'Waterlogging detected', category: 'ROAD_DEFECT', severity: 'HIGH' },
        { type: 'Missing signboard detected', category: 'INFRASTRUCTURE', severity: 'LOW' }
      ];
      const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newTickerItem = {
        id: `TICK_${Date.now()}`,
        time: nowStr,
        bus: randomBus.id,
        type: selected.type,
        location: randomBus.routeName.split('→')[0] || 'City Corridor'
      };

      setLiveTickerFeed(prev => [newTickerItem, ...prev.slice(0, 5)]);
    }, 12000); // New event every 12 seconds

    return () => clearInterval(interval);
  }, [buses]);

  // Interactive Maintenance Workflow State Machine:
  // Detected -> Assigned -> In Progress -> Resolved
  const updateDefectStatus = (defectId, newStatus, assignedCrew = '') => {
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
