import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseFirebaseErrorMessage } from '../../firebase/errors';
import {
  Building2,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export const OnboardingWizardPage: React.FC = () => {
  const { userProfile, completeOnboarding } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Company Info
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('Teknologi & Layanan');
  const [companyEmail, setCompanyEmail] = useState(userProfile?.email || '');
  const [companyPhone, setCompanyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [website, setWebsite] = useState('');

  // Step 2: Owner Info
  const [ownerName, setOwnerName] = useState(userProfile?.fullName || '');
  const [jobTitle, setJobTitle] = useState('Direktur Utama / Pemilik');
  const [ownerPhone, setOwnerPhone] = useState(userProfile?.phone || '');

  useEffect(() => {
    if (userProfile) {
      if (!ownerName && userProfile.fullName) setOwnerName(userProfile.fullName);
      if (!companyEmail && userProfile.email) setCompanyEmail(userProfile.email);
      if (!ownerPhone && userProfile.phone) setOwnerPhone(userProfile.phone);
    }
  }, [userProfile]);

  const industryOptions = [
    { value: 'Teknologi & Layanan', label: 'Teknologi & Layanan IT' },
    { value: 'Perdagangan & Retail', label: 'Perdagangan & Retail' },
    { value: 'Manufaktur & Produksi', label: 'Manufaktur & Produksi' },
    { value: 'Konstruksi & Properti', label: 'Konstruksi & Properti' },
    { value: 'Logistik & Distribusi', label: 'Logistik & Transportasi' },
    { value: 'Jasa Profesional & Konsultan', label: 'Jasa Profesional & Keuangan' },
    { value: 'Kesehatan & Farmasi', label: 'Kesehatan & Farmasi' },
    { value: 'Kuliner & F&B', label: 'Kuliner & Hospitality' },
    { value: 'Lainnya', label: 'Bidang Usaha Lainnya' },
  ];

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Nama perusahaan wajib diisi.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!ownerName.trim()) {
      setErrorMessage('Nama lengkap pemilik wajib diisi.');
      return;
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await completeOnboarding(
        {
          name: name.trim(),
          legalName: legalName.trim() || name.trim(),
          industry,
          email: companyEmail.trim(),
          phone: companyPhone.trim(),
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
          country: country.trim(),
          website: website.trim(),
        },
        {
          fullName: ownerName.trim(),
          jobTitle: jobTitle.trim(),
          phone: ownerPhone.trim(),
        }
      );

      showToast('Perusahaan berhasil didaftarkan! Selamat datang di ARVORA ONE.', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      setErrorMessage(parseFirebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <BrandLogo size="lg" showTagline />
        <h1 className="mt-4 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Inisialisasi Organisasi Bisnis
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Lengkapi data entitas untuk membuat tenant mandiri dengan isolasi data terenkripsi.
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-6">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold ${
              currentStep === 1
                ? 'bg-blue-50 text-blue-700'
                : currentStep > 1
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className="hidden xs:inline">Informasi Perusahaan</span>
          </div>

          <div className="h-0.5 flex-1 mx-2 bg-slate-100" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold ${
              currentStep === 2
                ? 'bg-blue-50 text-blue-700'
                : currentStep > 2
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className="hidden xs:inline">Data Pemilik</span>
          </div>

          <div className="h-0.5 flex-1 mx-2 bg-slate-100" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold ${
              currentStep === 3 ? 'bg-blue-50 text-blue-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="hidden xs:inline">Konfirmasi & Aktifkan</span>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs text-left">
          {errorMessage && (
            <Alert
              variant="error"
              title="Perhatian"
              className="mb-5 text-xs"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {/* STEP 1: COMPANY INFORMATION */}
          {currentStep === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Langkah 1: Profil Perusahaan</h2>
                <p className="text-xs text-slate-500">
                  Data ini akan menjadi identitas resmi tenant organisasi Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Perusahaan (Brand / Operasional) *"
                  placeholder="Contoh: Arvora Mega Solusi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Nama Legal / Badan Usaha"
                  placeholder="Contoh: PT Arvora Mega Solusi Tbk"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  helperText="Dapat disamakan bila belum berbadan hukum."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Bidang Industri / Usaha"
                  options={industryOptions}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
                <Input
                  label="Email Resmi Perusahaan"
                  type="email"
                  placeholder="kontak@perusahaan.com"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Telepon Kantor"
                  placeholder="+62 21 xxxx xxxx"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Situs Web (Opsional)"
                  placeholder="https://perusahaan.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Alamat Kantor Pusat"
                placeholder="Jl. Raya Bisnis No. 123, Gedung Tower Lt. 5"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Kota / Kabupaten"
                  placeholder="Jakarta Selatan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="Provinsi"
                  placeholder="DKI Jakarta"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
                <Input
                  label="Negara"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Lanjut ke Data Pemilik
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: OWNER INFORMATION */}
          {currentStep === 2 && (
            <form onSubmit={handleNextFromStep2} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Langkah 2: Data Pemilik Perusahaan</h2>
                <p className="text-xs text-slate-500">
                  Akun Anda akan ditetapkan sebagai <strong className="text-blue-700">COMPANY_OWNER</strong> dengan otoritas penuh atas tenant ini.
                </p>
              </div>

              <Input
                label="Nama Lengkap Pemilik / Direktur *"
                placeholder="Ahmad Pratama, S.T."
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Jabatan / Title Perusahaan"
                placeholder="Direktur Utama / Chief Executive Officer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
              />

              <Input
                label="Nomor Telepon / WhatsApp Pribadi"
                placeholder="+62 812 xxxx xxxx"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                helperText="Digunakan untuk notifikasi keamanan akun dan otorisasi darurat."
              />

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hak Akses Tertinggi</span>
                  Sebagai Company Owner, Anda memiliki wewenang untuk mengundang admin, mengelola staf, dan mengatur konfigurasi billing perusahaan.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}
                  onClick={() => setCurrentStep(1)}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Tinjau Ringkasan
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: CONFIRMATION & REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Langkah 3: Konfirmasi Ringkasan</h2>
                <p className="text-xs text-slate-500">
                  Periksa keakuratan data sebelum sistem ARVORA ONE menginisialisasi tenant Anda.
                </p>
              </div>

              {/* 7-Day Trial Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-bold block text-emerald-950">
                    Otomatis 7 Hari Free Trial Termasuk
                  </span>
                  Tenant akan aktif seketika dengan status <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">TRIAL</code> selama 7 hari tanpa pemungutan biaya.
                </div>
              </div>

              {/* Summary details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200 text-xs">
                    Entitas Perusahaan
                  </span>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Nama Bisnis:</span>
                    <span className="font-bold text-slate-800">{name}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Badan Legal:</span>
                    <span className="text-slate-800">{legalName || name}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Industri:</span>
                    <span className="text-slate-800">{industry}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800">{companyEmail || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Lokasi:</span>
                    <span className="text-slate-800">
                      {[city, province, country].filter(Boolean).join(', ') || '-'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200 text-xs">
                    Kepemilikan & Peran
                  </span>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Pemilik Akun:</span>
                    <span className="font-bold text-slate-800">{ownerName}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Jabatan:</span>
                    <span className="text-slate-800">{jobTitle}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">No. Kontak:</span>
                    <span className="text-slate-800">{ownerPhone || '-'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Peran Sistem:</span>
                    <span className="font-bold text-blue-700">COMPANY_OWNER</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Anggota Awal:</span>
                    <span className="font-semibold text-slate-800">1 Pengguna (Owner)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isSubmitting}
                  onClick={handleFinalSubmit}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                >
                  Konfirmasi & Buat Tenant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
