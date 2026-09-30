"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

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

  const handleChange = (val: string) => {
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
    <CustomSelect
      value={currentPeriod}
      onChange={handleChange}
      options={options}
      icon={<CalendarDays size={16} className="text-primary-400" />}
      className={className}
      buttonClassName="border-primary-100/90 bg-white/95"
      ariaLabel="Chọn khoảng thời gian"
    />
  );
}
