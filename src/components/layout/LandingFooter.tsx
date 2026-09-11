import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { Shield, Layers, Lock, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <BrandLogo size="md" invert showTagline />
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mt-2">
              ARVORA ONE adalah platform manajemen bisnis terintegrasi dan multi-tenant SaaS ERP.
              Dirancang dengan arsitektur isolasi data perusahaan tingkat tinggi, keamanan berbasis peran (RBAC),
              serta antarmuka responsif untuk efisiensi operasional terpadu.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-sky-400" /> Multi-Tenant Isolation
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-sky-400" /> Enterprise RBAC
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-sky-400" /> Cloud Architecture
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Struktur Platform
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <a href="#tentang" className="hover:text-white transition-colors">
                  Arsitektur Sistem
                </a>
              </li>
              <li>
                <a href="#keunggulan" className="hover:text-white transition-colors">
                  Keunggulan Multi-Tenant
                </a>
              </li>
              <li>
                <a href="#modul" className="hover:text-white transition-colors">
                  Peta Jalan Modul ERP
                </a>
              </li>
              <li>
                <a href="#keamanan" className="hover:text-white transition-colors">
                  Keamanan & Kepatuhan
                </a>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Akses Perusahaan
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link to="/auth/login" className="hover:text-white transition-colors">
                  Portal Masuk Organisasi
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-white transition-colors">
                  Registrasi Perusahaan Baru (7 Hari Trial)
                </Link>
              </li>
              <li>
                <Link to="/auth/forgot-password" className="hover:text-white transition-colors">
                  Pemulihan Kata Sandi
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Fase Pengembangan: <span className="text-sky-400 font-semibold">Tahap 1 Fondasi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} ARVORA ONE. All rights reserved. All-in-One Business Management Platform.
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Fondasi Bersih & Bebas Data Dummy</span>
            <span>•</span>
            <span>Zero Cross-Tenant Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
