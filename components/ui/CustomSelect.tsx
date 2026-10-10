"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

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
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        className={`group flex h-11 w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3.5 text-left text-[13px] font-bold transition-all cursor-pointer shadow-2xs focus:outline-none active:scale-[0.98] ${
          isOpen
            ? "border-primary-400 ring-2 ring-primary-100 shadow-cute"
            : "border-neutral-200/90 hover:border-primary-300 hover:shadow-sm"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {(selectedOption?.icon ?? icon) && (
            <span className="shrink-0">{selectedOption?.icon ?? icon}</span>
          )}
          <span className="truncate text-neutral-800 font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span className="shrink-0 rounded-full bg-primary-100/90 text-primary-700 px-1.5 py-0.5 text-[10.5px] font-black leading-none">
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
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1.5 z-50 min-w-full max-h-64 overflow-y-auto rounded-2xl border border-primary-100/90 bg-white/98 p-1.5 shadow-xl shadow-primary-500/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
          style={{ minWidth: "max(100%, 160px)" }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-50 text-primary-600 font-extrabold shadow-2xs"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
          })}
        </div>
      )}
    </div>
  );
}
