import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { sendResetPassword } from '../../firebase/auth';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import { isFirebaseConfigured } from '../../firebase/config';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Harap masukkan alamat email.');
      return;
    }

    if (!isFirebaseConfigured) {
      setErrorMessage('Firebase belum terkonfigurasi pada server ini. Silakan atur kredensial terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendResetPassword(email);
      setSuccess(true);
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <Link to="/" className="inline-block mb-6">
          <BrandLogo size="lg" />
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Pemulihan Kata Sandi
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Masukkan email terdaftar untuk menerima tautan pemulihan kata sandi.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-8 shadow-xs rounded-2xl border border-slate-200/80 text-left">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Tautan Terkirim</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Tautan pengaturan ulang kata sandi telah dikirim ke <span className="font-semibold">{email}</span>. Silakan periksa kotak masuk atau spam Anda.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" className="w-full">
                  Kembali ke Halaman Masuk
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <Alert
                  variant="error"
                  title="Gagal Mengirim"
                  className="mb-4 text-xs"
                  onClose={() => setErrorMessage(null)}
                >
                  {errorMessage}
                </Alert>
              )}

              <Input
                label="Alamat Email Terdaftar"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                Kirim Tautan Reset
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
