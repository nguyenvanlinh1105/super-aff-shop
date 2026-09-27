"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  badgeTone?: "rose" | "emerald" | "amber" | "neutral" | "sky";
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  align?: "left" | "right";
  ariaLabel?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  icon,
  className = "",
  menuClassName = "",
  align = "left",
  ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-label={ariaLabel || placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-2xl bg-white border py-2.5 pl-3.5 pr-3 text-xs font-extrabold text-neutral-800 shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? "border-rose-400 ring-2 ring-rose-500/20 shadow-sm"
            : "border-neutral-200/80 hover:border-rose-300 hover:bg-rose-50/20 active:scale-[0.99]"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Custom Trigger Icon or selected option icon */}
          <span className="shrink-0 text-neutral-500">
            {selectedOption?.icon || icon}
          </span>

          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {typeof selectedOption?.count === "number" && (
            <span className="ml-1 shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-black text-neutral-600 border border-neutral-200/60">
              {selectedOption.count}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-rose-500" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute top-full mt-1.5 z-50 min-w-[220px] max-h-72 overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-xl shadow-rose-950/10 border border-rose-100 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95 duration-150 custom-scrollbar ${
            align === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
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
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                  isSelected
                    ? "bg-rose-50 font-black text-rose-700 border border-rose-200/70 shadow-2xs"
                    : "text-neutral-700 font-bold hover:bg-neutral-100/80 hover:text-neutral-900 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {opt.icon && (
                    <span
                      className={`shrink-0 ${
                        isSelected ? "text-rose-600" : "text-neutral-400"
                      }`}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {typeof opt.count === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${
                        isSelected
                          ? "bg-rose-200/70 text-rose-800 border-rose-300/50"
                          : "bg-neutral-100 text-neutral-600 border-neutral-200/60"
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                  {isSelected && (
                    <Check
                      size={14}
                      strokeWidth={2.8}
                      className="text-rose-600"
                    />
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
