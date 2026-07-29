"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export type ComboboxOption = { id: string; label: string };

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d") // "đ" không tách dấu qua NFD, phải thay tay
    .toLowerCase();
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  emptyLabel = "Không tìm thấy khách hàng",
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
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  function selectOption(o: ComboboxOption) {
    onChange(o.id);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) selectOption(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const sizeClasses =
    size === "sm"
      ? "rounded-lg px-sm py-[6px] pr-[28px] text-[12px]"
      : "rounded-xl px-md py-[10px] pr-[36px] text-[14px]";
  const iconSize = size === "sm" ? 13 : 15;

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={open ? query : (selected?.label ?? "")}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full border border-ink/10 font-medium text-ink placeholder:text-mute/50 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary hover:border-ink/20 ${sizeClasses} ${inputClassName}`}
      />
      <Search
        size={iconSize}
        strokeWidth={2}
        className="pointer-events-none absolute right-sm top-1/2 -translate-y-1/2 text-mute/60"
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full min-w-[220px] overflow-y-auto rounded-xl border border-ink/10 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-md py-sm text-[13px] text-mute">{emptyLabel}</div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(o);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`cursor-pointer px-md py-[8px] text-[13px] ${
                  i === highlight ? "bg-primary-pale text-primary font-bold" : "text-ink font-medium"
                }`}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
