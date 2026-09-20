"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronDown } from "lucide-react";

interface PeriodSelectProps {
  paramName?: string;
  className?: string;
  options?: { value: string; label: string }[];
}

const DEFAULT_PERIOD_OPTIONS = [
  { value: "all", label: "Tất cả thời gian" },
  { value: "today", label: "Hôm nay" },
  { value: "last_7_days", label: "7 ngày qua" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
];

export function PeriodSelect({
  paramName = "period",
  className = "w-full sm:w-[200px] shrink-0",
  options = DEFAULT_PERIOD_OPTIONS,
}: PeriodSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get(paramName) || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, val);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`relative ${className}`}>
      <CalendarDays
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400"
      />
      <select
        value={currentPeriod}
        onChange={handleChange}
        className="h-11 w-full appearance-none rounded-2xl border border-primary-100 bg-white/95 pl-10 pr-9 text-[13px] font-semibold text-neutral-800 shadow-sm outline-none transition-all hover:border-primary-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2.2}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
      />
    </div>
  );
}
