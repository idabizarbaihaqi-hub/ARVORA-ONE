import type {
  Company,
  UserProfile,
  CompanyMember,
  CompanyInvitation,
  AuditLog,
  UserMembership,
  Department,
  Position,
  CompanyRole,
} from '../types';

const STORAGE_KEYS = {
  COMPANIES: 'arvora_store_companies',
  PROFILES: 'arvora_store_profiles',
  MEMBERSHIPS: 'arvora_store_memberships',
  MEMBERS: 'arvora_store_members',
  AUDIT_LOGS: 'arvora_store_audit_logs',
  INVITATIONS: 'arvora_store_invitations',
  DEPARTMENTS: 'arvora_store_departments',
  POSITIONS: 'arvora_store_positions',
  ROLES: 'arvora_store_roles',
} as const;

function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[tenantStore] Error reading key ${key}:`, e);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[tenantStore] Error writing key ${key}:`, e);
  }
}

// 1. Company
export function storeCompany(company: Company): void {
  const map = safeGetItem<Record<string, Company>>(STORAGE_KEYS.COMPANIES, {});
  map[company.id] = company;
  safeSetItem(STORAGE_KEYS.COMPANIES, map);
}

export function getStoredCompany(companyId: string): Company | null {
  const map = safeGetItem<Record<string, Company>>(STORAGE_KEYS.COMPANIES, {});
  return map[companyId] || null;
}

export function getAllStoredCompanies(): Company[] {
  const map = safeGetItem<Record<string, Company>>(STORAGE_KEYS.COMPANIES, {});
  return Object.values(map);
}

// 2. User Profile
export function storeUserProfile(profile: UserProfile): void {
  const map = safeGetItem<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
  map[profile.id] = profile;
  safeSetItem(STORAGE_KEYS.PROFILES, map);
}

export function getStoredUserProfile(userId: string): UserProfile | null {
  const map = safeGetItem<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
  return map[userId] || null;
}

export function getAllStoredProfiles(): UserProfile[] {
  const map = safeGetItem<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
  return Object.values(map);
}

// 3. User Membership
export function storeUserMembership(membership: UserMembership): void {
  const list = safeGetItem<UserMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
  const index = list.findIndex(m => m.id === membership.id);
  if (index >= 0) {
    list[index] = membership;
  } else {
    list.push(membership);
  }
  safeSetItem(STORAGE_KEYS.MEMBERSHIPS, list);
}

export function getStoredMemberships(userId: string): UserMembership[] {
  const list = safeGetItem<UserMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
  return list.filter(m => m.userId === userId && m.status === 'ACTIVE');
}

// 4. Company Member
export function storeCompanyMember(member: CompanyMember): void {
  const list = safeGetItem<CompanyMember[]>(STORAGE_KEYS.MEMBERS, []);
  const index = list.findIndex(m => m.companyId === member.companyId && m.userId === member.userId);
  if (index >= 0) {
    list[index] = member;
  } else {
    list.push(member);
  }
  safeSetItem(STORAGE_KEYS.MEMBERS, list);
}

export function getStoredCompanyMembers(companyId: string): CompanyMember[] {
  const list = safeGetItem<CompanyMember[]>(STORAGE_KEYS.MEMBERS, []);
  return list.filter(m => m.companyId === companyId);
}

// 5. Audit Log
export function storeAuditLog(log: AuditLog): void {
  const list = safeGetItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  list.unshift(log);
  // Keep last 200 logs
  if (list.length > 200) list.length = 200;
  safeSetItem(STORAGE_KEYS.AUDIT_LOGS, list);
}

export function getStoredAuditLogs(companyId: string): AuditLog[] {
  const list = safeGetItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  if (companyId === 'all' || companyId === 'global') return list;
  return list.filter(l => l.companyId === companyId);
}

