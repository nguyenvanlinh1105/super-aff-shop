"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { useTransition } from "react";

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  showSinglePage?: boolean;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
  className?: string;
  onPageChange?: (page: number) => void;
  scrollTargetId?: string;
  scrollToTable?: boolean;
}

type PageItem =
  | { type: "page"; value: number }
  | { type: "dots-left"; jumpTo: number }
  | { type: "dots-right"; jumpTo: number };

function getPaginationItems(totalPages: number, currentPage: number): PageItem[] {
  // 1. Nếu tổng số trang nhỏ hơn hoặc bằng 7: Hiển thị đầy đủ tất cả các trang [1, 2, 3, 4, 5, 6, 7]
  // Tuyệt đối không dùng dấu "…" khi danh sách chỉ có 6 hoặc 7 trang
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: "page",
      value: i + 1,
    }));
  }

  // 2. Khi tổng số trang > 7:
  // Cần xác định xem có cần dấu "…" ở bên trái và bên phải không
  const showLeftDots = currentPage > 4;
  const showRightDots = currentPage < totalPages - 3;

  // Trường hợp 2.1: Ở cụm đầu (currentPage <= 4) -> [1, 2, 3, 4, 5, …, totalPages]
  // Đảm bảo khi đang ở trang 1, 2, 3 thì trang 4 và 5 luôn hiện rõ và bấm được trực tiếp
  if (!showLeftDots && showRightDots) {
    return [
      { type: "page", value: 1 },
      { type: "page", value: 2 },
      { type: "page", value: 3 },
      { type: "page", value: 4 },
      { type: "page", value: 5 },
      { type: "dots-right", jumpTo: Math.min(totalPages, currentPage + 5) },
      { type: "page", value: totalPages },
    ];
  }

  // Trường hợp 2.2: Ở cụm cuối (currentPage >= totalPages - 3) -> [1, …, totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
  if (showLeftDots && !showRightDots) {
    return [
      { type: "page", value: 1 },
      { type: "dots-left", jumpTo: Math.max(1, currentPage - 5) },
      { type: "page", value: totalPages - 4 },
      { type: "page", value: totalPages - 3 },
      { type: "page", value: totalPages - 2 },
      { type: "page", value: totalPages - 1 },
      { type: "page", value: totalPages },
    ];
  }

  // Trường hợp 2.3: Ở giữa (currentPage từ 5 đến totalPages - 4) -> [1, …, curr-1, curr, curr+1, …, totalPages]
  return [
    { type: "page", value: 1 },
    { type: "dots-left", jumpTo: Math.max(1, currentPage - 5) },
    { type: "page", value: currentPage - 1 },
    { type: "page", value: currentPage },
    { type: "page", value: currentPage + 1 },
    { type: "dots-right", jumpTo: Math.min(totalPages, currentPage + 5) },
    { type: "page", value: totalPages },
  ];
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
  scrollTargetId,
  scrollToTable = true,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      startTransition(() => {
        // scroll: false ngăn Next.js tự động nhảy vụt lên đỉnh trang (0, 0)
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });

      // Nếu người dùng đã cuộn xuống quá đỉnh của bảng, cuộn mượt nhẹ nhàng về đầu bảng thay vì giật lên đầu trang
      if (scrollToTable) {
        requestAnimationFrame(() => {
          const target = scrollTargetId
            ? document.getElementById(scrollTargetId)
            : document.querySelector(".responsive-table, table, [data-table-container]");
          if (target) {
            const rect = target.getBoundingClientRect();
            if (rect.top < 0) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        });
      }
    }
  };

  const paginationItems = getPaginationItems(effectiveTotalPages, effectiveCurrentPage);

  return (
    <div
      className={`flex items-center justify-center gap-1 sm:gap-1.5 pt-4 pb-2 select-none relative ${
        isPending ? "opacity-60 transition-opacity" : ""
      } ${className}`}
    >
      {isPending && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 bg-white/90 px-2 py-0.5 rounded-full border border-neutral-200 shadow-xs">
          <Loader2 size={12} className="animate-spin text-amber-600" /> Đang tải...
        </span>
      )}
      {/* First Page (<<) — Chỉ hiển thị trên Desktop khi nhiều hơn 5 trang */}
      {effectiveTotalPages > 5 && (
        <button
          onClick={() => handleNavigate(1)}
          disabled={effectiveCurrentPage <= 1}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
          title="Về trang đầu (1)"
          type="button"
        >
          <ChevronsLeft size={15} />
        </button>
      )}

      {/* Prev Page (<) */}
      <button
        onClick={() => handleNavigate(effectiveCurrentPage - 1)}
        disabled={effectiveCurrentPage <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
        title="Trang trước"
        type="button"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers & Smart Ellipsis */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {paginationItems.map((item, idx) => {
          if (item.type === "dots-left" || item.type === "dots-right") {
            const isLeft = item.type === "dots-left";
            return (
              <button
                key={`${item.type}-${idx}`}
                type="button"
                onClick={() => handleNavigate(item.jumpTo)}
                title={`Nhảy ${isLeft ? "lùi" : "tiếp"} 5 trang (đến trang ${item.jumpTo})`}
                className="group flex h-8 w-7 sm:w-8 items-center justify-center rounded-full text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer select-none"
              >
                <span className="group-hover:hidden font-black text-xs tracking-widest leading-none">
                  …
                </span>
                <span className="hidden group-hover:inline text-[13px] font-black leading-none">
                  {isLeft ? "«" : "»"}
                </span>
              </button>
            );
          }

          const page = item.value;
          const isActive = effectiveCurrentPage === page;

          return (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              disabled={isActive}
              type="button"
              className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full text-xs font-black transition-all tabular-nums cursor-pointer ${
                isActive
                  ? "bg-neutral-900 text-white shadow-sm scale-105 cursor-default"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 active:scale-95"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page (>) */}
      <button
        onClick={() => handleNavigate(effectiveCurrentPage + 1)}
        disabled={effectiveCurrentPage >= effectiveTotalPages}
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
        title="Trang sau"
        type="button"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last Page (>>) — Chỉ hiển thị trên Desktop khi nhiều hơn 5 trang */}
      {effectiveTotalPages > 5 && (
        <button
          onClick={() => handleNavigate(effectiveTotalPages)}
          disabled={effectiveCurrentPage >= effectiveTotalPages}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
          title={`Đến trang cuối (${effectiveTotalPages})`}
          type="button"
        >
          <ChevronsRight size={15} />
        </button>
      )}
    </div>
  );
}
