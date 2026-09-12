import { UserRole, CompanyRole } from '../types';

export type Permission =
  // Category COMPANY
  | 'company.view'
  | 'company.update'
  // Category MEMBERS
  | 'members.view'
  | 'members.invite'
  | 'members.update'
  | 'members.remove'
  // Backward-compat aliases
  | 'company.members.view'
  | 'company.members.invite'
  | 'company.members.update'
  | 'company.members.remove'
  // Category ROLES
  | 'roles.view'
  | 'roles.manage'
  // Category PERMISSIONS
  | 'permissions.view'
  // Category SETTINGS
  | 'settings.view'
  | 'settings.update'
  | 'company.settings.view'
  | 'company.settings.update'
  // Category ORGANIZATION
  | 'org.view'
  | 'org.manage';

export interface PermissionDefinition {
  code: Permission;
  key: Permission;
  label: string;
  name: string;
  description: string;
  category: 'COMPANY' | 'MEMBERS' | 'ROLES' | 'SETTINGS' | 'ORGANIZATION';
}

export const PERMISSION_CATEGORIES = [
  { key: 'COMPANY', label: 'Perusahaan & Profil Bisnis' },
  { key: 'MEMBERS', label: 'Manajemen Anggota Tim' },
  { key: 'ROLES', label: 'Peran & Hak Akses' },
  { key: 'ORGANIZATION', label: 'Struktur Organisasi (Divisi & Jabatan)' },
  { key: 'SETTINGS', label: 'Pengaturan Sistem' },
];

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  // COMPANY
  {
    code: 'company.view',
    key: 'company.view',
    label: 'Lihat Profil Bisnis',
    name: 'Lihat Profil Bisnis',
    description: 'Mengakses informasi umum, legalitas, dan status operasional perusahaan.',
    category: 'COMPANY',
  },
  {
    code: 'company.update',
    key: 'company.update',
    label: 'Ubah Data Perusahaan',
    name: 'Ubah Data Perusahaan',
    description: 'Memperbarui nama bisnis, alamat, kontak, dan identitas resmi perusahaan.',
    category: 'COMPANY',
  },

  // MEMBERS
  {
    code: 'members.view',
    key: 'members.view',
    label: 'Lihat Anggota Tim',
    name: 'Lihat Anggota Tim',
    description: 'Melihat daftar anggota, status keanggotaan, jabatan, dan tanggal bergabung.',
    category: 'MEMBERS',
  },
  {
    code: 'members.invite',
    key: 'members.invite',
    label: 'Undang Anggota Baru',
    name: 'Undang Anggota Baru',
    description: 'Mengirimkan dan menerbitkan tautan undangan anggota tim baru.',
    category: 'MEMBERS',
  },
  {
    code: 'members.update',
    key: 'members.update',
    label: 'Kelola Status & Peran Anggota',
    name: 'Kelola Status & Peran Anggota',
    description: 'Mengubah peran, mengaktifkan, atau menonaktifkan status keanggotaan anggota.',
    category: 'MEMBERS',
  },
  {
    code: 'members.remove',
    key: 'members.remove',
    label: 'Hapus Keanggotaan',
    name: 'Hapus Keanggotaan',
    description: 'Mencabut hak akses keanggotaan anggota dari perusahaan secara permanen.',
    category: 'MEMBERS',
  },

  // ROLES
  {
    code: 'roles.view',
    key: 'roles.view',
    label: 'Lihat Daftar Peran (Roles)',
    name: 'Lihat Daftar Peran (Roles)',
    description: 'Melihat rincian peran default dan custom role perusahaan beserta hak aksesnya.',
    category: 'ROLES',
  },
  {
    code: 'roles.manage',
    key: 'roles.manage',
    label: 'Kelola Peran & Otoritas',
    name: 'Kelola Peran & Otoritas',
    description: 'Membuat, mengubah, dan menghapus custom role serta menetapkan matriks izin.',
    category: 'ROLES',
  },

  // PERMISSIONS
  {
    code: 'permissions.view',
    key: 'permissions.view',
    label: 'Lihat Matriks Perizinan',
    name: 'Lihat Matriks Perizinan',
    description: 'Memeriksa daftar seluruh hak akses sistem dan cakupan wewenang.',
    category: 'ROLES',
  },

  // SETTINGS
  {
    code: 'settings.view',
    key: 'settings.view',
    label: 'Akses Setelan Umum',
    name: 'Akses Setelan Umum',
    description: 'Melihat preferensi tampilan, format tanggal, dan konfigurasi umum sistem.',
    category: 'SETTINGS',
  },
  {
    code: 'settings.update',
    key: 'settings.update',
    label: 'Ubah Setelan Sistem',
    name: 'Ubah Setelan Sistem',
    description: 'Memperbarui parameter konfigurasi, zona waktu, dan preferensi kerja.',
    category: 'SETTINGS',
  },

  // ORGANIZATION
  {
    code: 'org.view',
    key: 'org.view',
    label: 'Lihat Struktur Organisasi',
    name: 'Lihat Struktur Organisasi',
    description: 'Melihat bagan departemen, hierarki divisi, dan daftar posisi jabatan.',
    category: 'ORGANIZATION',
  },
  {
    code: 'org.manage',
    key: 'org.manage',
    label: 'Kelola Struktur Organisasi',
    name: 'Kelola Struktur Organisasi',
    description: 'Menambah, menyunting, dan menghapus divisi/departemen serta posisi jabatan.',
    category: 'ORGANIZATION',
  },
];

