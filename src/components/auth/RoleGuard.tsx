import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: (UserRole | string)[];
  fallback?: ReactNode;
  showAccessDeniedMessage?: boolean;
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  fallback = null,
  showAccessDeniedMessage = false,
  children,
}) => {
  const { userProfile, isSuperAdmin, isMemberActive } = useAuth();

  if (!isMemberActive) {
    if (showAccessDeniedMessage) {
      return (
        <div id="role-denied-suspended" className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-red-800 dark:text-red-300">Akses Nonaktif</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Akun Anda pada perusahaan ini sedang dinonaktifkan.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Super Admin can access all roles
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const currentRole = userProfile?.role || 'EMPLOYEE';
  const hasRole = allowedRoles.includes(currentRole);

  if (!hasRole) {
    if (showAccessDeniedMessage) {
      return (
        <div id="role-denied-message" className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">Hak Akses Role Tidak Mencukupi</h3>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 max-w-md mx-auto">
            Halaman ini hanya dapat diakses oleh: {allowedRoles.join(', ')}. Role Anda saat ini adalah {currentRole}.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
