import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Menu, ArrowRight, ShieldCheck, Building2, Sparkles } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Tentang Platform', href: '#tentang' },
    { label: 'Keunggulan', href: '#keunggulan' },
    { label: 'Modul ERP', href: '#modul' },
    { label: 'Keamanan Multi-Tenant', href: '#keamanan' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/auth/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
            >
              Coba 7 Hari Gratis
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link to="/auth/login">
            <Button variant="ghost" size="sm" className="px-2.5 text-xs">
              Masuk
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={<BrandLogo size="sm" />}
        position="right"
      >
        <div className="flex flex-col gap-6 py-2 text-left">
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Navigasi
            </span>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium text-slate-800 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              Sistem Multi-Tenant Terisolasi
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Setiap entitas bisnis mendapatkan database scope terlindungi dan masa uji coba 7 hari gratis.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Daftar Perusahaan (7 Hari Free Trial)
              </Button>
            </Link>
            <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Masuk ke Platform
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
};
