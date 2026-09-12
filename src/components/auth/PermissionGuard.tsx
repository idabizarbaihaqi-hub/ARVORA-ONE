import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showAccessDeniedMessage?: boolean;
  children: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  showAccessDeniedMessage = false,
  children,
}) => {
  const { userProfile, isSuperAdmin, isMemberActive } = useAuth();

  // If member is deactivated / suspended in company, deny access
  if (!isMemberActive) {
    if (showAccessDeniedMessage) {
      return (
        <div id="access-denied-suspended" className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-red-800 dark:text-red-300">Akses Dibekukan</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Status keanggotaan Anda di perusahaan ini sedang nonaktif. Hubungi Company Owner atau Administrator.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Super Admin bypasses all checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const role = userProfile?.role || 'EMPLOYEE';
  const perms = Array.isArray(permission) ? permission : [permission];

  const allowed = requireAll
    ? perms.every((p) => hasPermission(role, p))
    : perms.some((p) => hasPermission(role, p));

  if (!allowed) {
    if (showAccessDeniedMessage) {
      return (
        <div id="access-denied-permission" className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">Akses Dibatasi</h3>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 max-w-md mx-auto">
            Anda tidak memiliki hak akses yang diperlukan ({Array.isArray(permission) ? permission.join(', ') : permission}) untuk melihat modul ini.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
