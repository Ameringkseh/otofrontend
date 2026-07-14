import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import TambahAgenda from './pages/TambahAgenda';
import TouringSaya from './pages/TouringSaya';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tambah-agenda" element={<TambahAgenda />} />
            <Route path="touring-saya" element={<TouringSaya />} />
            <Route path="forum" element={<Forum />} />
            <Route path="profil" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;