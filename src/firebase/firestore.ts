import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  getDocFromServer,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  storeCompany,
  getStoredCompany,
  getAllStoredCompanies,
  storeUserProfile,
  getStoredUserProfile,
  getAllStoredProfiles,
  storeUserMembership,
  getStoredMemberships,
  storeCompanyMember,
  getStoredCompanyMembers,
  storeAuditLog,
  getStoredAuditLogs,
  storeInvitation,
  getStoredInvitationByToken,
  getStoredCompanyInvitations,
  storeDepartment,
  removeStoredDepartment,
  getStoredDepartments,
  storePosition,
  removeStoredPosition,
  getStoredPositions,
  storeRole,
  removeStoredRole,
  getStoredRoles,
  getAllStoredAuditLogs,
} from './tenantStore';
import { isOfficialPlatformAdminEmail } from '../utils/authResolution';
import type {
  Company,
  UserProfile,
  CompanyMember,
  CompanyInvitation,
  AuditLog,
  UserRole,
  CompanyRole,
  Department,
  Position,
  UserMembership,
  MembershipStatus,
  CompanyStatus,
  SubscriptionPlan,
} from '../types';

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or misconfigured.');
    }
    return false;
  }
}

/**
 * Fetch a single company by its unique tenant ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  const local = getStoredCompany(companyId);
  if (!db) return local;
  const docRef = doc(db, 'companies', companyId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return local;
    const data = snap.data() as Company;
    storeCompany(data);
    return data;
  } catch (error) {
    if (local) return local;
    handleFirestoreError(error, OperationType.GET, `companies/${companyId}`);
  }
}

/**
 * Fetch a single user profile by Firebase Auth UID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const local = getStoredUserProfile(userId);
  if (!db) return local;
  const docRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return local;
    const data = snap.data() as UserProfile;
    storeUserProfile(data);
    return data;
  } catch (error) {
    if (local) return local;
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

/**
 * Fetch all registered members of a company
 */
export async function getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const local = getStoredCompanyMembers(companyId);
  if (!db) return local;
  try {
    const subColRef = collection(db, 'companies', companyId, 'members');
    const snap = await getDocs(subColRef);
    const members: CompanyMember[] = [];
    snap.forEach((d) => {
      const m = d.data() as CompanyMember;
      members.push(m);
      storeCompanyMember(m);
    });

    // Fallback/compat check for companyUsers junction if subcollection empty
    if (members.length === 0) {
      const q = query(collection(db, 'companyUsers'), where('companyId', '==', companyId));
      const legacySnap = await getDocs(q);
      legacySnap.forEach((d) => {
        const item = d.data();
        const m: CompanyMember = {
          id: item.id || `${companyId}_${item.userId}`,
          companyId: item.companyId,
          userId: item.userId,
          roleId: item.role,
          role: item.role,
          status: item.status || 'active',
          joinedAt: item.joinedAt || item.createdAt || new Date().toISOString(),
          displayName: item.userName || item.displayName,
          email: item.userEmail || item.email,
        };
        members.push(m);
        storeCompanyMember(m);
      });
    }

    return members.length > 0 ? members : local;
  } catch (error) {
    if (local.length > 0) return local;
    handleFirestoreError(error, OperationType.LIST, `companies/${companyId}/members`);
  }
}

/**
 * Update company profile details
 */
