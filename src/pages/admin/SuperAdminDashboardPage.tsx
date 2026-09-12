import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getAllCompanies,
  getPlatformStats,
  updateCompanyStatus,
  updateCompanyPlan,
  extendCompanyTrial,
  getAllPlatformAuditLogs,
  getAllPlatformUsers,
} from '../../firebase/firestore';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import type { Company, CompanyStatus, SubscriptionPlan, AuditLog, UserProfile } from '../../types';
import {
  ShieldAlert,
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Filter,
  Eye,
  Sliders,
  Calendar,
  CreditCard,
  History,
  Activity,
  UserCheck,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const { authUser, userProfile, isSuperAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Navigation tab inside Platform Console
  const [activeTab, setActiveTab] = useState<'companies' | 'audit' | 'users'>('companies');

  // Core Data States (Real Firestore Data only)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [platformUsers, setPlatformUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<{
    totalCompanies: number;
    activeCompanies: number;
    trialCompanies: number;
    expiredCompanies: number;
    suspendedCompanies: number;
    totalUsers: number;
  }>({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    expiredCompanies: 0,
    suspendedCompanies: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // Modal Inputs & Submitting
  const [actionReason, setActionReason] = useState('');
  const [additionalDays, setAdditionalDays] = useState<number>(7);
  const [targetPlan, setTargetPlan] = useState<SubscriptionPlan>('STARTER');
  const [targetStatus, setTargetStatus] = useState<CompanyStatus>('ACTIVE');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlatformData = async () => {
    setErrorMessage(null);
    try {
      const [compList, platformStats, logs, users] = await Promise.all([
        getAllCompanies(),
        getPlatformStats(),
        getAllPlatformAuditLogs(100),
        getAllPlatformUsers(),
      ]);

      setCompanies(compList || []);
      setStats(platformStats || {
        totalCompanies: 0,
        activeCompanies: 0,
        trialCompanies: 0,
        expiredCompanies: 0,
        suspendedCompanies: 0,
        totalUsers: 0,
      });
      setAuditLogs(logs || []);
      setPlatformUsers(users || []);
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlatformData();
  };

  // 1. Toggle Suspension / Unsuspend
  const handleToggleStatus = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    const willSuspend = selectedCompany.status !== 'SUSPENDED';
    const newStatus: CompanyStatus = willSuspend ? 'SUSPENDED' : 'ACTIVE';

    try {
      await updateCompanyStatus(
        selectedCompany.id,
        newStatus,
        {
          id: authUser?.uid || userProfile?.id || 'super_admin',
          name: userProfile?.fullName || 'Super Admin Platform',
          email: authUser?.email || userProfile?.email || 'admin@arvora.one',
        },
        actionReason || (willSuspend ? 'Penangguhan manual oleh Super Admin' : 'Aktivasi ulang oleh Super Admin')
      );

      // Local optimistic update
      setCompanies((prev) =>
        prev.map((c) => (c.id === selectedCompany.id ? { ...c, status: newStatus } : c))
      );

      showToast(
        `Perusahaan ${selectedCompany.name} berhasil di-${willSuspend ? 'suspend' : 'aktifkan'}.`,
        'success'
      );
      setSuspendModalOpen(false);
      setSelectedCompany(null);
      setActionReason('');
      fetchPlatformData();
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Extend Trial
  const handleExtendTrial = async () => {
    if (!selectedCompany) return;
    if (additionalDays <= 0) {
      showToast('Jumlah hari perpanjangan harus lebih dari 0', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const { newTrialEndAt } = await extendCompanyTrial(
        selectedCompany.id,
        additionalDays,
        {
          id: authUser?.uid || userProfile?.id || 'super_admin',
          name: userProfile?.fullName || 'Super Admin Platform',
          email: authUser?.email || userProfile?.email || 'admin@arvora.one',
        },
        actionReason || `Perpanjangan masa percobaan +${additionalDays} hari oleh Super Admin`
      );

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? { ...c, trialEndAt: newTrialEndAt, status: 'TRIAL', subscriptionStatus: 'TRIAL' }
            : c
        )
      );

      showToast(
        `Masa trial ${selectedCompany.name} berhasil diperpanjang +${additionalDays} hari.`,
        'success'
      );
      setExtendModalOpen(false);
      setSelectedCompany(null);
      setActionReason('');
      fetchPlatformData();
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Update Plan & Status
  const handleUpdatePlanAndStatus = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      await updateCompanyPlan(
        selectedCompany.id,
        targetPlan,
        {
          id: authUser?.uid || userProfile?.id || 'super_admin',
          name: userProfile?.fullName || 'Super Admin Platform',
          email: authUser?.email || userProfile?.email || 'admin@arvora.one',
        },
        actionReason || `Perubahan paket ke ${targetPlan} oleh Super Admin`
      );

      if (targetStatus !== selectedCompany.status) {
        await updateCompanyStatus(
          selectedCompany.id,
          targetStatus,
          {
            id: authUser?.uid || userProfile?.id || 'super_admin',
            name: userProfile?.fullName || 'Super Admin Platform',
            email: authUser?.email || userProfile?.email || 'admin@arvora.one',
          },
          actionReason || `Penyesuaian status ke ${targetStatus} oleh Super Admin`
        );
      }

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompany.id
            ? { ...c, subscriptionPlan: targetPlan, status: targetStatus }
            : c
        )
      );

      showToast(
        `Paket ${selectedCompany.name} berhasil diperbarui menjadi ${targetPlan}.`,
        'success'
      );
      setPlanModalOpen(false);
      setSelectedCompany(null);
      setActionReason('');
      fetchPlatformData();
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.legalName && c.legalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.actorName && log.actorName.toLowerCase().includes(q)) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      log.resource.toLowerCase().includes(q) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(q))
    );
  });

  const filteredUsers = platformUsers.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  // Calculate remaining trial days
  const getTrialDaysLeft = (endIso?: string) => {
    if (!endIso) return 0;
    const diff = new Date(endIso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="sm" showTagline={false} />
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-mono font-bold rounded-md uppercase tracking-wider">
              SUPER_ADMIN
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Platform Command Center ARVORA ONE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/dashboard')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-slate-300 border-slate-700 hover:bg-slate-800 text-xs"
          >
            Dashboard Tenant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            className="text-rose-400 hover:bg-rose-950/30 text-xs"
          >
            Keluar
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase">
                Otoritas Platform Resmi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Manajemen Seluruh Tenant & Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pengawasan multi-tenant, lifecycle status langganan, dan tata kelola akun organisasi ARVORA ONE.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-slate-300 border-slate-700 hover:bg-slate-800 text-xs"
            >
              Sinkronkan Data Firestore
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Gagal Memuat Data Platform" className="text-xs">
            {errorMessage}
          </Alert>
        )}

        {/* Global Metric Cards (Real Data from Firestore) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Total Tenant</span>
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalCompanies}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-semibold">Aktif (Resmi)</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{stats.activeCompanies}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-sky-400">
              <span className="text-[11px] font-semibold">Masa Trial</span>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-sky-400">{stats.trialCompanies}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-semibold">Trial Habis</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{stats.expiredCompanies}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold">Suspended</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-rose-400">{stats.suspendedCompanies}</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] font-semibold">Total Pengguna</span>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-purple-300">{stats.totalUsers}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'companies'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Daftar Tenant Perusahaan ({companies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Log Platform ({auditLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Pengawasan Pengguna ({platformUsers.length})</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder={
                activeTab === 'companies'
                  ? 'Cari nama perusahaan, ID tenant, industri...'
                  : activeTab === 'audit'
                  ? 'Cari aksi, email actor, resource...'
                  : 'Cari email pengguna, nama, role...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {activeTab === 'companies' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              {(['ALL', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Companies Table */}
        {activeTab === 'companies' && (
          <div>
            {loading ? (
              <div className="py-16 text-center">
                <LoadingState text="Mengambil daftar tenant seluruh platform..." />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                {companies.length === 0
                  ? 'Belum ada perusahaan terdaftar di database Firestore ARVORA ONE.'
                  : 'Tidak ada perusahaan yang cocok dengan filter pencarian.'}
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Nama Perusahaan</th>
                        <th className="py-3.5 px-4">ID Tenant</th>
                        <th className="py-3.5 px-4">Paket / Plan</th>
                        <th className="py-3.5 px-4">Anggota</th>
                        <th className="py-3.5 px-4">Masa Trial</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Tindakan Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredCompanies.map((comp) => {
                        const isSuspended = comp.status === 'SUSPENDED';
                        const daysLeft = getTrialDaysLeft(comp.trialEndAt);

                        return (
                          <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{comp.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">{comp.legalName || comp.industry || '-'}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-400">
                              {comp.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {comp.subscriptionPlan || 'TRIAL'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {comp.memberCount || 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {comp.trialEndAt ? (
                                <div>
                                  <span>
                                    {new Date(comp.trialEndAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  {comp.status === 'TRIAL' && (
                                    <span className="block text-[10px] text-sky-400 font-semibold">
                                      {daysLeft > 0 ? `(Sisa ${daysLeft} hari)` : '(Telah berakhir)'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${
                                  comp.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : comp.status === 'TRIAL'
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : comp.status === 'SUSPENDED'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {comp.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(comp);
                                    setDetailModalOpen(true);
                                  }}
                                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-2"
                                >
                                  Detail
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(comp);
                                    setAdditionalDays(7);
                                    setExtendModalOpen(true);
                                  }}
                                  className="text-sky-300 border-sky-500/30 hover:bg-sky-950/40 text-xs px-2"
                                >
                                  + Trial
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(comp);
                                    setTargetPlan(comp.subscriptionPlan || 'STARTER');
                                    setTargetStatus(comp.status || 'ACTIVE');
                                    setPlanModalOpen(true);
                                  }}
                                  className="text-indigo-300 border-indigo-500/30 hover:bg-indigo-950/40 text-xs px-2"
                                >
                                  Paket
                                </Button>

                                <Button
                                  variant={isSuspended ? 'primary' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCompany(comp);
                                    setSuspendModalOpen(true);
                                  }}
                                  className={`text-xs px-2.5 ${
                                    isSuspended
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'text-rose-400 border-rose-500/40 hover:bg-rose-950/30'
                                  }`}
                                >
                                  {isSuspended ? 'Aktifkan' : 'Suspend'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Audit Logs Platform */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                Belum ada aktivitas audit log yang tercatat di platform.
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Waktu (WIB)</th>
                        <th className="py-3.5 px-4">Aksi / Event</th>
                        <th className="py-3.5 px-4">Pelaku (Actor)</th>
                        <th className="py-3.5 px-4">Tenant / Resource</th>
                        <th className="py-3.5 px-4">Detail Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredAuditLogs.map((log, idx) => (
                        <tr key={log.id || `log_${idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-semibold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{log.actorName || log.actorEmail}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                            {log.companyId ? (
                              <span className="text-blue-400">{log.companyId}</span>
                            ) : (
                              <span className="text-slate-500">PLATFORM</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                            {log.metadata?.reason ||
                              log.metadata?.newStatus ||
                              (log.metadata && Object.keys(log.metadata).length > 0
                                ? JSON.stringify(log.metadata)
                                : '-')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Platform Users Oversight */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                Belum ada profil pengguna terdaftar di Firestore.
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Nama Lengkap</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Role Tenant</th>
                        <th className="py-3.5 px-4">Otoritas Platform</th>
                        <th className="py-3.5 px-4">Perusahaan Terkait</th>
                        <th className="py-3.5 px-4">Status Akun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            {u.fullName || u.displayName || 'Tanpa Nama'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                            {u.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-200">
                              {u.role || 'EMPLOYEE'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.platformRole === 'SUPER_ADMIN' ? (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold rounded">
                                SUPER_ADMIN
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[11px]">USER</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {u.companyName || u.companyId || (
                              <span className="text-slate-500 italic">Belum terikat tenant</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.accountStatus === 'suspended'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {u.accountStatus || 'active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal 1: Suspend / Unsuspend */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={
          selectedCompany?.status === 'SUSPENDED'
            ? 'Aktifkan Kembali Akses Tenant'
            : 'Tangguhkan Tenant (Suspend)'
        }
        maxWidth="md"
      >
        {selectedCompany && (
          <div className="space-y-4 text-left text-xs text-slate-700">
            <p className="leading-relaxed">
              Apakah Anda yakin ingin{' '}
              {selectedCompany.status === 'SUSPENDED' ? 'mengaktifkan kembali' : 'menangguhkan (suspend)'}{' '}
              akses tenant untuk <strong className="text-slate-900">{selectedCompany.name}</strong> (ID:{' '}
              <code className="font-mono text-blue-600">{selectedCompany.id}</code>)?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Tindakan (Tercatat di Audit Log):
              </label>
              <Input
                placeholder="Misal: Permintaan audit kepatuhan, pembayaran tertunda, dll"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-xs"
              />
            </div>

            {selectedCompany.status !== 'SUSPENDED' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Dampak Penangguhan:</span>
                  Pengguna tenant ini tidak dapat mengubah data perusahaan dan melihat peringatan status suspended di dashboard mereka.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Pemulihan Akses Penuh:</span>
                  Tenant akan kembali berstatus ACTIVE dan anggota dapat beroperasi kembali secara normal.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuspendModalOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                variant={selectedCompany.status === 'SUSPENDED' ? 'primary' : 'danger'}
                size="sm"
                isLoading={actionLoading}
                onClick={handleToggleStatus}
              >
                {selectedCompany.status === 'SUSPENDED' ? 'Konfirmasi Aktivasi' : 'Tangguhkan Sekarang'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Extend Trial */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Perpanjang Masa Percobaan (Trial)"
        maxWidth="md"
      >
        {selectedCompany && (
          <div className="space-y-4 text-left text-xs text-slate-700">
            <p className="leading-relaxed">
              Tambahkan hari masa percobaan gratis untuk tenant{' '}
              <strong className="text-slate-900">{selectedCompany.name}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Trial Saat Ini:</span>
                <span className="font-semibold text-slate-800">
                  {selectedCompany.trialEndAt
                    ? new Date(selectedCompany.trialEndAt).toLocaleDateString('id-ID')
                    : 'Belum diatur'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa Hari:</span>
                <span className="font-semibold text-sky-700">
                  {getTrialDaysLeft(selectedCompany.trialEndAt)} Hari
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Durasi Tambahan:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setAdditionalDays(days)}
                    className={`py-2 px-3 rounded-lg font-bold border text-xs transition-colors ${
                      additionalDays === days
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    +{days} Hari
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min={1}
                max={365}
                value={additionalDays}
                onChange={(e) => setAdditionalDays(parseInt(e.target.value, 10) || 1)}
                placeholder="Atau masukkan jumlah hari kustom"
                className="text-xs mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Alasan:
              </label>
              <Input
                placeholder="Misal: Evaluasi tambahan kebutuhan fitur HR & CRM"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExtendModalOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleExtendTrial}
              >
                Simpan Perpanjangan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 3: Update Subscription Plan & Status */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Kelola Paket Langganan & Status"
        maxWidth="md"
      >
        {selectedCompany && (
          <div className="space-y-4 text-left text-xs text-slate-700">
            <p className="leading-relaxed">
              Atur paket layanan komersial dan status operasional untuk{' '}
              <strong className="text-slate-900">{selectedCompany.name}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Paket Langganan (Subscription Plan):
              </label>
              <select
                value={targetPlan}
                onChange={(e) => setTargetPlan(e.target.value as SubscriptionPlan)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="TRIAL">TRIAL (7 Hari Evaluasi)</option>
                <option value="STARTER">STARTER (Bisnis Pemula)</option>
                <option value="PROFESSIONAL">PROFESSIONAL (Berkembang)</option>
                <option value="BUSINESS">BUSINESS (Korporasi Menengah)</option>
                <option value="CUSTOM ENTERPRISE">CUSTOM ENTERPRISE (Kustom Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Operasional Tenant:
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as CompanyStatus)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE (Akses Penuh Normal)</option>
                <option value="TRIAL">TRIAL (Masa Uji Coba)</option>
                <option value="EXPIRED">EXPIRED (Masa Berlaku Habis)</option>
                <option value="SUSPENDED">SUSPENDED (Ditangguhkan Sementara)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Administrasi:
              </label>
              <Input
                placeholder="Misal: Pembayaran invoice tahunan telah terverifikasi"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlanModalOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={handleUpdatePlanAndStatus}
              >
                Perbarui Paket & Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Company Detail */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Lengkap Tenant Organisasi"
        maxWidth="lg"
      >
        {selectedCompany && (
          <div className="space-y-4 text-left text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">ID Tenant:</span>
                <span className="font-mono font-bold text-slate-900">{selectedCompany.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nama Operasional:</span>
                <span className="font-bold text-slate-900">{selectedCompany.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Badan Legal:</span>
                <span className="text-slate-800">{selectedCompany.legalName || selectedCompany.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Industri:</span>
                <span className="text-slate-800">{selectedCompany.industry || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Kontak:</span>
                <span className="text-slate-800">{selectedCompany.email || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Telepon Kantor:</span>
                <span className="text-slate-800">{selectedCompany.phone || '-'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Alamat Kantor:</span>
                <span className="text-slate-800">{selectedCompany.address || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Paket Langganan:</span>
                <span className="font-bold text-indigo-700">{selectedCompany.subscriptionPlan || 'TRIAL'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Operasional:</span>
                <span className="font-bold text-slate-900">{selectedCompany.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mulai Uji Coba:</span>
                <span className="text-slate-800">
                  {selectedCompany.trialStartAt
                    ? new Date(selectedCompany.trialStartAt).toLocaleString('id-ID')
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Berakhir Uji Coba:</span>
                <span className="text-slate-800">
                  {selectedCompany.trialEndAt
                    ? new Date(selectedCompany.trialEndAt).toLocaleString('id-ID')
                    : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Jumlah Anggota Terdaftar:</span>
                <span className="font-semibold text-slate-900">
                  {selectedCompany.memberCount || 1} Pengguna
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Pendaftaran:</span>
                <span className="text-slate-800">
                  {selectedCompany.createdAt
                    ? new Date(selectedCompany.createdAt).toLocaleString('id-ID')
                    : '-'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
