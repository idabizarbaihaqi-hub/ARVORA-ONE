import React, { type ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/app/dashboard"
            className="flex items-center hover:text-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-slate-800 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-800">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 pb-5 mb-6 border-b border-slate-200/70 text-left ${className}`}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-1" />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>
    </div>
  );
};
