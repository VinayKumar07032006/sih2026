import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  X, 
  UserCheck, 
  Play, 
  CheckSquare,
  Search,
  Filter,
  Siren,
  MapPin,
  ExternalLink,
  Printer,
  FileText,
  Truck
} from 'lucide-react';
import { SEVERITY_BADGES } from '../data/events';
import { WorkOrderModal } from '../components/WorkOrderModal';

export const RoadConditions = () => {
  const { 
    defects, 
    infrastructure, 
    incidents, 
    selectedDefect, 
    setSelectedDefect, 
    updateDefectStatus,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'DEFECTS', 'INFRASTRUCTURE', 'SAFETY'
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [workOrderTarget, setWorkOrderTarget] = useState(null);

  // Combine unified issues
  const allIssues = [
    ...defects.map(d => ({ ...d, category: 'DEFECTS', categoryLabel: 'Road Defect' })),
    ...infrastructure.map(i => ({ 
      id: i.id, 
      type: i.type, 
      location: i.location, 
      busId: i.busId, 
      confidence: i.confidence, 
      severity: i.severity, 
      status: i.status || 'Reported', 
      detectedAt: 'Today', 
      evidenceImage: i.evidenceImage,
      description: i.description,
      assignedTo: i.assignedAuthority,
      category: 'INFRASTRUCTURE',
      categoryLabel: 'Infrastructure'
    })),
    ...incidents.map(inc => ({
      id: inc.id,
      type: inc.type,
      location: inc.location,
      busId: inc.busId,
      confidence: inc.confidence,
      severity: inc.severity,
      status: inc.status || 'Reported',
      detectedAt: inc.timestamp,
      evidenceImage: inc.evidenceImage,
      description: inc.description,
      assignedTo: 'Traffic Police Division',
      offendingVehicle: inc.offendingVehicle,
      category: 'SAFETY',
      categoryLabel: 'Safety & Incident'
    }))
  ];

  const counts = {
    ALL: allIssues.length,
    DEFECTS: defects.length,
    INFRASTRUCTURE: infrastructure.length,
    SAFETY: incidents.length
  };

  const filteredIssues = allIssues.filter(item => {
    if (activeTab !== 'ALL' && item.category !== activeTab) return false;
    if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && item.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchType = item.type.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchId && !matchType && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 0. ACTIONABLE WORK ORDERS HUB BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Actionable Municipal Maintenance & Work Orders Hub</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Mobile Transit Sensing → Field Crew Dispatch
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Move beyond static map pins. Auto-generate official, printable PWD Work Orders with live GPS coordinates, high-res edge AI visual evidence, priority SLA response windows, and material requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl px-4 py-2.5 text-center">
            <div className="text-lg font-mono font-bold text-emerald-400">
              {allIssues.filter(i => i.status === 'Assigned' || i.status === 'In Progress').length}
            </div>
            <div className="text-[10px] text-slate-300 uppercase font-semibold">Active Work Orders</div>
          </div>
        </div>
      </div>

      {/* 1. TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Reported Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{allIssues.length}</div>
          <div className="text-[11px] text-slate-500">Across all municipal sectors</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Critical Severity</span>
            <Siren className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {allIssues.filter(i => i.severity === 'CRITICAL').length}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold">Immediate attention needed</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Work Orders Dispatched</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {allIssues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold">Crews currently in field</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Resolved This Week</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {allIssues.filter(i => i.status === 'Resolved').length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Verified repaired & closed</div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Category Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'ALL', label: 'All Issues', count: counts.ALL },
            { id: 'DEFECTS', label: 'Road Defects', count: counts.DEFECTS },
            { id: 'INFRASTRUCTURE', label: 'Infrastructure', count: counts.INFRASTRUCTURE },
            { id: 'SAFETY', label: 'Safety & Incidents', count: counts.SAFETY }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by ID, type, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Severity:</span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="detected">Detected</option>
                <option value="assigned">Assigned</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED DATA TABLE WITH WORK ORDER ACTIONS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Issue ID</th>
                <th className="py-3 px-4">Type & Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Sensing Unit</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Work Order & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((item) => {
                let statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
                if (item.status === 'Assigned') statusBadge = "bg-blue-50 text-blue-800 border-blue-200";
                if (item.status === 'In Progress') statusBadge = "bg-purple-50 text-purple-800 border-purple-200";
                if (item.status === 'Resolved') statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";

                return (
                  <tr 
                    key={item.id}
                    onClick={() => setSelectedDefect(item)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.type}</div>
                      <div className="text-[10px] text-slate-400">{item.categoryLabel}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.location}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-mono text-[11px]">
                        {item.busId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={SEVERITY_BADGES[item.severity] || "bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded"}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-semibold ${statusBadge}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setWorkOrderTarget(item)}
                          className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition shadow-2xs"
                          title="Generate Printable Work Order"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Work Order</span>
                        </button>

                        <button 
                          onClick={() => setSelectedDefect(item)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs px-1.5 py-1"
                        >
                          Inspect →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DETAIL & WORK ORDER DRAWER MODAL */}
      {selectedDefect && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono text-blue-600 font-bold">{selectedDefect.id}</div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDefect.type} Record</h3>
              </div>
              <button 
                onClick={() => setSelectedDefect(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Progression Stepper */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Maintenance Lifecycle
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { state: 'Detected', active: selectedDefect.status === 'Detected' },
                  { state: 'Assigned', active: selectedDefect.status === 'Assigned' },
                  { state: 'In Progress', active: selectedDefect.status === 'In Progress' },
                  { state: 'Resolved', active: selectedDefect.status === 'Resolved' }
                ].map(s => (
                  <div key={s.state} className={`p-2 rounded-lg font-semibold transition ${
                    s.active 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-400'
                  }`}>
                    {s.state}
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Image & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                <img 
                  src={selectedDefect.evidenceImage} 
                  alt="Issue Evidence" 
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs text-emerald-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 shadow-xs">
                  AI Confidence: {(selectedDefect.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-900">{selectedDefect.location}</span></div>
                  <div><span className="text-slate-400">Sensing Bus:</span> <span className="font-mono text-blue-600 font-bold">{selectedDefect.busId}</span></div>
                  <div><span className="text-slate-400">Assigned Agency:</span> <span className="font-semibold text-slate-800">{selectedDefect.assignedTo || 'Municipal Maintenance Crew'}</span></div>
                  {selectedDefect.offendingVehicle && (
                    <div className="pt-1 border-t border-slate-200">
                      <span className="text-slate-400">Offending Vehicle:</span>
                      <span className="font-mono font-bold text-rose-600 ml-1">{selectedDefect.offendingVehicle.registrationNo}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 italic leading-relaxed">
                  "{selectedDefect.description}"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2.5 justify-between items-center">
              <div>
                <button
                  onClick={() => {
                    setWorkOrderTarget(selectedDefect);
                    setSelectedDefect(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Generate Work Order</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedDefect.status === 'Detected' && (
                  <button 
                    onClick={() => updateDefectStatus(selectedDefect.id, 'Assigned', 'Municipal Asphalt Crew 1')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" /> Assign Crew
                  </button>
                )}

                {(selectedDefect.status === 'Assigned' || selectedDefect.status === 'Detected') && (
                  <button 
                    onClick={() => updateDefectStatus(selectedDefect.id, 'In Progress')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Play className="w-4 h-4" /> In Progress
                  </button>
                )}

                {selectedDefect.status !== 'Resolved' && (
                  <button 
                    onClick={() => updateDefectStatus(selectedDefect.id, 'Resolved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <CheckSquare className="w-4 h-4" /> Resolved
                  </button>
                )}

                <button 
                  onClick={() => setSelectedDefect(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL PRINTABLE WORK ORDER MODAL */}
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
