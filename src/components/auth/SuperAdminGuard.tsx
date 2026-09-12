import React, { type ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

interface SuperAdminGuardProps {
  children: ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const { authUser, userProfile, isSuperAdmin, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-sm font-medium tracking-wide">Memvalidasi Otoritas Super Admin ARVORA ONE...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated at all, redirect to login with intent
  if (!authUser) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user is logged in but NOT a verified platform Super Admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div
          id="super-admin-access-denied"
          className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
              403 • Akses Platform Dibatasi
            </span>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Akses Khusus Super Admin
            </h1>

            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Konsol Super Admin ARVORA ONE dilindungi oleh otorisasi tingkat platform. Akun Anda tidak memiliki hak istimewa platform Super Admin.
            </p>

            <div className="mt-5 w-full bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Email Akun:</span>
                <span className="text-slate-300 font-mono font-medium">{authUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role Tenant:</span>
                <span className="text-amber-400 font-medium">{userProfile?.role || 'MEMBER'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perusahaan:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{userProfile?.companyName || 'Belum Terhubung'}</span>
              </div>
            </div>

            <div className="mt-6 w-full space-y-2.5">
              <Link
                to="/app/dashboard"
                id="btn-return-company"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard Perusahaan
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                id="btn-logout-denied"
                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Keluar Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
