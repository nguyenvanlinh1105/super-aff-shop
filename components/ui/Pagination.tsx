"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  showSinglePage?: boolean;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
  className?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  totalPages,
  currentPage,
  showSinglePage = true,
  totalItems,
  pageSize = 10,
  itemName = "mục",
  className = "",
  onPageChange,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const effectiveTotalPages = Math.max(0, totalPages || 0);
  const effectiveCurrentPage = Math.max(1, Math.min(currentPage || 1, effectiveTotalPages || 1));

  // Ẩn phân trang khi hoàn toàn không có dữ liệu (0 trang)
  if (effectiveTotalPages === 0) {
    return null;
  }
  // Nếu chỉ có 1 trang và showSinglePage = false thì ẩn
  if (effectiveTotalPages <= 1 && !showSinglePage) {
    return null;
  }

  const handleNavigate = (page: number) => {
    if (page < 1 || page > effectiveTotalPages || page === effectiveCurrentPage) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-1.5 pt-4 pb-2 select-none ${className}`}
    >
      {/* First Page (chỉ hiện khi nhiều hơn 5 trang) */}
      {effectiveTotalPages > 5 && (
        <button
          onClick={() => handleNavigate(1)}
          disabled={effectiveCurrentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
          title="Trang đầu"
          type="button"
        >
          <ChevronsLeft size={15} />
        </button>
      )}

      {/* Prev Page */}
      <button
        onClick={() => handleNavigate(effectiveCurrentPage - 1)}
        disabled={effectiveCurrentPage <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
        title="Trang trước"
        type="button"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (effectiveTotalPages <= 7) return true;
            if (page === 1 || page === effectiveTotalPages) return true;
            if (Math.abs(page - effectiveCurrentPage) <= 1) return true;
            return false;
          })
          .map((page, index, array) => {
            if (index > 0 && page - array[index - 1] > 1) {
              return (
                <span key={`dots-${page}`} className="px-1 text-neutral-300 font-bold select-none text-xs">
                  …
                </span>
              );
            }
            const isActive = effectiveCurrentPage === page;
            return (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                disabled={isActive}
                type="button"
                className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-xl text-xs font-black transition-all tabular-nums ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs cursor-default"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 active:scale-95"
                }`}
              >
                {page}
              </button>
            );
          })}
      </div>

      {/* Next Page */}
      <button
        onClick={() => handleNavigate(effectiveCurrentPage + 1)}
        disabled={effectiveCurrentPage >= effectiveTotalPages}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
        title="Trang sau"
        type="button"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last Page (chỉ hiện khi nhiều hơn 5 trang) */}
      {effectiveTotalPages > 5 && (
        <button
          onClick={() => handleNavigate(effectiveTotalPages)}
          disabled={effectiveCurrentPage >= effectiveTotalPages}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
          title="Trang cuối"
          type="button"
        >
          <ChevronsRight size={15} />
        </button>
      )}
    </div>
  );
}
