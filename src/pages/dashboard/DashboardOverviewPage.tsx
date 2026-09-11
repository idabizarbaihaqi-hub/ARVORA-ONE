import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bell,
  Layers,
  Settings,
  FolderOpen,
  Receipt,
  Package,
  TrendingUp,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { userProfile, company, authUser } = useAuth();

  // Calculate days left in 7-day trial
  const calculateDaysLeft = () => {
    if (!company?.trialEndAt) return 7;
    const end = new Date(company.trialEndAt).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Ikhtisar"
        description="Fondasi operasional dan tata kelola perusahaan dalam arsitektur multi-tenant ARVORA ONE."
        badge={
          <Badge variant="trial" size="md">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            7 Hari Free Trial ({daysLeft} Hari Tersisa)
          </Badge>
        }
        action={
          <Link to="/app/business">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Building2 className="w-4 h-4 text-blue-700" />}
            >
              Profil Perusahaan
            </Button>
          </Link>
        }
      />

      {/* Primary Tenant & Account Status Invariant Cards (Authentic Real Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Perusahaan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
            {company?.name || 'Inisialisasi...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate font-mono">
            ID: {company?.id || 'comp_pending'}
          </div>
        </Card>

        {/* User Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pengguna Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
            {userProfile?.fullName || 'Pengguna'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {userProfile?.email || authUser?.email || '-'}
          </div>
        </Card>

        {/* Role Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Peran (RBAC)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900">
            {userProfile?.role || 'COMPANY_OWNER'}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-600 font-medium">
              Status: {userProfile?.accountStatus || 'active'}
            </span>
          </div>
        </Card>

        {/* Subscription & Trial Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Langganan
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900">
            {company?.subscriptionPlan || 'TRIAL'}
          </div>
          <div className="text-[11px] text-sky-700 font-semibold mt-1">
            Masa Percobaan: {daysLeft} Hari Tersisa
          </div>
        </Card>
      </div>

      {/* Multi-Tenant Security & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tenant Overview & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Aksi Cepat & Pengaturan Tenant"
              subtitle="Kelola konfigurasi organisasi dan pelajari struktur isolasi data."
            />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/app/business"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Kelola Profil Tenant
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Lihat informasi legal, ID tenant, dan struktur kepemilikan.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/modules"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Peta Jalan Modul ERP
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tinjau modul lanjutan yang dipersiapkan untuk Tahap 2.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/settings"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Pengaturan Keamanan
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Periksa status token auth, role permissions, dan konfigurasi cloud.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/notifications"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Pusat Notifikasi
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pengumuman sistem dan log aktivitas tenant terkini.
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Authentic Empty States for ERP Modules (Strict Zero Fake Data Rule) */}
          <Card>
            <CardHeader
              title="Operasional & Modul Bisnis"
              subtitle="Data riil perusahaan pada tahap fondasi awal."
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center text-center">
                  <Users className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Karyawan</span>
                  <span className="text-lg font-extrabold text-slate-900 my-1">
                    {company?.memberCount || 1}
                  </span>
                  <span className="text-[11px] text-slate-500">1 Terdaftar (Owner)</span>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center text-center">
                  <Receipt className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Transaksi Keuangan</span>
                  <span className="text-lg font-extrabold text-slate-900 my-1">0</span>
                  <span className="text-[11px] text-slate-500">Belum ada transaksi</span>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center text-center">
                  <Package className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Barang / Stok</span>
                  <span className="text-lg font-extrabold text-slate-900 my-1">0</span>
                  <span className="text-[11px] text-slate-500">Belum ada item inventaris</span>
                </div>
              </div>

              {/* Module Foundation Empty State Notice */}
              <EmptyState
                title="Modul ERP Lengkap Belum Aktif"
                description="Modul HR, Finance, Inventory, Sales, CRM, dan Purchasing sengaja belum dibuat pada Tahap 1 untuk menjaga fondasi tetap solid dan siap diekspansi pada Tahap 2."
                icon={<Layers className="w-6 h-6 text-blue-600" />}
                action={
                  <Link to="/app/modules">
                    <Button variant="outline" size="sm">
                      Lihat Peta Jalan Tahap 2
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Notification Area & Tenant Info */}
        <div className="space-y-6">
          {/* Notification Area */}
          <Card>
            <CardHeader
              title="Notifikasi Sistem"
              subtitle="Pemberitahuan resmi tenant"
              action={
                <Badge variant="primary" size="sm">
                  1 Info
                </Badge>
              }
            />
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block">Selamat Datang di ARVORA ONE</span>
                  Tenant <span className="font-semibold">{company?.name}</span> telah berhasil diinisialisasi
                  dengan paket 7 Hari Free Trial.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block">Isolasi Keamanan Aktif</span>
                  Data organisasi Anda dikunci dengan Firestore Security Rules bertaraf enterprise.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Tenant Scope Summary */}
          <Card>
            <CardHeader
              title="Parameter Isolasi Tenant"
              subtitle="Spesifikasi keamanan aktif"
            />
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tenant ID</span>
                <span className="font-mono font-bold text-slate-800">
                  {company?.id || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Slug Organisasi</span>
                <span className="font-mono text-slate-800">{company?.slug || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Masa Evaluasi</span>
                <span className="font-semibold text-emerald-700">7 Hari Aktif</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Role Pemilik</span>
                <span className="font-semibold text-blue-700">COMPANY_OWNER</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Status Gateway</span>
                <span className="text-slate-400 font-medium">Tahap Berikutnya</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
