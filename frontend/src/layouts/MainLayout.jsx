import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'City Overview & Live Operations',
  '/prediction': 'AI Media Detection Studio',
  '/gis-map': 'Live GIS Map & Spatial Intelligence',
  '/issues': 'Issue Tracking & Maintenance Orders',
  '/road-conditions': 'Issue Tracking & Maintenance Orders',
  '/infrastructure': 'Issue Tracking & Maintenance Orders',
  '/safety-incidents': 'Issue Tracking & Maintenance Orders',
  '/bus-fleet': 'Fleet Telemetry & Mobile Sensors',
  '/analytics-reports': 'Mobility Analytics & Municipal Reports'
};

export const MainLayout = () => {
  const location = useLocation();
  const { toast } = useApp();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Urban Intelligence Platform';

  return (
    <div className="flex h-screen bg-slate-50/70 text-slate-900 overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/60">
        {/* Top Header */}
        <Header pageTitle={pageTitle} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Toast Notification Popup */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 text-slate-900 text-xs rounded-xl shadow-xl animate-in slide-in-from-bottom-5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            <span className="font-semibold text-slate-800">{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