export async function updateCompanyDetails(
  companyId: string,
  updates: Partial<Company>
): Promise<void> {
  const local = getStoredCompany(companyId);
  if (local) {
    storeCompany({ ...local, ...updates, updatedAt: new Date().toISOString() });
  }
  if (!db) return;
  const docRef = doc(db, 'companies', companyId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (local) {
      console.warn('Notice: Cloud update failed, updated locally in tenant store:', error);
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const local = getStoredUserProfile(userId);
  if (local) {
    storeUserProfile({ ...local, ...updates, updatedAt: new Date().toISOString() });
  }
  if (!db) return;
  const docRef = doc(db, 'users', userId);
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (local) {
      console.warn('Notice: Cloud user update failed, updated locally in tenant store:', error);
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Register or ensure official Super Admin record exists in /superAdmins/{userId}
 */
export async function ensureSuperAdminRecord(userId: string, email: string): Promise<void> {
  if (!db || !userId) return;
  try {
    const docRef = doc(db, 'superAdmins', userId);
    await setDoc(docRef, {
      userId,
      email: email.toLowerCase().trim(),
      role: 'SUPER_ADMIN',
      grantedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Notice: superAdmins record write skipped/handled:', err);
  }
}

/**
 * Append an immutable audit log record
 */
export async function recordAuditLog(
  logData: Omit<AuditLog, 'id' | 'timestamp'>
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const auditLog: AuditLog = {
    ...logData,
    id: logId,
    timestamp: new Date().toISOString(),
  };

  storeAuditLog(auditLog);

  if (!db) return;
  try {
    await setDoc(doc(db, 'auditLogs', logId), auditLog);
  } catch (error) {
    console.warn('Audit log cloud write skipped:', error);
  }
}

/**
 * Get recent audit logs for a company
 */
export async function getCompanyAuditLogs(
  companyId: string,
  limitCount = 50
): Promise<AuditLog[]> {
  const local = getStoredAuditLogs(companyId);
  if (!db) return local.slice(0, limitCount);
  try {
    const q = query(
      collection(db, 'auditLogs'),
      where('companyId', '==', companyId),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const logs: AuditLog[] = [];
    snap.forEach((d) => {
      const item = d.data() as AuditLog;
      logs.push(item);
      storeAuditLog(item);
    });
    // Sort descending by timestamp in memory
    const sorted = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.length > 0 ? sorted : local.slice(0, limitCount);
  } catch (error) {
    return local.slice(0, limitCount);
  }
}

/**
 * Fetch company invitations
 */
export async function getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]> {
  const local = getStoredCompanyInvitations(companyId);
  if (!db) return local;
  try {
    const subColRef = collection(db, 'companies', companyId, 'invitations');
    const snap = await getDocs(subColRef);
    const invites: CompanyInvitation[] = [];
    snap.forEach((d) => {
      const item = d.data() as CompanyInvitation;
      invites.push(item);
      storeInvitation(item);
    });
    return invites.length > 0 ? invites : local;
  } catch (error) {
    return local;
  }
}

/**
 * Create a new member invitation
 */
export async function createCompanyInvitation(
  companyId: string,
  companyName: string,
  email: string,
  role: string,
  invitedBy: { id: string; name: string },
  personalMessage?: string
): Promise<CompanyInvitation> {
  const normalizedEmail = email.toLowerCase().trim();
  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

  const invitation: CompanyInvitation = {
    id: inviteId,
    companyId,
    companyName,
    email: normalizedEmail,
    role,
    status: 'PENDING',
    invitedBy: invitedBy.id,
    invitedByName: invitedBy.name,
    personalMessage: personalMessage?.trim() || undefined,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  storeInvitation(invitation);

  await recordAuditLog({
    actorId: invitedBy.id,
    actorName: invitedBy.name,
    actorEmail: '',
    companyId,
    action: 'MEMBER_INVITED',
    resource: 'invitation',
    resourceId: inviteId,
    metadata: { role, targetEmail: normalizedEmail },
  });

  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId, 'invitations', inviteId), invitation);
      await setDoc(doc(db, 'invitations', inviteId), invitation);
    } catch (error) {
      console.warn('Notice: Firestore cloud invite sync skipped:', error);
    }
  }

  return invitation;
}

/**
 * Revoke an invitation
 */
export async function revokeCompanyInvitation(
  companyId: string,
  invitationId: string,
  actor: { id: string; name: string; email?: string } | string,
  actorNameParam?: string
): Promise<void> {
  const actorId = typeof actor === 'object' ? actor.id : actor;
  const actorName = typeof actor === 'object' ? actor.name : (actorNameParam || 'System User');
  const actorEmail = typeof actor === 'object' ? (actor.email || '') : '';

  const storedInv = getStoredInvitationByToken(invitationId);
  if (storedInv) {
    storeInvitation({ ...storedInv, status: 'REVOKED' });
  }

  await recordAuditLog({
    actorId,
    actorName,
    actorEmail,
    companyId,
    action: 'INVITATION_REVOKED',
    resource: 'invitation',
    resourceId: invitationId,
  });

  if (db) {
    try {
      const updates = { status: 'REVOKED' as const };
      await updateDoc(doc(db, 'companies', companyId, 'invitations', invitationId), updates);
      await updateDoc(doc(db, 'invitations', invitationId), updates);
    } catch (error) {
      console.warn('Notice: Cloud invite revoke skipped:', error);
    }
  }
}

/**
 * Get an invitation by its global token / ID
 */
export async function getInvitationById(invitationId: string): Promise<CompanyInvitation | null> {
  const local = getStoredInvitationByToken(invitationId);
  if (!db) return local;
  try {
    const snap = await getDoc(doc(db, 'invitations', invitationId));
    if (!snap.exists()) return local;
    const data = snap.data() as CompanyInvitation;
    storeInvitation(data);
    return data;
  } catch (error) {
    return local;
  }
}

/**
 * Accept an invitation and join the tenant
 */
export async function acceptCompanyInvitation(
  invitationId: string,
  user: { uid: string; email: string; fullName: string }
): Promise<{ companyId: string; role: UserRole }> {
  const invite = await getInvitationById(invitationId);
  if (!invite) {
    throw new Error('Undangan tidak ditemukan atau tautan tidak valid.');
  }

  if (invite.status !== 'PENDING') {
    throw new Error(`Undangan ini sudah tidak aktif (Status: ${invite.status}).`);
  }

  const now = new Date();
  if (new Date(invite.expiresAt).getTime() < now.getTime()) {
    throw new Error('Undangan ini telah kadaluarsa (melewati batas 7 hari).');
  }

  const companyId = invite.companyId;
  const memberId = user.uid;

  const newMember: CompanyMember = {
    id: `${companyId}_${memberId}`,
    companyId,
    userId: memberId,
    roleId: invite.role,
    role: invite.role,
    status: 'active',
    joinedAt: now.toISOString(),
    invitedBy: invite.invitedBy,
    displayName: user.fullName,
    email: user.email,
  };

  const userMembership: UserMembership = {
    id: `${companyId}_${memberId}`,
    userId: memberId,
    companyId,
    companyName: invite.companyName,
    role: invite.role as UserRole,
    status: 'ACTIVE',
    joinedAt: now.toISOString(),
  };

  // Local storage updates
  storeCompanyMember(newMember);
  storeUserMembership(userMembership);
  storeInvitation({ ...invite, status: 'ACCEPTED' });

  const userProfile = getStoredUserProfile(memberId);
  if (userProfile) {
    userProfile.companyId = companyId;
    userProfile.companyName = invite.companyName;
    userProfile.role = invite.role as UserRole;
    storeUserProfile(userProfile);
  }

  // Cloud sync if available
  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId, 'members', memberId), newMember);
      await setDoc(doc(db, 'companyUsers', `${companyId}_${memberId}`), {
        id: `${companyId}_${memberId}`,
        companyId,
        userId: memberId,
        role: invite.role,
        status: 'active',
        joinedAt: now.toISOString(),
        userName: user.fullName,
        userEmail: user.email,
      });
      await setDoc(doc(db, 'userMemberships', `${companyId}_${memberId}`), userMembership);
      await updateDoc(doc(db, 'users', user.uid), {
        companyId,
        companyName: invite.companyName,
        role: invite.role,
        updatedAt: now.toISOString(),
      });
      const acceptedUpdates = { status: 'ACCEPTED' as const };
      await updateDoc(doc(db, 'companies', companyId, 'invitations', invitationId), acceptedUpdates);
      await updateDoc(doc(db, 'invitations', invitationId), acceptedUpdates);

      const compDoc = await getDoc(doc(db, 'companies', companyId));
      if (compDoc.exists()) {
        const currentCount = compDoc.data().memberCount || 1;
        await updateDoc(doc(db, 'companies', companyId), {
          memberCount: currentCount + 1,
          updatedAt: now.toISOString(),
        });
      }
    } catch (cloudErr) {
      console.warn('Notice: Firestore cloud sync on invite accept skipped:', cloudErr);
    }
  }

  // 6. Record audit log
  await recordAuditLog({
    actorId: user.uid,
    actorName: user.fullName,
    actorEmail: user.email,
    companyId,
    action: 'MEMBER_JOINED',
    resource: 'member',
    resourceId: memberId,
    metadata: { role: invite.role, invitationId },
  });

  return { companyId, role: invite.role as UserRole };
}

