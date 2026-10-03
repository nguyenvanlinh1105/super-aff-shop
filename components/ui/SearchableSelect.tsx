"use client";

import { useMemo, useState } from "react";
import { Search, X, Check, User } from "lucide-react";

export type ComboboxOption = {
  id: string;
  label: string;
  code?: string;
  email?: string | null;
  phone?: string | null;
  subLabel?: string;
};

function normalize(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

export function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Tìm tên, mã, email...",
  emptyLabel = "Không tìm thấy khách hàng nào",
  size = "md",
  className = "",
  inputClassName = "",
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  size?: "md" | "sm";
  className?: string;
  inputClassName?: string;
  dropdownAlign?: "left" | "right";
}) {
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value]
  );

  // Lọc theo Tên, Mã khách hàng, Email, và Số điện thoại
  const filtered = useMemo(() => {
    const raw = query.trim();
    if (!raw) return options;
    const q = normalize(raw);
    return options.filter((o) => {
      if (normalize(o.label).includes(q)) return true;
      if (o.code && normalize(o.code).includes(q)) return true;
      if (o.email && normalize(o.email).includes(q)) return true;
      if (o.phone && o.phone.includes(raw)) return true;
      if (o.subLabel && normalize(o.subLabel).includes(q)) return true;
      return false;
    });
  }, [options, query]);

  // Nhấn Enter trên ô tìm kiếm: nếu có đúng 1 kết quả hoặc kết quả đầu tiên thì chọn luôn
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        onChange(filtered[0].id);
      }
    }
  }

  const isSm = size === "sm";

  // Khi đã chọn 1 khách hàng: hiển thị thẻ khách hàng đã chọn + nút gỡ/đổi
  if (selected) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div
          className={`flex items-center justify-between gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/90 text-emerald-900 shadow-2xs transition-all ${
            isSm ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Check size={isSm ? 13 : 15} className="text-emerald-600 shrink-0" />
            <div className="truncate font-bold leading-tight">
              <span>{selected.label}</span>
              {selected.code && (
                <span className="ml-1 text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-emerald-200/70 text-emerald-800">
                  {selected.code}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            title="Đổi hoặc chọn khách khác"
            className="rounded p-0.5 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-950 transition-colors shrink-0"
          >
            <X size={isSm ? 12 : 14} />
          </button>
        </div>
        {selected.email && (
          <span className="text-[10px] text-neutral-500 truncate px-1">
            ✉️ {selected.email}
          </span>
        )}
      </div>
    );
  }

  // Khi chưa chọn khách hàng: hiển thị Ô tìm kiếm (Tên/Mã/Email) + Selection dropdown (select)
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* 1. Ô tìm kiếm lọc theo Tên, Email, Mã KH */}
      <div className="relative flex items-center">
        <Search
          size={isSm ? 12 : 14}
          className="pointer-events-none absolute left-2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-neutral-200 bg-white font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-200 hover:border-neutral-300 transition-colors ${
            isSm
              ? "pl-6 pr-6 py-1 text-[11px]"
              : "pl-8 pr-8 py-2 text-xs"
          } ${inputClassName}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-1.5 p-0.5 text-neutral-400 hover:text-neutral-600 rounded"
            title="Xóa tìm kiếm"
          >
            <X size={isSm ? 11 : 13} />
          </button>
        )}
      </div>

      {/* 2. Selection dropdown (thẻ select chuẩn để Admin click chọn) */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border border-neutral-200 bg-white font-bold text-neutral-800 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-200 hover:border-neutral-300 transition-colors cursor-pointer truncate ${
            isSm
              ? "px-2 py-1 text-xs"
              : "px-3 py-2 text-xs"
          }`}
        >
          <option value="" disabled={filtered.length > 0}>
            {filtered.length === 0
              ? `❌ ${emptyLabel}`
              : query
              ? `-- Chọn từ ${filtered.length} kết quả tìm kiếm --`
              : `-- Chọn khách hàng (${options.length}) --`}
          </option>
          {filtered.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label} {o.code ? `[${o.code}]` : ""} {o.email ? `• ${o.email}` : o.phone ? `• ${o.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Gợi ý khi tìm kiếm có kết quả */}
      {query && filtered.length > 0 && (
        <span className="text-[10px] text-neutral-400 px-1 truncate">
          Tìm thấy {filtered.length} khách • Nhấn Enter hoặc chọn từ danh sách
        </span>
      )}
    </div>
  );
}
