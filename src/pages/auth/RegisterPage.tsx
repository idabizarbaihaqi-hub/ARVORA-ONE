import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Checkbox } from '../../components/ui/Checkbox';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import { User, Building2, Mail, Lock, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { register, isFirebaseConfigured, startPreviewSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !companyName.trim() || !email.trim() || !password) {
      setErrorMessage('Harap lengkapi nama user, nama perusahaan, email, dan kata sandi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui ketentuan layanan untuk melanjutkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { needsOnboarding } = await register({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      showToast('Pendaftaran berhasil! Selamat datang di ARVORA ONE.', 'success');

      if (redirectUrl) {
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

  const handlePreviewRegister = () => {
    startPreviewSession();
    showToast('Memulai sesi pratinjau struktur tenant ARVORA ONE', 'info');
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
          Daftar Akun & Perusahaan
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Sudah memiliki akun organisasi?{' '}
          <Link
            to={redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login'}
            className="font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            Masuk Portal
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-xs rounded-2xl border border-slate-200/80 text-left">
          {/* Trial Guarantee Banner */}
          <div className="mb-5 p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block">Free Trial 7 Hari Langsung Aktif</span>
              Akses penuh ke semua fitur bisnis, manajemen tim, keuangan, dan POS dengan isolasi data tingkat enterprise.
            </div>
          </div>

          {!isFirebaseConfigured && (
            <Alert
              variant="warning"
              title="Firebase Cloud Belum Aktif"
              className="mb-5 text-xs"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewRegister}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                  className="w-full mt-2 bg-blue-50/70 border-blue-200 text-blue-800"
                >
                  Uji Alur Registrasi (Pratinjau Arsitektur)
                </Button>
              }
            >
              Kredensial Firebase (.env) belum dikonfigurasi. Anda dapat meninjau alur form dan simulasi onboarding.
            </Alert>
          )}

          {errorMessage && (
            <Alert
              variant="error"
              title="Gagal Mendaftar"
              className="mb-5 text-xs"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nama Lengkap Penanggung Jawab"
              placeholder="Contoh: Ahmad Pratama"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Nama Perusahaan / Bisnis"
              placeholder="Contoh: PT Sukses Mandiri Bersama"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Alamat Email Kerja"
              type="email"
              placeholder="admin@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Kata Sandi Akun"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Checkbox
                label="Saya menyetujui Ketentuan Layanan & Kebijakan Data ARVORA ONE"
                sublabel="Data tenant perusahaan sepenuhnya terisolasi dan dilindungi hak ciptanya."
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
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
                Daftar & Mulai Trial 7 Hari
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-800 transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
