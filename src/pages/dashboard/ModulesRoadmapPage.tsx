import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Wallet,
  ShoppingBag,
  Package,
  Headphones,
  ShoppingCart,
  FolderKanban,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const ModulesRoadmapPage: React.FC = () => {
  const phase1Deliverables = [
    'Struktur multi-tenant terisolasi per companyId',
    'Sistem pendaftaran perusahaan mandiri (Company Owner)',
    '7 Hari Free Trial otomatis',
    'Model data RBAC (SUPER_ADMIN, COMPANY_OWNER, COMPANY_ADMIN, EMPLOYEE)',
    'Design system modular (Button, Table, Modal, Drawer, Toast, EmptyState, dll)',
    'Responsive mobile-first (360px - desktop 4K) dengan bottom navigation',
    'Penanganan kueri aman & aturan keamanan Firestore Rules',
  ];

  const phase2Modules = [
    {
      name: 'Human Resources (HR)',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      desc: 'Database pegawai, hierarki jabatan, pencatatan absensi, pengajuan cuti, dan slip gaji terintegrasi.',
      features: ['Data Pegawai', 'Manajemen Cuti & Izin', 'Absensi & Shift', 'Payroll & PPh21'],
    },
    {
      name: 'Finance & Akuntansi',
      icon: <Wallet className="w-6 h-6 text-blue-600" />,
      desc: 'Bagan akun (COA), pencatatan jurnal umum, buku besar, neraca saldo, dan arus kas otomatis.',
      features: ['Chart of Accounts', 'Jurnal & Buku Besar', 'Laba Rugi & Neraca', 'Arus Kas Real-time'],
    },
    {
      name: 'Sales & Penjualan',
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      desc: 'Siklus penjualan lengkap dari surat penawaran (quotation), pesanan (SO), surat jalan (DO), hingga invoice.',
      features: ['Quotation Generator', 'Sales Order & DO', 'Faktur Penjualan', 'Analisis Performa Sales'],
    },
    {
      name: 'Inventory & Gudang',
      icon: <Package className="w-6 h-6 text-blue-600" />,
      desc: 'Manajemen multi-gudang, penomoran batch & serial, kartu stok, stock opname, dan peringatan minimum stok.',
      features: ['Multi-Warehouse', 'Kartu Stok & Mutasi', 'Stock Opname', 'Batas Minimum Stok'],
    },
    {
      name: 'CRM & Relasi Pelanggan',
      icon: <Headphones className="w-6 h-6 text-blue-600" />,
      desc: 'Database kontak prospek dan klien, pipeline penjualan (deals), riwayat interaksi, dan tiket bantuan.',
      features: ['Database Pelanggan', 'Pipeline Transaksi', 'Catatan Interaksi', 'Customer Support Ticket'],
    },
    {
      name: 'Purchasing & Pengadaan',
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      desc: 'Permintaan pembelian (PR), Purchase Order (PO) ke supplier, penerimaan barang, dan pencatatan hutang dagang.',
      features: ['Purchase Requisition', 'Purchase Order', 'Goods Receipt', 'Hutang Usaha (AP)'],
    },
    {
      name: 'Projects & Milestone',
      icon: <FolderKanban className="w-6 h-6 text-blue-600" />,
      desc: 'Manajemen tugas proyek, pembagian tanggung jawab, pelacakan jam kerja (timesheet), dan progres deadline.',
      features: ['Board Proyek & Task', 'Timesheet Pelaksanaan', 'Milestone Tracking', 'Kapasitas Tim'],
    },
    {
      name: 'Laporan & Analitik',
      icon: <FileSpreadsheet className="w-6 h-6 text-blue-600" />,
      desc: 'Dashboard analitik eksekutif terpusat dengan grafik kinerja keuangan, tren penjualan, dan efisiensi operasional.',
      features: ['Executive Dashboard', 'Ekspor PDF & Excel', 'Filter Lintas Periode', 'Audit Trail Aktivitas'],
    },
    {
      name: 'Dokumen & Kontrak',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      desc: 'Penyimpanan arsip digital perusahaan, surat perjanjian kerja sama, dan standard operating procedure (SOP).',
      features: ['Folder Terstruktur', 'Akses Hak Berkas', 'Enkripsi Dokumen', 'Pencarian Instan'],
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Peta Jalan Pengembangan Modul ERP"
        description="Rencana rilis modular ARVORA ONE untuk memastikan fondasi arsitektur dibangun dengan ketelitian tinggi."
        breadcrumbs={[
          { label: 'Modul', href: '/app/modules' },
          { label: 'Peta Jalan Tahap 2' },
        ]}
      />

      {/* Tahap 1 Status Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="primary" size="sm" className="bg-blue-600/60 text-blue-200 border-none">
              Status Saat Ini
            </Badge>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Tahap 1: Fondasi Arsitektur Multi-Tenant & Design System
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Fase ini berfokus secara ketat pada keamanan isolasi database per-tenant, autentikasi Firebase,
              desain sistem responsif, dan struktur UI tanpa memuat data dummy.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" /> Tahap 1 Selesai
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-300">
          {phase1Deliverables.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tahap 2 Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Rencana Modul Tahap 2</h3>
            <p className="text-xs text-slate-500">
              Modul-modul berikut akan diintegrasikan secara bertahap ke dalam fondasi ini.
            </p>
          </div>
          <Badge variant="default" size="sm">
            Tahap 2 &bull; Coming Soon
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phase2Modules.map((module) => (
            <Card key={module.name} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    {module.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Tahap 2
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{module.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{module.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Fitur Direncanakan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {module.features.map((f, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
