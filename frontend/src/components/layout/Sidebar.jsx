import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Sparkles, 
  AlertCircle, 
  Bus, 
  BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/prediction', label: 'AI Detection Studio', icon: Sparkles, badge: 'Live AI' },
  { path: '/gis-map', label: 'Live Operations Map', icon: Map },
  { path: '/issues', label: 'Issue & Work Orders', icon: AlertCircle },
  { path: '/bus-fleet', label: 'Fleet Telemetry', icon: Bus },
  { path: '/analytics-reports', label: 'Analytics & Reports', icon: BarChart3 }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white text-slate-700 border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shrink-0 select-none shadow-xs">
      {/* App Branding */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm tracking-tight shadow-md shadow-blue-500/20">
            US
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900">
              UrbanNet
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Mobility Intelligence
            </div>
          </div>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Clean Municipal Operator Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-xs">
            OP
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">City Operations</div>
            <div className="text-[10px] text-slate-400 truncate">Municipal Control</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
