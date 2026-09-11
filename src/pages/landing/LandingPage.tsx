import React from 'react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from '../../components/layout/LandingNavbar';
import { LandingFooter } from '../../components/layout/LandingFooter';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  Layers,
  CheckCircle2,
  Users,
  Wallet,
  Package,
  ShoppingBag,
  Headphones,
  FileSpreadsheet,
  FolderKanban,
  Clock,
  Key,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const upcomingModules = [
    {
      name: 'HR & Kepegawaian',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      desc: 'Manajemen data karyawan, struktur organisasi, dan absensi terpusat.',
    },
    {
      name: 'Finance & Akuntansi',
      icon: <Wallet className="w-5 h-5 text-blue-600" />,
      desc: 'Pencatatan arus kas, invoice, buku besar, dan laporan keuangan komprehensif.',
    },
    {
      name: 'CRM & Pelanggan',
      icon: <Headphones className="w-5 h-5 text-blue-600" />,
      desc: 'Pusat data relasi klien, prospek bisnis, dan riwayat komunikasi.',
    },
    {
      name: 'Inventory & Gudang',
      icon: <Package className="w-5 h-5 text-blue-600" />,
      desc: 'Pelacakan stok multi-lokasi, mutasi barang, dan peringatan batas minimum.',
    },
    {
      name: 'Sales & Penjualan',
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      desc: 'Manajemen pesanan penjualan, penawaran harga (quotation), dan delivery order.',
    },
    {
      name: 'Projects & Dokumen',
      icon: <FolderKanban className="w-5 h-5 text-blue-600" />,
      desc: 'Kolaborasi proyek tim, pelacakan milestone, dan arsip dokumen terenkripsi.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>7 Hari Free Trial &bull; Arsitektur Multi-Tenant Terisolasi</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
              Kelola Seluruh Bisnis Anda dalam Satu Platform.
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              ARVORA ONE adalah platform SaaS ERP modern yang dirancang untuk menyatukan operasional,
              manajemen data, dan tata kelola perusahaan dengan keamanan data terisolasi penuh antar tenant.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Mulai 7 Hari Free Trial
                </Button>
              </Link>
              <Link to="/auth/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Masuk ke Portal Perusahaan
                </Button>
              </Link>
            </div>

            {/* Real Feature Invariants (No fake customer numbers or dummy ratings) */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Isolasi Data
                </span>
                <span className="text-sm font-bold text-slate-800">100% Multi-Tenant</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Masa Evaluasi
                </span>
                <span className="text-sm font-bold text-slate-800">7 Hari Penuh</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Aksesibilitas
                </span>
                <span className="text-sm font-bold text-slate-800">Mobile & Desktop</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Kontrol Peran
                </span>
                <span className="text-sm font-bold text-slate-800">Granular RBAC</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Penjelasan ARVORA ONE */}
        <section id="tentang" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                Konsep Arsitektur
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Dirancang untuk Pertumbuhan Berkelanjutan
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Platform bisnis tradisional sering memecah data perusahaan ke berbagai spreadsheet atau software terpisah.
                ARVORA ONE mengkonsolidasikan seluruh lini organisasi dalam satu ekosistem terpadu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
              <Card className="p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Struktur Multi-Tenant Sejak Hari Pertama
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Setiap perusahaan yang mendaftar memperoleh ID unik permanen. Data internal Anda
                  sepenuhnya terpisah dari perusahaan lain di level database dan security rules.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Hierarki Peran & Izin Bertingkat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Mendukung pembagian peran mulai dari Pemilik Perusahaan (Company Owner), Administrator,
                  hingga Karyawan dengan hak akses terukur dan aman dari eskalasi hak istimewa.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Fondasi Skalabel Tanpa Perombakan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Arsitektur Tahap 1 disiapkan secara matang sehingga penambahan modul HR, Keuangan,
                  hingga Inventaris di tahap selanjutnya berjalan mulus tanpa merusak struktur dasar.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Keunggulan Platform */}
        <section id="keunggulan" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                  Keunggulan Inti
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Standard Enterprise untuk Efisiensi Bisnis Modern
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  ARVORA ONE fokus pada stabilitas, kejelasan data, dan kecepatan navigasi kerja tanpa
                  hambatan visual yang membingungkan.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    'Satu Akun Perusahaan untuk Seluruh Tim & Divisi Kerja',
                    'Zero Data Leakage: Pengamanan ketat di sisi cloud database',
                    'Desain Bersih & Elegan: Tanpa elemen gaming atau neon berlebihan',
                    'Mobile-First Responsif: Nyaman dioperasikan langsung dari smartphone',
                    'Uji Coba 7 Hari Penuh: Akses fitur fondasi tanpa biaya komitmen',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Blueprint Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Skema Isolasi Multi-Tenant</span>
                  <Badge variant="primary" size="sm">
                    Tervalidasi
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">companies/{'{companyId}'}</span>
                    <span className="text-slate-500">Profil & Status 7-Hari Trial</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">users/{'{userId}'}</span>
                    <span className="text-slate-500">Profil Pengguna & Role</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">companyUsers/{'{companyId_userId}'}</span>
                    <span className="text-slate-500">Pemetaan Izin & Status Tenant</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Struktur ini memastikan keamanan database Cloud Firestore terlindungi dari akses silang
                  organisasi secara permanen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Gambaran Modul (Peta Jalan Tahap 2) */}
        <section id="modul" className="py-16 sm:py-24 bg-white text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                Peta Jalan Pengembangan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Modul ERP Lengkap yang Akan Datang
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Tahap 1 difokuskan pada fondasi arsitektur, autentikasi, dan isolasi data. Modul operasional berikut dijadwalkan secara bertahap pada Tahap 2:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingModules.map((mod) => (
                <div
                  key={mod.name}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                        {mod.icon}
                      </div>
                      <Badge variant="default" size="sm">
                        Tahap 2 &bull; Coming Soon
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">{mod.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 & 7. Keamanan & Multi-Tenant Detail */}
        <section id="keamanan" className="py-16 sm:py-20 bg-slate-900 text-white text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3 lg:col-span-1">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Keamanan & Kepatuhan
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Perlindungan Data Mutlak untuk Setiap Organisasi
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Tidak ada kompromi terhadap kerahasiaan data. Setiap kueri diverifikasi di sisi server
                  dan cloud security rules.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-2">
                  <ShieldCheck className="w-6 h-6 text-sky-400 mb-1" />
                  <h4 className="text-sm font-bold text-white">Zero Trust Security Rules</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Firestore security rules memverifikasi bahwa pengakses adalah anggota aktif tenant yang sesuai sebelum izin baca atau tulis diberikan.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-2">
                  <Lock className="w-6 h-6 text-sky-400 mb-1" />
                  <h4 className="text-sm font-bold text-white">Bebas Penyimpanan Password Mandiri</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Autentikasi dikelola langsung oleh Firebase Authentication berstandar industri dengan token terenkripsi.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-2">
                  <Building2 className="w-6 h-6 text-sky-400 mb-1" />
                  <h4 className="text-sm font-bold text-white">Isolasi ID Tenant Permanen</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ID perusahaan digenerate secara unik oleh sistem dan tidak dapat diubah oleh pengguna biasa untuk mencegah kerentanan spoofing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-2">
                  <Smartphone className="w-6 h-6 text-sky-400 mb-1" />
                  <h4 className="text-sm font-bold text-white">Mobile-First Responsiveness</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dioptimalkan untuk lebar layar mobile 360px hingga 430px dengan navigasi bawah dan tanpa overflow horizontal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8 & 9. Responsive Capability & Call To Action */}
        <section className="py-16 sm:py-24 bg-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-tr from-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden text-center">
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-widest mb-2">
                  Mulai Evaluasi Platform
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-xl">
                  Siap Membangun Fondasi Bisnis Terintegrasi?
                </h2>
                <p className="mt-3 text-xs sm:text-base text-slate-300 max-w-lg leading-relaxed">
                  Daftarkan perusahaan Anda hari ini. Nikmati 7 hari masa percobaan tanpa kartu kredit
                  dan jelajahi fondasi sistem multi-tenant ARVORA ONE.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <Link to="/auth/register" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 border-none"
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                    >
                      Daftar Sekarang (7 Hari Free Trial)
                    </Button>
                  </Link>
                  <Link to="/auth/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto text-white border-slate-600 hover:bg-slate-800"
                    >
                      Masuk Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <LandingFooter />
    </div>
  );
};
