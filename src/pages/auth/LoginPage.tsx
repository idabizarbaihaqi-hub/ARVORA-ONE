import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { authUser, isSuperAdmin, login, isFirebaseConfigured, startPreviewSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authUser) {
      if (isSuperAdmin) {
        navigate('/super-admin', { replace: true });
      } else if (redirectUrl && !redirectUrl.startsWith('/super-admin') && !redirectUrl.startsWith('/admin')) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [authUser, isSuperAdmin, redirectUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Harap isi alamat email dan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { needsOnboarding, isSuperAdmin: userIsSuperAdmin } = await login(email, password);
      showToast('Berhasil masuk ke portal ARVORA ONE', 'success');

      if (userIsSuperAdmin) {
        navigate('/super-admin');
      } else if (redirectUrl && !redirectUrl.startsWith('/super-admin') && !redirectUrl.startsWith('/admin')) {
        navigate(redirectUrl);
      } else if (needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      const msg = parseFirebaseErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewLogin = () => {
    startPreviewSession();
    showToast('Masuk dalam Mode Pratinjau Desain Arsitektur', 'info');
    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <Link to="/" className="inline-block mb-6">
          <BrandLogo size="lg" showTagline />
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Masuk ke Portal Perusahaan
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Belum mendaftarkan perusahaan?{' '}
          <Link
            to={redirectUrl ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/register'}
            className="font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            Daftar Free Trial 7 Hari
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-xs rounded-2xl border border-slate-200/80 text-left">
          {!isFirebaseConfigured && (
            <Alert
              variant="warning"
              title="Firebase Belum Dikonfigurasi"
              className="mb-5 text-xs"
              action={
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-[11px] text-slate-600">
                    Kredensial Firebase (.env) belum diatur. Anda dapat menjelajahi UI dashboard, struktur tenant, dan audit log dalam mode pratinjau:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewLogin}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                    className="w-full bg-blue-50/70 border-blue-200 text-blue-800"
                  >
                    Masuk Mode Pratinjau Arsitektur
                  </Button>
                </div>
              }
            >
              Autentikasi langsung membutuhkan API key Firebase aktif.
            </Alert>
          )}

          {errorMessage && (
            <Alert
              variant="error"
              title="Gagal Masuk"
              className="mb-5 text-xs"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Alamat Email Kerja"
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Masuk ke Dashboard
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Terkoneksi Firebase Auth
            </span>
            <Link to="/" className="hover:text-slate-800 transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
