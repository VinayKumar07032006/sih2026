import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Map, 
  Download, 
  FileText, 
  Calendar, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  ORIGIN_DESTINATION_MATRIX, 
  ACTIONABLE_URBAN_INSIGHTS, 
  REPORT_TYPES
} from '../data/analytics';
import { ROUTE_PERFORMANCE } from '../data/traffic';

export const AnalyticsReports = () => {
  const { showToast } = useApp();
  const [timeFilter, setTimeFilter] = useState('7_DAYS');
  const [selectedReport, setSelectedReport] = useState('ROAD_DEFECTS');
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateReport = (format) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast(`Generated & Downloaded Municipal ${format} Report successfully.`, 'success');
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & TIME FILTER BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Mobility Analytics & Municipal Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated traffic intelligence and defect distribution from transit mobile sensing units.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {['TODAY', '7_DAYS', '30_DAYS', 'ALL_TIME'].map(t => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeFilter === t ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ACTIONABLE MUNICIPAL INSIGHTS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Key Findings & Corrective Recommendations</h3>
            <p className="text-xs text-slate-500">Action items identified from spatial pattern telemetry</p>
          </div>
          <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-xl">
            {ACTIONABLE_URBAN_INSIGHTS.length} Active Findings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIONABLE_URBAN_INSIGHTS.map(insight => (
            <div key={insight.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2 hover:bg-slate-50 hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{insight.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  insight.urgency === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {insight.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{insight.summary}</p>
              <div className="pt-2 border-t border-slate-200/60 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Action: {insight.recommendedAction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ORIGIN-DESTINATION (OD) MATRIX */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Origin-Destination (OD) Traffic Flow Matrix</h3>
            <p className="text-xs text-slate-500">Peak hour trip volume distribution across municipal sectors (Vehicles / Hr)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px]">
              <tr>
                <th className="p-3 text-left border border-slate-200 font-bold">Origin \ Destination</th>
                {ORIGIN_DESTINATION_MATRIX.zones.map(z => (
                  <th key={z} className="p-3 border border-slate-200 font-bold">{z.split(' ')[1]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORIGIN_DESTINATION_MATRIX.matrix.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80">
                  <td className="p-3 text-left font-bold text-slate-900 bg-slate-50 border border-slate-200">
                    {ORIGIN_DESTINATION_MATRIX.zones[rIdx]}
                  </td>
                  {row.map((val, cIdx) => {
                    let bg = "bg-white";
                    if (val > 400) bg = "bg-rose-50 text-rose-700 font-bold border border-rose-200";
                    else if (val > 250) bg = "bg-amber-50 text-amber-800 font-bold border border-amber-200";
                    else if (val > 0) bg = "bg-slate-50/60 text-slate-700 border border-slate-200";

                    return (
                      <td key={cIdx} className={`p-3 font-mono ${bg}`}>
                        {val === 0 ? '—' : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Traffic Corridors */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-700 mb-2">High-Density Corridors</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ORIGIN_DESTINATION_MATRIX.topCorridors.map(cor => (
              <div key={cor.rank} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="font-bold text-blue-700">#{cor.rank} {cor.corridor}</div>
                <div className="text-slate-800 font-semibold font-mono">{cor.volume}</div>
                <div className="text-[11px] text-slate-500">{cor.flowRate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ROUTE DELAY ANALYTICS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transit Fleet Route Delays</h3>
            <p className="text-xs text-slate-500">Real-time schedule variance across major routes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Standard Time</th>
                <th className="py-2.5 px-3">Current Observed</th>
                <th className="py-2.5 px-3">Delay Variance</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROUTE_PERFORMANCE.map((route, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-semibold text-slate-900">{route.route}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{route.normalTime}</td>
                  <td className="py-3 px-3 text-slate-800 font-mono font-semibold">{route.currentTime}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">{route.delay}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      route.status === 'Delayed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MUNICIPAL REPORT GENERATOR & EXPORT TOOL */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Municipal Report Export</h3>
            <p className="text-xs text-slate-500">Generate certified PDF executive briefings or export raw CSV data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REPORT_TYPES.map(rep => (
            <div 
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2.5 ${
                selectedReport === rep.id 
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs' 
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="font-bold text-xs text-slate-900">{rep.title}</div>
                <p className="text-[11px] text-slate-500 mt-1">{rep.desc}</p>
              </div>
              <div className="text-[11px] text-blue-600 font-semibold pt-2 border-t border-slate-200/60">
                {selectedReport === rep.id ? '✓ Selected for export' : 'Click to select'}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Selected: <span className="font-bold text-slate-900">{REPORT_TYPES.find(r => r.id === selectedReport)?.title}</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => handleGenerateReport('PDF')}
              disabled={isExporting}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Briefing</span>
            </button>
            <button
              onClick={() => handleGenerateReport('CSV')}
              disabled={isExporting}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
