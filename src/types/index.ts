export type UserRole = 'SUPER_ADMIN' | 'COMPANY_OWNER' | 'COMPANY_ADMIN' | 'EMPLOYEE';

export type SubscriptionPlan = 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface Company {
  id: string; // Unique system-generated ID (e.g. comp_xxxxxxxxxxxx)
  name: string;
  slug: string;
  businessType?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  ownerId: string;
  createdAt: string; // ISO string
  updatedAt?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialStartAt: string; // ISO string
  trialEndAt: string; // ISO string (+7 days from start)
  memberCount: number;
}

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  fullName: string;
  phoneNumber?: string;
  companyId: string;
  companyName?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
  emailVerified: boolean;
}

export interface CompanyUser {
  id: string; // `${companyId}_${userId}`
  companyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  permissions: string[];
  joinedAt: string;
  status: 'active' | 'inactive';
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
