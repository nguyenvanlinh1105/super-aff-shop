"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  direction?: "down" | "up" | "auto";
  ariaLabel?: string;
  wrapLabels?: boolean;
  showCountInButton?: boolean;
  fullWidthMenu?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  icon,
  placeholder = "Chọn...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "left",
  direction = "auto",
  ariaLabel,
  wrapLabels = false,
  showCountInButton = false,
  fullWidthMenu,
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveAlign, setEffectiveAlign] = useState<"left" | "right">(align);
  const [effectiveDirection, setEffectiveDirection] = useState<"down" | "up">(
    direction === "up" ? "up" : "down"
  );

  const isFullWidth = fullWidthMenu ?? className.includes("w-full");

  useEffect(() => {
    setEffectiveAlign(align);
  }, [align]);

  // Handle alignment and direction
  useEffect(() => {
    if (direction === "up") {
      setEffectiveDirection("up");
    } else if (direction === "down") {
      setEffectiveDirection("down");
    }

    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Prevent right-edge overflow on mobile when not full width
      if (!isFullWidth && align === "left" && viewportWidth - rect.left < 260 && rect.right > 260) {
        setEffectiveAlign("right");
      }

      // Auto detect direction: if not enough room below (< 260px) and more room above, flip up!
      if (direction === "auto") {
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 260 && spaceAbove > spaceBelow) {
          setEffectiveDirection("up");
        } else {
          setEffectiveDirection("down");
        }
      }
    }
  }, [isOpen, align, direction, isFullWidth]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .trim();
    return options.filter((opt) => {
      const label = opt.label
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase();
      return label.includes(q);
    });
  }, [options, searchable, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative select-none", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        className={cn(
          "group flex h-11 w-full items-center justify-between gap-1.5 rounded-2xl border bg-white px-3 text-left text-[13px] font-bold transition-all cursor-pointer shadow-2xs focus:outline-none active:scale-[0.98]",
          isOpen
            ? "border-primary-400 ring-2 ring-primary-100 shadow-cute"
            : "border-neutral-200/90 hover:border-primary-300 hover:shadow-sm",
          buttonClassName
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {(selectedOption?.icon ?? icon) && (
            <span className="shrink-0">{selectedOption?.icon ?? icon}</span>
          )}
          <span className="truncate text-neutral-800 font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {showCountInButton && selectedOption?.count !== undefined && (
            <span className="shrink-0 rounded-full bg-primary-100/90 text-primary-700 px-1.5 py-0.5 text-[10px] font-black leading-none whitespace-nowrap">
              {selectedOption.count}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          strokeWidth={2.4}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary-500" : "group-hover:text-neutral-700"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 rounded-2xl border border-primary-100/90 bg-white p-1.5 shadow-xl shadow-primary-500/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col",
            effectiveDirection === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            isFullWidth
              ? "left-0 right-0 w-full min-w-0 max-w-full"
              : cn(
                  effectiveAlign === "right" ? "right-0" : "left-0",
                  "min-w-full w-max max-w-[calc(100vw-2rem)] sm:max-w-xs"
                ),
            menuClassName
          )}
        >
          {searchable && (
            <div className="p-1 pb-1.5 shrink-0 border-b border-neutral-100 mb-1">
              <div className="relative flex items-center">
                <Search size={13} className="pointer-events-none absolute left-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl bg-neutral-50/90 border border-neutral-200/90 pl-8 pr-7 py-1.5 text-xs font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") setIsOpen(false);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto overflow-x-hidden scrollbar-none scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 flex flex-col gap-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-xs font-semibold text-neutral-400">
                {searchable && searchQuery ? "Không tìm thấy kết quả" : "Không có lựa chọn nào"}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    title={opt.label}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-50 text-primary-600 font-extrabold shadow-2xs"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span
                        className={
                          wrapLabels
                            ? "whitespace-normal break-words line-clamp-2 leading-snug"
                            : "whitespace-nowrap truncate"
                        }
                      >
                        {opt.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {opt.count !== undefined && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                            isSelected
                              ? "bg-primary-500 text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={14} strokeWidth={2.5} className="text-primary-500" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
