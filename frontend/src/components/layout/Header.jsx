import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Clock, 
  Activity,
  Sparkles
} from 'lucide-react';

export const Header = ({ pageTitle }) => {
  const { searchQuery, setSearchQuery, liveTickerFeed } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-30">
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center space-x-3.5">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search bus, defect, street, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Launch Action: Run AI Model */}
        <Link
          to="/prediction"
          className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run AI Detection</span>
        </Link>

        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 space-x-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
          <span className="font-semibold text-slate-800">{formattedTime}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Live Alerts</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 font-bold px-1.5 py-0.5 rounded-md">4 New</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {liveTickerFeed.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50 transition flex items-start gap-2.5">
                    <Activity className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">{item.type}</div>
                      <div className="text-[11px] text-slate-500">Bus <span className="font-medium text-slate-700">{item.bus}</span> • {item.location}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