/**
 * Onboarding: Create a brand new Company and register the owner
 */
export async function createCompanyOnboarding(
  userId: string,
  userEmail: string,
  companyPayload: {
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
  },
  ownerPayload: {
    fullName: string;
    jobTitle?: string;
    phone?: string;
  }
): Promise<{ company: Company; userProfile: UserProfile }> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi di aplikasi.');

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  const companyId = `comp_${timestamp}_${random}`;

  const slug =
    companyPayload.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || companyId;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial

  const company: Company = {
    id: companyId,
    name: companyPayload.name.trim(),
    legalName: companyPayload.legalName?.trim() || companyPayload.name.trim(),
    slug,
    industry: companyPayload.industry?.trim() || 'Teknologi & Layanan',
    businessType: companyPayload.industry?.trim() || 'Teknologi & Layanan',
    email: companyPayload.email?.trim() || userEmail,
    phone: companyPayload.phone?.trim() || ownerPayload.phone || '',
    address: companyPayload.address?.trim() || '',
    city: companyPayload.city?.trim() || '',
    province: companyPayload.province?.trim() || '',
    country: companyPayload.country?.trim() || 'Indonesia',
    website: companyPayload.website?.trim() || '',
    ownerId: userId,
    status: 'TRIAL',
    subscriptionPlan: 'TRIAL',
    subscriptionStatus: 'TRIAL',
    trialStartAt: now.toISOString(),
    trialEndAt: trialEnd.toISOString(),
    memberCount: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const userProfile: UserProfile = {
    id: userId,
    uid: userId,
    email: userEmail,
    displayName: ownerPayload.fullName.trim(),
    fullName: ownerPayload.fullName.trim(),
    phone: ownerPayload.phone?.trim() || '',
    jobTitle: ownerPayload.jobTitle?.trim() || 'Pemilik / Direktur',
    companyId,
    companyName: company.name,
    role: 'COMPANY_OWNER',
    companyRole: 'COMPANY_OWNER',
    platformRole: isOfficialPlatformAdminEmail(userEmail) ? 'SUPER_ADMIN' : 'USER',
    accountStatus: 'active',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    emailVerified: false,
  };

  const member: CompanyMember = {
    id: userId,
    companyId,
    userId,
    roleId: 'COMPANY_OWNER',
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    joinedAt: now.toISOString(),
    displayName: ownerPayload.fullName.trim(),
    email: userEmail,
    jobTitle: ownerPayload.jobTitle?.trim() || 'Pemilik',
  };

  const userMembership: UserMembership = {
    id: `${companyId}_${userId}`,
    userId,
    companyId,
    companyName: company.name,
    role: 'COMPANY_OWNER',
    status: 'ACTIVE',
    joinedAt: now.toISOString(),
  };

  // 1. Instantly store into local tenant persistence layer
  storeCompany(company);
  storeCompanyMember(member);
  storeUserProfile(userProfile);
  storeUserMembership(userMembership);

  // 2. Audit log
  await recordAuditLog({
    actorId: userId,
    actorName: ownerPayload.fullName.trim(),
    actorEmail: userEmail,
    companyId,
    action: 'COMPANY_CREATED',
    resource: 'company',
    resourceId: companyId,
    metadata: { companyName: company.name },
  });

  // 3. Attempt sync to Cloud Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId), company);
      await setDoc(doc(db, 'companies', companyId, 'members', userId), member);
      await setDoc(doc(db, 'users', userId), userProfile, { merge: true });
      await setDoc(doc(db, 'userMemberships', `${companyId}_${userId}`), userMembership);
      await setDoc(doc(db, 'companyUsers', `${companyId}_${userId}`), {
        id: `${companyId}_${userId}`,
        companyId,
        userId,
        role: 'COMPANY_OWNER',
        status: 'active',
        joinedAt: now.toISOString(),
        userName: ownerPayload.fullName.trim(),
        userEmail,
      });
    } catch (cloudErr) {
      console.warn('Notice: Firestore cloud sync queued/offline, company active locally:', cloudErr);
    }
  }

  return { company, userProfile };
}

/**
 * Super Admin: Get platform statistics (Calculated from real Firestore records)
 */
