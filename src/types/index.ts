// Platform Level Role: Controls platform-wide capabilities (ARVORA ONE super admin)
export type PlatformRole = 'SUPER_ADMIN' | 'USER';

// Company Tenant Level Role: Controls company workspace access and tenant permissions
export type CompanyRoleType = 'COMPANY_OWNER' | 'COMPANY_ADMIN' | 'EMPLOYEE' | string;

// Retained for backward compatibility
export type UserRole = CompanyRoleType;

export type CompanyStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';

export type SubscriptionPlan = 'TRIAL' | 'STARTER' | 'BUSINESS' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM ENTERPRISE';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Company {
  id: string; // Unique system-generated ID (e.g. comp_xxxxxxxxxxxx)
  name: string;
  legalName: string;
  slug: string;
  industry: string;
  businessType?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  country: string;
  website?: string;
  logoUrl?: string;
  ownerId: string;
  status: CompanyStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialStartAt: string; // ISO string
  trialEndAt: string; // ISO string (+7 days from start)
  memberCount: number;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  uid: string; // Alias for consistency with Firebase conventions
  email: string;
  displayName: string;
  fullName: string;
  phone?: string;
  phoneNumber?: string;
  jobTitle?: string;
  photoURL?: string;
  companyId: string | null;
  companyName?: string;
  companyRole?: CompanyRoleType | null;
  role: UserRole;
  platformRole: PlatformRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
  emailVerified: boolean;
}

export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'active' | 'pending' | 'revoked';

export interface CompanyMember {
  id: string; // `${companyId}_${userId}`
  companyId: string;
  userId: string;
  roleId: string;
  role: string;
  status: MembershipStatus;
  joinedAt: string;
  invitedBy?: string;
  displayName?: string;
  email?: string;
  jobTitle?: string;
  departmentId?: string;
  positionId?: string;
  lastActivityAt?: string;
  photoURL?: string;
}

export interface CompanyRole {
  id: string; // role_...
  companyId: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  companyId: string;
  departmentId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UserMembership {
  id: string; // `${companyId}_${userId}`
  userId: string;
  companyId: string;
  companyName: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED';
  joinedAt: string;
}

export interface CompanyInvitation {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'EMPLOYEE' | string;
  personalMessage?: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  companyId: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'COMPANY_CREATED'
    | 'MEMBER_INVITED'
    | 'MEMBER_JOINED'
    | 'ROLE_CHANGED'
    | 'COMPANY_UPDATED'
    | 'PROFILE_UPDATED'
    | 'COMPANY_SUSPENDED'
    | 'COMPANY_ACTIVATED'
    | string;
  resource: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  companyId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface ModuleRoadmapItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'COMING_SOON' | 'PLANNED' | 'FOUNDATION';
  phase: number;
  iconName: string;
}

// Backwards compatibility alias
export type CompanyUser = CompanyMember;
