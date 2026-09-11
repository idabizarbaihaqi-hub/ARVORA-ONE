import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 10))) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-1 text-xs text-slate-500 ${className}`}
    >
      {totalItems !== undefined && pageSize !== undefined && (
        <div>
          Menampilkan{' '}
          <span className="font-semibold text-slate-800">
            {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
          </span>{' '}
          -{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          dari <span className="font-semibold text-slate-800">{totalItems}</span> entri
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Sebelumnya
        </Button>
        <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg">
          {currentPage} / {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman berikutnya"
        >
          Berikutnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
