'use client';

import React from 'react';

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TablePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  entityLabel?: string;
}

export function TablePagination({ pagination, onPageChange, entityLabel = 'items' }: TablePaginationProps) {
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const pages: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      for (let p = 1; p <= total; p++) {
        pages.push(p);
      }
      return pages;
    }

    if (current <= 4) {
      for (let p = 1; p <= 4; p++) {
        pages.push(p);
      }
      pages.push('ellipsis');
      pages.push(total);
      return pages;
    }

    if (current >= total - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let p = total - 3; p <= total; p++) {
        pages.push(p);
      }
      return pages;
    }

    pages.push(1);
    pages.push('ellipsis');
    for (let p = current - 1; p <= current + 1; p++) {
      pages.push(p);
    }
    pages.push('ellipsis');
    pages.push(total);

    return pages;
  };

  const handleClick = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    onPageChange(newPage);
  };

  const start = Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount);
  const end = Math.min(pagination.page * pagination.limit, pagination.totalCount);

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <div>
        Showing{' '}
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {start}
        </span>{' '}
        to{' '}
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {end}
        </span>{' '}
        of{' '}
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {pagination.totalCount}
        </span>{' '}
        {entityLabel}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleClick(pagination.page - 1)}
          disabled={!pagination.hasPrev}
          title="Previous page"
          className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
            pagination.hasPrev
              ? 'bg-white hover:bg-gray-50 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {getPageNumbers().map((item, index) =>
          item === 'ellipsis'
            ? (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
              )
            : (
              <button
                key={item}
                onClick={() => handleClick(item)}
                className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
                  item === pagination.page
                    ? 'dashboard-btn-primary border-transparent cursor-default'
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {item}
              </button>
              )
        )}
        <button
          onClick={() => handleClick(pagination.page + 1)}
          disabled={!pagination.hasNext}
          title="Next page"
          className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
            pagination.hasNext
              ? 'bg-white hover:bg-gray-50 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}


