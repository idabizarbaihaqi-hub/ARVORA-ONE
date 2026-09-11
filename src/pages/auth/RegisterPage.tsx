import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Checkbox } from '../../components/ui/Checkbox';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import { Building2, User, Mail, Lock, Clock, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessType, setBusinessType] = useState('Teknologi & Layanan');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isFirebaseConfigured, startPreviewSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const businessTypeOptions = [
    { value: 'Teknologi & Layanan', label: 'Teknologi & Layanan' },
    { value: 'Perdagangan & Retail', label: 'Perdagangan & Retail' },
    { value: 'Manufaktur & Produksi', label: 'Manufaktur & Produksi' },
    { value: 'Konstruksi & Properti', label: 'Konstruksi & Properti' },
    { value: 'Logistik & Distribusi', label: 'Logistik & Distribusi' },
    { value: 'Jasa Profesional & Konsultan', label: 'Jasa Profesional & Konsultan' },
    { value: 'Lainnya', label: 'Bidang Bisnis Lainnya' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName || !fullName || !email || !password) {
      setErrorMessage('Harap lengkapi semua kolom yang wajib diisi.');
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
      await register({
        companyName,
        fullName,
        email,
        password,
        businessType,
      });
      showToast('Perusahaan berhasil didaftarkan dengan 7 Hari Free Trial', 'success');
      navigate('/app/dashboard');
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
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <Link to="/" className="inline-block mb-6">
          <BrandLogo size="lg" showTagline />
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Daftarkan Perusahaan Anda
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Sudah memiliki akun organisasi?{' '}
          <Link
            to="/auth/login"
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
              <span className="font-bold block">Otomatis 7 Hari Free Trial</span>
              Pendaftaran sebagai Pemilik Perusahaan (Company Owner) dengan isolasi data multi-tenant mandiri.
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
              Kredensial Firebase (.env) belum dikonfigurasi. Anda dapat meninjau struktur form dan masuk ke dashboard pratinjau.
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
              label="Nama Perusahaan / Organisasi"
              placeholder="PT Maju Gemilang Nusantara"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              leftIcon={<Building2 className="w-4 h-4" />}
              helperText="ID unik tenant akan dibuat otomatis oleh sistem."
            />

            <Select
              label="Bidang Industri / Bisnis"
              options={businessTypeOptions}
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />

            <Input
              label="Nama Lengkap Pemilik / Admin"
              placeholder="Ahmad Pratama"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Alamat Email Perusahaan"
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
                sublabel="Data perusahaan sepenuhnya terisolasi dan dilindungi di bawah scope tenant mandiri."
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
              >
                Daftar & Mulai 7 Hari Trial
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
