import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { Link } from 'react-router-dom';
import { getCompanyAuditLogs, getCompanyMembers } from '../../firebase/firestore';
import type { AuditLog, CompanyMember } from '../../types';
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
  Sparkles,
  AlertTriangle,
  Lock,
  CreditCard,
  ShieldAlert,
  Activity,
  History,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { userProfile, company, authUser, isSuperAdmin, platformRole, companyRole } = useAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (company?.id) {
      setLoadingActivity(true);
      Promise.all([
        getCompanyAuditLogs(company.id, 6),
        getCompanyMembers(company.id),
      ])
        .then(([logs, mems]) => {
          if (isMounted) {
            setRecentLogs(logs || []);
            setMembers(mems || []);
          }
        })
        .catch((err) => {
          console.warn('Notice: loading company overview activity:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingActivity(false);
        });
    } else {
      setLoadingActivity(false);
    }
    return () => {
      isMounted = false;
    };
  }, [company?.id]);

  // Calculate days left in 7-day trial
  const calculateDaysLeft = () => {
    if (!company?.trialEndAt) return 7;
    const end = new Date(company.trialEndAt).getTime();
    const now = Date.now();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysLeft = calculateDaysLeft();
  const isTrial = company?.status === 'TRIAL' || company?.subscriptionStatus === 'TRIAL';
  const isExpired = company?.status === 'EXPIRED' || (isTrial && daysLeft === 0);
  const isSuspended = company?.status === 'SUSPENDED';

  return (
    <div className="space-y-6 text-left">
      {/* SUPER ADMIN PLATFORM SHORTCUT BANNER */}
      {isSuperAdmin && (
        <div className="p-3.5 bg-slate-900 border border-red-500/30 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Platform Super Admin
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-300 rounded font-mono">
                  PLATFORM_ROLE: SUPER_ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Anda memiliki hak istimewa Super Admin platform ARVORA ONE di atas tenant ini.
              </p>
            </div>
          </div>
          <Link to="/super-admin">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-white bg-red-600 hover:bg-red-700 border-red-500 shrink-0"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
            >
              Buka Konsol Super Admin
            </Button>
          </Link>
        </div>
      )}

      {/* SUSPENDED LOCK ALERT */}
      {isSuspended && (
        <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-2xl text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Tenant Ditangguhkan (Suspended)</h3>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                Akses perusahaan ini sementara ditangguhkan oleh Super Admin. Anda dapat melihat informasi dasar, namun pengubahan data terkunci.
              </p>
            </div>
          </div>
          <Link to="/app/settings">
            <Button variant="outline" size="sm" className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100">
              Lihat Detail Pengaturan
            </Button>
          </Link>
        </div>
      )}

      {/* EXPIRED LOCK BANNER */}
      {isExpired && !isSuspended && (
        <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-2xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Masa Percobaan 7 Hari Telah Selesai</h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Free trial untuk tenant <strong>{company?.name}</strong> telah habis. Hubungi konsultan untuk mengaktifkan paket resmi perusahaan.
              </p>
            </div>
          </div>
          <Link to="/app/billing">
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Aktifkan Paket Sekarang
            </Button>
          </Link>
        </div>
      )}

      {/* ACTIVE 7-DAY TRIAL PROMINENT BANNER */}
      {isTrial && !isExpired && !isSuspended && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 text-blue-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider text-blue-100">
                  7 Hari Free Trial Aktif
                </span>
                <span className="text-xs font-semibold text-blue-200">
                  Sisa {daysLeft} Hari
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
                Masa Percobaan Tenant Berakhir pada{' '}
                {company?.trialEndAt
                  ? new Date(company.trialEndAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '7 hari mendatang'}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Akses penuh ke seluruh fitur isolasi tenant, hak akses anggota tim, dan keamanan tanpa biaya komitmen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link to="/app/billing" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              >
                Pilihan Paket & Upgrade
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Dashboard Ikhtisar"
        description="Fondasi operasional dan tata kelola perusahaan dalam arsitektur multi-tenant ARVORA ONE."
        badge={
          <Badge variant={company?.status === 'ACTIVE' ? 'success' : 'trial'} size="md">
            <Clock className="w-3.5 h-3.5" />
            {company?.status === 'ACTIVE'
              ? 'Paket Aktif'
              : `7 Hari Free Trial (${daysLeft} Hari Tersisa)`}
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/app/team">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-4 h-4 text-blue-700" />}
              >
                Kelola Tim ({company?.memberCount || 1})
              </Button>
            </Link>
            <Link to="/app/business">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Building2 className="w-4 h-4 text-blue-700" />}
              >
                Profil Bisnis
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary Tenant & Account Status Cards */}
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
              Peran Organisasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900">
            {companyRole || userProfile?.companyRole || userProfile?.role || 'COMPANY_OWNER'}
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-600 font-medium">
              Status: {userProfile?.accountStatus || 'active'}
            </span>
            {isSuperAdmin && (
              <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                SUPER_ADMIN Platform
              </span>
            )}
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
            {isExpired ? 'Masa Percobaan Habis' : `Masa Percobaan: ${daysLeft} Hari Tersisa`}
          </div>
        </Card>
      </div>

      {/* Multi-Tenant Quick Actions & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Actions & Operational Foundation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Aksi Cepat Manajemen Tenant"
              subtitle="Kelola organisasi, anggota tim, dan pantau log aktivitas sistem."
            />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/app/team"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Kelola Tim & Undangan
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kirim link undangan anggota dan tetapkan role Admin atau Staf.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/audit-log"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Audit Log Perusahaan
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Jejak audit kepatuhan aktivitas pengguna yang bersifat immutable.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/billing"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Paket & Masa Trial
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tinjau sisa masa trial 7 hari dan formulir konsultasi aktivasi.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/app/business"
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                      Profil & Legalitas Bisnis
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kelola identitas badan usaha, alamat, dan kontak resmi kantor.
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Authentic Real Activity & Operational Counters */}
          <Card>
            <CardHeader
              title="Aktivitas Terbaru Perusahaan"
              subtitle="Jejak audit dan peristiwa operasional nyata yang tercatat di Firestore tenant ini."
              action={
                <Link to="/app/audit-log">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-800">
                    Lihat Semua Log
                  </Button>
                </Link>
              }
            />
            <CardContent className="space-y-4">
              {loadingActivity ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Memuat riwayat aktivitas tenant...
                </div>
              ) : recentLogs.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  <Activity className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  Belum ada catatan aktivitas tambahan pada tenant ini. Setiap aksi tim akan tercatat secara permanen di sini.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentLogs.map((log, idx) => (
                    <div
                      key={log.id || `log_${idx}`}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 mt-0.5 shrink-0">
                          <History className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-[11px] px-1.5 py-0.2 bg-slate-200 rounded text-slate-800">
                              {log.action}
                            </span>
                            <span className="text-slate-600 font-normal truncate max-w-[200px] sm:max-w-xs">
                              oleh {log.actorName || log.actorEmail}
                            </span>
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {log.metadata.reason || log.metadata.description || JSON.stringify(log.metadata)}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-semibold text-slate-700">Anggota Tim Terdaftar</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {members.length > 0 ? members.length : company?.memberCount || 1}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-sky-700" />
                      <span className="text-xs font-semibold text-slate-700">Masa Trial</span>
                    </div>
                    <span className="text-xs font-bold text-sky-800">
                      {daysLeft} Hari Tersisa
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Notification & Tenant Info */}
        <div className="space-y-6">
          {/* Notification Area */}
          <Card>
            <CardHeader
              title="Pemberitahuan Sistem"
              subtitle="Status keamanan tenant"
            />
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block">Tenant Terdaftar & Siap Pakai</span>
                  Organisasi <span className="font-semibold">{company?.name}</span> beroperasi di bawah tenant ID unik mandiri.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block">Isolasi Firestore Aktif</span>
                  Security rules mencegah kebocoran data lintas perusahaan (anti cross-tenant).
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Tenant Scope Summary */}
          <Card>
            <CardHeader
              title="Parameter Tenant"
              subtitle="Spesifikasi keamanan aktif"
            />
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ID Tenant</span>
                <span className="font-mono font-bold text-slate-800">
                  {company?.id || '-'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Slug Organisasi</span>
                <span className="font-mono text-slate-800">{company?.slug || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Masa Trial</span>
                <span className="font-semibold text-sky-700">{daysLeft} Hari Tersisa</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Role Perusahaan</span>
                <span className="font-semibold text-blue-700">{companyRole || userProfile?.companyRole || userProfile?.role || 'COMPANY_OWNER'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Otoritas Platform</span>
                <span className={`font-semibold ${platformRole === 'SUPER_ADMIN' ? 'text-red-600' : 'text-slate-600'}`}>
                  {platformRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Status Keamanan</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Terisolasi
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
