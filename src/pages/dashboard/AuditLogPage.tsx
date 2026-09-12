import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { getCompanyAuditLogs } from '../../firebase/firestore';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import type { AuditLog } from '../../types';
import {
  ShieldCheck,
  Clock,
  Search,
  RefreshCw,
  FileText,
  UserCheck,
  UserPlus,
  Key,
  Building,
  Lock,
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { company, isFirebaseConfigured, userProfile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!company?.id) {
      setLoading(false);
      return;
    }

    try {
      if (!isFirebaseConfigured) {
        // Mock audit trail for local preview
        const mockLogs: AuditLog[] = [
          {
            id: 'log_mock_1',
            actorId: userProfile?.id || 'usr_owner',
            actorName: userProfile?.fullName || 'Ahmad Pratama',
            actorEmail: userProfile?.email || 'owner@perusahaan.com',
            companyId: company.id,
            action: 'LOGIN',
            resource: 'auth',
            resourceId: 'auth_session_01',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'log_mock_2',
            actorId: userProfile?.id || 'usr_owner',
            actorName: userProfile?.fullName || 'Ahmad Pratama',
            actorEmail: userProfile?.email || 'owner@perusahaan.com',
            companyId: company.id,
            action: 'COMPANY_CREATED',
            resource: 'company',
            resourceId: company.id,
            metadata: { companyName: company.name },
            timestamp: company.createdAt,
          },
        ];
        setLogs(mockLogs);
        return;
      }

      const logList = await getCompanyAuditLogs(company.id, 100);
      setLogs(logList);
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [company?.id, isFirebaseConfigured]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'COMPANY_CREATED':
        return <Badge variant="primary" size="sm">COMPANY_CREATED</Badge>;
      case 'MEMBER_INVITED':
        return <Badge variant="info" size="sm">MEMBER_INVITED</Badge>;
      case 'MEMBER_JOINED':
        return <Badge variant="success" size="sm">MEMBER_JOINED</Badge>;
      case 'ROLE_CHANGED':
        return <Badge variant="warning" size="sm">ROLE_CHANGED</Badge>;
      case 'MEMBER_DEACTIVATED':
        return <Badge variant="danger" size="sm">MEMBER_DEACTIVATED</Badge>;
      case 'MEMBER_ACTIVATED':
        return <Badge variant="success" size="sm">MEMBER_ACTIVATED</Badge>;
      case 'MEMBER_REMOVED':
        return <Badge variant="danger" size="sm">MEMBER_REMOVED</Badge>;
      case 'MEMBER_ORGANIZATION_UPDATED':
        return <Badge variant="info" size="sm">MEMBER_ORG_UPDATED</Badge>;
      case 'DEPARTMENT_CREATED':
      case 'DEPARTMENT_UPDATED':
      case 'DEPARTMENT_DELETED':
        return <Badge variant="primary" size="sm">{action}</Badge>;
      case 'POSITION_CREATED':
      case 'POSITION_UPDATED':
      case 'POSITION_DELETED':
        return <Badge variant="info" size="sm">{action}</Badge>;
      case 'ROLE_CREATED':
      case 'ROLE_UPDATED':
      case 'ROLE_DELETED':
        return <Badge variant="warning" size="sm">{action}</Badge>;
      case 'TENANT_SWITCHED':
        return <Badge variant="default" size="sm">TENANT_SWITCHED</Badge>;
      case 'LOGIN':
        return <Badge variant="default" size="sm">LOGIN</Badge>;
      default:
        return <Badge variant="default" size="sm">{action}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'COMPANY_CREATED':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'MEMBER_INVITED':
      case 'MEMBER_JOINED':
      case 'MEMBER_ACTIVATED':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'ROLE_CHANGED':
      case 'ROLE_CREATED':
      case 'ROLE_UPDATED':
        return <Key className="w-4 h-4 text-amber-600" />;
      case 'MEMBER_DEACTIVATED':
      case 'MEMBER_REMOVED':
      case 'DEPARTMENT_DELETED':
      case 'POSITION_DELETED':
      case 'ROLE_DELETED':
        return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      case 'LOGIN':
        return <UserCheck className="w-4 h-4 text-slate-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchQuery =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.actorName && l.actorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.actorEmail && l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchQuery && matchAction;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log & Riwayat Aktivitas"
        description="Jejak audit kepatuhan dan log keamanan immutable untuk seluruh peristiwa penting organisasi."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Segarkan Log
          </Button>
        }
      />

      {/* Security Immutability Notice */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>
            Catatan audit log dilindungi aturan Firestore append-only (tidak dapat diedit atau dihapus oleh siapapun).
          </span>
        </div>
        <Badge variant="success" size="sm">Immutable Ledger</Badge>
      </div>

      {errorMessage && (
        <Alert variant="error" title="Gagal Memuat Log" className="text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari aktivitas, nama pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'LOGIN', 'MEMBER_INVITED', 'MEMBER_JOINED', 'ROLE_CHANGED', 'MEMBER_ORGANIZATION_UPDATED', 'COMPANY_CREATED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                actionFilter === act
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act === 'ALL' ? 'Semua Aktivitas' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      {loading ? (
        <div className="py-12 bg-white rounded-xl border border-slate-200">
          <LoadingState text="Mengambil catatan audit log tenant..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          Belum ada aktivitas audit yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktivitas / Event</th>
                  <th className="py-3 px-4">Pengguna (Aktor)</th>
                  <th className="py-3 px-4">Sumber Daya (Resource)</th>
                  <th className="py-3 px-4">Keterangan / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.actorName || 'User'}</div>
                      <div className="text-slate-400 text-[11px]">{log.actorEmail || log.actorId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {log.resource}
                      {log.resourceId ? ` (${log.resourceId.substring(0, 10)}...)` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {log.metadata ? (
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {JSON.stringify(log.metadata)}
                        </code>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
