import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  createCompanyInvitation,
  getCompanyMembers,
  getCompanyInvitations,
  getCompanyRoles,
  getCompanyDepartments,
  getCompanyPositions,
} from '../../firebase/firestore';
import type { CompanyInvitation, CompanyRole, Department, Position } from '../../types';
import {
  UserPlus,
  Mail,
  Shield,
  Building2,
  Briefcase,
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

export const InviteMemberPage: React.FC = () => {
  const { userProfile, company } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<CompanyInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!company?.id) return;
    const fetchData = async () => {
      try {
        const [roleList, deptList, posList] = await Promise.all([
          getCompanyRoles(company.id),
          getCompanyDepartments(company.id),
          getCompanyPositions(company.id),
        ]);
        setRoles(Array.isArray(roleList) ? roleList : []);
        setDepartments(Array.isArray(deptList) ? deptList : []);
        setPositions(Array.isArray(posList) ? posList : []);
      } catch (err) {
        console.error('Failed to load invite options:', err);
        setRoles([]);
        setDepartments([]);
        setPositions([]);
      }
    };
    fetchData();
  }, [company?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showToast('Masukkan alamat email yang valid.', 'error');
      return;
    }

    if (!company?.id || !userProfile) return;

    setIsSubmitting(true);
    try {
      // 1. Check if already a member
      const existingMembers = await getCompanyMembers(company.id);
      const isAlreadyMember = existingMembers.some(
        (m) => m.email.toLowerCase() === cleanEmail
      );
      if (isAlreadyMember) {
        showToast('Email ini sudah terdaftar sebagai anggota aktif di perusahaan ini.', 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Check if pending invite already exists
      const existingInvites = await getCompanyInvitations(company.id);
      const hasPendingInvite = existingInvites.some(
        (inv) => inv.email.toLowerCase() === cleanEmail && inv.status === 'PENDING'
      );
      if (hasPendingInvite) {
        showToast('Undangan untuk email ini masih aktif menunggu konfirmasi.', 'warning');
      }

      // 3. Create invitation
      const invite = await createCompanyInvitation(
        company.id,
        company.name,
        cleanEmail,
        selectedRole,
        { id: userProfile.id, name: userProfile.fullName },
        personalMessage
      );

      setCreatedInvite(invite);
      showToast(`Undangan untuk ${cleanEmail} berhasil dibuat!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengirim undangan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inviteLink = createdInvite ? `${window.location.origin}/invite/${createdInvite.id}` : '';

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast('Tautan undangan disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <PermissionGuard permission="members.invite" showAccessDeniedMessage>
      <div id="invite-member-page" className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Navigation back */}
        <div className="flex items-center gap-2">
          <Button
            id="back-to-members-btn"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/members')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali ke Daftar Anggota
          </Button>
        </div>

        <PageHeader
          title="Undang Anggota Baru"
          description={`Kirimkan tautan resmi untuk mengundang karyawan atau rekan kerja bergabung dengan ${company?.name || 'perusahaan'}.`}
        />

        {createdInvite ? (
          /* SUCCESS STATE AFTER CREATING INVITATION */
          <Card id="invite-success-card" className="p-6 sm:p-8 space-y-6 bg-white dark:bg-neutral-900 text-left border-emerald-200 dark:border-emerald-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                  Undangan Berhasil Dibuat!
                </h3>
                <p className="text-xs text-slate-500">
                  Tautan undangan aktif selama 7 hari untuk <strong>{createdInvite.email}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-slate-200 dark:border-neutral-700">
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Tautan Akses Undangan:
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="invite-link-input"
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-200 focus:outline-none select-all"
                />
                <Button
                  id="copy-invite-link-btn"
                  variant={copiedLink ? 'primary' : 'outline'}
                  size="md"
                  onClick={handleCopyLink}
                  leftIcon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedLink ? 'Tersalin' : 'Salin'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg">
                <span className="text-slate-400 block">Peran yang Diberikan:</span>
                <span className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                  {createdInvite.role}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg">
                <span className="text-slate-400 block">Masa Berlaku:</span>
                <span className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5 block">
                  {new Date(createdInvite.expiresAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                id="invite-another-btn"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setCreatedInvite(null);
                  setEmail('');
                  setPersonalMessage('');
                }}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Undang Anggota Lainnya
              </Button>
              <Button
                id="finish-invite-btn"
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => navigate('/app/members')}
              >
                Kembali ke Daftar Anggota
              </Button>
            </div>
          </Card>
        ) : (
          /* INVITATION FORM */
          <Card className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
            <form id="invite-form" onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Alamat Email Calon Anggota <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="invite-email-input"
                    type="email"
                    placeholder="nama.karyawan@perusahaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Calon anggota akan menerima akses melalui link verifikasi ini saat mendaftar atau login.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Tingkat Peran & Akses (Role) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(roles || [])
                    .filter((r) => r?.id !== 'COMPANY_OWNER')
                    .map((r) => (
                      <label
                        key={r.id}
                        id={`role-choice-${r.id}`}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedRole === r.id || selectedRole === r.name
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                            : 'border-slate-200 dark:border-neutral-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="inviteRole"
                          value={r.id}
                          checked={selectedRole === r.id || selectedRole === r.name}
                          onChange={() => setSelectedRole(r.id)}
                          className="mt-0.5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                            {r.name}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {r.description}
                          </p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Pesan Personal (Opsional)
                </label>
                <textarea
                  id="invite-message-input"
                  rows={3}
                  placeholder="Contoh: Selamat bergabung di tim kami! Silakan gunakan tautan ini untuk mengaktifkan akun kerja Anda."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notice */}
              <div className="flex items-start gap-3 p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 rounded-xl text-xs text-sky-800 dark:text-sky-300">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  Setiap undangan berlaku selama <strong>7 hari kalender</strong> sejak diterbitkan. Anda dapat membatalkan undangan yang masih tertunda kapan saja melalui halaman daftar anggota.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <Button
                  id="cancel-invite-btn"
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app/members')}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  id="submit-invite-btn"
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Buat & Kirim Undangan
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PermissionGuard>
  );
};
