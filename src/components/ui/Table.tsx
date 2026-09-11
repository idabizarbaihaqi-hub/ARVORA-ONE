import React, { type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: ReactNode;
  renderMobileCard?: (item: T) => ReactNode;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  renderMobileCard,
  className = '',
}: TableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Mobile Card Layout (When renderMobileCard provided, renders cleanly on small screens without horizontal scrolling) */}
      {renderMobileCard && (
        <div className="md:hidden flex flex-col gap-3">
          {data.map((item) => (
            <div key={keyExtractor(item)}>{renderMobileCard(item)}</div>
          ))}
        </div>
      )}

      {/* Standard Table (Desktop / Tablet view, or standard table) */}
      <div
        className={`${
          renderMobileCard ? 'hidden md:block' : 'block'
        } overflow-x-auto rounded-xl border border-slate-200/80 bg-white`}
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-slate-700 text-xs sm:text-sm ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
