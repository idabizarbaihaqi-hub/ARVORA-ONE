import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { triggerEmailVerification } from '../../firebase/auth';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { authUser, userProfile } = useAuth();
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleResend = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      await triggerEmailVerification();
      setFeedback('Email verifikasi baru berhasil dikirim.');
      showToast('Email verifikasi telah dikirim ulang', 'success');
    } catch (err) {
      setFeedback('Gagal mengirim email verifikasi. Pastikan sesi login aktif.');
    } finally {
      setIsSending(false);
    }
  };

  const isVerified = authUser?.emailVerified ?? userProfile?.emailVerified ?? false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <Link to="/" className="inline-block mb-6">
          <BrandLogo size="lg" />
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Verifikasi Email Perusahaan
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-xs rounded-2xl border border-slate-200/80 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            {isVerified ? 'Email Terverifikasi' : 'Periksa Kotak Masuk Anda'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            {isVerified
              ? 'Alamat email akun perusahaan Anda telah berstatus terverifikasi dan memenuhi syarat keamanan sistem.'
              : `Kami telah mengirimkan tautan konfirmasi ke ${
                  authUser?.email || userProfile?.email || 'email Anda'
                }. Silakan klik tautan tersebut untuk memvalidasi kepemilikan domain.`}
          </p>

          {feedback && (
            <Alert variant="info" className="mb-5 text-xs text-left">
              {feedback}
            </Alert>
          )}

          <div className="flex flex-col gap-2.5">
            <Link to="/app/dashboard">
              <Button
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Lanjut ke Dashboard
              </Button>
            </Link>

            {!isVerified && (
              <Button
                variant="outline"
                onClick={handleResend}
                isLoading={isSending}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="w-full text-xs"
              >
                Kirim Ulang Email Konfirmasi
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
