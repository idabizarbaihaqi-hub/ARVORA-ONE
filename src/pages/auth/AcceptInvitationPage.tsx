import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getInvitationById, acceptCompanyInvitation } from '../../firebase/firestore';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import type { CompanyInvitation } from '../../types';
import { Building2, CheckCircle2, AlertTriangle, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const AcceptInvitationPage: React.FC = () => {
  const params = useParams<{ invitationId?: string; inviteId?: string }>();
  const activeInviteId = params.invitationId || params.inviteId;
  const { authUser, userProfile, refreshProfile, refreshCompany } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<CompanyInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvite() {
      if (!activeInviteId) {
        setErrorMessage('Tautan undangan tidak memiliki token yang valid.');
        setLoading(false);
        return;
      }

      try {
        const inv = await getInvitationById(activeInviteId);
        if (!inv) {
          setErrorMessage('Undangan tidak ditemukan atau tautan sudah kadaluarsa.');
        } else if (inv.status === 'ACCEPTED') {
          setErrorMessage('Undangan ini sudah pernah diterima sebelumnya.');
        } else if (inv.status === 'REVOKED') {
          setErrorMessage('Undangan ini telah dibatalkan oleh pihak pengelola perusahaan.');
        } else if (new Date(inv.expiresAt).getTime() < Date.now()) {
          setErrorMessage('Masa berlaku undangan ini telah habis (kadaluarsa).');
        } else {
          setInvitation(inv);
        }
      } catch (err) {
        setErrorMessage(parseFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [activeInviteId]);

  const handleAccept = async () => {
    if (!activeInviteId || !invitation) return;
    if (!authUser && !userProfile) {
      navigate(`/auth/login?redirect=/invite/${activeInviteId}`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await acceptCompanyInvitation(activeInviteId, {
        uid: authUser?.uid || userProfile?.id || 'usr_invited',
        email: authUser?.email || userProfile?.email || invitation.email,
        fullName: authUser?.displayName || userProfile?.fullName || 'Anggota Tim',
      });

      await refreshProfile();
      await refreshCompany();

      showToast(`Selamat bergabung di ${invitation.companyName}!`, 'success');
      navigate('/app/dashboard');
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingState message="Memvalidasi kode undangan perusahaan..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <BrandLogo size="lg" showTagline />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card id="accept-invite-card" className="p-6 sm:p-8 text-center shadow-xs border border-slate-200/80">
          {errorMessage ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Undangan Tidak Dapat Digunakan</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{errorMessage}</p>
              <div className="pt-2">
                <Button id="back-to-login-btn" variant="outline" className="w-full" onClick={() => navigate('/auth/login')}>
                  Kembali ke Halaman Masuk
                </Button>
              </div>
            </div>
          ) : invitation ? (
            <div className="space-y-5">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                  Undangan Bergabung Perusahaan
                </span>
                <h2 className="text-xl font-bold text-slate-900">{invitation.companyName}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Diundang oleh <strong className="text-slate-700">{invitation.invitedByName || 'Administrator'}</strong>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email Tujuan:</span>
                  <span className="font-semibold text-slate-800">{invitation.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Peran yang Diberikan:</span>
                  <Badge variant={invitation.role === 'COMPANY_ADMIN' ? 'info' : 'default'} size="sm">
                    {invitation.role}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Batas Berlaku:</span>
                  <span className="text-slate-600">
                    {new Date(invitation.expiresAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {authUser || userProfile ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-600">
                    Masuk sebagai: <strong className="text-slate-900">{authUser?.email || userProfile?.email}</strong>
                  </p>
                  <Button
                    id="accept-invite-btn"
                    variant="primary"
                    className="w-full"
                    isLoading={isProcessing}
                    onClick={handleAccept}
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                  >
                    Terima & Masuk ke Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-500">
                    Silakan masuk atau buat akun baru terlebih dahulu untuk menerima undangan ini.
                  </p>
                  <Button
                    id="login-to-accept-btn"
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(`/auth/login?redirect=/invite/${activeInviteId}`)}
                    leftIcon={<LogIn className="w-4 h-4 text-white" />}
                  >
                    Masuk ke Akun
                  </Button>
                  <Button
                    id="register-to-accept-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/auth/register?redirect=/invite/${activeInviteId}`)}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Daftar Akun Baru
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
};
