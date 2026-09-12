import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCompanyRoles,
  createCompanyRole,
  updateCompanyRole,
  deleteCompanyRole,
  getCompanyMembers,
} from '../../firebase/firestore';
import {
  PERMISSION_CATALOG,
  PERMISSION_CATEGORIES,
  hasPermission,
  getPermissionsForRole,
} from '../../utils/permissions';
import type { CompanyRole, CompanyMember } from '../../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Check,
  X,
  Layers,
  Users,
  Building2,
  Settings,
} from 'lucide-react';

export const RolesManagementPage: React.FC = () => {
  const { userProfile, company } = useAuth();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');

  // Custom Role Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    role: CompanyRole | null;
  }>({
    open: false,
    role: null,
  });

  const currentUserRole = userProfile?.role || 'EMPLOYEE';
  const canManageRoles = hasPermission(currentUserRole, 'roles.manage');

  const loadData = async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [roleList, memberList] = await Promise.all([
        getCompanyRoles(company.id),
        getCompanyMembers(company.id),
      ]);
      setRoles(roleList);
      setMembers(memberList);
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat data peran dan izin.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
    setSelectedPermissions(['company.view', 'members.view']);
    setModalOpen(true);
  };

  const handleOpenEdit = (role: CompanyRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setSelectedPermissions([...role.permissions]);
    setModalOpen(true);
  };

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const toggleCategoryPermissions = (category: string) => {
    const catPerms = PERMISSION_CATALOG.filter((p) => p.category === category).map((p) => p.key);
    const allSelected = catPerms.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !catPerms.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...catPerms])));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Nama role wajib diisi.', 'error');
      return;
    }
    if (selectedPermissions.length === 0) {
      showToast('Pilih minimal 1 hak izin untuk peran ini.', 'error');
      return;
    }
    if (!company?.id || !userProfile) return;

    setIsSubmitting(true);
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };

    try {
      if (editingRole) {
        await updateCompanyRole(
          company.id,
          editingRole.id,
          {
            name: roleName,
            description: roleDesc,
            permissions: selectedPermissions,
          },
          actor
        );
        showToast('Peran berhasil diperbarui.', 'success');
      } else {
        await createCompanyRole(
          company.id,
          {
            name: roleName,
            description: roleDesc,
            permissions: selectedPermissions,
          },
          actor
        );
        showToast('Peran kustom baru berhasil dibuat.', 'success');
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan role.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteDialog.role || !company?.id || !userProfile) return;
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };

    try {
      await deleteCompanyRole(company.id, deleteDialog.role.id, actor);
      showToast(`Peran "${deleteDialog.role.name}" berhasil dihapus.`, 'success');
      setDeleteDialog({ open: false, role: null });
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus role.', 'error');
    }
  };

  const countMembersWithRole = (roleId: string, roleName: string) => {
    return members.filter((m) => m.roleId === roleId || m.role === roleId || m.role === roleName).length;
  };

  return (
    <PermissionGuard permission="roles.view" showAccessDeniedMessage>
      <div id="roles-management-page" className="max-w-7xl mx-auto space-y-6 pb-12">
        <PageHeader
          title="Manajemen Peran & Hak Akses"
          description="Atur peran sistem bawaan dan buat peran kustom dengan kombinasi izin granular sesuai struktur organisasi."
          action={
            canManageRoles && (
              <Button
                id="create-role-btn"
                variant="primary"
                onClick={handleOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Buat Peran Kustom
              </Button>
            )
          }
        />

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6">
          <button
            id="tab-role-cards"
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'cards'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Daftar Peran ({roles.length})</span>
          </button>
          <button
            id="tab-role-matrix"
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriks Matriks Hak Izin</span>
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Memuat daftar peran dan matriks izin..." />
        ) : activeTab === 'cards' ? (
          <div id="roles-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => {
              const assignedCount = countMembersWithRole(role.id, role.name);
              return (
                <Card
                  key={role.id}
                  id={`role-card-${role.id}`}
                  className="p-5 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-900 transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            role.isSystemRole
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 text-indigo-600'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-600'
                          }`}
                        >
                          {role.isSystemRole ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base">
                            {role.name}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            {role.isSystemRole ? 'Peran Sistem' : 'Peran Kustom'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={role.isSystemRole ? 'primary' : 'success'} size="sm">
                        {role.permissions.length} Izin
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-neutral-400 min-h-[36px] line-clamp-2">
                      {role.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Hak Akses Utama:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-medium text-slate-600 dark:text-neutral-300"
                          >
                            {p}
                          </span>
                        ))}
                        {role.permissions.length > 5 && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-semibold text-slate-500">
                            +{role.permissions.length - 5} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {assignedCount} Anggota Ditugaskan
                    </span>

                    <div className="flex items-center gap-1">
                      {!role.isSystemRole && canManageRoles && (
                        <>
                          <button
                            id={`edit-role-btn-${role.id}`}
                            type="button"
                            onClick={() => handleOpenEdit(role)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="Edit Peran Kustom"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-role-btn-${role.id}`}
                            type="button"
                            onClick={() => setDeleteDialog({ open: true, role })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Hapus Peran Kustom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* PERMISSION MATRIX VIEW */
          <div id="permission-matrix-container" className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-5 py-3.5 min-w-[240px]">Hak Akses / Permission</th>
                    <th className="px-5 py-3.5 min-w-[140px]">Kategori</th>
                    {roles.map((r) => (
                      <th key={r.id} className="px-4 py-3.5 text-center min-w-[120px]">
                        <span className="block font-bold truncate">{r.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {r.isSystemRole ? 'Sistem' : 'Kustom'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catPerms = PERMISSION_CATALOG.filter((p) => p.category === cat.key);
                    return (
                      <React.Fragment key={cat.key}>
                        <tr className="bg-slate-100/70 dark:bg-neutral-800/80 font-bold text-xs text-slate-700 dark:text-neutral-300">
                          <td colSpan={2 + roles.length} className="px-5 py-2 uppercase tracking-wider">
                            Kategori: {cat.label}
                          </td>
                        </tr>
                        {catPerms.map((perm) => (
                          <tr
                            key={perm.key}
                            id={`matrix-row-${perm.key}`}
                            className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40"
                          >
                            <td className="px-5 py-3">
                              <p className="font-semibold text-slate-900 dark:text-neutral-100 text-xs">
                                {perm.name}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {perm.key}
                              </p>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-600 dark:text-neutral-400">
                              {cat.label}
                            </td>
                            {roles.map((r) => {
                              const isGranted = r.permissions.includes(perm.key);
                              return (
                                <td key={r.id} className="px-4 py-3 text-center">
                                  {isGranted ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-300 dark:text-neutral-600">
                                      <X className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT CUSTOM ROLE */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            if (!isSubmitting) setModalOpen(false);
          }}
          title={editingRole ? 'Edit Peran Kustom' : 'Buat Peran Kustom Baru'}
          size="lg"
        >
          <form id="custom-role-form" onSubmit={handleSaveRole} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Peran <span className="text-red-500">*</span>
              </label>
              <Input
                id="role-name-input"
                placeholder="Contoh: HR Officer, Auditor Internal, Sales Lead"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Deskripsi Peran
              </label>
              <textarea
                id="role-desc-input"
                rows={2}
                placeholder="Uraian wewenang peran ini..."
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                  Pilih Hak Akses (Permissions) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-blue-600 font-semibold">
                  {selectedPermissions.length} Dipilih
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto border border-slate-200 dark:border-neutral-700 rounded-xl p-3 bg-slate-50/50 dark:bg-neutral-800/30">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const catPerms = PERMISSION_CATALOG.filter((p) => p.category === cat.key);
                  const isCatAllChecked = catPerms.every((p) => selectedPermissions.includes(p.key));

                  return (
                    <div key={cat.key} className="bg-white dark:bg-neutral-800 p-3 rounded-lg border border-slate-200/80 dark:border-neutral-700">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-700">
                        <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                          {cat.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCategoryPermissions(cat.key)}
                          className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                          {isCatAllChecked ? 'Batalkan Semua' : 'Pilih Semua'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {catPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              id={`perm-checkbox-label-${perm.key}`}
                              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                                isChecked
                                  ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
                                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-neutral-700/50'
                              }`}
                            >
                              <input
                                id={`perm-checkbox-${perm.key}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-900 dark:text-neutral-100">
                                  {perm.name}
                                </p>
                                <p className="text-[10px] text-slate-500 line-clamp-1">
                                  {perm.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                id="cancel-role-btn"
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                id="submit-role-btn"
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                {editingRole ? 'Simpan Perubahan' : 'Buat Peran'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* CONFIRM DELETE DIALOG */}
        <ConfirmDialog
          isOpen={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, role: null })}
          onConfirm={handleDeleteRole}
          title="Hapus Peran Kustom"
          description={`Apakah Anda yakin ingin menghapus peran "${deleteDialog.role?.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus Peran"
          cancelText="Batal"
          variant="danger"
        />
      </div>
    </PermissionGuard>
  );
};
