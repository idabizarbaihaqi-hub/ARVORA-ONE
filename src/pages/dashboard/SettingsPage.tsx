import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Key,
  Database,
  Lock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, company, logout, isFirebaseConfigured } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Berhasil keluar dari akun', 'info');
    navigate('/auth/login');
  };

  const roleMatrix = [
    {
      role: 'SUPER_ADMIN',
      label: 'Super Administrator',
      scope: 'Platform Global',
      desc: 'Pengelola teknis ekosistem global ARVORA ONE. Tidak diekspos pada pendaftaran publik.',
    },
    {
      role: 'COMPANY_OWNER',
      label: 'Pemilik Perusahaan (Owner)',
      scope: 'Tenant Mandiri',
      desc: 'Memiliki otoritas tertinggi atas seluruh data, penagihan, konfigurasi tenant, dan tim internal.',
    },
    {
      role: 'COMPANY_ADMIN',
      label: 'Administrator Perusahaan',
      scope: 'Tenant Mandiri',
      desc: 'Mengelola operasional harian modul, perizinan staf, dan laporan bisnis tanpa akses hapus tenant.',
    },
    {
      role: 'EMPLOYEE',
      label: 'Karyawan / Staf',
      scope: 'Divisi / Penugasan Terbatas',
      desc: 'Mengakses tugas, absensi, pengajuan, dan data operasional yang ditugaskan secara spesifik.',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Pengaturan Akun & Keamanan"
        description="Kelola profil pengguna, pelajari matriks perizinan peran (RBAC), dan tinjau status konektivitas cloud."
        breadcrumbs={[
          { label: 'Pengaturan', href: '/app/settings' },
          { label: 'Akun & Keamanan' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center">
              <Avatar name={userProfile?.fullName || 'User'} size="lg" className="mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                {userProfile?.fullName || 'Pengguna'}
              </h3>
              <p className="text-xs text-slate-500">{userProfile?.email || '-'}</p>

              <div className="mt-3 flex items-center gap-1.5">
                <Badge variant="primary" size="sm">
                  {userProfile?.role || 'COMPANY_OWNER'}
                </Badge>
                <Badge variant="success" size="sm">
                  {userProfile?.accountStatus || 'active'}
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Perusahaan</span>
                <span className="font-semibold text-slate-800">{company?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tenant ID</span>
                <span className="font-mono text-slate-800">{company?.id || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Email Terverifikasi</span>
                <span className="font-semibold text-emerald-600">
                  {userProfile?.emailVerified ? 'Ya' : 'Dalam Proses'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={() => setShowLogoutConfirm(true)}
              >
                Keluar dari Akun
              </Button>
            </div>
          </Card>

          {/* Cloud Connectivity Inspector */}
          <Card className="p-5">
            <CardHeader
              title="Koneksi Cloud"
              subtitle="Status integrasi Firebase"
            />
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Firebase Auth</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {isFirebaseConfigured ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aktif
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Mode Pratinjau
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cloud Firestore</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {isFirebaseConfigured ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terkoneksi
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Standby
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Aturan Keamanan</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hardened Rules
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Cols: RBAC Permissions Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Matriks Kontrol Akses Berbasis Peran (RBAC)"
              subtitle="Struktur otoritas sistem ARVORA ONE untuk mencegah eskalasi wewenang ilegal."
            />
            <CardContent className="space-y-4">
              {roleMatrix.map((item) => {
                const isCurrent = userProfile?.role === item.role;
                return (
                  <div
                    key={item.role}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-300 bg-blue-50/40'
                        : 'border-slate-200/80 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {item.label}
                        </span>
                        <code className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          {item.role}
                        </code>
                      </div>
                      {isCurrent && (
                        <Badge variant="primary" size="sm">
                          Peran Anda Saat Ini
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-blue-700 block mb-1">
                      Scope: {item.scope}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Security Standards Card */}
          <Card className="p-5">
            <CardHeader
              title="Prinsip Isolasi Data ARVORA ONE"
              subtitle="Standar arsitektur multi-tenant"
            />
            <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tenant Isolation by Design:</strong> Setiap kueri database difilter secara ketat berdasarkan atribut <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-700">companyId</code>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Server-side Enforcement:</strong> Aturan keamanan dievaluasi langsung oleh mesin Firestore Rules, sehingga manipulasi request dari sisi client tidak dapat menembus proteksi data.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun?"
        message="Anda akan dialihkan kembali ke portal masuk. Sesi kerja Anda pada tenant ini akan diakhiri dengan aman."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
};
