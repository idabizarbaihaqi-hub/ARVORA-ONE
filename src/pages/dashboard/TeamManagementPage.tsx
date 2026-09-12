import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCompanyMembers,
  getCompanyInvitations,
  createCompanyInvitation,
  revokeCompanyInvitation,
  updateCompanyMemberRole,
  removeCompanyMember,
} from '../../firebase/firestore';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import { hasPermission, canManageMember, ROLE_PERMISSIONS } from '../../utils/permissions';
import type { CompanyMember, CompanyInvitation, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Clock,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  MoreVertical,
  Shield,
  Info,
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const { authUser, userProfile, company, isFirebaseConfigured } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'COMPANY_ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [isInviting, setIsInviting] = useState(false);
  const [lastCreatedInvite, setLastCreatedInvite] = useState<CompanyInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Change Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('EMPLOYEE');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Remove Member Modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentUserRole = userProfile?.role || 'EMPLOYEE';
  const canInvite = hasPermission(currentUserRole, 'company.members.invite');
  const canUpdateRole = hasPermission(currentUserRole, 'company.members.update');
  const canDeleteMember = hasPermission(currentUserRole, 'company.members.remove');

  const fetchTeamData = async () => {
    if (!company?.id) {
      setLoading(false);
      return;
    }

    try {
      if (!isFirebaseConfigured) {
        // Preview mock data
        setMembers([
          {
            id: `${company.id}_${userProfile?.id || 'owner_1'}`,
            companyId: company.id,
            userId: userProfile?.id || 'owner_1',
            roleId: 'COMPANY_OWNER',
            role: 'COMPANY_OWNER',
            status: 'active',
            joinedAt: company.createdAt,
            displayName: userProfile?.fullName || 'Ahmad Pratama',
            email: userProfile?.email || 'owner@perusahaan.com',
            jobTitle: userProfile?.jobTitle || 'Pemilik / Direktur',
          },
        ]);
        setInvitations([]);
        return;
      }

      const [memberList, inviteList] = await Promise.all([
        getCompanyMembers(company.id),
        getCompanyInvitations(company.id),
      ]);

      setMembers(memberList);
      setInvitations(inviteList);
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [company?.id, isFirebaseConfigured]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      if (!isFirebaseConfigured) {
        // Local preview simulation
        const dummyInvite: CompanyInvitation = {
          id: `inv_mock_${Date.now()}`,
          companyId: company.id,
          companyName: company.name,
          email: inviteEmail.trim(),
          role: inviteRole,
          status: 'PENDING',
          invitedBy: userProfile?.id || 'usr_mock',
          invitedByName: userProfile?.fullName || 'Owner',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        };
        setInvitations((prev) => [dummyInvite, ...prev]);
        setLastCreatedInvite(dummyInvite);
        showToast(`Undangan untuk ${inviteEmail} berhasil dibuat!`, 'success');
        return;
      }

      const created = await createCompanyInvitation(
        company.id,
        company.name,
        inviteEmail.trim(),
        inviteRole,
        {
          id: authUser?.uid || userProfile?.id || 'owner',
          name: userProfile?.fullName || 'Owner',
        }
      );

      setInvitations((prev) => [created, ...prev]);
      setLastCreatedInvite(created);
      showToast(`Tautan undangan berhasil dibuat untuk ${inviteEmail}!`, 'success');
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!company?.id) return;
    try {
      if (isFirebaseConfigured) {
        await revokeCompanyInvitation(
          company.id,
          invitationId,
          authUser?.uid || userProfile?.id || 'user',
          userProfile?.fullName || 'User'
        );
      }
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId ? { ...i, status: 'REVOKED' } : i))
      );
      showToast('Undangan berhasil dibatalkan.', 'info');
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!company?.id || !selectedMember) return;
    setIsUpdatingRole(true);
    try {
      if (isFirebaseConfigured) {
        await updateCompanyMemberRole(
          company.id,
          selectedMember.userId,
          newRole,
          {
            id: authUser?.uid || userProfile?.id || 'owner',
            name: userProfile?.fullName || 'Owner',
            email: authUser?.email || userProfile?.email || '',
          }
        );
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.userId === selectedMember.userId ? { ...m, role: newRole, roleId: newRole } : m
        )
      );

      showToast(`Peran ${selectedMember.displayName || selectedMember.email} diperbarui menjadi ${newRole}`, 'success');
      setRoleModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!company?.id || !selectedMember) return;
    setIsRemoving(true);
    try {
      if (isFirebaseConfigured) {
        await removeCompanyMember(company.id, selectedMember.userId, {
          id: authUser?.uid || userProfile?.id || 'owner',
          name: userProfile?.fullName || 'Owner',
          email: authUser?.email || userProfile?.email || '',
        });
      }

      setMembers((prev) => prev.filter((m) => m.userId !== selectedMember.userId));
      showToast(`${selectedMember.displayName || selectedMember.email} telah dikeluarkan dari perusahaan.`, 'info');
      setRemoveModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      showToast(parseFirebaseErrorMessage(err), 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  const copyInviteUrl = (inviteId: string) => {
    const url = `${window.location.origin}/invite/${inviteId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Tautan undangan disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Tim & Hak Akses"
        description="Kelola anggota perusahaan, distribusi peran (RBAC), serta kirim undangan kolaborasi tim."
        action={
          canInvite && (
            <Button
              variant="primary"
              onClick={() => {
                setLastCreatedInvite(null);
                setInviteEmail('');
                setInviteModalOpen(true);
              }}
              leftIcon={<UserPlus className="w-4 h-4 text-white" />}
            >
              Undang Anggota Baru
            </Button>
          )
        }
      />

      {errorMessage && (
        <Alert variant="error" title="Kesalahan Memuat Tim" className="text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* Role & Permission Quick Reference Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-xs">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Struktur Peran Tenant (Role-Based Access Control)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-900 block mb-1">COMPANY_OWNER</span>
            Otoritas tertinggi tenant. Memiliki hak penuh mengelola data bisnis, invite & hapus member, ubah role, dan melihat audit log.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="font-bold text-slate-900 block mb-1">COMPANY_ADMIN</span>
            Mengelola operasional dan mengundang anggota baru. Tidak dapat menghapus entitas perusahaan atau menurunkan status owner.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="font-bold text-slate-900 block mb-1">EMPLOYEE</span>
            Anggota tim reguler. Mengakses modul kerja operasional sesuai izin yang diberikan tanpa hak administratif.
          </div>
        </div>
      </div>

      {/* ACTIVE MEMBERS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Anggota Aktif ({members.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-xl border border-slate-200">
            <LoadingState text="Mengambil daftar anggota perusahaan..." />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama & Email</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Peran Sistem</th>
                    <th className="py-3 px-4">Tanggal Bergabung</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {members.map((member) => {
                    const isSelf = member.userId === userProfile?.id || member.userId === authUser?.uid;
                    const isOwner = member.role === 'COMPANY_OWNER';
                    const canManage = canManageMember(currentUserRole, member.role) && !isSelf;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {member.displayName || member.userName || 'Anggota Perusahaan'}
                            {isSelf && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px]">{member.email || member.userEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {member.jobTitle || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              member.role === 'COMPANY_OWNER'
                                ? 'primary'
                                : member.role === 'COMPANY_ADMIN'
                                ? 'info'
                                : 'default'
                            }
                            size="sm"
                          >
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(member.joinedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1.5">
                              {canUpdateRole && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setNewRole(member.role);
                                    setRoleModalOpen(true);
                                  }}
                                  className="text-xs text-blue-700 hover:bg-blue-50"
                                >
                                  Ubah Peran
                                </Button>
                              )}
                              {canDeleteMember && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setRemoveModalOpen(true);
                                  }}
                                  className="text-xs text-rose-600 hover:bg-rose-50 px-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          )}
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

      {/* PENDING INVITATIONS SECTION */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" />
            Daftar Undangan ({invitations.length})
          </h2>
        </div>

        {invitations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            Belum ada undangan yang aktif atau menunggu konfirmasi.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Email Tujuan</th>
                    <th className="py-3 px-4">Peran Diberikan</th>
                    <th className="py-3 px-4">Diundang Oleh</th>
                    <th className="py-3 px-4">Masa Berlaku</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invitations.map((invite) => {
                    const isPending = invite.status === 'PENDING';
                    const isExpired = new Date(invite.expiresAt).getTime() < Date.now();

                    return (
                      <tr key={invite.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {invite.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={invite.role === 'COMPANY_ADMIN' ? 'info' : 'default'} size="sm">
                            {invite.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {invite.invitedByName || 'Administrator'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(invite.expiresAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              invite.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : invite.status === 'REVOKED'
                                ? 'bg-slate-100 text-slate-600'
                                : isExpired
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isExpired && invite.status === 'PENDING' ? 'EXPIRED' : invite.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && !isExpired && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyInviteUrl(invite.id)}
                                  className="text-xs"
                                  leftIcon={<Copy className="w-3 h-3 text-slate-500" />}
                                >
                                  Salin Link
                                </Button>
                                {canInvite && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevokeInvite(invite.id)}
                                    className="text-xs text-rose-600 hover:bg-rose-50"
                                  >
                                    Batalkan
                                  </Button>
                                )}
                              </>
                            )}
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

      {/* MODAL: INVITE MEMBER */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Undang Anggota ke Perusahaan"
        size="md"
      >
        <div className="space-y-4 text-left">
          {lastCreatedInvite ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Check className="w-4 h-4" /> Undangan Berhasil Dibuat
                </span>
                <p>
                  Undangan telah terdaftar untuk email <strong>{lastCreatedInvite.email}</strong> dengan peran{' '}
                  <strong>{lastCreatedInvite.role}</strong>.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Tautan Undangan Langsung:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/invite/${lastCreatedInvite.id}`}
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-800"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => copyInviteUrl(lastCreatedInvite.id)}
                      leftIcon={copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedLink ? 'Tersalin' : 'Salin'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLastCreatedInvite(null);
                    setInviteEmail('');
                  }}
                >
                  Undang Lagi
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="space-y-4">
              <Input
                label="Alamat Email Calon Anggota *"
                type="email"
                placeholder="nama@perusahaan.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Undangan akan berlaku selama 7 hari kalender."
              />

              <Select
                label="Peran Akses Organisasi *"
                options={[
                  { value: 'EMPLOYEE', label: 'Employee (Anggota Tim Operasional)' },
                  { value: 'COMPANY_ADMIN', label: 'Company Admin (Administrator)' },
                ]}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'COMPANY_ADMIN' | 'EMPLOYEE')}
              />

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Pengguna yang menerima undangan ini akan langsung tergabung ke dalam tenant{' '}
                  <strong>{company?.name}</strong> tanpa perlu membuat perusahaan baru.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isInviting}
                >
                  Buat Tautan Undangan
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* MODAL: UPDATE MEMBER ROLE */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Ubah Peran Anggota"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-600">
              Pilih peran baru untuk <strong className="text-slate-900">{selectedMember.displayName || selectedMember.email}</strong>:
            </p>

            <Select
              label="Peran Baru"
              options={[
                { value: 'EMPLOYEE', label: 'EMPLOYEE (Staf Reguler)' },
                { value: 'COMPANY_ADMIN', label: 'COMPANY_ADMIN (Administrator)' },
              ]}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdatingRole}
                onClick={handleUpdateRole}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: REMOVE MEMBER CONFIRMATION */}
      <Modal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Keluarkan Anggota Tim"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin mengeluarkan{' '}
              <strong className="text-slate-900">{selectedMember.displayName || selectedMember.email}</strong> dari tenant{' '}
              <strong className="text-slate-900">{company?.name}</strong>?
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
              Akses pengguna ke seluruh data, modul, dan laporan perusahaan ini akan langsung dicabut seketika.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRemoveModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isRemoving}
                onClick={handleRemoveMember}
              >
                Keluarkan Sekarang
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
