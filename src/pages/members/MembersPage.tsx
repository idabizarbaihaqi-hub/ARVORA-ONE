import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCompanyMembers,
  getCompanyInvitations,
  getCompanyRoles,
  getCompanyDepartments,
  getCompanyPositions,
  updateCompanyMemberRole,
  updateCompanyMemberStatus,
  updateCompanyMemberOrg,
  removeCompanyMember,
  revokeCompanyInvitation,
} from '../../firebase/firestore';
import { hasPermission, canManageMember } from '../../utils/permissions';
import type {
  CompanyMember,
  CompanyInvitation,
  CompanyRole,
  Department,
  Position,
} from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  ShieldCheck,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  Trash2,
  Edit2,
  UserX,
  UserCheck,
  Check,
  Eye,
} from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { userProfile, company } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Member Detail Drawer
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Edit Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetMemberForRole, setTargetMemberForRole] = useState<CompanyMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('EMPLOYEE');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Edit Org (Dept / Position) Modal
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [targetMemberForOrg, setTargetMemberForOrg] = useState<CompanyMember | null>(null);
  const [orgForm, setOrgForm] = useState({
    departmentId: '',
    positionId: '',
    jobTitle: '',
  });
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);

  // Confirm Status Toggle Dialog
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    member: CompanyMember | null;
    targetStatus: 'ACTIVE' | 'INACTIVE';
  }>({
    open: false,
    member: null,
    targetStatus: 'INACTIVE',
  });

  // Confirm Remove Member Dialog
  const [removeConfirm, setRemoveConfirm] = useState<{
    open: boolean;
    member: CompanyMember | null;
  }>({
    open: false,
    member: null,
  });

  const currentUserRole = userProfile?.role || 'EMPLOYEE';
  const canInvite = hasPermission(currentUserRole, 'members.invite');
  const canUpdateMember = hasPermission(currentUserRole, 'members.update');
  const canRemoveMember = hasPermission(currentUserRole, 'members.remove');

  const loadData = async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [memberList, inviteList, roleList, deptList, posList] = await Promise.all([
        getCompanyMembers(company.id),
        getCompanyInvitations(company.id),
        getCompanyRoles(company.id),
        getCompanyDepartments(company.id),
        getCompanyPositions(company.id),
      ]);
      setMembers(Array.isArray(memberList) ? memberList : []);
      setInvitations(Array.isArray(inviteList) ? inviteList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      setPositions(Array.isArray(posList) ? posList : []);
    } catch (err: any) {
      setMembers([]);
      setInvitations([]);
      setRoles([]);
      setDepartments([]);
      setPositions([]);
      showToast(err?.message || 'Gagal memuat data anggota.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  // Handle Role Update
  const handleSaveRole = async () => {
    if (!targetMemberForRole || !company?.id || !userProfile) return;
    setIsUpdatingRole(true);
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };
    try {
      await updateCompanyMemberRole(company.id, targetMemberForRole.userId, selectedRole, actor);
      showToast(`Peran ${targetMemberForRole.displayName} berhasil diubah.`, 'success');
      setRoleModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui peran anggota.', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Handle Org Update
  const handleSaveOrg = async () => {
    if (!targetMemberForOrg || !company?.id || !userProfile) return;
    setIsUpdatingOrg(true);
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };
    try {
      await updateCompanyMemberOrg(company.id, targetMemberForOrg.userId, orgForm, actor);
      showToast(`Penugasan divisi & jabatan ${targetMemberForOrg.displayName} berhasil diperbarui.`, 'success');
      setOrgModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui divisi anggota.', 'error');
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  // Handle Toggle Status Execution
  const executeStatusToggle = async () => {
    if (!statusConfirm.member || !company?.id || !userProfile) return;
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };
    try {
      await updateCompanyMemberStatus(
        company.id,
        statusConfirm.member.userId,
        statusConfirm.targetStatus,
        actor
      );
      showToast(
        `Status ${statusConfirm.member.displayName} berhasil ${
          statusConfirm.targetStatus === 'ACTIVE' ? 'diaktifkan kembali' : 'dinonaktifkan'
        }.`,
        'success'
      );
      setStatusConfirm({ open: false, member: null, targetStatus: 'INACTIVE' });
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengubah status anggota.', 'error');
    }
  };

  // Handle Remove Member Execution
  const executeRemoveMember = async () => {
    if (!removeConfirm.member || !company?.id || !userProfile) return;
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };
    try {
      await removeCompanyMember(company.id, removeConfirm.member.userId, actor);
      showToast(`${removeConfirm.member.displayName} telah dihapus dari perusahaan.`, 'success');
      setRemoveConfirm({ open: false, member: null });
      if (selectedMember?.userId === removeConfirm.member.userId) {
        setDetailDrawerOpen(false);
      }
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus anggota.', 'error');
    }
  };

  // Cancel Invitation
  const handleCancelInvitation = async (invitationId: string) => {
    if (!company?.id || !userProfile) return;
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };
    try {
      await revokeCompanyInvitation(company.id, invitationId, actor);
      showToast('Undangan berhasil dibatalkan.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal membatalkan undangan.', 'error');
    }
  };

  // Helpers
  const getDeptName = (deptId?: string) => {
    if (!deptId) return null;
    return (departments || []).find((d) => d?.id === deptId)?.name || null;
  };

  const getPosName = (posId?: string) => {
    if (!posId) return null;
    return (positions || []).find((p) => p?.id === posId)?.name || null;
  };

  // Filter members
  const filteredMembers = (members || []).filter((m) => {
    const matchesSearch =
      m?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m?.jobTitle && m.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || m?.role === roleFilter || m?.roleId === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && (m?.status === 'ACTIVE' || m?.status === 'active')) ||
      (statusFilter === 'INACTIVE' && (m?.status === 'INACTIVE' || m?.status === 'inactive'));

    const matchesDept = departmentFilter === 'ALL' || m?.departmentId === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  const pendingInvitations = (invitations || []).filter((inv) => inv?.status === 'PENDING');

  return (
    <PermissionGuard permission="members.view" showAccessDeniedMessage>
      <div id="members-page" className="max-w-7xl mx-auto space-y-6 pb-12">
        <PageHeader
          title="Anggota & Manajemen Tim"
          description="Kelola seluruh staf, penugasan divisi, peran hak akses, dan pantau status undangan anggota baru."
          action={
            canInvite && (
              <Button
                id="invite-member-btn"
                variant="primary"
                onClick={() => navigate('/app/members/invite')}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Undang Anggota
              </Button>
            )
          }
        />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6">
          <button
            id="tab-active-members"
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Anggota Terdaftar ({members.length})</span>
          </button>
          <button
            id="tab-pending-invitations"
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Undangan Menunggu ({pendingInvitations.length})</span>
          </button>
        </div>

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-member-input"
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    id="filter-role-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="COMPANY_OWNER">Company Owner</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                    <option value="EMPLOYEE">Employee (Staf)</option>
                    {roles
                      .filter((r) => !r.isSystemRole)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    id="filter-status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <select
                    id="filter-dept-select"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Departemen</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-neutral-800">
                <span>
                  Menampilkan {filteredMembers.length} dari {members.length} anggota
                </span>
                {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL' || departmentFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('ALL');
                      setStatusFilter('ALL');
                      setDepartmentFilter('ALL');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <LoadingState message="Memuat daftar anggota..." />
            ) : filteredMembers.length === 0 ? (
              <EmptyState
                title="Anggota Tidak Ditemukan"
                description={
                  searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL' || departmentFilter !== 'ALL'
                    ? 'Tidak ada anggota yang cocok dengan filter yang Anda tentukan.'
                    : 'Belum ada anggota lain di perusahaan ini.'
                }
                action={
                  canInvite ? (
                    <Button
                      id="empty-invite-btn"
                      variant="primary"
                      onClick={() => navigate('/app/members/invite')}
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Undang Anggota Pertama
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-5 py-3.5">Nama & Kontak</th>
                        <th className="px-5 py-3.5">Peran (Role)</th>
                        <th className="px-5 py-3.5">Divisi & Jabatan</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Bergabung</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                      {filteredMembers.map((member) => {
                        const isOwner = member.role === 'COMPANY_OWNER';
                        const isSelf = member.userId === userProfile?.id;
                        const isMemberActive = member.status === 'ACTIVE' || member.status === 'active';
                        const deptName = getDeptName(member.departmentId);
                        const posName = getPosName(member.positionId);

                        return (
                          <tr
                            key={member.id}
                            id={`member-row-${member.userId}`}
                            className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            {/* Name & Contact */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={member.displayName} size="md" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate">
                                    {member.displayName} {isSelf && <span className="text-xs text-blue-600 font-normal">(Anda)</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isOwner
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : member.role === 'COMPANY_ADMIN'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <Shield className="w-3 h-3" />
                                {member.role}
                              </span>
                            </td>

                            {/* Department & Position */}
                            <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-neutral-300">
                              {deptName || posName || member.jobTitle ? (
                                <div className="space-y-0.5">
                                  {deptName && (
                                    <p className="font-medium text-slate-800 dark:text-neutral-200 flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-slate-400" />
                                      {deptName}
                                    </p>
                                  )}
                                  {(posName || member.jobTitle) && (
                                    <p className="text-slate-500 flex items-center gap-1">
                                      <Briefcase className="w-3 h-3 text-slate-400" />
                                      {posName || member.jobTitle}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Belum ditentukan</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <Badge variant={isMemberActive ? 'success' : 'default'} size="sm">
                                {isMemberActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </td>

                            {/* Joined Date */}
                            <td className="px-5 py-3.5 text-xs text-slate-500">
                              {new Date(member.joinedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Detail button */}
                                <button
                                  id={`view-detail-${member.userId}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setDetailDrawerOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                  title="Lihat Rincian Anggota"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {canUpdateMember && !isOwner && !isSelf && (
                                  <>
                                    {/* Role edit button */}
                                    <button
                                      id={`change-role-${member.userId}`}
                                      type="button"
                                      onClick={() => {
                                        setTargetMemberForRole(member);
                                        setSelectedRole(member.role);
                                        setRoleModalOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                                      title="Ubah Peran"
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                    </button>

                                    {/* Org edit button */}
                                    <button
                                      id={`change-org-${member.userId}`}
                                      type="button"
                                      onClick={() => {
                                        setTargetMemberForOrg(member);
                                        setOrgForm({
                                          departmentId: member.departmentId || '',
                                          positionId: member.positionId || '',
                                          jobTitle: member.jobTitle || '',
                                        });
                                        setOrgModalOpen(true);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                                      title="Atur Divisi & Jabatan"
                                    >
                                      <Building2 className="w-4 h-4" />
                                    </button>

                                    {/* Toggle status button */}
                                    <button
                                      id={`toggle-status-${member.userId}`}
                                      type="button"
                                      onClick={() =>
                                        setStatusConfirm({
                                          open: true,
                                          member,
                                          targetStatus: isMemberActive ? 'INACTIVE' : 'ACTIVE',
                                        })
                                      }
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        isMemberActive
                                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                      }`}
                                      title={isMemberActive ? 'Nonaktifkan Akses' : 'Aktifkan Akses'}
                                    >
                                      {isMemberActive ? (
                                        <UserX className="w-4 h-4" />
                                      ) : (
                                        <UserCheck className="w-4 h-4" />
                                      )}
                                    </button>
                                  </>
                                )}

                                {canRemoveMember && !isOwner && !isSelf && (
                                  <button
                                    id={`remove-member-${member.userId}`}
                                    type="button"
                                    onClick={() => setRemoveConfirm({ open: true, member })}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Hapus dari Perusahaan"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
        )}

        {/* PENDING INVITATIONS TAB */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {pendingInvitations.length === 0 ? (
              <EmptyState
                title="Tidak Ada Undangan Menunggu"
                description="Semua undangan telah diterima atau kadaluwarsa. Gunakan tombol 'Undang Anggota' untuk mengundang karyawan baru."
                action={
                  canInvite ? (
                    <Button
                      id="invite-new-btn"
                      variant="primary"
                      onClick={() => navigate('/app/members/invite')}
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Kirim Undangan Baru
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-5 py-3.5">Email Penerima</th>
                        <th className="px-5 py-3.5">Peran Ditawarkan</th>
                        <th className="px-5 py-3.5">Pengundang</th>
                        <th className="px-5 py-3.5">Tgl Dikirim</th>
                        <th className="px-5 py-3.5">Kadaluwarsa</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                      {pendingInvitations.map((invite) => {
                        const isExpired = new Date(invite.expiresAt).getTime() < Date.now();
                        const inviteLink = `${window.location.origin}/invite/${invite.id}`;

                        return (
                          <tr
                            key={invite.id}
                            id={`invite-row-${invite.id}`}
                            className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40"
                          >
                            <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-neutral-100">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{invite.email}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                {invite.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-600">
                              {invite.invitedByName}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500">
                              {new Date(invite.createdAt).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {isExpired ? (
                                <Badge variant="danger" size="sm">
                                  Kadaluwarsa
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  Aktif (7 Hari)
                                </Badge>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  id={`copy-link-${invite.id}`}
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(inviteLink);
                                    showToast('Tautan undangan berhasil disalin!', 'success');
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Salin Tautan Undangan"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                {canInvite && (
                                  <button
                                    id={`cancel-invite-${invite.id}`}
                                    type="button"
                                    onClick={() => handleCancelInvitation(invite.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Batalkan Undangan"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
        )}

        {/* DRAWER: MEMBER DETAILS */}
        <Drawer
          isOpen={detailDrawerOpen}
          onClose={() => setDetailDrawerOpen(false)}
          title="Rincian Anggota"
          position="right"
        >
          {selectedMember && (
            <div id="member-detail-drawer" className="space-y-6 text-left py-2">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                <Avatar name={selectedMember.displayName} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base truncate">
                    {selectedMember.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{selectedMember.email}</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedMember.status === 'ACTIVE' || selectedMember.status === 'active'
                          ? 'success'
                          : 'default'
                      }
                      size="sm"
                    >
                      {selectedMember.status === 'ACTIVE' || selectedMember.status === 'active'
                        ? 'Status Aktif'
                        : 'Status Nonaktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Informasi Organisasi
                </h4>

                <div className="p-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peran Sistem:</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {selectedMember.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departemen / Divisi:</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {getDeptName(selectedMember.departmentId) || 'Belum Ditugaskan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jabatan Resmi:</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {getPosName(selectedMember.positionId) || selectedMember.jobTitle || 'Belum Ditugaskan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal Bergabung:</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">
                      {new Date(selectedMember.joinedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">User ID Platform:</span>
                    <span className="font-mono text-slate-500 truncate max-w-[160px]">
                      {selectedMember.userId}
                    </span>
                  </div>
                </div>
              </div>

              {canUpdateMember && selectedMember.role !== 'COMPANY_OWNER' && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-neutral-800">
                  <Button
                    id="drawer-edit-role-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTargetMemberForRole(selectedMember);
                      setSelectedRole(selectedMember.role);
                      setDetailDrawerOpen(false);
                      setRoleModalOpen(true);
                    }}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Ubah Peran (Role)
                  </Button>
                  <Button
                    id="drawer-edit-org-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTargetMemberForOrg(selectedMember);
                      setOrgForm({
                        departmentId: selectedMember.departmentId || '',
                        positionId: selectedMember.positionId || '',
                        jobTitle: selectedMember.jobTitle || '',
                      });
                      setDetailDrawerOpen(false);
                      setOrgModalOpen(true);
                    }}
                    leftIcon={<Building2 className="w-4 h-4" />}
                  >
                    Atur Divisi & Jabatan
                  </Button>
                </div>
              )}
            </div>
          )}
        </Drawer>

        {/* MODAL: UPDATE ROLE */}
        <Modal
          isOpen={roleModalOpen}
          onClose={() => {
            if (!isUpdatingRole) setRoleModalOpen(false);
          }}
          title="Ubah Peran Anggota"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-neutral-300">
              Pilih peran baru untuk <strong>{targetMemberForRole?.displayName}</strong>:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roles
                .filter((r) => r.id !== 'COMPANY_OWNER')
                .map((r) => (
                  <label
                    key={r.id}
                    id={`role-opt-${r.id}`}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === r.id || selectedRole === r.name
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-neutral-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="memberRole"
                      value={r.id}
                      checked={selectedRole === r.id || selectedRole === r.name}
                      onChange={() => setSelectedRole(r.id)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                        {r.name}
                      </p>
                      <p className="text-xs text-slate-500">{r.description}</p>
                    </div>
                  </label>
                ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleModalOpen(false)}
                disabled={isUpdatingRole}
              >
                Batal
              </Button>
              <Button
                id="save-role-btn"
                variant="primary"
                onClick={handleSaveRole}
                isLoading={isUpdatingRole}
              >
                Simpan Peran
              </Button>
            </div>
          </div>
        </Modal>

        {/* MODAL: UPDATE ORG ASSIGNMENT */}
        <Modal
          isOpen={orgModalOpen}
          onClose={() => {
            if (!isUpdatingOrg) setOrgModalOpen(false);
          }}
          title="Atur Divisi & Jabatan"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-neutral-300">
              Tetapkan departemen dan jabatan resmi untuk <strong>{targetMemberForOrg?.displayName}</strong>:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Departemen / Divisi
              </label>
              <select
                id="member-dept-select"
                value={orgForm.departmentId}
                onChange={(e) => setOrgForm({ ...orgForm, departmentId: e.target.value, positionId: '' })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Departemen --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Jabatan / Posisi Resmi
              </label>
              <select
                id="member-pos-select"
                value={orgForm.positionId}
                onChange={(e) => setOrgForm({ ...orgForm, positionId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Jabatan --</option>
                {positions
                  .filter((p) => !orgForm.departmentId || p.departmentId === orgForm.departmentId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Gelar Pekerjaan Kustom (Opsional)
              </label>
              <input
                id="member-jobtitle-input"
                type="text"
                placeholder="Contoh: Senior Frontend Lead"
                value={orgForm.jobTitle}
                onChange={(e) => setOrgForm({ ...orgForm, jobTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOrgModalOpen(false)}
                disabled={isUpdatingOrg}
              >
                Batal
              </Button>
              <Button
                id="save-org-btn"
                variant="primary"
                onClick={handleSaveOrg}
                isLoading={isUpdatingOrg}
              >
                Simpan Penugasan
              </Button>
            </div>
          </div>
        </Modal>

        {/* CONFIRM TOGGLE STATUS */}
        <ConfirmDialog
          isOpen={statusConfirm.open}
          onClose={() => setStatusConfirm({ open: false, member: null, targetStatus: 'INACTIVE' })}
          onConfirm={executeStatusToggle}
          title={statusConfirm.targetStatus === 'INACTIVE' ? 'Nonaktifkan Anggota' : 'Aktifkan Kembali Anggota'}
          description={`Apakah Anda yakin ingin ${
            statusConfirm.targetStatus === 'INACTIVE'
              ? 'menonaktifkan akses'
              : 'mengaktifkan kembali akses'
          } untuk "${statusConfirm.member?.displayName}"?`}
          confirmText={statusConfirm.targetStatus === 'INACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
          cancelText="Batal"
          variant={statusConfirm.targetStatus === 'INACTIVE' ? 'danger' : 'primary'}
        />

        {/* CONFIRM REMOVE MEMBER */}
        <ConfirmDialog
          isOpen={removeConfirm.open}
          onClose={() => setRemoveConfirm({ open: false, member: null })}
          onConfirm={executeRemoveMember}
          title="Hapus Anggota dari Perusahaan"
          description={`Apakah Anda yakin ingin menghapus "${removeConfirm.member?.displayName}" dari perusahaan? Anggota ini tidak akan dapat lagi mengakses data perusahaan ini.`}
          confirmText="Ya, Hapus Anggota"
          cancelText="Batal"
          variant="danger"
        />
      </div>
    </PermissionGuard>
  );
};
