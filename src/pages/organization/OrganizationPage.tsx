import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCompanyDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCompanyPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from '../../firebase/firestore';
import { hasPermission } from '../../utils/permissions';
import type { Department, Position } from '../../types';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderTree,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react';

export const OrganizationPage: React.FC = () => {
  const { userProfile, company } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'departments' | 'positions'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [deptSearch, setDeptSearch] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);

  // Position Modal State
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [posForm, setPosForm] = useState({
    name: '',
    departmentId: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [isSubmittingPos, setIsSubmittingPos] = useState(false);

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'department' | 'position';
    id: string;
    title: string;
  }>({
    open: false,
    type: 'department',
    id: '',
    title: '',
  });

  const currentUserRole = userProfile?.role || 'EMPLOYEE';
  const canManageOrg = hasPermission(currentUserRole, 'org.manage');

  const loadData = async () => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [deptList, posList] = await Promise.all([
        getCompanyDepartments(company.id),
        getCompanyPositions(company.id),
      ]);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      setPositions(Array.isArray(posList) ? posList : []);
    } catch (err: any) {
      setDepartments([]);
      setPositions([]);
      showToast(err?.message || 'Gagal memuat struktur organisasi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  // Handle Department Submit
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      showToast('Nama departemen wajib diisi.', 'error');
      return;
    }
    if (!company?.id || !userProfile) return;

    setIsSubmittingDept(true);
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };

    try {
      if (editingDept) {
        await updateDepartment(company.id, editingDept.id, deptForm, actor);
        showToast('Departemen berhasil diperbarui.', 'success');
      } else {
        await createDepartment(company.id, { name: deptForm.name, description: deptForm.description }, actor);
        showToast('Departemen baru berhasil ditambahkan.', 'success');
      }
      setDeptModalOpen(false);
      setEditingDept(null);
      setDeptForm({ name: '', description: '', status: 'ACTIVE' });
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan departemen.', 'error');
    } finally {
      setIsSubmittingDept(false);
    }
  };

  // Handle Position Submit
  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posForm.name.trim()) {
      showToast('Nama jabatan wajib diisi.', 'error');
      return;
    }
    if (!posForm.departmentId) {
      showToast('Pilih departemen untuk jabatan ini.', 'error');
      return;
    }
    if (!company?.id || !userProfile) return;

    setIsSubmittingPos(true);
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };

    try {
      if (editingPos) {
        await updatePosition(company.id, editingPos.id, posForm, actor);
        showToast('Jabatan berhasil diperbarui.', 'success');
      } else {
        await createPosition(
          company.id,
          {
            name: posForm.name,
            departmentId: posForm.departmentId,
            description: posForm.description,
          },
          actor
        );
        showToast('Jabatan baru berhasil ditambahkan.', 'success');
      }
      setPosModalOpen(false);
      setEditingPos(null);
      setPosForm({ name: '', departmentId: '', description: '', status: 'ACTIVE' });
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyimpan jabatan.', 'error');
    } finally {
      setIsSubmittingPos(false);
    }
  };

  // Handle Delete Confirmation Execution
  const executeDelete = async () => {
    if (!company?.id || !userProfile) return;
    const actor = {
      id: userProfile.id,
      name: userProfile.fullName,
      email: userProfile.email,
    };

    try {
      if (deleteConfirm.type === 'department') {
        await deleteDepartment(company.id, deleteConfirm.id, actor);
        showToast('Departemen beserta posisinya berhasil dihapus.', 'success');
      } else {
        await deletePosition(company.id, deleteConfirm.id, actor);
        showToast('Jabatan berhasil dihapus.', 'success');
      }
      setDeleteConfirm({ open: false, type: 'department', id: '', title: '' });
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus item.', 'error');
    }
  };

  // Filtered lists
  const filteredDepartments = (departments || []).filter((d) =>
    d?.name?.toLowerCase().includes(deptSearch.toLowerCase()) ||
    (d?.description && d.description.toLowerCase().includes(deptSearch.toLowerCase()))
  );

  const filteredPositions = (positions || []).filter((p) => {
    const matchesSearch =
      p?.name?.toLowerCase().includes(posSearch.toLowerCase()) ||
      (p?.description && p.description.toLowerCase().includes(posSearch.toLowerCase()));
    const matchesDept = selectedDeptFilter === 'ALL' || p?.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const getDeptName = (deptId: string) => {
    return (departments || []).find((d) => d?.id === deptId)?.name || 'Departemen Tidak Ditemukan';
  };

  return (
    <PermissionGuard permission="org.view" showAccessDeniedMessage>
      <div id="organization-page" className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <PageHeader
          title="Struktur Organisasi"
          description="Kelola departemen, divisi kerja, dan hierarki jabatan resmi di perusahaan Anda."
          action={
            canManageOrg && (
              <div className="flex items-center gap-2">
                {activeTab === 'departments' ? (
                  <Button
                    id="add-department-btn"
                    variant="primary"
                    onClick={() => {
                      setEditingDept(null);
                      setDeptForm({ name: '', description: '', status: 'ACTIVE' });
                      setDeptModalOpen(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Tambah Departemen
                  </Button>
                ) : (
                  <Button
                    id="add-position-btn"
                    variant="primary"
                    onClick={() => {
                      setEditingPos(null);
                      setPosForm({
                        name: '',
                        departmentId: departments[0]?.id || '',
                        description: '',
                        status: 'ACTIVE',
                      });
                      setPosModalOpen(true);
                    }}
                    disabled={departments.length === 0}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Tambah Jabatan
                  </Button>
                )}
              </div>
            )
          }
        />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 gap-6">
          <button
            id="tab-departments"
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'departments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departemen / Divisi ({departments.length})</span>
          </button>
          <button
            id="tab-positions"
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'positions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-neutral-400'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jabatan / Posisi ({positions.length})</span>
          </button>
        </div>

        {/* DEPARTMENTS TAB CONTENT */}
        {activeTab === 'departments' && (
          <div id="departments-tab-content" className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-neutral-900 p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-dept-input"
                  type="text"
                  placeholder="Cari departemen..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-xs text-slate-500">
                Menampilkan {filteredDepartments.length} dari {departments.length} departemen
              </span>
            </div>

            {isLoading ? (
              <LoadingState message="Memuat daftar departemen..." />
            ) : filteredDepartments.length === 0 ? (
              <EmptyState
                title={deptSearch ? 'Departemen Tidak Ditemukan' : 'Belum Ada Departemen'}
                description={
                  deptSearch
                    ? 'Coba gunakan kata kunci pencarian lainnya.'
                    : 'Mulai dengan menambahkan divisi operasional perusahaan seperti Keuangan, SDM, Teknologi, atau Operasional.'
                }
                action={
                  canManageOrg && !deptSearch ? (
                    <Button
                      id="empty-add-dept-btn"
                      variant="primary"
                      onClick={() => {
                        setEditingDept(null);
                        setDeptForm({ name: '', description: '', status: 'ACTIVE' });
                        setDeptModalOpen(true);
                      }}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buat Departemen Pertama
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDepartments.map((dept) => {
                  const linkedPositionsCount = positions.filter((p) => p.departmentId === dept.id).length;
                  return (
                    <Card
                      key={dept.id}
                      id={`dept-card-${dept.id}`}
                      className="p-5 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-900 transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-neutral-100 text-base truncate">
                              {dept.name}
                            </h3>
                          </div>
                          <Badge variant={dept.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                            {dept.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
                          {dept.description || 'Tidak ada deskripsi departemen.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {linkedPositionsCount} Jabatan Terdaftar
                        </span>

                        {canManageOrg && (
                          <div className="flex items-center gap-1">
                            <button
                              id={`edit-dept-btn-${dept.id}`}
                              type="button"
                              onClick={() => {
                                setEditingDept(dept);
                                setDeptForm({
                                  name: dept.name,
                                  description: dept.description || '',
                                  status: dept.status,
                                });
                                setDeptModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              title="Edit Departemen"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-dept-btn-${dept.id}`}
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  type: 'department',
                                  id: dept.id,
                                  title: dept.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="Hapus Departemen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* POSITIONS TAB CONTENT */}
        {activeTab === 'positions' && (
          <div id="positions-tab-content" className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-neutral-900 p-3 rounded-xl border border-slate-200/80 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-pos-input"
                    type="text"
                    placeholder="Cari nama jabatan..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  id="filter-pos-dept-select"
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full sm:w-56 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Departemen</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-slate-500">
                Menampilkan {filteredPositions.length} dari {positions.length} jabatan
              </span>
            </div>

            {isLoading ? (
              <LoadingState message="Memuat daftar jabatan..." />
            ) : departments.length === 0 ? (
              <EmptyState
                title="Departemen Diperlukan Terlebih Dahulu"
                description="Sebelum membuat jabatan, silakan daftarkan minimal 1 departemen untuk menampung posisi tersebut."
                action={
                  canManageOrg ? (
                    <Button
                      id="create-dept-first-btn"
                      variant="primary"
                      onClick={() => {
                        setActiveTab('departments');
                        setDeptModalOpen(true);
                      }}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buat Departemen Dulu
                    </Button>
                  ) : undefined
                }
              />
            ) : filteredPositions.length === 0 ? (
              <EmptyState
                title={posSearch ? 'Jabatan Tidak Ditemukan' : 'Belum Ada Jabatan'}
                description={
                  posSearch
                    ? 'Coba gunakan kata kunci pencarian yang berbeda.'
                    : 'Daftarkan posisi kerja spesifik seperti Manajer Pemasaran, Akuntan Senior, atau Software Engineer.'
                }
                action={
                  canManageOrg && !posSearch ? (
                    <Button
                      id="empty-add-pos-btn"
                      variant="primary"
                      onClick={() => {
                        setEditingPos(null);
                        setPosForm({
                          name: '',
                          departmentId: departments[0]?.id || '',
                          description: '',
                          status: 'ACTIVE',
                        });
                        setPosModalOpen(true);
                      }}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Buat Jabatan Pertama
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-5 py-3.5">Nama Jabatan</th>
                        <th className="px-5 py-3.5">Departemen</th>
                        <th className="px-5 py-3.5">Deskripsi Singkat</th>
                        <th className="px-5 py-3.5">Status</th>
                        {canManageOrg && <th className="px-5 py-3.5 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                      {filteredPositions.map((pos) => (
                        <tr
                          key={pos.id}
                          id={`pos-row-${pos.id}`}
                          className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-neutral-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600">
                                <Briefcase className="w-3.5 h-3.5" />
                              </div>
                              <span>{pos.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-neutral-300">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-300">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {getDeptName(pos.departmentId)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 dark:text-neutral-400 max-w-xs truncate">
                            {pos.description || '-'}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={pos.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                              {pos.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </td>
                          {canManageOrg && (
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  id={`edit-pos-btn-${pos.id}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingPos(pos);
                                    setPosForm({
                                      name: pos.name,
                                      departmentId: pos.departmentId,
                                      description: pos.description || '',
                                      status: pos.status,
                                    });
                                    setPosModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                  title="Edit Jabatan"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  id={`delete-pos-btn-${pos.id}`}
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      open: true,
                                      type: 'position',
                                      id: pos.id,
                                      title: pos.name,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                  title="Hapus Jabatan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD / EDIT DEPARTMENT */}
        <Modal
          isOpen={deptModalOpen}
          onClose={() => {
            if (!isSubmittingDept) {
              setDeptModalOpen(false);
              setEditingDept(null);
            }
          }}
          title={editingDept ? 'Edit Departemen' : 'Tambah Departemen Baru'}
        >
          <form id="dept-form" onSubmit={handleSaveDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Departemen / Divisi <span className="text-red-500">*</span>
              </label>
              <Input
                id="dept-name-input"
                placeholder="Contoh: Keuangan & Akuntansi"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Deskripsi Singkat
              </label>
              <textarea
                id="dept-desc-input"
                rows={3}
                placeholder="Tanggung jawab dan lingkup kerja divisi ini..."
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {editingDept && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Status Operasional
                </label>
                <select
                  id="dept-status-select"
                  value={deptForm.status}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                id="cancel-dept-btn"
                type="button"
                variant="outline"
                onClick={() => setDeptModalOpen(false)}
                disabled={isSubmittingDept}
              >
                Batal
              </Button>
              <Button
                id="submit-dept-btn"
                type="submit"
                variant="primary"
                isLoading={isSubmittingDept}
              >
                {editingDept ? 'Simpan Perubahan' : 'Buat Departemen'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: ADD / EDIT POSITION */}
        <Modal
          isOpen={posModalOpen}
          onClose={() => {
            if (!isSubmittingPos) {
              setPosModalOpen(false);
              setEditingPos(null);
            }
          }}
          title={editingPos ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
        >
          <form id="pos-form" onSubmit={handleSavePosition} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Departemen Naungan <span className="text-red-500">*</span>
              </label>
              <select
                id="pos-dept-select"
                value={posForm.departmentId}
                onChange={(e) => setPosForm({ ...posForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Jabatan / Posisi <span className="text-red-500">*</span>
              </label>
              <Input
                id="pos-name-input"
                placeholder="Contoh: Senior Business Analyst"
                value={posForm.name}
                onChange={(e) => setPosForm({ ...posForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Deskripsi Jabatan & Tanggung Jawab
              </label>
              <textarea
                id="pos-desc-input"
                rows={3}
                placeholder="Uraian tugas pokok dan wewenang posisi ini..."
                value={posForm.description}
                onChange={(e) => setPosForm({ ...posForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {editingPos && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Status Jabatan
                </label>
                <select
                  id="pos-status-select"
                  value={posForm.status}
                  onChange={(e) =>
                    setPosForm({ ...posForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
              <Button
                id="cancel-pos-btn"
                type="button"
                variant="outline"
                onClick={() => setPosModalOpen(false)}
                disabled={isSubmittingPos}
              >
                Batal
              </Button>
              <Button
                id="submit-pos-btn"
                type="submit"
                variant="primary"
                isLoading={isSubmittingPos}
              >
                {editingPos ? 'Simpan Perubahan' : 'Buat Jabatan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* CONFIRM DELETE DIALOG */}
        <ConfirmDialog
          isOpen={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, type: 'department', id: '', title: '' })}
          onConfirm={executeDelete}
          title={`Hapus ${deleteConfirm.type === 'department' ? 'Departemen' : 'Jabatan'}`}
          description={`Apakah Anda yakin ingin menghapus "${deleteConfirm.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus Sekarang"
          cancelText="Batal"
          variant="danger"
        />
      </div>
    </PermissionGuard>
  );
};
