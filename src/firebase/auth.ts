import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import {
  getUserProfile,
  getCompany,
  createCompanyOnboarding,
  recordAuditLog,
} from './firestore';
import { storeUserProfile, getStoredUserProfile, getStoredCompany } from './tenantStore';
import type { Company, UserProfile, UserRole } from '../types';

export interface RegisterUserPayload {
  fullName: string;
  email: string;
  password: string;
}

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

/**
 * Register a brand-new user without a company yet (routes to /onboarding)
 */
export async function registerNewUser(payload: RegisterUserPayload): Promise<{
  userProfile: UserProfile;
}> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi. Silakan periksa kredensial Firebase di .env');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  const authUser = userCredential.user;
  const now = new Date().toISOString();

  const userProfile: UserProfile = {
    id: authUser.uid,
    uid: authUser.uid,
    email: payload.email.trim().toLowerCase(),
    displayName: payload.fullName.trim(),
    fullName: payload.fullName.trim(),
    companyId: null, // Empty until onboarding or invitation acceptance
    role: 'EMPLOYEE' as UserRole,
    platformRole: 'USER',
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    emailVerified: authUser.emailVerified,
  };

  storeUserProfile(userProfile);

  if (db) {
    try {
      await setDoc(doc(db, 'users', authUser.uid), userProfile);
    } catch (err) {
      console.warn('Notice: Cloud Firestore user write queued/offline:', err);
    }
  }

  // Attempt to send email verification
  try {
    await sendEmailVerification(authUser);
  } catch (verifyErr) {
    console.warn('Notice: Email verification skipped:', verifyErr);
  }

  return { userProfile };
}

/**
 * Direct owner registration (wizard/one-shot fallback)
 */
export async function registerCompanyOwner(payload: RegisterCompanyPayload): Promise<{
  userProfile: UserProfile;
  company: Company;
}> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi. Silakan periksa kredensial Firebase di .env');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  const authUser = userCredential.user;

  const { company, userProfile } = await createCompanyOnboarding(
    authUser.uid,
    payload.email.trim().toLowerCase(),
    {
      name: payload.companyName,
      industry: payload.businessType || 'Teknologi & Layanan',
    },
    {
      fullName: payload.fullName,
      jobTitle: 'Pemilik / Direktur',
    }
  );

  try {
    await sendEmailVerification(authUser);
  } catch (verifyErr) {
    console.warn('Notice: Email verification skipped:', verifyErr);
  }

  return { userProfile, company };
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{
  userProfile: UserProfile | null;
  company: Company | null;
}> {
  if (!auth) {
    throw new Error('Firebase Authentication belum terkonfigurasi. Silakan periksa kredensial Firebase di .env');
  }

  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const userId = credential.user.uid;

  let profile: UserProfile | null = null;
  try {
    profile = await getUserProfile(userId);
  } catch (profileErr) {
    console.warn('Notice: Could not load user profile on login:', profileErr);
  }
  if (!profile) {
    profile = getStoredUserProfile(userId);
  }

  let company: Company | null = null;
  if (profile?.companyId) {
    try {
      company = await getCompany(profile.companyId);
    } catch (companyErr) {
      console.warn('Notice: Could not load company on login:', companyErr);
    }
    if (!company) {
      company = getStoredCompany(profile.companyId);
    }
  }

  if (profile) {
    try {
      await recordAuditLog({
        actorId: userId,
        actorName: profile.fullName || 'User',
        actorEmail: email,
        companyId: profile.companyId || 'global',
        action: 'LOGIN',
        resource: 'auth',
        resourceId: userId,
      });
    } catch (auditErr) {
      console.warn('Notice: Audit log skipped on login:', auditErr);
    }
  }

  return { userProfile: profile, company };
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  const user = auth.currentUser;
  if (user) {
    try {
      await recordAuditLog({
        actorId: user.uid,
        actorName: user.displayName || 'User',
        actorEmail: user.email || '',
        companyId: 'global',
        action: 'LOGOUT',
        resource: 'auth',
        resourceId: user.uid,
      });
    } catch (err) {
      console.warn('Notice: Audit log skipped on logout:', err);
    }
  }
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
