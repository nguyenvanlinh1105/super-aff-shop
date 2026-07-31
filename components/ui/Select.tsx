"use client";

import { useState, useRef, useEffect, ReactNode, Children, isValidElement, ReactElement } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectProps = {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  placeholder?: string;
};

type OptionItem = {
  value: string;
  label: ReactNode;
};

export function Select({ value, onChange, className = "", disabled, children, placeholder }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trích xuất danh sách options từ children <option>
  const options: OptionItem[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type === "option" || (child as ReactElement).props?.value !== undefined)) {
      const props = (child as ReactElement).props;
      options.push({
        value: String(props.value ?? ""),
        label: props.children ?? String(props.value ?? ""),
      });
    }
  });

  const selectedOption = options.find((o) => o.value === String(value ?? "")) ?? options[0];

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(val: string) {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: val } });
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white px-4 py-2.5 text-xs font-extrabold text-neutral-800 shadow-xs transition-all duration-200 hover:border-rose-300 hover:bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder ?? "Chọn..."}</span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={`shrink-0 ml-2 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-rose-500" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-neutral-200/80 bg-white/95 p-1.5 shadow-xl shadow-neutral-900/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === String(value ?? "");
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition-all text-left ${
                  isSelected
                    ? "bg-rose-50 text-rose-700 font-black"
                    : "text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="shrink-0 text-rose-600 font-bold ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