export function getAllStoredAuditLogs(): AuditLog[] {
  return safeGetItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

// 6. Invitation
export function storeInvitation(inv: CompanyInvitation): void {
  const list = safeGetItem<CompanyInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  const index = list.findIndex(i => i.id === inv.id);
  if (index >= 0) {
    list[index] = inv;
  } else {
    list.push(inv);
  }
  safeSetItem(STORAGE_KEYS.INVITATIONS, list);
}

export function getStoredInvitationByToken(tokenOrId: string): CompanyInvitation | null {
  const list = safeGetItem<CompanyInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  return list.find(i => i.id === tokenOrId) || null;
}

export function getStoredCompanyInvitations(companyId: string): CompanyInvitation[] {
  const list = safeGetItem<CompanyInvitation[]>(STORAGE_KEYS.INVITATIONS, []);
  return list.filter(i => i.companyId === companyId);
}

// 7. Departments
export function storeDepartment(dept: Department): void {
  const list = safeGetItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
  const index = list.findIndex(d => d.id === dept.id && d.companyId === dept.companyId);
  if (index >= 0) {
    list[index] = dept;
  } else {
    list.push(dept);
  }
  safeSetItem(STORAGE_KEYS.DEPARTMENTS, list);
}

export function removeStoredDepartment(companyId: string, deptId: string): void {
  const list = safeGetItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
  safeSetItem(STORAGE_KEYS.DEPARTMENTS, list.filter(d => !(d.companyId === companyId && d.id === deptId)));
}

export function getStoredDepartments(companyId: string): Department[] {
  const list = safeGetItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
  const matched = list.filter(d => d.companyId === companyId);
  if (matched.length > 0) return matched;

  // Initialize sensible defaults for the new company if none exist yet
  const defaults: Department[] = [
    {
      id: `${companyId}_dept_ops`,
      companyId,
      name: 'Operasional & Layanan',
      description: 'Manajemen operasional harian dan koordinasi layanan pelanggan.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `${companyId}_dept_tech`,
      companyId,
      name: 'Teknologi & Produk',
      description: 'Pengembangan sistem informasi, infrastruktur digital, dan inovasi produk.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `${companyId}_dept_finance`,
      companyId,
      name: 'Keuangan & Akuntansi',
      description: 'Pengelolaan anggaran, pembukuan keuangan, perpajakan, dan kas bisnis.',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  defaults.forEach(d => storeDepartment(d));
  return defaults;
}

// 8. Positions
export function storePosition(pos: Position): void {
  const list = safeGetItem<Position[]>(STORAGE_KEYS.POSITIONS, []);
  const index = list.findIndex(p => p.id === pos.id && p.companyId === pos.companyId);
  if (index >= 0) {
    list[index] = pos;
  } else {
    list.push(pos);
  }
  safeSetItem(STORAGE_KEYS.POSITIONS, list);
}

export function removeStoredPosition(companyId: string, posId: string): void {
  const list = safeGetItem<Position[]>(STORAGE_KEYS.POSITIONS, []);
  safeSetItem(STORAGE_KEYS.POSITIONS, list.filter(p => !(p.companyId === companyId && p.id === posId)));
}

export function getStoredPositions(companyId: string, departmentId?: string): Position[] {
  const list = safeGetItem<Position[]>(STORAGE_KEYS.POSITIONS, []);
  let matched = list.filter(p => p.companyId === companyId);
  if (matched.length === 0) {
    // Seed defaults for company
    const defaults: Position[] = [
      {
        id: `${companyId}_pos_gm`,
        companyId,
        departmentId: `${companyId}_dept_ops`,
        name: 'General Manager',
        description: 'Penanggung jawab operasional harian perusahaan.',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${companyId}_pos_lead`,
        companyId,
        departmentId: `${companyId}_dept_tech`,
        name: 'Technical Lead',
        description: 'Pemimpin arsitektur sistem dan teknologi.',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${companyId}_pos_fin`,
        companyId,
        departmentId: `${companyId}_dept_finance`,
        name: 'Finance & Accounting Officer',
        description: 'Pelaksana pembukuan dan administrasi keuangan.',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    defaults.forEach(p => storePosition(p));
    matched = defaults;
  }

  if (departmentId) {
    return matched.filter(p => p.departmentId === departmentId);
  }
  return matched;
}

// 9. Roles
export function storeRole(role: CompanyRole): void {
  const list = safeGetItem<CompanyRole[]>(STORAGE_KEYS.ROLES, []);
  const index = list.findIndex(r => r.id === role.id && r.companyId === role.companyId);
  if (index >= 0) {
    list[index] = role;
  } else {
    list.push(role);
  }
  safeSetItem(STORAGE_KEYS.ROLES, list);
}

export function removeStoredRole(companyId: string, roleId: string): void {
  const list = safeGetItem<CompanyRole[]>(STORAGE_KEYS.ROLES, []);
  safeSetItem(STORAGE_KEYS.ROLES, list.filter(r => !(r.companyId === companyId && r.id === roleId)));
}

export function getStoredRoles(companyId: string): CompanyRole[] {
  const list = safeGetItem<CompanyRole[]>(STORAGE_KEYS.ROLES, []);
  return list.filter(r => r.companyId === companyId);
}
