import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, getFirebaseConfigStatus, type FirebaseConfigStatus } from '../firebase/config';
import {
  getUserProfile,
  getCompany,
  createCompanyOnboarding,
  getUserMemberships,
  switchActiveCompany,
  ensureSuperAdminRecord,
} from '../firebase/firestore';
import { storeUserProfile } from '../firebase/tenantStore';
import {
  registerNewUser,
  registerCompanyOwner,
  loginWithEmail,
  logoutUser,
  type RegisterCompanyPayload,
  type RegisterUserPayload,
} from '../firebase/auth';
import type { Company, UserProfile, UserMembership, PlatformRole, CompanyRoleType } from '../types';
import {
  resolveAuthorization,
  isOfficialPlatformAdminEmail,
  type ResolvedAuthorization,
} from '../utils/authResolution';

export interface OnboardingCompanyInput {
  name: string;
  legalName?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  website?: string;
}

export interface OnboardingOwnerInput {
  fullName: string;
  jobTitle?: string;
  phone?: string;
}

interface AuthContextType {
  authUser: User | null;
  userProfile: UserProfile | null;
  company: Company | null;
  memberships: UserMembership[];
  authorization: ResolvedAuthorization;
  platformRole: PlatformRole | null;
  companyRole: CompanyRoleType | null;
  isSuperAdmin: boolean;
  isCompanyOwner: boolean;
  isCompanyAdmin: boolean;
  isEmployee: boolean;
  isMemberActive: boolean;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  configStatus: FirebaseConfigStatus;
  login: (email: string, pass: string) => Promise<{ needsOnboarding: boolean; isSuperAdmin: boolean }>;
  register: (payload: RegisterUserPayload | RegisterCompanyPayload) => Promise<{ needsOnboarding: boolean; isSuperAdmin: boolean }>;
  completeOnboarding: (companyData: OnboardingCompanyInput, ownerData: OnboardingOwnerInput) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCompany: () => Promise<void>;
  refreshMemberships: () => Promise<void>;
  refreshIdToken: () => Promise<void>;
  previewSessionActive: boolean;
  startPreviewSession: () => void;
  exitPreviewSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [tokenClaims, setTokenClaims] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewSessionActive, setPreviewSessionActive] = useState<boolean>(false);

  const configStatus = getFirebaseConfigStatus();

  // Strict architectural separation of Platform Role vs Company Role
  const authorization = resolveAuthorization({
    authUser,
    userProfile,
    idTokenClaims: tokenClaims,
    activeCompanyId: company?.id || userProfile?.companyId || null,
    companyMemberships: memberships,
    activeCompanyOwnerId: company?.ownerId,
  });

  const isSuperAdmin = authorization.isSuperAdmin;
  const platformRole = authorization.platformRole;
  const companyRole = authorization.companyRole;
  const isCompanyOwner = authorization.isCompanyOwner;
  const isCompanyAdmin = authorization.isCompanyAdmin;
  const isEmployee = authorization.isEmployee;

  // Check if member is active in current company
  const isMemberActive = userProfile?.accountStatus !== 'suspended';

  const loadUserContext = async (uid: string) => {
    try {
      let claims: Record<string, any> | null = null;
      if (auth?.currentUser) {
        try {
          const tokenRes = await auth.currentUser.getIdTokenResult();
          claims = tokenRes.claims;
          setTokenClaims(claims);
        } catch {
          // Token claims check skipped
        }
      }

      let profile: UserProfile | null = null;
      try {
        profile = await getUserProfile(uid);
      } catch (profErr) {
        console.warn('Notice: Could not load user profile in context:', profErr);
      }

      const activeEmail = (auth?.currentUser?.email || profile?.email || '').trim().toLowerCase();
      const isOfficialSuperAdmin = isOfficialPlatformAdminEmail(activeEmail);
      const isSuper = Boolean(
        isOfficialSuperAdmin ||
        claims?.superAdmin === true ||
        claims?.platformRole === 'SUPER_ADMIN' ||
        claims?.role === 'SUPER_ADMIN' ||
        profile?.platformRole === 'SUPER_ADMIN'
      );

      // Auto-provision or restore platform Super Admin profile if official email / claim
      if (isSuper) {
        if (!profile) {
          profile = {
            id: uid,
            uid: uid,
            email: activeEmail,
            displayName: 'Super Admin ARVORA ONE',
            fullName: 'Super Admin ARVORA ONE',
            role: 'COMPANY_OWNER',
            companyRole: null,
            platformRole: 'SUPER_ADMIN',
            accountStatus: 'active',
            companyId: null,
            createdAt: new Date().toISOString(),
            emailVerified: true,
          };
          storeUserProfile(profile);
          if (db) {
            try {
              await setDoc(doc(db, 'users', uid), profile, { merge: true });
            } catch (err) {
              console.warn('Notice: Cloud user write queued:', err);
            }
          }
        } else if (profile.platformRole !== 'SUPER_ADMIN') {
          profile = {
            ...profile,
            platformRole: 'SUPER_ADMIN',
            companyRole: profile.companyRole || (profile.role !== 'SUPER_ADMIN' ? profile.role : 'COMPANY_OWNER'),
            role: profile.role !== 'SUPER_ADMIN' ? profile.role : 'COMPANY_OWNER',
          };
          storeUserProfile(profile);
          if (db) {
            try {
              await updateDoc(doc(db, 'users', uid), { platformRole: 'SUPER_ADMIN' });
            } catch (err) {
              console.warn('Notice: Cloud user platformRole update queued:', err);
            }
          }
        }

        // Register UID document in superAdmins collection
        await ensureSuperAdminRecord(uid, activeEmail);
      }

      setUserProfile(profile);

      if (profile?.companyId) {
        try {
          const companyData = await getCompany(profile.companyId);
          setCompany(companyData);
        } catch (compErr) {
          console.warn('Notice: Could not load company in context:', compErr);
          setCompany(null);
        }
      } else {
        setCompany(null);
      }

      try {
        const userMems = await getUserMemberships(uid);
        setMemberships(userMems);
      } catch (memErr) {
        console.warn('Notice: Could not load memberships in context:', memErr);
        setMemberships([]);
      }
    } catch (err) {
      console.error('Error fetching user context:', err);
    }
  };

  const refreshIdToken = async () => {
    if (!auth?.currentUser) return;
    try {
      const tokenRes = await auth.currentUser.getIdTokenResult(true);
      setTokenClaims(tokenRes.claims);
      await loadUserContext(auth.currentUser.uid);
    } catch (err) {
      console.warn('Failed refreshing ID token:', err);
    }
  };

  // Load user data when auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        await loadUserContext(user.uid);
      } else {
        setUserProfile(null);
        setCompany(null);
        setMemberships([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchCompany = async (targetCompanyId: string) => {
    if (previewSessionActive || !authUser) {
      return;
    }
    setIsLoading(true);
    try {
      const updatedComp = await switchActiveCompany(authUser.uid, targetCompanyId, {
        id: authUser.uid,
        name: userProfile?.fullName || 'User',
        email: authUser.email || '',
      });
      setCompany(updatedComp);
      await loadUserContext(authUser.uid);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMemberships = async () => {
    if (authUser) {
      const userMems = await getUserMemberships(authUser.uid);
      setMemberships(userMems);
    }
  };

  const login = async (email: string, pass: string): Promise<{ needsOnboarding: boolean; isSuperAdmin: boolean }> => {
    setIsLoading(true);
    try {
      const res = await loginWithEmail(email, pass);
      setUserProfile(res.userProfile);
      setCompany(res.company);
      setPreviewSessionActive(false);

      let claims: Record<string, any> | null = null;
      if (auth?.currentUser) {
        try {
          const tokenResult = await auth.currentUser.getIdTokenResult(true);
          claims = tokenResult.claims;
          setTokenClaims(claims);
        } catch {
          // ignore
        }
      }

      const authRes = resolveAuthorization({
        authUser: auth?.currentUser || null,
        userProfile: res.userProfile,
        idTokenClaims: claims,
        activeCompanyId: res.company?.id || res.userProfile?.companyId || null,
        activeCompanyOwnerId: res.company?.ownerId,
      });

      return {
        needsOnboarding: !authRes.isSuperAdmin && !res.userProfile?.companyId,
        isSuperAdmin: authRes.isSuperAdmin,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    payload: RegisterUserPayload | RegisterCompanyPayload
  ): Promise<{ needsOnboarding: boolean; isSuperAdmin: boolean }> => {
    setIsLoading(true);
    try {
      // If companyName was provided in the payload, register both in one shot
      if ('companyName' in payload && payload.companyName) {
        const res = await registerCompanyOwner(payload);
        setUserProfile(res.userProfile);
        setCompany(res.company);
        setPreviewSessionActive(false);
        return { needsOnboarding: false, isSuperAdmin: false };
      }

      // Standard multi-step: user created first, routes to onboarding
      const res = await registerNewUser(payload);
      setUserProfile(res.userProfile);
      setCompany(null);
      setPreviewSessionActive(false);
      return { needsOnboarding: true, isSuperAdmin: false };
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (
    companyData: OnboardingCompanyInput,
    ownerData: OnboardingOwnerInput
  ) => {
    setIsLoading(true);
    try {
      if (previewSessionActive || !isFirebaseConfigured || !authUser) {
        // Handle in preview mode
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const compId = `comp_${Date.now().toString(36)}`;
        const newComp: Company = {
          id: compId,
          name: companyData.name,
          legalName: companyData.legalName || companyData.name,
          slug: companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          industry: companyData.industry || 'Teknologi & Layanan',
          businessType: companyData.industry || 'Teknologi & Layanan',
          email: companyData.email || userProfile?.email || 'admin@perusahaan.com',
          phone: companyData.phone || ownerData.phone || '',
          address: companyData.address || '',
          city: companyData.city || '',
          province: companyData.province || '',
          country: companyData.country || 'Indonesia',
          website: companyData.website || '',
          ownerId: userProfile?.id || 'usr_preview',
          status: 'TRIAL',
          subscriptionPlan: 'TRIAL',
          subscriptionStatus: 'TRIAL',
          trialStartAt: now.toISOString(),
          trialEndAt: trialEnd.toISOString(),
          memberCount: 1,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        const updatedProfile: UserProfile = {
          id: userProfile?.id || 'usr_preview',
          uid: userProfile?.id || 'usr_preview',
          email: userProfile?.email || 'admin@perusahaan.com',
          fullName: ownerData.fullName,
          displayName: ownerData.fullName,
          jobTitle: ownerData.jobTitle || 'Pemilik',
          phone: ownerData.phone || '',
          companyId: compId,
          companyName: newComp.name,
          role: 'COMPANY_OWNER',
          platformRole: userProfile?.platformRole || 'USER',
          accountStatus: 'active',
          createdAt: now.toISOString(),
          emailVerified: true,
        };

        setCompany(newComp);
        setUserProfile(updatedProfile);
        return;
      }

      // Real Firebase Firestore onboarding
      const { company: createdComp, userProfile: updatedProf } = await createCompanyOnboarding(
        authUser.uid,
        authUser.email || '',
        companyData,
        ownerData
      );

      setCompany(createdComp);
      setUserProfile(updatedProf);
      if (authUser?.uid) {
        const freshMems = await getUserMemberships(authUser.uid);
        setMemberships(freshMems);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await logoutUser();
      }
      setAuthUser(null);
      setUserProfile(null);
      setCompany(null);
      setPreviewSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (authUser) {
      const profile = await getUserProfile(authUser.uid);
      setUserProfile(profile);
    }
  };

  const refreshCompany = async () => {
    if (userProfile?.companyId) {
      const companyData = await getCompany(userProfile.companyId);
      setCompany(companyData);
    }
  };

  const startPreviewSession = () => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setPreviewSessionActive(true);
    setUserProfile({
      id: 'usr_preview_init',
      uid: 'usr_preview_init',
      email: 'owner@arvoraone.internal',
      fullName: 'Ahmad Pratama',
      displayName: 'Ahmad Pratama',
      jobTitle: 'Direktur Utama',
      companyId: 'comp_demo_tenant_01',
      companyName: 'PT Maju Gemilang Nusantara',
      role: 'COMPANY_OWNER',
      platformRole: 'USER',
      accountStatus: 'active',
      createdAt: now.toISOString(),
      emailVerified: true,
    });
    setCompany({
      id: 'comp_demo_tenant_01',
      name: 'PT Maju Gemilang Nusantara',
      legalName: 'PT Maju Gemilang Nusantara Tbk',
      slug: 'maju-gemilang',
      industry: 'Teknologi & Layanan',
      businessType: 'Teknologi & Layanan',
      email: 'kontak@majugemilang.co.id',
      phone: '+62 21 555 0192',
      address: 'Jl. Jend. Sudirman Kav. 52-53',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      website: 'https://majugemilang.co.id',
      ownerId: 'usr_preview_init',
      status: 'TRIAL',
      subscriptionPlan: 'TRIAL',
      subscriptionStatus: 'TRIAL',
      trialStartAt: now.toISOString(),
      trialEndAt: trialEnd.toISOString(),
      memberCount: 1,
      createdAt: now.toISOString(),
    });
  };

  const exitPreviewSession = () => {
    setPreviewSessionActive(false);
    setUserProfile(null);
    setCompany(null);
  };

  const setSuperAdminPreview = (enable: boolean) => {
    if (!userProfile) return;
    setUserProfile({
      ...userProfile,
      platformRole: enable ? 'SUPER_ADMIN' : 'USER',
      role: enable ? 'SUPER_ADMIN' : userProfile.role,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        company,
        memberships,
        authorization,
        platformRole,
        companyRole,
        isSuperAdmin,
        isCompanyOwner,
        isCompanyAdmin,
        isEmployee,
        isMemberActive,
        isLoading,
        isFirebaseConfigured,
        configStatus,
        login,
        register,
        completeOnboarding,
        switchCompany,
        logout,
        refreshProfile,
        refreshCompany,
        refreshMemberships,
        refreshIdToken,
        previewSessionActive,
        startPreviewSession,
        exitPreviewSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