/**
 * Normalizes legacy permission keys to standard keys
 */
export const normalizePermission = (p: string): Permission => {
  switch (p) {
    case 'company.members.view':
      return 'members.view';
    case 'company.members.invite':
      return 'members.invite';
    case 'company.members.update':
      return 'members.update';
    case 'company.members.remove':
      return 'members.remove';
    case 'company.settings.view':
      return 'settings.view';
    case 'company.settings.update':
      return 'settings.update';
    default:
      return p as Permission;
  }
};

/**
 * Standard System Roles default permissions
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'company.view',
    'company.update',
    'members.view',
    'members.invite',
    'members.update',
    'members.remove',
    'roles.view',
    'roles.manage',
    'permissions.view',
    'settings.view',
    'settings.update',
    'org.view',
    'org.manage',
  ],
  COMPANY_OWNER: [
    'company.view',
    'company.update',
    'members.view',
    'members.invite',
    'members.update',
    'members.remove',
    'roles.view',
    'roles.manage',
    'permissions.view',
    'settings.view',
    'settings.update',
    'org.view',
    'org.manage',
  ],
  COMPANY_ADMIN: [
    'company.view',
    'members.view',
    'members.invite',
    'members.update',
    'roles.view',
    'permissions.view',
    'settings.view',
    'org.view',
    'org.manage',
  ],
  EMPLOYEE: [
    'company.view',
    'members.view',
    'org.view',
  ],
};

/**
 * Check if a role possesses a specific permission (supports system roles and custom roles)
 */
export const hasPermission = (
  roleOrPermissions: string | string[] | undefined | null,
  permission: Permission,
  customRoles?: CompanyRole[]
): boolean => {
  if (!roleOrPermissions) return false;

  const target = normalizePermission(permission);

  // If passed an array of raw permissions directly
  if (Array.isArray(roleOrPermissions)) {
    return roleOrPermissions.map(normalizePermission).includes(target);
  }

  const roleStr = roleOrPermissions.trim();

  // Super Admin & Company Owner inherently have all permissions
  if (roleStr === 'SUPER_ADMIN' || roleStr === 'COMPANY_OWNER') {
    return true;
  }

  // Check built-in system role
  if (ROLE_PERMISSIONS[roleStr]) {
    const list = ROLE_PERMISSIONS[roleStr].map(normalizePermission);
    return list.includes(target);
  }

  // Check custom role if provided
  if (customRoles && customRoles.length > 0) {
    const match = customRoles.find((r) => r.id === roleStr || r.name.toLowerCase() === roleStr.toLowerCase());
    if (match) {
      return match.permissions.map(normalizePermission).includes(target);
    }
  }

  return false;
};

/**
 * Return the list of permissions for a role (system role or custom role)
 */
export const getPermissionsForRole = (
  roleIdOrName: string,
  customRoles?: CompanyRole[]
): Permission[] => {
  if (!roleIdOrName) return [];
  const normalized = roleIdOrName.trim();
  if (normalized === 'SUPER_ADMIN' || normalized === 'COMPANY_OWNER') {
    return PERMISSION_CATALOG.map((p) => p.code);
  }
  if (ROLE_PERMISSIONS[normalized]) {
    return ROLE_PERMISSIONS[normalized];
  }
  if (customRoles && customRoles.length > 0) {
    const match = customRoles.find(
      (r) => r.id === normalized || r.name.toLowerCase() === normalized.toLowerCase()
    );
    if (match) {
      return match.permissions as Permission[];
    }
  }
  return [];
};

/**
 * Check if the acting user can manage or change the role of a target member
 */
export const canManageMember = (
  actingRole: string | undefined | null,
  targetRole: string | undefined | null
): boolean => {
  if (!actingRole) return false;
  if (actingRole === 'SUPER_ADMIN') return true;
  if (actingRole === 'COMPANY_OWNER') {
    // Owner can manage everyone except other owners (or self)
    return targetRole !== 'COMPANY_OWNER' && targetRole !== 'SUPER_ADMIN';
  }
  if (actingRole === 'COMPANY_ADMIN') {
    // Company admin can only manage employees or custom non-admin roles
    return targetRole === 'EMPLOYEE';
  }
  return false;
};

/**
 * Check if the acting user has authority to assign a specific role to someone else
 * (Anti-Privilege Escalation)
 */
export const canAssignRole = (
  actingRole: string | undefined | null,
  roleToAssign: string
): boolean => {
  if (!actingRole) return false;
  if (actingRole === 'SUPER_ADMIN') return true;
  if (actingRole === 'COMPANY_OWNER') {
    // Cannot assign SUPER_ADMIN
    return roleToAssign !== 'SUPER_ADMIN';
  }
  if (actingRole === 'COMPANY_ADMIN') {
    // Cannot assign SUPER_ADMIN or COMPANY_OWNER
    return roleToAssign === 'EMPLOYEE';
  }
  return false;
};
