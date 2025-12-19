'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  // Always display pagination, even if there's only one page or no data

  const handleChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    // Handle edge cases: 0 or 1 page
    if (totalPages <= 0) {
      return [1]; // Show at least page 1 even if no data
    }

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) {
        pages.push(p);
      }
      return pages;
    }

    if (currentPage <= 4) {
      for (let p = 1; p <= 4; p++) {
        pages.push(p);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let p = totalPages - 3; p <= totalPages; p++) {
        pages.push(p);
      }
      return pages;
    }

    pages.push(1);
    pages.push('ellipsis');
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
      pages.push(p);
    }
    pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
  };

  const start = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className="flex items-center justify-between px-10 py-4 border-t border-gray-200 text-sm"
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
          {totalCount}
        </span>{' '}
        {itemLabel}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Previous page"
          className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
            currentPage > 1
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
            ) : (
              <button
                key={item}
                onClick={() => handleChange(item)}
                className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
                  item === currentPage
                    ? 'dashboard-btn-primary border-transparent cursor-default'
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {item}
              </button>
            )
        )}
        <button
          onClick={() => handleChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Next page"
          className={`w-8 h-8 rounded-md border text-sm flex items-center justify-center ${
            currentPage < totalPages
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


