"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigate = (page: number) => {
    router.push(createPageURL(page));
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-xl pb-lg">
      <button
        onClick={() => handleNavigate(1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Trang đầu"
      >
        <ChevronsLeft size={16} />
      </button>
      <button
        onClick={() => handleNavigate(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1 px-sm">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 5) return true;
            if (page === 1 || page === totalPages) return true;
            if (Math.abs(page - currentPage) <= 1) return true;
            return false;
          })
          .map((page, index, array) => {
            if (index > 0 && page - array[index - 1] > 1) {
              return (
                <span key={`dots-${page}`} className="px-1 text-gray-400">
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl text-[14px] font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#e86a33] text-white shadow-sm shadow-[#e86a33]/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}
      </div>

      <button
        onClick={() => handleNavigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={() => handleNavigate(totalPages)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Trang cuối"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