export async function getPlatformStats(): Promise<{
  totalCompanies: number;
  activeCompanies: number;
  trialCompanies: number;
  expiredCompanies: number;
  suspendedCompanies: number;
  totalUsers: number;
}> {
  if (!db) {
    const comps = getAllStoredCompanies();
    const users = getAllStoredProfiles();
    const now = Date.now();
    let active = 0;
    let trial = 0;
    let expired = 0;
    let suspended = 0;
    comps.forEach((c) => {
      if (c.status === 'SUSPENDED') {
        suspended++;
      } else if (c.status === 'ACTIVE') {
        active++;
      } else if (c.status === 'TRIAL') {
        if (c.trialEndAt && new Date(c.trialEndAt).getTime() < now) {
          expired++;
        } else {
          trial++;
        }
      } else if (c.status === 'EXPIRED') {
        expired++;
      }
    });
    return {
      totalCompanies: comps.length,
      activeCompanies: active,
      trialCompanies: trial,
      expiredCompanies: expired,
      suspendedCompanies: suspended,
      totalUsers: users.length,
    };
  }
  try {
    const compSnap = await getDocs(collection(db, 'companies'));
    const userSnap = await getDocs(collection(db, 'users'));

    let active = 0;
    let trial = 0;
    let expired = 0;
    let suspended = 0;

    const now = Date.now();

    compSnap.forEach((d) => {
      const c = d.data() as Company;
      if (c.status === 'SUSPENDED') {
        suspended++;
      } else if (c.status === 'ACTIVE') {
        active++;
      } else if (c.status === 'TRIAL') {
        if (c.trialEndAt && new Date(c.trialEndAt).getTime() < now) {
          expired++;
        } else {
          trial++;
        }
      } else if (c.status === 'EXPIRED') {
        expired++;
      }
    });

    return {
      totalCompanies: compSnap.size,
      activeCompanies: active,
      trialCompanies: trial,
      expiredCompanies: expired,
      suspendedCompanies: suspended,
      totalUsers: userSnap.size,
    };
  } catch (error) {
    console.warn('Notice: Firestore getPlatformStats error, checking local store:', error);
    const comps = getAllStoredCompanies();
    const users = getAllStoredProfiles();
    return {
      totalCompanies: comps.length,
      activeCompanies: comps.filter(c => c.status === 'ACTIVE').length,
      trialCompanies: comps.filter(c => c.status === 'TRIAL').length,
      expiredCompanies: comps.filter(c => c.status === 'EXPIRED').length,
      suspendedCompanies: comps.filter(c => c.status === 'SUSPENDED').length,
      totalUsers: users.length,
    };
  }
}

/**
 * Super Admin: Get all registered companies
 */
