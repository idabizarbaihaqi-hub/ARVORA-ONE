import React, { type ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

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
