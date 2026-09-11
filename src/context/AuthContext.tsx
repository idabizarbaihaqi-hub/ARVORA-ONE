import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseConfigStatus, type FirebaseConfigStatus } from '../firebase/config';
import { getUserProfile, getCompany } from '../firebase/firestore';
import {
  registerCompanyOwner,
  loginWithEmail,
  logoutUser,
  type RegisterCompanyPayload,
} from '../firebase/auth';
import type { Company, UserProfile } from '../types';

interface AuthContextType {
  authUser: User | null;
  userProfile: UserProfile | null;
  company: Company | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  configStatus: FirebaseConfigStatus;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: RegisterCompanyPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCompany: () => Promise<void>;
  // Fallback exploration preview mode when Firebase isn't configured in environment
  previewSessionActive: boolean;
  startPreviewSession: () => void;
  exitPreviewSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewSessionActive, setPreviewSessionActive] = useState<boolean>(false);

  const configStatus = getFirebaseConfigStatus();

  // Load user data when auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          if (profile?.companyId) {
            const companyData = await getCompany(profile.companyId);
            setCompany(companyData);
          }
        } catch (err) {
          console.error('Error fetching user context:', err);
        }
      } else {
        setUserProfile(null);
        setCompany(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginWithEmail(email, pass);
      setUserProfile(res.userProfile);
      setCompany(res.company);
      setPreviewSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterCompanyPayload) => {
    setIsLoading(true);
    try {
      const res = await registerCompanyOwner(payload);
      setUserProfile(res.userProfile);
      setCompany(res.company);
      setPreviewSessionActive(false);
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

    // Initial architectural state preview conforming strictly to the data model and Zero Fake Data
    setPreviewSessionActive(true);
    setUserProfile({
      id: 'usr_preview_init',
      email: 'owner@arvoraone.internal',
      fullName: 'Founder / Administrator',
      companyId: 'comp_demo_tenant_01',
      companyName: 'PT Arvora Semesta Mandiri',
      role: 'COMPANY_OWNER',
      accountStatus: 'active',
      createdAt: now.toISOString(),
      emailVerified: true,
    });
    setCompany({
      id: 'comp_demo_tenant_01',
      name: 'PT Arvora Semesta Mandiri',
      slug: 'arvora-semesta',
      businessType: 'SaaS & Enterprise Technology',
      ownerId: 'usr_preview_init',
      createdAt: now.toISOString(),
      subscriptionPlan: 'TRIAL',
      subscriptionStatus: 'TRIAL',
      trialStartAt: now.toISOString(),
      trialEndAt: trialEnd.toISOString(),
      memberCount: 1, // Only the registered owner
    });
  };

  const exitPreviewSession = () => {
    setPreviewSessionActive(false);
    setUserProfile(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        company,
        isLoading,
        isFirebaseConfigured,
        configStatus,
        login,
        register,
        logout,
        refreshProfile,
        refreshCompany,
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
