"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface ServerSearchInputProps {
  placeholder?: string;
  className?: string;
}

export function ServerSearchInput({ placeholder = "Tìm kiếm...", className = "" }: ServerSearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset về trang 1 khi search
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-11 w-full rounded-2xl bg-white/90 pl-10 pr-4 text-[13px] font-medium text-neutral-800 border border-primary-100 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all"
      />
    </div>
  );
}
