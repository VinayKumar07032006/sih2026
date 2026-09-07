import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar
} from 'recharts';
import { 
  Bus, 
  AlertTriangle, 
  Car, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { HOURLY_TRAFFIC_TREND } from '../data/traffic';
import { DEFECTS_OVER_TIME_TREND } from '../data/analytics';
import { SEVERITY_BADGES } from '../data/events';

const createCustomIcon = (color, label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
        ${label}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const Overview = () => {
  const { 
    cityConfig, 
    mapConfig,
    buses, 
    events, 
    defects, 
    incidents, 
    setSelectedEvent
  } = useApp();

  const activeBuses = buses.filter(b => b.status === 'ONLINE').length;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const pendingDefects = defects.filter(d => d.status !== 'Resolved').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. WELCOME & OPERATIONS BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Live & Sensing • {cityConfig.cityName}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Municipal Command & Mobility Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time urban surveillance and road quality telemetry powered by {buses.length} public transport mobile sensing units.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/prediction"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload Media & Test AI</span>
          </Link>
          <Link
            to="/gis-map"
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200/80 transition"
          >
            <span>Open Map</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 2. FOUR PRIMARY OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Sensing Fleet</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeBuses}</span>
            <span className="text-xs text-slate-400 font-medium">/ {buses.length} online</span>
          </div>
          {/* <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>84% fleet telemetry coverage</span>
          </div> */}
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Road Defects Detected</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{defects.length}</span>
            <span className="text-xs text-amber-600 font-medium">{pendingDefects} pending repair</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {/* 82 Potholes • 31 Waterlogging */}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Traffic Congestion Index</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">68<span className="text-sm font-normal text-slate-400">/100</span></span>
            <span className="text-xs text-cyan-700 font-medium">Moderate Peak</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {/* 18 active bottleneck zones */}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500">Safety & Critical Events</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{criticalIncidentsCount}</span>
            <span className="text-xs text-rose-600 font-medium">High priority</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {/* 3 hit-and-run vehicles tracked */}
          </div>
        </div>
      </div>

      {/* 3. SPLIT SECTION: LIVE MAP PREVIEW vs REAL-TIME INCIDENT FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map ~65% */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Spatial Operations</h3>
              <p className="text-xs text-slate-500">Real-time bus sensors and detected road issues</p>
            </div>
            <Link 
              to="/gis-map" 
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Interactive Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full h-88 rounded-xl overflow-hidden border border-slate-200/80 relative">
            <MapContainer
              center={cityConfig.center}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url={mapConfig.basemapUrl}
                attribution="&copy; OpenStreetMap & CartoDB"
              />

              {/* Render Bus Markers */}
              {buses.slice(0, 15).map(bus => (
                <Marker
                  key={bus.id}
                  position={[bus.latitude, bus.longitude]}
                  icon={createCustomIcon(bus.status === 'ONLINE' ? '#2563eb' : '#f59e0b', 'B')}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <div className="font-bold text-blue-600">{bus.id}</div>
                      <div className="text-slate-600">Route: {bus.routeId}</div>
                      <div className="text-slate-600">Speed: {bus.speed} km/h</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Render Defect Markers */}
              {defects.slice(0, 8).map(def => (
                <Marker
                  key={def.id}
                  position={[def.latitude, def.longitude]}
                  icon={createCustomIcon('#ef4444', '!')}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <div className="font-bold text-rose-600">{def.type}</div>
                      <div className="text-slate-600">Location: {def.location}</div>
                      <div className="text-slate-600">Confidence: {(def.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-xl px-3 py-2 text-[11px] text-slate-700 z-[1000] flex items-center space-x-3 shadow-md">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Bus Unit
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Defect Alert
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Alerts Feed ~35% */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Incident Feed</h3>
              <p className="text-xs text-slate-500">Recent automated detections</p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">
              Streaming
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {events.slice(0, 5).map(evt => (
              <div 
                key={evt.id} 
                onClick={() => setSelectedEvent(evt)}
                className="pt-2 hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={SEVERITY_BADGES[evt.severity] || "bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded"}>
                      {evt.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{evt.type}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Bus <span className="font-semibold text-slate-800">{evt.busId}</span> • {evt.location}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {evt.timeAgo}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link 
              to="/issues"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1 w-full text-center"
            >
              View all detected issues ({events.length}) →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. CHARTS: TRAFFIC VOLUME & ROAD DEFECT TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Traffic Density & Fleet Speed</h3>
              <p className="text-xs text-slate-500">24-hour citywide congestion trend</p>
            </div>
            <span className="text-xs text-slate-600 font-medium">Avg Speed: 32 km/h</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_TRAFFIC_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="densityIndex" stroke="#2563eb" strokeWidth={2.5} name="Traffic Index" dot={false} />
                <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} name="Fleet Speed (km/h)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Road Defects Detected by Category</h3>
              <p className="text-xs text-slate-500">Weekly accumulation trend</p>
            </div>
            <span className="text-xs text-slate-600 font-medium">Total: 167 Issues</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFECTS_OVER_TIME_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="potholes" fill="#f59e0b" name="Potholes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waterlogging" fill="#06b6d4" name="Waterlogging" radius={[4, 4, 0, 0]} />
                <Bar dataKey="infrastructure" fill="#8b5cf6" name="Infrastructure" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. RECENT DETECTIONS LOG */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent AI-Detected Events</h3>
            <p className="text-xs text-slate-500">Automated mobile computer vision detection logs</p>
          </div>
          <Link to="/issues" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
            Manage All Issues →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Issue Type</th>
                <th className="py-2.5 px-3">Sensing Bus</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.slice(0, 6).map((evt) => (
                <tr 
                  key={evt.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setSelectedEvent(evt)}
                >
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{evt.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{evt.type}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{evt.busId}</td>
                  <td className="py-3 px-3 text-slate-700">{evt.location}</td>
                  <td className="py-3 px-3">
                    <span className={SEVERITY_BADGES[evt.severity] || "bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded"}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-emerald-600">
                    {(evt.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{evt.timeAgo || evt.timestamp}</td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold">
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
