import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, 
  MapPin, 
  Bus, 
  AlertTriangle, 
  ShieldAlert, 
  Siren, 
  X, 
  Zap,
  CheckCircle2,
  Printer,
  FileText
} from 'lucide-react';
import { SEVERITY_BADGES } from '../data/events';
import { WorkOrderModal } from '../components/WorkOrderModal';

const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const GisMap = () => {
  const { 
    cityConfig, 
    buses, 
    events, 
    selectedEvent, 
    setSelectedEvent,
    mapFilters,
    setMapFilters,
    mapConfig,
    updateDefectStatus,
    showToast
  } = useApp();

  const [workOrderTarget, setWorkOrderTarget] = useState(null);

  const [activeLayers, setActiveLayers] = useState({
    buses: true,
    defects: true,
    infrastructure: true,
    incidents: true
  });

  const filteredEvents = events.filter(evt => {
    if (mapFilters.eventType !== 'ALL' && evt.type !== mapFilters.eventType) return false;
    if (mapFilters.severity !== 'ALL' && evt.severity !== mapFilters.severity) return false;
    if (mapFilters.busId !== 'ALL' && evt.busId !== mapFilters.busId) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 relative">
      {/* LEFT FILTER & CONTROL PANEL */}
      <div className="w-full lg:w-80 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">Map Layers & Filters</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
            Live Spatial
          </span>
        </div>

        {/* LAYER TOGGLES */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Display Layers</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setActiveLayers(p => ({ ...p, buses: !p.buses }))}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                activeLayers.buses 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5"><Bus className="w-3.5 h-3.5" /> Buses</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            <button
              onClick={() => setActiveLayers(p => ({ ...p, defects: !p.defects }))}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                activeLayers.defects 
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Defects</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </button>

            <button
              onClick={() => setActiveLayers(p => ({ ...p, infrastructure: !p.infrastructure }))}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                activeLayers.infrastructure 
                  ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Infra</span>
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            </button>

            <button
              onClick={() => setActiveLayers(p => ({ ...p, incidents: !p.incidents }))}
              className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                activeLayers.incidents 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5"><Siren className="w-3.5 h-3.5" /> Safety</span>
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            </button>
          </div>
        </div>

        {/* EVENT TYPE FILTER */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Issue Category</label>
          <select
            value={mapFilters.eventType}
            onChange={(e) => setMapFilters(p => ({ ...p, eventType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="POTHOLE">Pothole</option>
            <option value="DAMAGED_ROAD">Damaged Road</option>
            <option value="WATERLOGGING">Waterlogging</option>
            <option value="MISSING_DIVIDER">Missing Divider</option>
            <option value="MISSING_ZEBRA_CROSSING">Missing Zebra Crossing</option>
            <option value="DAMAGED_SIGNBOARD">Damaged Signboard</option>
            <option value="TRAFFIC_BOTTLENECK">Traffic Bottleneck</option>
            <option value="HIT_AND_RUN">Hit and Run Incident</option>
            <option value="RASH_DRIVING">Rash Driving</option>
          </select>
        </div>

        {/* SEVERITY FILTER */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Severity</label>
          <select
            value={mapFilters.severity}
            onChange={(e) => setMapFilters(p => ({ ...p, severity: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* SUMMARY STATS */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Visible Events:</span>
            <span className="font-bold text-slate-900">{filteredEvents.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Online Buses:</span>
            <span className="font-semibold text-blue-600">42 Units Active</span>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN MAP VIEW */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs relative">
        <MapContainer
          center={cityConfig.center}
          zoom={cityConfig.zoom}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url={mapConfig.basemapUrl}
            attribution="&copy; OpenStreetMap & CartoDB"
          />

          {/* BUS MARKERS */}
          {activeLayers.buses && buses.map(bus => (
            <Marker
              key={bus.id}
              position={[bus.latitude, bus.longitude]}
              icon={createCustomIcon(bus.status === 'ONLINE' ? '#2563eb' : '#f59e0b', '🚌')}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-blue-600">{bus.id} • {bus.vehicleReg}</div>
                  <div className="text-slate-700">Route: {bus.routeName}</div>
                  <div className="text-slate-700">Speed: {bus.speed} km/h</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* DETECTED EVENTS MARKERS */}
          {filteredEvents.map(evt => {
            let color = '#f59e0b';
            let iconSymbol = '!';
            if (evt.severity === 'CRITICAL') { color = '#dc2626'; iconSymbol = '🚨'; }
            else if (evt.type === 'POTHOLE') { color = '#ea580c'; iconSymbol = '🕳️'; }
            else if (evt.type === 'WATERLOGGING') { color = '#0284c7'; iconSymbol = '🌊'; }
            else if (evt.type === 'MISSING_DIVIDER') { color = '#9333ea'; iconSymbol = '🚧'; }

            return (
              <Marker
                key={evt.id}
                position={[evt.latitude, evt.longitude]}
                icon={createCustomIcon(color, iconSymbol)}
                eventHandlers={{
                  click: () => setSelectedEvent(evt)
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <div className="font-bold text-slate-900">{evt.id} — {evt.type}</div>
                    <div className="text-slate-600">Location: {evt.location}</div>
                    <div className="text-slate-600">Confidence: {(evt.confidence * 100).toFixed(1)}%</div>
                    <button 
                      onClick={() => setSelectedEvent(evt)}
                      className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold w-full transition"
                    >
                      View Details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* MAP LEGEND OVERLAY */}
        <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-200/80 rounded-2xl p-3 shadow-lg text-xs text-slate-700 z-[1000] space-y-1.5 backdrop-blur-xs">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px]">
            Map Legend
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Transit Bus</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Critical Event</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Defect</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Infrastructure</span>
          </div>
        </div>

        {/* EVENT DETAIL DRAWER */}
        {selectedEvent && (
          <div className="absolute top-4 right-4 w-96 bg-white/98 border border-slate-200/90 rounded-2xl p-5 shadow-2xl z-[1000] text-xs text-slate-800 space-y-4 backdrop-blur-xs animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-mono font-bold text-blue-600">{selectedEvent.id}</span>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">{selectedEvent.type}</div>
              <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> {selectedEvent.location}
              </div>
            </div>

            {/* Evidence Image Snapshot */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img 
                src={selectedEvent.evidenceImage} 
                alt="Detection Snapshot"
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] text-emerald-700 font-mono font-bold border border-emerald-200 shadow-2xs">
                Confidence: {(selectedEvent.confidence * 100).toFixed(1)}%
              </div>
            </div>

            {/* Telemetry Breakdown */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[10px]">Bus:</span>
                <div className="font-bold text-blue-600 font-mono">{selectedEvent.busId}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Severity:</span>
                <div>
                  <span className={SEVERITY_BADGES[selectedEvent.severity] || "bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded"}>
                    {selectedEvent.severity}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {selectedEvent.description}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => {
                  setWorkOrderTarget(selectedEvent);
                  setSelectedEvent(null);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Work Order Ticket</span>
              </button>

              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WORK ORDER MODAL */}
      {workOrderTarget && (
        <WorkOrderModal 
          issue={workOrderTarget}
          onClose={() => setWorkOrderTarget(null)}
          onStatusUpdate={updateDefectStatus}
          showToast={showToast}
        />
      )}
    </div>
  );
};