export async function getAllCompanies(): Promise<Company[]> {
  if (!db) {
    return getAllStoredCompanies().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  try {
    const snap = await getDocs(collection(db, 'companies'));
    const list: Company[] = [];
    snap.forEach((d) => {
      const c = d.data() as Company;
      list.push(c);
      storeCompany(c);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Notice: Firestore getAllCompanies error, using cached tenant store:', error);
    return getAllStoredCompanies().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/**
 * Super Admin: Update company status (ACTIVE, SUSPENDED, TRIAL, EXPIRED)
 */
export async function updateCompanyStatus(
  companyId: string,
  newStatus: CompanyStatus,
  actor: { id: string; name: string; email: string },
  reason?: string
): Promise<void> {
  const local = getStoredCompany(companyId);
  const updatedCompany: Company = local
    ? {
        ...local,
        status: newStatus,
        subscriptionStatus: newStatus === 'SUSPENDED' ? 'SUSPENDED' : newStatus === 'ACTIVE' ? 'ACTIVE' : local.subscriptionStatus,
        updatedAt: new Date().toISOString(),
      }
    : ({} as Company);

  if (local) {
    storeCompany(updatedCompany);
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        status: newStatus,
        subscriptionStatus: newStatus === 'SUSPENDED' ? 'SUSPENDED' : newStatus === 'ACTIVE' ? 'ACTIVE' : local?.subscriptionStatus || 'TRIAL',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (!local) {
        handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
      }
    }
  }

  let actionName = 'COMPANY_STATUS_CHANGED';
  if (newStatus === 'SUSPENDED') actionName = 'COMPANY_SUSPENDED';
  if (newStatus === 'ACTIVE') actionName = 'COMPANY_ACTIVATED';

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: actionName,
    resource: 'company',
    resourceId: companyId,
    metadata: {
      newStatus,
      reason: reason || 'Administrasi Platform Super Admin',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Super Admin: Toggle company suspension status
 */
export async function toggleCompanySuspension(
  companyId: string,
  suspend: boolean,
  actor: { id: string; name: string; email: string },
  reason?: string
): Promise<void> {
  await updateCompanyStatus(companyId, suspend ? 'SUSPENDED' : 'ACTIVE', actor, reason);
}

/**
 * Super Admin: Update company subscription plan
 */
export async function updateCompanyPlan(
  companyId: string,
  newPlan: SubscriptionPlan,
  actor: { id: string; name: string; email: string },
  reason?: string
): Promise<void> {
  const local = getStoredCompany(companyId);
  const newSubStatus = newPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE';
  const newCompanyStatus = newPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE';

  if (local) {
    storeCompany({
      ...local,
      subscriptionPlan: newPlan,
      subscriptionStatus: newSubStatus,
      status: newCompanyStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        subscriptionPlan: newPlan,
        subscriptionStatus: newSubStatus,
        status: newCompanyStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (!local) {
        handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}`);
      }
    }
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'SUBSCRIPTION_PLAN_CHANGED',
    resource: 'subscription',
    resourceId: companyId,
    metadata: {
      newPlan,
      reason: reason || 'Administrasi Paket Super Admin',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Super Admin: Extend trial days
 */
export async function extendCompanyTrial(
  companyId: string,
  additionalDays: number,
  actor: { id: string; name: string; email: string },
  reason?: string
): Promise<{ newTrialEndAt: string }> {
  let comp = getStoredCompany(companyId);
  if (db && !comp) {
    try {
      const snap = await getDoc(doc(db, 'companies', companyId));
      if (snap.exists()) {
        comp = snap.data() as Company;
      }
    } catch {
      // ignore
    }
  }
  if (!comp) throw new Error('Perusahaan tidak ditemukan');

  const currentEnd = comp.trialEndAt ? new Date(comp.trialEndAt).getTime() : Date.now();
  const baseTime = Math.max(Date.now(), currentEnd);
  const newEndAt = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();

  storeCompany({
    ...comp,
    trialEndAt: newEndAt,
    status: 'TRIAL',
    subscriptionStatus: 'TRIAL',
    updatedAt: new Date().toISOString(),
  });

  if (db) {
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        trialEndAt: newEndAt,
        status: 'TRIAL',
        subscriptionStatus: 'TRIAL',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      // non-fatal if offline
    }
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'TRIAL_EXTENDED',
    resource: 'trial',
    resourceId: companyId,
    metadata: {
      additionalDays,
      newTrialEndAt: newEndAt,
      reason: reason || 'Perpanjangan Masa Uji Coba oleh Super Admin',
      timestamp: new Date().toISOString(),
    },
  });

  return { newTrialEndAt: newEndAt };
}

/**
 * Super Admin: Get all platform audit logs
 */
export async function getAllPlatformAuditLogs(limitCount = 100): Promise<AuditLog[]> {
  if (!db) {
    return getAllStoredAuditLogs().slice(0, limitCount);
  }
  try {
    const q = query(
      collection(db, 'auditLogs'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const list: AuditLog[] = [];
    snap.forEach((d) => {
      const item = d.data() as AuditLog;
      list.push(item);
      storeAuditLog(item);
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn('Notice: Firestore getAllPlatformAuditLogs error, using local audit logs:', error);
    return getAllStoredAuditLogs().slice(0, limitCount);
  }
}

/**
 * Fetch a single member by ID
 */
export async function getCompanyMemberById(
  companyId: string,
  memberUserId: string
): Promise<CompanyMember | null> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi.');
  try {
    const memberDoc = await getDoc(doc(db, 'companies', companyId, 'members', memberUserId));
    if (memberDoc.exists()) {
      return memberDoc.data() as CompanyMember;
    }
    // Fallback check in companyUsers
    const compUserDoc = await getDoc(doc(db, 'companyUsers', `${companyId}_${memberUserId}`));
    if (compUserDoc.exists()) {
      const d = compUserDoc.data();
      return {
        id: `${companyId}_${memberUserId}`,
        companyId,
        userId: memberUserId,
        roleId: d.role,
        role: d.role,
        status: d.status || 'ACTIVE',
        joinedAt: d.joinedAt || new Date().toISOString(),
        displayName: d.userName,
        email: d.userEmail,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `companies/${companyId}/members/${memberUserId}`);
  }
}

/**
 * Update member role (supports system roles and custom roles)
 */
export async function updateCompanyMemberRole(
  companyId: string,
  memberUserId: string,
  newRole: string,
  actor: { id: string; name: string; email: string }
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi.');
  try {
    await updateDoc(doc(db, 'companies', companyId, 'members', memberUserId), {
      role: newRole,
      roleId: newRole,
      updatedAt: new Date().toISOString(),
    });

    // Also update users/{userId} doc
    try {
      await updateDoc(doc(db, 'users', memberUserId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Ignore if user doc doesn't exist
    }

    // Update userMemberships
    try {
      await updateDoc(doc(db, 'userMemberships', `${companyId}_${memberUserId}`), {
        role: newRole,
      });
    } catch {
      // If doesn't exist, create it
      await setDoc(doc(db, 'userMemberships', `${companyId}_${memberUserId}`), {
        id: `${companyId}_${memberUserId}`,
        userId: memberUserId,
        companyId,
        companyName: '',
        role: newRole,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
      }, { merge: true });
    }

    await recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      companyId,
      action: 'ROLE_CHANGED',
      resource: 'member',
      resourceId: memberUserId,
      metadata: { newRole },
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}/members/${memberUserId}`);
  }
}

/**
 * Toggle or update member status (ACTIVE / INACTIVE)
 */
export async function updateCompanyMemberStatus(
  companyId: string,
  memberUserId: string,
  newStatus: 'ACTIVE' | 'INACTIVE',
  actor: { id: string; name: string; email: string }
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi.');
  try {
    await updateDoc(doc(db, 'companies', companyId, 'members', memberUserId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    try {
      await updateDoc(doc(db, 'companyUsers', `${companyId}_${memberUserId}`), {
        status: newStatus.toLowerCase(),
      });
    } catch {
      // Ignore
    }

    try {
      await updateDoc(doc(db, 'userMemberships', `${companyId}_${memberUserId}`), {
        status: newStatus,
      });
    } catch {
      // Ignore
    }

    await recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      companyId,
      action: newStatus === 'INACTIVE' ? 'MEMBER_DEACTIVATED' : 'MEMBER_ACTIVATED',
      resource: 'member',
      resourceId: memberUserId,
      metadata: { newStatus },
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}/members/${memberUserId}`);
  }
}

/**
 * Update member organizational assignment (department, position, job title)
 */
export async function updateCompanyMemberOrg(
  companyId: string,
  memberUserId: string,
  updates: {
    departmentId?: string | null;
    positionId?: string | null;
    jobTitle?: string | null;
  },
  actor: { id: string; name: string; email: string }
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi.');
  try {
    const patch: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.departmentId !== undefined) patch.departmentId = updates.departmentId;
    if (updates.positionId !== undefined) patch.positionId = updates.positionId;
    if (updates.jobTitle !== undefined) patch.jobTitle = updates.jobTitle;

    await updateDoc(doc(db, 'companies', companyId, 'members', memberUserId), patch);

    await recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      companyId,
      action: 'MEMBER_ORGANIZATION_UPDATED',
      resource: 'member',
      resourceId: memberUserId,
      metadata: updates,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `companies/${companyId}/members/${memberUserId}`);
  }
}

/**
 * Remove member from company
 */
export async function removeCompanyMember(
  companyId: string,
  memberUserId: string,
  actor: { id: string; name: string; email: string }
): Promise<void> {
  if (!db) throw new Error('Firebase Firestore belum terkonfigurasi.');
  try {
    await deleteDoc(doc(db, 'companies', companyId, 'members', memberUserId));
    await deleteDoc(doc(db, 'companyUsers', `${companyId}_${memberUserId}`));
    try {
      await deleteDoc(doc(db, 'userMemberships', `${companyId}_${memberUserId}`));
    } catch {
      // Ignore
    }

    // Reset user's active company if this was their active one
    try {
      const uDoc = await getDoc(doc(db, 'users', memberUserId));
      if (uDoc.exists() && uDoc.data().companyId === companyId) {
        await updateDoc(doc(db, 'users', memberUserId), {
          companyId: null,
          companyName: null,
          role: 'EMPLOYEE',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Ignore
    }

    // Decrement member count
    const compDoc = await getDoc(doc(db, 'companies', companyId));
    if (compDoc.exists()) {
      const currentCount = compDoc.data().memberCount || 1;
      await updateDoc(doc(db, 'companies', companyId), {
        memberCount: Math.max(1, currentCount - 1),
        updatedAt: new Date().toISOString(),
      });
    }

    await recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      companyId,
      action: 'MEMBER_REMOVED',
      resource: 'member',
      resourceId: memberUserId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `companies/${companyId}/members/${memberUserId}`);
  }
}

/**
 * Multi-Company Switcher: Get all verified memberships for a user
 */
export async function getUserMemberships(userId: string): Promise<UserMembership[]> {
  const local = getStoredMemberships(userId);
  if (!db) return local;
  try {
    const q = query(collection(db, 'userMemberships'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: UserMembership[] = [];
    snap.forEach((d) => {
      const item = d.data() as UserMembership;
      if (item.status === 'ACTIVE') {
        list.push(item);
        storeUserMembership(item);
      }
    });
    return list.length > 0 ? list : local;
  } catch (error) {
    if (local.length > 0) return local;
    handleFirestoreError(error, OperationType.LIST, `userMemberships?userId=${userId}`);
  }
}

/**
 * Multi-Company Switcher: Switch user active tenant
 */
export async function switchActiveCompany(
  userId: string,
  targetCompanyId: string,
  actor: { id: string; name: string; email: string }
): Promise<Company> {
  const localMemberships = getStoredMemberships(userId);
  const localMem = localMemberships.find(
    (m) => m.companyId === targetCompanyId && m.userId === userId && m.status === 'ACTIVE'
  );
  let targetComp = getStoredCompany(targetCompanyId);
  let memberRole = localMem?.role || 'COMPANY_OWNER';

  if (db) {
    try {
      const memberDoc = await getDoc(doc(db, 'companies', targetCompanyId, 'members', userId));
      if (memberDoc.exists()) {
        const memberData = memberDoc.data() as CompanyMember;
        if (memberData.status === 'INACTIVE') {
          throw new Error('Keanggotaan Anda di perusahaan ini sedang dinonaktifkan.');
        }
        memberRole = memberData.role;
      } else if (!localMem) {
        throw new Error('Anda tidak memiliki izin atau keanggotaan aktif di perusahaan tujuan.');
      }

      const compDoc = await getDoc(doc(db, 'companies', targetCompanyId));
      if (compDoc.exists()) {
        targetComp = compDoc.data() as Company;
        storeCompany(targetComp);
      }
    } catch (err) {
      if (!localMem) throw err;
    }
  } else if (!localMem) {
    throw new Error('Anda tidak memiliki izin atau keanggotaan aktif di perusahaan tujuan.');
  }

  if (!targetComp) {
    throw new Error('Perusahaan tujuan tidak ditemukan.');
  }

  // Update user profile active company in local store
  const userProfile = getStoredUserProfile(userId);
  if (userProfile) {
    userProfile.companyId = targetCompanyId;
    userProfile.companyName = targetComp.name;
    userProfile.role = memberRole as UserRole;
    userProfile.updatedAt = new Date().toISOString();
    storeUserProfile(userProfile);
  }

  // Attempt Firestore sync
  if (db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        companyId: targetCompanyId,
        companyName: targetComp.name,
        role: memberRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (updateErr) {
      console.warn('Cloud Firestore update skipped on tenant switch:', updateErr);
    }
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId: targetCompanyId,
    action: 'TENANT_SWITCHED',
    resource: 'company',
    resourceId: targetCompanyId,
    metadata: { targetCompanyName: targetComp.name, targetRole: memberRole },
  });

  return targetComp;
}

/* =========================================================================
 * ORGANIZATION: DEPARTMENTS CRUD
 * ========================================================================= */

export async function getCompanyDepartments(companyId: string): Promise<Department[]> {
  const localList = getStoredDepartments(companyId);
  if (!db) return localList;
  try {
    const snap = await getDocs(collection(db, 'companies', companyId, 'departments'));
    if (snap.empty) {
      return localList;
    }
    const list: Department[] = [];
    snap.forEach((d) => {
      const dept = d.data() as Department;
      storeDepartment(dept);
      list.push(dept);
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Notice: Firestore getCompanyDepartments fallback to local store:', error);
    return localList;
  }
}

export async function createDepartment(
  companyId: string,
  data: { name: string; description?: string },
  actor: { id: string; name: string; email: string }
): Promise<Department> {
  const deptId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const department: Department = {
    id: deptId,
    companyId,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  storeDepartment(department);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'DEPARTMENT_CREATED',
    resource: 'department',
    resourceId: deptId,
    metadata: { name: department.name },
  });

  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId, 'departments', deptId), department);
    } catch (error) {
      console.warn('Notice: Firestore cloud department sync skipped:', error);
    }
  }

  return department;
}

export async function updateDepartment(
  companyId: string,
  departmentId: string,
  data: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' },
  actor: { id: string; name: string; email: string }
): Promise<void> {
  const existingList = getStoredDepartments(companyId);
  const target = existingList.find(d => d.id === departmentId);
  if (target) {
    const updated: Department = {
      ...target,
      ...data,
      name: data.name ? data.name.trim() : target.name,
      description: data.description !== undefined ? data.description.trim() : target.description,
      updatedAt: new Date().toISOString(),
    };
    storeDepartment(updated);
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'DEPARTMENT_UPDATED',
    resource: 'department',
    resourceId: departmentId,
    metadata: data,
  });

  if (db) {
    try {
      const updates: Record<string, any> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (data.name) updates.name = data.name.trim();
      if (data.description !== undefined) updates.description = data.description.trim();

      await updateDoc(doc(db, 'companies', companyId, 'departments', departmentId), updates);
    } catch (error) {
      console.warn('Notice: Firestore cloud department update skipped:', error);
    }
  }
}

export async function deleteDepartment(
  companyId: string,
  departmentId: string,
  actor: { id: string; name: string; email: string }
): Promise<void> {
  removeStoredDepartment(companyId, departmentId);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'DEPARTMENT_DELETED',
    resource: 'department',
    resourceId: departmentId,
  });

  if (db) {
    try {
      const posSnap = await getDocs(
        query(collection(db, 'companies', companyId, 'positions'), where('departmentId', '==', departmentId))
      );
      const deletePromises = posSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'companies', companyId, 'departments', departmentId));
    } catch (error) {
      console.warn('Notice: Firestore cloud department deletion skipped:', error);
    }
  }
}

/* =========================================================================
 * ORGANIZATION: POSITIONS CRUD
 * ========================================================================= */

export async function getCompanyPositions(companyId: string, departmentId?: string): Promise<Position[]> {
  const localList = getStoredPositions(companyId, departmentId);
  if (!db) return localList;
  try {
    let snap;
    if (departmentId) {
      snap = await getDocs(
        query(collection(db, 'companies', companyId, 'positions'), where('departmentId', '==', departmentId))
      );
    } else {
      snap = await getDocs(collection(db, 'companies', companyId, 'positions'));
    }
    if (snap.empty) {
      return localList;
    }
    const list: Position[] = [];
    snap.forEach((d) => {
      const pos = d.data() as Position;
      storePosition(pos);
      list.push(pos);
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Notice: Firestore getCompanyPositions fallback to local store:', error);
    return localList;
  }
}

export async function createPosition(
  companyId: string,
  data: { departmentId: string; name: string; description?: string },
  actor: { id: string; name: string; email: string }
): Promise<Position> {
  const posId = `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const position: Position = {
    id: posId,
    companyId,
    departmentId: data.departmentId,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  storePosition(position);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'POSITION_CREATED',
    resource: 'position',
    resourceId: posId,
    metadata: { name: position.name, departmentId: position.departmentId },
  });

  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId, 'positions', posId), position);
    } catch (error) {
      console.warn('Notice: Firestore cloud position creation skipped:', error);
    }
  }

  return position;
}

export async function updatePosition(
  companyId: string,
  positionId: string,
  data: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE'; departmentId?: string },
  actor: { id: string; name: string; email: string }
): Promise<void> {
  const existingList = getStoredPositions(companyId);
  const target = existingList.find(p => p.id === positionId);
  if (target) {
    const updated: Position = {
      ...target,
      ...data,
      name: data.name ? data.name.trim() : target.name,
      description: data.description !== undefined ? data.description.trim() : target.description,
      departmentId: data.departmentId || target.departmentId,
      updatedAt: new Date().toISOString(),
    };
    storePosition(updated);
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'POSITION_UPDATED',
    resource: 'position',
    resourceId: positionId,
    metadata: data,
  });

  if (db) {
    try {
      const updates: Record<string, any> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (data.name) updates.name = data.name.trim();
      if (data.description !== undefined) updates.description = data.description.trim();

      await updateDoc(doc(db, 'companies', companyId, 'positions', positionId), updates);
    } catch (error) {
      console.warn('Notice: Firestore cloud position update skipped:', error);
    }
  }
}

export async function deletePosition(
  companyId: string,
  positionId: string,
  actor: { id: string; name: string; email: string }
): Promise<void> {
  removeStoredPosition(companyId, positionId);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'POSITION_DELETED',
    resource: 'position',
    resourceId: positionId,
  });

  if (db) {
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'positions', positionId));
    } catch (error) {
      console.warn('Notice: Firestore cloud position deletion skipped:', error);
    }
  }
}

