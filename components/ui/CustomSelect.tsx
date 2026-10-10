"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
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
  ariaLabel?: string;
  wrapLabels?: boolean;
  showCountInButton?: boolean;
  fullWidthMenu?: boolean;
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
  ariaLabel,
  wrapLabels = false,
  showCountInButton = false,
  fullWidthMenu,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveAlign, setEffectiveAlign] = useState<"left" | "right">(align);

  const isFullWidth = fullWidthMenu ?? className.includes("w-full");

  useEffect(() => {
    setEffectiveAlign(align);
  }, [align]);

  // Prevent right-edge overflow on mobile when not full width
  useEffect(() => {
    if (isOpen && containerRef.current && !isFullWidth) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      if (align === "left" && viewportWidth - rect.left < 260 && rect.right > 260) {
        setEffectiveAlign("right");
      }
    }
  }, [isOpen, align, isFullWidth]);

  const selectedOption = options.find((opt) => opt.value === value);

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
            "absolute top-full mt-1.5 z-50 rounded-2xl border border-primary-100/90 bg-white p-1.5 shadow-xl shadow-primary-500/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto overflow-x-hidden scrollbar-none scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isFullWidth
              ? "left-0 right-0 w-full min-w-0 max-w-full"
              : cn(
                  effectiveAlign === "right" ? "right-0" : "left-0",
                  "min-w-full w-max max-w-[calc(100vw-2rem)] sm:max-w-xs"
                ),
            menuClassName
          )}
        >
          {options.length === 0 ? (
            <div className="py-3 px-3 text-center text-xs font-semibold text-neutral-400">
              Không có lựa chọn nào
            </div>
          ) : (
            options.map((opt) => {
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
      )}
    </div>
  );
}
