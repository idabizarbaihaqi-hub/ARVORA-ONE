import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Bell,
  Layers,
  LogOut,
  Users,
  Wallet,
  ShoppingBag,
  Package,
  Headphones,
  ShoppingCart,
  FolderKanban,
  FileText,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { userProfile, company, logout, previewSessionActive } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const primaryNavItems = [
    {
      to: '/app/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/app/business',
      label: 'Perusahaan',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      to: '/app/modules',
      label: 'Peta Jalan Modul',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      to: '/app/notifications',
      label: 'Notifikasi',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      to: '/app/settings',
      label: 'Pengaturan',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Upcoming Phase 2 ERP modules
  const upcomingModules = [
    { label: 'HR & Kepegawaian', icon: <Users className="w-4 h-4" /> },
    { label: 'Finance & Akuntansi', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Sales & Penjualan', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Inventory & Stok', icon: <Package className="w-4 h-4" /> },
    { label: 'CRM Pelanggan', icon: <Headphones className="w-4 h-4" /> },
    { label: 'Purchasing', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: 'Projects & Tugas', icon: <FolderKanban className="w-4 h-4" /> },
    { label: 'Laporan Bisnis', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'Dokumen', icon: <FileText className="w-4 h-4" /> },
  ];

  // Calculate days left in trial
  const calculateDaysLeft = () => {
    if (!company?.trialEndAt) return 7;
    const end = new Date(company.trialEndAt).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysLeft = calculateDaysLeft();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none">
      {/* Header / Brand */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
        <BrandLogo size="md" />

        {/* Active Company & Trial Status Pill */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col gap-1.5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tenant Aktif
            </span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {daysLeft} Hari Trial
            </span>
          </div>
          <span className="text-xs font-bold text-slate-900 truncate">
            {company?.name || 'Inisialisasi Perusahaan'}
          </span>
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-left">
        {/* Core Nav */}
        <div className="space-y-1">
          <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </span>
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Upcoming Phase 2 Modules */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Modul Tahap 2
            </span>
            <Badge variant="default" size="sm" className="text-[9px] px-1.5 py-0">
              Coming Soon
            </Badge>
          </div>
          <div className="space-y-0.5 pt-1">
            {upcomingModules.map((mod) => (
              <div
                key={mod.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 cursor-not-allowed select-none hover:bg-slate-50/50"
                title={`${mod.label} dijadwalkan pada Tahap 2 pengembangan ERP`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="opacity-70">{mod.icon}</span>
                  <span className="truncate">{mod.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-slate-100 px-1.5 py-0.2 rounded">
                  Tahap 2
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={userProfile?.fullName || 'User'} size="sm" />
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-slate-900 truncate">
              {userProfile?.fullName || 'Pengguna'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              {userProfile?.role || 'COMPANY_OWNER'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Keluar dari akun"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
