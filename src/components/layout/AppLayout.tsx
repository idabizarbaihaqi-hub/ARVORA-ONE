import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/LoadingState';
import { Alert } from '../ui/Alert';
import { Info, Database } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { authUser, userProfile, isLoading, isFirebaseConfigured, previewSessionActive } = useAuth();

  if (isLoading) {
    return <LoadingState fullScreen message="Menyiapkan sesi aplikasi ARVORA ONE..." />;
  }

  // If not authenticated and not in a preview session, redirect to login
  if (!authUser && !userProfile && !previewSessionActive) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <AppHeader />

        {/* Informative Firebase Config Banner if running in design preview or unconfigured */}
        {!isFirebaseConfigured && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-medium">
                Koneksi Firebase Cloud belum terkonfigurasi. Aplikasi berjalan dalam mode fondasi arsitektur lokal.
              </span>
            </div>
            <span className="shrink-0 text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-bold">
              Tahap 1 Fondasi
            </span>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
