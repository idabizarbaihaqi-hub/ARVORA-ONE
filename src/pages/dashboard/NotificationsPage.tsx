import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();

  // Initial real system setup notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_welcome',
      title: 'Selamat Datang di ARVORA ONE',
      message: 'Perusahaan Anda telah terdaftar dalam sistem multi-tenant dengan masa uji coba 7 hari aktif.',
      time: 'Baru saja',
      type: 'system',
      read: false,
    },
    {
      id: 'notif_security',
      title: 'Proteksi Tenant Aktif',
      message: 'Firestore Security Rules terpasang untuk melindungi data organisasi dari akses silang tenant.',
      time: 'Hari ini',
      type: 'security',
      read: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Semua notifikasi ditandai telah dibaca', 'info');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('Daftar notifikasi telah dibersihkan', 'info');
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Pusat Notifikasi"
        description="Pemberitahuan operasional, peringatan sistem, dan pengumuman platform."
        breadcrumbs={[
          { label: 'Notifikasi', href: '/app/notifications' },
          { label: 'Daftar Pemberitahuan' },
        ]}
        action={
          notifications.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Tandai Dibaca
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Bersihkan
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card>
        <CardHeader
          title="Notifikasi Masuk"
          subtitle={`Terdapat ${notifications.filter((n) => !n.read).length} notifikasi belum dibaca.`}
          action={
            <Badge variant="primary" size="sm">
              {notifications.length} Total
            </Badge>
          }
        />
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState
              title="Belum ada notifikasi"
              description="Semua pemberitahuan sistem dan aktivitas tenant terbaru akan ditampilkan di sini."
              icon={<Bell className="w-6 h-6 text-slate-400" />}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`py-4 flex items-start gap-3.5 transition-colors ${
                    item.read ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    {item.type === 'security' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
