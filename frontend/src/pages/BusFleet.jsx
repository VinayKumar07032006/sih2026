import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bus, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Activity,
  Search,
  Wifi,
  Radio,
  MapPin,
  Clock
} from 'lucide-react';
import { FLEET_SUMMARY } from '../data/buses';

export const BusFleet = () => {
  const { buses, selectedBus, setSelectedBus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBuses = buses.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (search && !b.id.toLowerCase().includes(search.toLowerCase()) && !b.routeName.toLowerCase().includes(search.toLowerCase()) && !b.vehicleReg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. TOP BUS FLEET STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Sensing Units</span>
            <Bus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{FLEET_SUMMARY.total}</div>
          <div className="text-[11px] text-blue-600 font-semibold">City transit buses equipped</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Online & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{FLEET_SUMMARY.online}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">84% live data streaming</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Degraded / Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{FLEET_SUMMARY.warning}</div>
          <div className="text-[11px] text-slate-500">Sensor check required</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Detections Logged</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">{FLEET_SUMMARY.eventsTodayTotal}</div>
          <div className="text-[11px] text-slate-500">Transmitted today</div>
        </div>
      </div>

      {/* 2. BUS FLEET MONITORING TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mobile Sensing Fleet Status</h3>
            <p className="text-xs text-slate-500">Real-time telemetry and edge health on municipal transit units</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search bus, route, plate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online</option>
              <option value="WARNING">Warning</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Bus ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Assigned Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Hardware Health</th>
                <th className="py-3 px-4">Network</th>
                <th className="py-3 px-4">Events Today</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBuses.map((bus) => {
                let statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                if (bus.status === 'WARNING') statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
                if (bus.status === 'OFFLINE') statusBadge = "bg-slate-100 text-slate-600 border-slate-200";

                return (
                  <tr 
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{bus.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-medium">{bus.vehicleReg}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{bus.routeId}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${statusBadge}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {bus.status === 'OFFLINE' ? '—' : `${bus.speed} km/h`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${
                        bus.edgeAiHealth === 'OPTIMAL' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bus.edgeAiHealth === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {bus.edgeAiHealth}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{bus.network}</td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{bus.eventsToday}</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBus(bus);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. BUS TELEMETRY INSPECTION MODAL */}
      {selectedBus && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedBus.id} ({selectedBus.vehicleReg})
                  </h3>
                  <p className="text-xs text-slate-500">{selectedBus.routeName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBus(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hardware Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Current Speed:</span>
                <div className="font-semibold text-slate-900 text-sm">{selectedBus.speed} km/h</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">GPS Coordinates:</span>
                <div className="font-mono text-slate-800">{selectedBus.latitude}, {selectedBus.longitude}</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Device Edge Load:</span>
                <div className="font-semibold text-emerald-700">CPU {selectedBus.cpuLoad}% • GPU {selectedBus.gpuUsage}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Firmware:</span>
                <div className="font-mono text-slate-700">{selectedBus.firmwareVersion}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-semibold text-slate-700">Sensor Health Overview</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">Vision AI</div>
                  <div className="font-bold text-emerald-600 mt-0.5">Active</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">GPS Modem</div>
                  <div className="font-bold text-emerald-600 mt-0.5">Connected</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">4G / 5G Sync</div>
                  <div className="font-bold text-blue-600 mt-0.5">{selectedBus.network}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400">Last sync: <span className="font-medium text-slate-700">{selectedBus.lastSync}</span></span>
              <button onClick={() => setSelectedBus(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
