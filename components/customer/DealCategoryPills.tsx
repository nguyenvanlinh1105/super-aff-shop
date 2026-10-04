"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CATEGORY_ITEMS = [
  { value: "all", label: "Tất cả", emoji: "🔥" },
  { value: "Thời trang", label: "Thời trang", emoji: "👗" },
  { value: "Mỹ phẩm", label: "Mỹ phẩm", emoji: "💄" },
  { value: "Điện tử", label: "Điện tử", emoji: "⚡" },
  { value: "Gia dụng", label: "Gia dụng", emoji: "🍳" },
  { value: "Thực phẩm", label: "Thực phẩm", emoji: "🍪" },
  { value: "Thú cưng", label: "Thú cưng", emoji: "🐾" },
];

export function DealCategoryPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  function handleSelect(cat: string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 -my-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {CATEGORY_ITEMS.map((item) => {
          const isActive =
            activeCategory.toLowerCase() === item.value.toLowerCase() ||
            (activeCategory === "all" && item.value === "all");

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-[12.5px] font-extrabold transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-cute scale-[1.02]"
                  : "bg-white text-neutral-600 border border-primary-100/90 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
