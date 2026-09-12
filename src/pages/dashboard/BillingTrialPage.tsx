import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Shield,
  HelpCircle,
  Building2,
  Headphones,
  Mail,
  Send,
} from 'lucide-react';

export const BillingTrialPage: React.FC = () => {
  const { company } = useAuth();
  const { showToast } = useToast();

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate trial days remaining
  const now = Date.now();
  const trialEnd = company?.trialEndAt ? new Date(company.trialEndAt).getTime() : now + 7 * 86400000;
  const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft === 0 && company?.status === 'TRIAL';

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUpgradeModalOpen(false);
      showToast('Permintaan konsultasi aktivasi paket berhasil dikirim ke tim enterprise ARVORA!', 'success');
      setContactNotes('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paket Langganan & Masa Trial"
        description="Kelola siklus langganan bisnis, status masa percobaan 7 hari, dan alokasi lisensi organisasi."
      />

      {/* Trial Status Highlight Card */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-200" />
              <span>
                {company?.status === 'ACTIVE'
                  ? 'Langganan Aktif'
                  : isExpired
                  ? 'Masa Percobaan Habis'
                  : 'Masa Percobaan 7 Hari Aktif'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {company?.status === 'ACTIVE'
                ? `Paket Bisnis Aktif: ${company.subscriptionPlan}`
                : `${daysLeft} Hari Tersisa pada Free Trial Anda`}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Masa trial berlaku hingga{' '}
              <strong>
                {company?.trialEndAt
                  ? new Date(company.trialEndAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '7 hari sejak inisialisasi'}
              </strong>
              . Seluruh modul dan tata kelola tim dapat dievaluasi tanpa pembatasan fitur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={() => {
                setSelectedPlan('GROWTH');
                setUpgradeModalOpen(true);
              }}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            >
              Konsultasi Aktivasi Paket
            </Button>
          </div>
        </div>
      </div>

      {isExpired && (
        <Alert
          variant="error"
          title="Masa Percobaan 7 Hari Telah Selesai"
          className="text-xs"
        >
          Masa percobaan gratis untuk tenant <strong>{company?.name}</strong> telah berakhir. Silakan hubungi konsultan ARVORA untuk mengaktifkan lisensi produksi perusahaan Anda.
        </Alert>
      )}

      {/* Plan Tiers Comparison (Informational, No Payment Gateway) */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h3 className="text-base font-bold text-slate-900">Pilihan Skala Layanan ARVORA ONE</h3>
          <p className="text-xs text-slate-500 mt-1">
            Transparan, terukur, dan didukung garansi isolasi data multi-tenant tingkat enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Trial / Starter */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 text-left">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Starter Trial</span>
              <h4 className="text-lg font-bold text-slate-900">7-Day Free Trial</h4>
              <div className="mt-2 text-2xl font-black text-slate-900">Rp 0</div>
              <p className="text-xs text-slate-500 mt-1">Gratis otomatis saat inisialisasi tenant.</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Hingga 5 Anggota Tim
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Tenant Database Terisolasi
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Role & Permission (RBAC)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Audit Log Dasar
              </li>
            </ul>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                Paket Aktif Saat Ini
              </Button>
            </div>
          </div>

          {/* Growth Plan (Popular) */}
          <div className="bg-white p-5 rounded-xl border-2 border-blue-600 shadow-xs space-y-4 text-left relative">
            <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Rekomendasi
            </div>

            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">Growth Scale</span>
              <h4 className="text-lg font-bold text-slate-900">Paket Berkembang</h4>
              <div className="mt-2 text-2xl font-black text-slate-900">
                Rp 299.000 <span className="text-xs font-normal text-slate-500">/ bulan</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Ideal untuk bisnis berkembang dengan tim dinamis.</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Hingga 25 Anggota Tim
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Dukungan Multi-Role Lengkap
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Audit Log Unlimited History
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Prioritas Support Email & Chat
              </li>
            </ul>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSelectedPlan('GROWTH');
                  setUpgradeModalOpen(true);
                }}
              >
                Pilih Paket Growth
              </Button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 text-left">
            <div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">Enterprise</span>
              <h4 className="text-lg font-bold text-slate-900">Custom Organization</h4>
              <div className="mt-2 text-2xl font-black text-slate-900">Custom SLA</div>
              <p className="text-xs text-slate-500 mt-1">Untuk korporasi skala besar & kepatuhan khusus.</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Anggota Tim Tanpa Batas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Dedicated Customer Success
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Perjanjian SLA 99.9%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Kustomisasi Integrasi Khusus
              </li>
            </ul>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSelectedPlan('ENTERPRISE');
                  setUpgradeModalOpen(true);
                }}
              >
                Hubungi Konsultan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: KONSULTASI AKTIVASI (No Payment Gateway) */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Formulir Konsultasi Aktivasi Langganan"
        size="md"
      >
        <form onSubmit={handleConsultationSubmit} className="space-y-4 text-left text-xs">
          <p className="text-slate-600 leading-relaxed">
            Tim konsultan ARVORA ONE akan menghubungi Anda untuk menyiapkan surat pesanan resmi, faktur pajak perusahaan, dan aktivasi lisensi tenant <strong>{company?.name}</strong>.
          </p>

          <Input
            label="Nama Kontak PIC *"
            placeholder="Ahmad Pratama"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />

          <Input
            label="Email Kerja PIC *"
            type="email"
            placeholder="pic@perusahaan.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Catatan / Permintaan Khusus (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Jumlah lisensi staf yang dibutuhkan, kebutuhan faktur pajak, dsb."
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
            <Headphones className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span>
              Tidak ada pembayaran instan atau pengisian kartu kredit di halaman ini. Seluruh faktur diterbitkan secara resmi melalui transfer perbankan korporat.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUpgradeModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Kirim Permintaan Aktivasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
