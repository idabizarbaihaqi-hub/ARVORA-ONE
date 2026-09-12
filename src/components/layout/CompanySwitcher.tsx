import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ChevronDown, Check, Plus, Shield, Loader2 } from 'lucide-react';

interface CompanySwitcherProps {
  className?: string;
  fullWidth?: boolean;
}

export const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ className = '', fullWidth = false }) => {
  const { company, userProfile, memberships, switchCompany, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = async (targetCompanyId: string) => {
    if (targetCompanyId === company?.id) {
      setIsOpen(false);
      return;
    }
    setIsSwitching(true);
    try {
      await switchCompany(targetCompanyId);
      setIsOpen(false);
      navigate('/app/dashboard');
    } catch (err: any) {
      alert(err?.message || 'Gagal berpindah perusahaan.');
    } finally {
      setIsSwitching(false);
    }
  };

  const currentRole = userProfile?.role || 'EMPLOYEE';
  const roleBadgeLabel =
    currentRole === 'COMPANY_OWNER'
      ? 'Owner'
      : currentRole === 'COMPANY_ADMIN'
      ? 'Admin'
      : currentRole === 'SUPER_ADMIN'
      ? 'Super Admin'
      : 'Staf';

  if (!company) {
    return null;
  }

  return (
    <div id="company-switcher-container" className={`relative ${fullWidth ? 'w-full' : ''} ${className}`} ref={dropdownRef}>
      <button
        id="company-switcher-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching || isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-left shadow-2xs ${
          fullWidth ? 'w-full' : 'max-w-[220px] sm:max-w-[260px]'
        }`}
        title="Ganti Perusahaan"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
          {isSwitching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Building2 className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
            {company.name}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-neutral-400 truncate">
              {roleBadgeLabel}
            </span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
              • Aktif
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="company-switcher-dropdown"
          className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Perusahaan Terdaftar
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {/* Current company always shown */}
            <button
              id={`switch-company-${company.id}`}
              type="button"
              onClick={() => handleSelectCompany(company.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors bg-indigo-50/50 dark:bg-indigo-950/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs flex-shrink-0">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {company.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {roleBadgeLabel} • Aktif
                  </p>
                </div>
              </div>
              <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />
            </button>

            {/* Other company memberships */}
            {memberships
              .filter((m) => m.companyId !== company.id)
              .map((mem) => (
                <button
                  key={mem.companyId}
                  id={`switch-company-${mem.companyId}`}
                  type="button"
                  onClick={() => handleSelectCompany(mem.companyId)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold text-xs flex-shrink-0">
                      {mem.companyName ? mem.companyName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {mem.companyName || mem.companyId}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {mem.role}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1 mt-1 px-1">
            <button
              id="company-switcher-add-btn"
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/onboarding');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Perusahaan Baru</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
