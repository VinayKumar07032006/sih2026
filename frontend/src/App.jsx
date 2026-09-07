import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

import { Overview } from './pages/Overview';
import { GisMap } from './pages/GisMap';
import { RoadConditions } from './pages/RoadConditions';
import { BusFleet } from './pages/BusFleet';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { Prediction } from './pages/Predection';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Overview />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="gis-map" element={<GisMap />} />
            <Route path="issues" element={<RoadConditions />} />
            <Route path="bus-fleet" element={<BusFleet />} />
            <Route path="analytics-reports" element={<AnalyticsReports />} />

            {/* Backwards-compatible route aliases */}
            <Route path="road-conditions" element={<Navigate to="/issues" replace />} />
            <Route path="infrastructure" element={<Navigate to="/issues" replace />} />
            <Route path="safety-incidents" element={<Navigate to="/issues" replace />} />
            <Route path="traffic-intelligence" element={<Navigate to="/analytics-reports" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}