import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './config';
import { createTenantData, getUserProfile, getCompany } from './firestore';
import type { Company, UserProfile, CompanyUser, UserRole } from '../types';

export interface RegisterCompanyPayload {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  businessType?: string;
}

export function generateTenantId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `comp_${timestamp}_${random}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function registerCompanyOwner(payload: RegisterCompanyPayload): Promise<{
  userProfile: UserProfile;
  company: Company;
}> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi. Silakan periksa kredensial Firebase di .env');
  }

  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  const authUser = userCredential.user;

  // 2. Generate unique company ID and slug
  const companyId = generateTenantId();
  const companySlug = generateSlug(payload.companyName) || companyId;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial

  // 3. Prepare Multi-Tenant data models
  const company: Company = {
    id: companyId,
    name: payload.companyName.trim(),
    slug: companySlug,
    businessType: payload.businessType || 'General Business',
    ownerId: authUser.uid,
    createdAt: now.toISOString(),
    subscriptionPlan: 'TRIAL',
    subscriptionStatus: 'TRIAL',
    trialStartAt: now.toISOString(),
    trialEndAt: trialEnd.toISOString(),
    memberCount: 1,
  };

  const userProfile: UserProfile = {
    id: authUser.uid,
    email: payload.email.trim(),
    fullName: payload.fullName.trim(),
    companyId: companyId,
    companyName: company.name,
    role: 'COMPANY_OWNER' as UserRole,
    accountStatus: 'active',
    createdAt: now.toISOString(),
    emailVerified: authUser.emailVerified,
  };

  const companyUser: CompanyUser = {
    id: `${companyId}_${authUser.uid}`,
    companyId: companyId,
    userId: authUser.uid,
    userEmail: payload.email.trim(),
    userName: payload.fullName.trim(),
    role: 'COMPANY_OWNER',
    permissions: [
      'MANAGE_COMPANY',
      'MANAGE_USERS',
      'VIEW_REPORTS',
      'MANAGE_SETTINGS',
      'ACCESS_MODULES',
      'INVITE_MEMBERS',
    ],
    joinedAt: now.toISOString(),
    status: 'active',
  };

  // 4. Save to Firestore atomically
  await createTenantData(company, userProfile, companyUser);

  // Optional: Send email verification
  try {
    await sendEmailVerification(authUser);
  } catch (verifyErr) {
    console.warn('Notice: Email verification dispatch skipped:', verifyErr);
  }

  return { userProfile, company };
}

export async function loginWithEmail(email: string, password: string): Promise<{
  userProfile: UserProfile | null;
  company: Company | null;
}> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi. Silakan periksa kredensial Firebase di .env');
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const userId = credential.user.uid;

  const profile = await getUserProfile(userId);
  let company: Company | null = null;
  if (profile?.companyId) {
    company = await getCompany(profile.companyId);
  }

  return { userProfile: profile, company };
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export async function sendResetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi.');
  }
  await sendPasswordResetEmail(auth, email);
}

export async function triggerEmailVerification(): Promise<void> {
  if (!auth?.currentUser) {
    throw new Error('Pengguna belum terautentikasi.');
  }
  await sendEmailVerification(auth.currentUser);
}