/* =========================================================================
 * ROLE & PERMISSION MANAGEMENT CRUD
 * ========================================================================= */

export async function getCompanyRoles(companyId: string): Promise<CompanyRole[]> {
  const systemRoles: CompanyRole[] = [
    {
      id: 'COMPANY_OWNER',
      companyId,
      name: 'Company Owner',
      description: 'Pemilik perusahaan dengan wewenang tertinggi atas seluruh modul, keuangan, perizinan, dan staf.',
      permissions: [
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
      isSystemRole: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'COMPANY_ADMIN',
      companyId,
      name: 'Company Admin',
      description: 'Administrator operasional perusahaan yang dapat mengelola staf, setelan bisnis, dan struktur divisi.',
      permissions: [
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
      isSystemRole: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'EMPLOYEE',
      companyId,
      name: 'Employee (Staf)',
      description: 'Anggota staf standar dengan akses dasar melihat profil bisnis dan rekan kerja.',
      permissions: ['company.view', 'members.view', 'org.view'],
      isSystemRole: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const localCustomRoles = getStoredRoles(companyId);

  if (!db) {
    return [...systemRoles, ...localCustomRoles];
  }

  try {
    const snap = await getDocs(collection(db, 'companies', companyId, 'roles'));
    const cloudRoles: CompanyRole[] = [];
    snap.forEach((d) => {
      const r = d.data() as CompanyRole;
      storeRole(r);
      cloudRoles.push(r);
    });

    const combinedCustom = [...localCustomRoles];
    cloudRoles.forEach((cr) => {
      if (!combinedCustom.some((r) => r.id === cr.id)) {
        combinedCustom.push(cr);
      }
    });

    return [...systemRoles, ...combinedCustom];
  } catch (error) {
    console.warn('Notice: Firestore getCompanyRoles fallback to system and local roles:', error);
    return [...systemRoles, ...localCustomRoles];
  }
}

export async function createCompanyRole(
  companyId: string,
  data: { name: string; description: string; permissions: string[] },
  actor: { id: string; name: string; email: string }
): Promise<CompanyRole> {
  const reservedNames = ['super admin', 'company owner', 'company admin', 'employee'];
  if (reservedNames.includes(data.name.toLowerCase().trim())) {
    throw new Error('Nama role tersebut adalah sistem bawaan dan tidak dapat diduplikasi.');
  }

  const roleId = `role_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const role: CompanyRole = {
    id: roleId,
    companyId,
    name: data.name.trim(),
    description: data.description.trim(),
    permissions: data.permissions,
    isSystemRole: false,
    createdAt: now,
    updatedAt: now,
  };

  storeRole(role);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'ROLE_CREATED',
    resource: 'role',
    resourceId: roleId,
    metadata: { name: role.name, permissionsCount: role.permissions.length },
  });

  if (db) {
    try {
      await setDoc(doc(db, 'companies', companyId, 'roles', roleId), role);
    } catch (error) {
      console.warn('Notice: Firestore cloud role creation skipped:', error);
    }
  }

  return role;
}

export async function updateCompanyRole(
  companyId: string,
  roleId: string,
  data: { name?: string; description?: string; permissions?: string[] },
  actor: { id: string; name: string; email: string }
): Promise<void> {
  const existingRoles = getStoredRoles(companyId);
  const target = existingRoles.find(r => r.id === roleId);
  if (target) {
    const updated: CompanyRole = {
      ...target,
      ...data,
      name: data.name ? data.name.trim() : target.name,
      description: data.description !== undefined ? data.description.trim() : target.description,
      permissions: data.permissions || target.permissions,
      updatedAt: new Date().toISOString(),
    };
    storeRole(updated);
  }

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'ROLE_UPDATED',
    resource: 'role',
    resourceId: roleId,
    metadata: data,
  });

  if (db) {
    try {
      const updates: Record<string, any> = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (data.name) updates.name = data.name.trim();
      if (data.description !== undefined) updates.description = data.description.trim();

      await updateDoc(doc(db, 'companies', companyId, 'roles', roleId), updates);
    } catch (error) {
      console.warn('Notice: Firestore cloud role update skipped:', error);
    }
  }
}

export async function deleteCompanyRole(
  companyId: string,
  roleId: string,
  actor: { id: string; name: string; email: string }
): Promise<void> {
  if (['COMPANY_OWNER', 'COMPANY_ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'].includes(roleId)) {
    throw new Error('Role sistem bawaan tidak dapat dihapus.');
  }

  removeStoredRole(companyId, roleId);

  await recordAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    companyId,
    action: 'ROLE_DELETED',
    resource: 'role',
    resourceId: roleId,
  });

  if (db) {
    try {
      const membersSnap = await getDocs(
        query(collection(db, 'companies', companyId, 'members'), where('roleId', '==', roleId))
      );
      if (!membersSnap.empty) {
        throw new Error('Role ini masih digunakan oleh anggota tim. Alihkan role mereka terlebih dahulu.');
      }
      await deleteDoc(doc(db, 'companies', companyId, 'roles', roleId));
    } catch (error) {
      console.warn('Notice: Firestore cloud role deletion skipped:', error);
    }
  }
}

/* =========================================================================
 * SUPER ADMIN PLATFORM USER OVERSIGHT
 * ========================================================================= */

export async function getAllPlatformUsers(): Promise<UserProfile[]> {
  if (!db) {
    return getAllStoredProfiles().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((d) => {
      const u = d.data() as UserProfile;
      list.push(u);
      storeUserProfile(u);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Notice: Falling back to cached profiles:', error);
    return getAllStoredProfiles().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getCompanyMembersAdmin(companyId: string): Promise<CompanyMember[]> {
  if (!db) {
    return getStoredCompanyMembers(companyId);
  }
  try {
    const snap = await getDocs(collection(db, 'companies', companyId, 'members'));
    const list: CompanyMember[] = [];
    snap.forEach((d) => {
      const m = d.data() as CompanyMember;
      list.push(m);
      storeCompanyMember(m);
    });
    return list;
  } catch (error) {
    console.warn('Notice: Falling back to cached company members:', error);
    return getStoredCompanyMembers(companyId);
  }
}
