import type { User } from 'firebase/auth';
import type { UserProfile, CompanyMember, UserMembership, PlatformRole, CompanyRoleType } from '../types';

/**
 * Official ARVORA ONE Platform Super Administrator emails.
 * Primary platform administrator: id.abizarbaihaqi@gmail.com
 */
export const OFFICIAL_SUPER_ADMIN_EMAILS: readonly string[] = Object.freeze([
  'id.abizarbaihaqi@gmail.com',
  'admin@arvora.one',
  'id.agnesyakartika@gmail.com',
]);

export interface ResolvedAuthorization {
  /**
   * PLATFORM ROLE: Governs platform-wide privileges (SUPER_ADMIN or USER).
   * Strictly separated from company-level tenant roles.
   */
  platformRole: PlatformRole | null;

  /**
   * COMPANY ROLE: Governs workspace privileges inside an active company tenant.
   * e.g. COMPANY_OWNER, COMPANY_ADMIN, EMPLOYEE, or custom role ID.
   */
  companyRole: CompanyRoleType | null;

  /**
   * True if user holds platform-level SUPER_ADMIN authority.
   */
  isSuperAdmin: boolean;

  /**
   * True if user is the COMPANY_OWNER of the active company tenant.
   */
  isCompanyOwner: boolean;

  /**
   * True if user is COMPANY_ADMIN in active company tenant.
   */
  isCompanyAdmin: boolean;

  /**
   * True if user is regular EMPLOYEE in active company tenant.
   */
  isEmployee: boolean;

  /**
   * Active company tenant ID.
   */
  activeCompanyId: string | null;
}

export interface ResolveAuthorizationParams {
  authUser: User | null;
  userProfile: UserProfile | null;
  idTokenClaims?: Record<string, any> | null;
  activeCompanyId?: string | null;
  companyMemberships?: (UserMembership | CompanyMember)[];
  activeCompanyOwnerId?: string | null;
}

/**
 * Helper to check if an email matches the official platform administration emails.
 */
export function isOfficialPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return OFFICIAL_SUPER_ADMIN_EMAILS.includes(normalized);
}

/**
 * Centralized authorization resolver for ARVORA ONE.
 *
 * Implements strict architectural separation:
 * PLATFORM ROLE (SUPER_ADMIN) vs COMPANY ROLE (COMPANY_OWNER / COMPANY_ADMIN / EMPLOYEE).
 *
 * An account such as id.abizarbaihaqi@gmail.com:
 * - platformRole: 'SUPER_ADMIN'
 * - isSuperAdmin: true
 * - companyRole: 'COMPANY_OWNER' (if owning a tenant) or null (if pure platform)
 *
 * Company members cannot escalate to SUPER_ADMIN.
 * SUPER_ADMIN does not erase or override tenant-level company membership.
 */
export function resolveAuthorization(params: ResolveAuthorizationParams): ResolvedAuthorization {
  const {
    authUser,
    userProfile,
    idTokenClaims,
    activeCompanyId,
    companyMemberships,
    activeCompanyOwnerId,
  } = params;

  if (!authUser && !userProfile) {
    return {
      platformRole: null,
      companyRole: null,
      isSuperAdmin: false,
      isCompanyOwner: false,
      isCompanyAdmin: false,
      isEmployee: false,
      activeCompanyId: null,
    };
  }

  const effectiveEmail = (authUser?.email || userProfile?.email || '').trim().toLowerCase();
  const currentUid = authUser?.uid || userProfile?.uid || userProfile?.id || '';

  // 1. Evaluate Platform Authority
  // A. Check Firebase Auth Custom Claims (cryptographically sealed token claims)
  const hasCustomClaim = Boolean(
    idTokenClaims?.superAdmin === true ||
    idTokenClaims?.platformRole === 'SUPER_ADMIN' ||
    idTokenClaims?.role === 'SUPER_ADMIN'
  );

  // B. Check official platform super admin email (Firebase authenticated)
  const isOfficialEmail = isOfficialPlatformAdminEmail(effectiveEmail);

  // C. Check persistent platformRole stored on UserProfile (verified by Firestore security rules)
  const isProfilePlatformAdmin = userProfile?.platformRole === 'SUPER_ADMIN';

  const isSuperAdmin = Boolean(hasCustomClaim || isOfficialEmail || isProfilePlatformAdmin);
  const platformRole: PlatformRole = isSuperAdmin ? 'SUPER_ADMIN' : 'USER';

  // 2. Evaluate Company Role (Tenant Authorization)
  const resolvedCompanyId = activeCompanyId || userProfile?.companyId || null;
  let companyRole: CompanyRoleType | null = null;

  // A. If active company matches and current user is ownerId
  if (resolvedCompanyId && activeCompanyOwnerId && currentUid && activeCompanyOwnerId === currentUid) {
    companyRole = 'COMPANY_OWNER';
  }

  // B. Check company memberships array
  if (!companyRole && resolvedCompanyId && companyMemberships && companyMemberships.length > 0) {
    const matchingMembership = companyMemberships.find((m: any) => {
      const matchCompany = m.companyId === resolvedCompanyId;
      const matchUser = m.userId === currentUid || m.id === `${resolvedCompanyId}_${currentUid}`;
      return matchCompany && matchUser;
    });

    if (matchingMembership && (matchingMembership as any).role) {
      const rawRole = (matchingMembership as any).role;
      // Do not allow 'SUPER_ADMIN' to leak into companyRole
      if (rawRole !== 'SUPER_ADMIN') {
        companyRole = rawRole;
      }
    }
  }

  // C. Check userProfile fields
  if (!companyRole && userProfile) {
    if (userProfile.companyRole && userProfile.companyRole !== 'SUPER_ADMIN') {
      companyRole = userProfile.companyRole;
    } else if (userProfile.role && userProfile.role !== 'SUPER_ADMIN') {
      companyRole = userProfile.role;
    }
  }

  // Default company role to null if user has no company
  if (!resolvedCompanyId) {
    companyRole = null;
  }

  const isCompanyOwner = companyRole === 'COMPANY_OWNER';
  const isCompanyAdmin = companyRole === 'COMPANY_ADMIN';
  const isEmployee = companyRole === 'EMPLOYEE';

  return {
    platformRole,
    companyRole,
    isSuperAdmin,
    isCompanyOwner,
    isCompanyAdmin,
    isEmployee,
    activeCompanyId: resolvedCompanyId,
  };
}
