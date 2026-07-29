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
      <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-10 w-full rounded-xl bg-gray-50 pl-10 pr-md text-[13px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all"
      />
    </div>
  );
}
