import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Drawer } from '../ui/Drawer';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Menu,
  Clock,
  LogOut,
  Building2,
  LayoutDashboard,
  Layers,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AppHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { userProfile, company, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const calculateDaysLeft = () => {
    if (!company?.trialEndAt) return 7;
    const end = new Date(company.trialEndAt).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <header className="md:hidden sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 px-4 h-15 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 -ml-1.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BrandLogo size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="trial" size="sm" className="hidden xs:inline-flex">
          <Clock className="w-3 h-3 text-sky-600" />
          {calculateDaysLeft()} Hari Trial
        </Badge>
        <Link to="/app/settings" className="min-h-[44px] flex items-center">
          <Avatar name={userProfile?.fullName || 'User'} size="sm" />
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={<BrandLogo size="sm" />}
        position="left"
      >
        <div className="flex flex-col gap-5 text-left py-2">
          {/* Tenant Header card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Perusahaan Aktif
            </span>
            <span className="text-sm font-bold text-slate-900 truncate">
              {company?.name || 'Inisialisasi Perusahaan'}
            </span>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500">Masa Percobaan:</span>
              <span className="font-semibold text-sky-700">{calculateDaysLeft()} Hari Tersisa</span>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Navigasi
            </span>
            <Link
              to="/app/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Dashboard Utama
            </Link>
            <Link
              to="/app/business"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              Perusahaan & Tenant
            </Link>
            <Link
              to="/app/modules"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              Peta Jalan Modul
            </Link>
            <Link
              to="/app/notifications"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              Notifikasi
            </Link>
            <Link
              to="/app/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Pengaturan
            </Link>
          </nav>

          {/* User profile & Logout */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <Avatar name={userProfile?.fullName || 'User'} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {userProfile?.fullName}
                </span>
                <span className="text-xs text-slate-500 truncate">{userProfile?.email}</span>
                <span className="text-[10px] text-blue-700 font-semibold mt-0.5">
                  Role: {userProfile?.role}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
              onClick={handleLogout}
              className="w-full text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
};
