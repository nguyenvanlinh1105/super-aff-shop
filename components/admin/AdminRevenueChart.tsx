"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ZoomIn, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface OrderDataPoint {
  date: string; // ISO string: "2026-07-15"
  commission: number;
  reward: number;
  profit: number;
}

type ViewLevel = "year" | "month" | "week";

interface ChartItem {
  label: string;
  commission: number;
  reward: number;
  profit: number;
  count: number;
}

interface AdminRevenueChartProps {
  orderData: OrderDataPoint[];
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Lấy ngày thứ Hai đầu tuần chứa date d */
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

/** Xác định tuần thứ mấy trong tháng (1-indexed) */
function weekOfMonth(d: Date): number {
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstMonday = getMonday(firstDay);
  // Nếu firstMonday nằm ở tháng trước, cộng thêm 7 ngày
  const adjustedFirst = firstMonday.getDate() > 7
    ? new Date(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate() + 7)
    : firstMonday;
  const monday = getMonday(d);
  const diff = Math.round((monday.getTime() - adjustedFirst.getTime()) / (7 * 86400000));
  return Math.max(1, diff + 1);
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"];

const fmtShort = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return `${v}`;
};

/* ── Component ─────────────────────────────────────────────────────── */

export function AdminRevenueChart({ orderData }: AdminRevenueChartProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // Parse dates once
  const parsedOrders = useMemo(() => {
    return orderData.map((o) => ({
      ...o,
      _date: new Date(o.date),
    }));
  }, [orderData]);

  // Chỉ lấy những NĂM có dữ liệu thực tế (sắp xếp giảm dần)
  const availableYears = useMemo(() => {
    if (parsedOrders.length === 0) return [currentYear];
    const years = new Set<number>();
    for (const o of parsedOrders) {
      years.add(o._date.getFullYear());
    }
    const arr = Array.from(years).sort((a, b) => b - a);
    return arr.length > 0 ? arr : [currentYear];
  }, [parsedOrders, currentYear]);

  const [viewLevel, setViewLevel] = useState<ViewLevel>("year");
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (orderData.length === 0) return currentYear;
    const years = Array.from(new Set(orderData.map((o) => new Date(o.date).getFullYear()))).sort((a, b) => b - a);
    return years[0] || currentYear;
  });

  // Chỉ lấy những THÁNG có dữ liệu trong selectedYear
  const availableMonthsInYear = useMemo(() => {
    const map = new Map<number, { count: number; commission: number; reward: number; profit: number }>();
    for (const o of parsedOrders) {
      if (o._date.getFullYear() !== selectedYear) continue;
      const m = o._date.getMonth();
      const cur = map.get(m) ?? { count: 0, commission: 0, reward: 0, profit: 0 };
      cur.count += 1;
      cur.commission += o.commission;
      cur.reward += o.reward;
      cur.profit += o.profit;
      map.set(m, cur);
    }
    return Array.from(map.entries())
      .filter(([_, val]) => val.count > 0)
      .map(([m, val]) => ({
        month: m,
        name: MONTH_NAMES[m],
        fullName: `Tháng ${m + 1}`,
        ...val,
      }))
      .sort((a, b) => a.month - b.month);
  }, [parsedOrders, selectedYear]);

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return currentMonth;
  });

  // Tự động đồng bộ selectedMonth với tháng gần nhất có dữ liệu khi đổi năm
  useEffect(() => {
    if (availableMonthsInYear.length > 0) {
      const exists = availableMonthsInYear.some((m) => m.month === selectedMonth);
      if (!exists) {
        setSelectedMonth(availableMonthsInYear[availableMonthsInYear.length - 1].month);
      }
    }
  }, [selectedYear, availableMonthsInYear, selectedMonth]);

  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null); // ISO date of Monday
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Tổng hợp cả năm
  const yearTotals = useMemo(() => {
    let commission = 0;
    let reward = 0;
    let profit = 0;
    let count = 0;
    for (const o of parsedOrders) {
      if (o._date.getFullYear() === selectedYear) {
        commission += o.commission;
        reward += o.reward;
        profit += o.profit;
        count += 1;
      }
    }
    return { commission, reward, profit, count };
  }, [parsedOrders, selectedYear]);

  // Tổng hợp tháng đang chọn
  const monthTotals = useMemo(() => {
    let commission = 0;
    let reward = 0;
    let profit = 0;
    let count = 0;
    for (const o of parsedOrders) {
      if (o._date.getFullYear() === selectedYear && o._date.getMonth() === selectedMonth) {
        commission += o.commission;
        reward += o.reward;
        profit += o.profit;
        count += 1;
      }
    }
    return { commission, reward, profit, count };
  }, [parsedOrders, selectedYear, selectedMonth]);

  // ═══ Build chart items theo view level ═══
  const chartItems: ChartItem[] = useMemo(() => {
    if (viewLevel === "year") {
      // Nhóm theo 12 tháng của selectedYear
      const buckets: ChartItem[] = Array.from({ length: 12 }, (_, i) => ({
        label: MONTH_NAMES[i],
        commission: 0, reward: 0, profit: 0, count: 0,
      }));
      for (const o of parsedOrders) {
        if (o._date.getFullYear() !== selectedYear) continue;
        const m = o._date.getMonth();
        buckets[m].commission += o.commission;
        buckets[m].reward += o.reward;
        buckets[m].profit += o.profit;
        buckets[m].count += 1;
      }

      // Nếu là năm hiện tại, chỉ hiển thị đến tháng hiện tại
      if (selectedYear === currentYear) {
        return buckets.slice(0, currentMonth + 1);
      }
      return buckets;
    }

    if (viewLevel === "month") {
      // Nhóm theo tuần trong tháng selectedMonth của selectedYear
      // Tính các tuần (thứ Hai → Chủ nhật)
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const weeksMap = new Map<string, ChartItem>();

      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const monday = getMonday(new Date(d));
        const key = monday.toISOString().slice(0, 10);
        if (!weeksMap.has(key)) {
          const wom = weekOfMonth(new Date(d));
          const endOfWeek = new Date(monday);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          const startLabel = `${monday.getDate()}/${monday.getMonth() + 1}`;
          const endLabel = `${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
          weeksMap.set(key, {
            label: `Tuần ${wom}`,
            commission: 0, reward: 0, profit: 0, count: 0,
          });
        }
      }

      for (const o of parsedOrders) {
        if (o._date.getFullYear() !== selectedYear || o._date.getMonth() !== selectedMonth) continue;
        const monday = getMonday(o._date);
        const key = monday.toISOString().slice(0, 10);
        const bucket = weeksMap.get(key);
        if (bucket) {
          bucket.commission += o.commission;
          bucket.reward += o.reward;
          bucket.profit += o.profit;
          bucket.count += 1;
        }
      }

      return Array.from(weeksMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => v);
    }

    if (viewLevel === "week" && selectedWeekStart) {
      // 7 ngày từ Monday
      const monday = new Date(selectedWeekStart);
      const buckets: ChartItem[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dayOfWeek = day.getDay(); // 0=CN, 1=T2...
        buckets.push({
          label: `${DAY_LABELS[dayOfWeek]} ${day.getDate()}/${day.getMonth() + 1}`,
          commission: 0, reward: 0, profit: 0, count: 0,
        });
      }

      for (const o of parsedOrders) {
        const mondayDate = new Date(selectedWeekStart);
        const sundayDate = new Date(mondayDate);
        sundayDate.setDate(sundayDate.getDate() + 6);
        if (o._date >= mondayDate && o._date <= sundayDate) {
          const diff = Math.floor((o._date.getTime() - mondayDate.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) {
            buckets[diff].commission += o.commission;
            buckets[diff].reward += o.reward;
            buckets[diff].profit += o.profit;
            buckets[diff].count += 1;
          }
        }
      }

      return buckets;
    }

    return [];
  }, [viewLevel, selectedYear, selectedMonth, selectedWeekStart, parsedOrders, currentYear, currentMonth]);

  // ═══ Growth calculation ═══
  const growthInfo = useMemo(() => {
    if (viewLevel === "year") {
      if (availableMonthsInYear.length < 2) return { pct: 0, prevLabel: "", currentLabel: "" };
      const last = availableMonthsInYear[availableMonthsInYear.length - 1];
      const prev = availableMonthsInYear[availableMonthsInYear.length - 2];
      const pct = prev.commission > 0
        ? Math.round(((last.commission - prev.commission) / prev.commission) * 100)
        : 0;
      return { pct, prevLabel: prev.name, currentLabel: last.name };
    }
    const itemsWithData = chartItems.filter((m) => m.count > 0);
    if (itemsWithData.length < 2) return { pct: 0, prevLabel: "", currentLabel: "" };
    const last = itemsWithData[itemsWithData.length - 1];
    const prev = itemsWithData[itemsWithData.length - 2];
    const pct = prev.commission > 0
      ? Math.round(((last.commission - prev.commission) / prev.commission) * 100)
      : 0;
    return { pct, prevLabel: prev.label, currentLabel: last.label };
  }, [viewLevel, availableMonthsInYear, chartItems]);

  // ═══ Active / Hovered item ═══
  const activeIdx = hoveredIdx !== null ? hoveredIdx : chartItems.length - 1;
  const activeItem = chartItems[activeIdx] ?? chartItems[chartItems.length - 1];
  const maxVal = Math.max(...chartItems.map((m) => m.commission), 1);

  // ═══ SVG Layout ═══
  const PLOT = { left: 46, right: 584, top: 40, bottom: 165 };
  const n = chartItems.length;
  const getX = (i: number) => PLOT.left + 14 + i * ((PLOT.right - PLOT.left - 28) / Math.max(n - 1, 1));
  const getY = (val: number) => PLOT.bottom - (val / maxVal) * (PLOT.bottom - PLOT.top);

  const commPoints = chartItems.map((m, i) => ({ x: getX(i), y: getY(m.commission), val: m.commission }));
  const rewPoints = chartItems.map((m, i) => ({ x: getX(i), y: getY(m.reward), val: m.reward }));
  const profPoints = chartItems.map((m, i) => ({ x: getX(i), y: getY(m.profit), val: m.profit }));

  const makePath = (pts: typeof commPoints) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const makeArea = (pts: typeof commPoints) =>
    pts.length > 0 ? `${makePath(pts)} L ${pts[pts.length - 1].x} ${PLOT.bottom} L ${pts[0].x} ${PLOT.bottom} Z` : "";

  const midY = (PLOT.top + PLOT.bottom) / 2;

  // ═══ Drill-down handlers ═══
  const handleDrillDown = (idx: number) => {
    if (viewLevel === "year") {
      // Chỉ drill nếu tháng có dữ liệu thực tế
      const targetItem = chartItems[idx];
      if (!targetItem || targetItem.count === 0) return;
      setSelectedMonth(idx);
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "month") {
      // Tìm monday key tương ứng
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const weeks: string[] = [];
      const seenKeys = new Set<string>();
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const monday = getMonday(new Date(d));
        const key = monday.toISOString().slice(0, 10);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          weeks.push(key);
        }
      }
      weeks.sort();
      if (weeks[idx]) {
        setSelectedWeekStart(weeks[idx]);
        setViewLevel("week");
        setHoveredIdx(null);
      }
    }
    // week level → no drill
  };

  const handleGoBack = () => {
    if (viewLevel === "week") {
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "month") {
      setViewLevel("year");
      setHoveredIdx(null);
    }
  };

  // ═══ Breadcrumb ═══
  const breadcrumb = useMemo(() => {
    const parts: { label: string; onClick?: () => void }[] = [];
    parts.push({
      label: `Năm ${selectedYear}`,
      onClick: viewLevel !== "year" ? () => { setViewLevel("year"); setHoveredIdx(null); } : undefined,
    });
    if (viewLevel === "month" || viewLevel === "week") {
      parts.push({
        label: MONTH_NAMES[selectedMonth],
        onClick: viewLevel === "week" ? () => { setViewLevel("month"); setSelectedWeekStart(null); setHoveredIdx(null); } : undefined,
      });
    }
    if (viewLevel === "week" && selectedWeekStart) {
      const monday = new Date(selectedWeekStart);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      parts.push({
        label: `${monday.getDate()}/${monday.getMonth() + 1} – ${sunday.getDate()}/${sunday.getMonth() + 1}`,
      });
    }
    return parts;
  }, [viewLevel, selectedYear, selectedMonth, selectedWeekStart]);

  // ═══ Summary Cards Calculations ═══
  const summaryDisplay = useMemo(() => {
    if (hoveredIdx !== null && chartItems[hoveredIdx]) {
      const it = chartItems[hoveredIdx];
      return {
        title: `${it.label} (${it.count} đơn) 🔍`,
        commission: it.commission,
        reward: it.reward,
        profit: it.profit,
      };
    }

    if (viewLevel === "year") {
      return {
        title: `Cả năm ${selectedYear} (${yearTotals.count} đơn)`,
        commission: yearTotals.commission,
        reward: yearTotals.reward,
        profit: yearTotals.profit,
      };
    }

    if (viewLevel === "month") {
      return {
        title: `${MONTH_NAMES[selectedMonth]}/${selectedYear} (${monthTotals.count} đơn)`,
        commission: monthTotals.commission,
        reward: monthTotals.reward,
        profit: monthTotals.profit,
      };
    }

    const totalComm = chartItems.reduce((s, c) => s + c.commission, 0);
    const totalRew = chartItems.reduce((s, c) => s + c.reward, 0);
    const totalProf = chartItems.reduce((s, c) => s + c.profit, 0);
    const totalCount = chartItems.reduce((s, c) => s + c.count, 0);
    return {
      title: `Tuần (${totalCount} đơn)`,
      commission: totalComm,
      reward: totalRew,
      profit: totalProf,
    };
  }, [hoveredIdx, chartItems, viewLevel, selectedYear, selectedMonth, yearTotals, monthTotals]);

  // ═══ Subtitle text ═══
  const subtitleText = useMemo(() => {
    if (viewLevel === "year") return "Chọn tháng có dữ liệu trên biểu đồ hoặc menu để xem chi tiết theo tuần";
    if (viewLevel === "month") return "Click vào tuần để xem chi tiết theo ngày";
    return "Hover vào từng ngày để xem chi tiết";
  }, [viewLevel]);

  const canDrill = viewLevel !== "week";

  // Handle empty data
  if (chartItems.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-sm font-bold text-neutral-500">Chưa có dữ liệu cho khoảng thời gian này</div>
        {viewLevel !== "year" && (
          <button onClick={handleGoBack} className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            <ChevronLeft size={14} /> Quay lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 p-1 flex items-center justify-center shadow-xs border border-rose-100 shrink-0 overflow-hidden">
            <img src="/meow-back-analytics.png" alt="Analytics" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Xu Hướng Tăng Trưởng Doanh Thu</h2>
            <p className="text-xs text-neutral-500 font-medium">{subtitleText}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 text-[11px] font-extrabold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-700">Hoa hồng sàn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-neutral-700">Hoàn khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-700">Lợi nhuận</span>
          </div>
        </div>
      </div>

      {/* Navigation Bar + Filter Controls (Chỉ năm & tháng có dữ liệu) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
          {viewLevel !== "year" && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors mr-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 border border-rose-200/70 shadow-2xs font-extrabold"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
              <span>Quay lại</span>
            </button>
          )}
          {breadcrumb.map((part, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-neutral-300">›</span>}
              {part.onClick ? (
                <button
                  onClick={part.onClick}
                  className="text-rose-600 hover:text-rose-700 hover:underline transition-colors font-bold"
                >
                  {part.label}
                </button>
              ) : (
                <span className="text-neutral-800 font-extrabold bg-neutral-100 px-2 py-0.5 rounded-lg">
                  {part.label}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Filter Controls: Chọn Năm & Chọn Tháng */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* 1. BỘ CHỌN NĂM (Chỉ các năm có dữ liệu) */}
          <div className="flex items-center rounded-xl bg-neutral-100/90 p-0.5 border border-neutral-200/80 shadow-2xs">
            <button
              onClick={() => {
                const curIdx = availableYears.indexOf(selectedYear);
                if (curIdx < availableYears.length - 1) {
                  const newYear = availableYears[curIdx + 1];
                  setSelectedYear(newYear);
                  setViewLevel("year");
                  setHoveredIdx(null);
                }
              }}
              disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
              className="p-1 rounded-lg hover:bg-white text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Năm trước (có dữ liệu)"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>

            <select
              value={selectedYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                setSelectedYear(y);
                setViewLevel("year");
                setHoveredIdx(null);
              }}
              className="bg-transparent text-xs font-black text-neutral-900 px-1.5 py-1 cursor-pointer focus:outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const curIdx = availableYears.indexOf(selectedYear);
                if (curIdx > 0) {
                  const newYear = availableYears[curIdx - 1];
                  setSelectedYear(newYear);
                  setViewLevel("year");
                  setHoveredIdx(null);
                }
              }}
              disabled={availableYears.indexOf(selectedYear) <= 0}
              className="p-1 rounded-lg hover:bg-white text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Năm sau (có dữ liệu)"
            >
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* 2. BỘ CHỌN THÁNG (Chỉ các tháng có dữ liệu trong năm đã chọn) */}
          <div className="flex items-center rounded-xl bg-rose-50/70 p-0.5 border border-rose-200/80 shadow-2xs">
            {viewLevel === "month" && (
              <button
                onClick={() => {
                  const curIdx = availableMonthsInYear.findIndex((m) => m.month === selectedMonth);
                  if (curIdx > 0) {
                    setSelectedMonth(availableMonthsInYear[curIdx - 1].month);
                    setHoveredIdx(null);
                  }
                }}
                disabled={availableMonthsInYear.findIndex((m) => m.month === selectedMonth) <= 0}
                className="p-1 rounded-lg hover:bg-white text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Tháng trước (có dữ liệu)"
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
            )}

            <select
              value={viewLevel === "year" ? "all" : selectedMonth}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setViewLevel("year");
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                } else {
                  const mIdx = Number(val);
                  setSelectedMonth(mIdx);
                  setViewLevel("month");
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                }
              }}
              className="bg-transparent text-xs font-black text-rose-900 px-1.5 py-1 cursor-pointer focus:outline-none"
            >
              <option value="all">📊 Cả năm {selectedYear}</option>
              {availableMonthsInYear.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.fullName} ({m.count} đơn)
                </option>
              ))}
            </select>

            {viewLevel === "month" && (
              <button
                onClick={() => {
                  const curIdx = availableMonthsInYear.findIndex((m) => m.month === selectedMonth);
                  if (curIdx >= 0 && curIdx < availableMonthsInYear.length - 1) {
                    setSelectedMonth(availableMonthsInYear[curIdx + 1].month);
                    setHoveredIdx(null);
                  }
                }}
                disabled={
                  availableMonthsInYear.findIndex((m) => m.month === selectedMonth) >=
                  availableMonthsInYear.length - 1
                }
                className="p-1 rounded-lg hover:bg-white text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Tháng sau (có dữ liệu)"
              >
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/70 transition-all">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider truncate">
            Hoa hồng {summaryDisplay.title}
          </span>
          <span className="text-sm sm:text-base font-black text-neutral-900 tabular-nums">
            {formatCurrency(summaryDisplay.commission)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider truncate">
            Hoàn khách {summaryDisplay.title}
          </span>
          <span className="text-sm sm:text-base font-black text-neutral-900 tabular-nums">
            {formatCurrency(summaryDisplay.reward)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider truncate">
            Lợi nhuận {summaryDisplay.title}
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-700 tabular-nums">
            {formatCurrency(summaryDisplay.profit)}
          </span>
        </div>
      </div>

      {/* Interactive SVG 3-Line Graph */}
      <div className="relative w-full">
        <svg
          viewBox="0 0 600 215"
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Biểu đồ xu hướng doanh thu"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.right} y2={PLOT.top} stroke="#F1F5F9" strokeWidth="1" />
          <line x1={PLOT.left} y1={midY} x2={PLOT.right} y2={midY} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
          <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="#D1D5DB" strokeWidth="1.5" />

          <text x={PLOT.left - 6} y={PLOT.top + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            {fmtShort(maxVal)}
          </text>
          <text x={PLOT.left - 6} y={midY + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            {fmtShort(maxVal / 2)}
          </text>
          <text x={PLOT.left - 6} y={PLOT.bottom + 4} textAnchor="end" className="text-[10px] font-bold fill-neutral-400">
            0
          </text>

          {/* Area Fills */}
          {commPoints.length > 0 && <path d={makeArea(commPoints)} fill="url(#roseGradient)" />}
          {profPoints.length > 0 && <path d={makeArea(profPoints)} fill="url(#emeraldGradient)" />}

          {/* Lines */}
          {commPoints.length > 1 && <path d={makePath(commPoints)} fill="none" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
          {rewPoints.length > 1 && <path d={makePath(rewPoints)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
          {profPoints.length > 1 && <path d={makePath(profPoints)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Hover Guideline */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={PLOT.top}
              x2={getX(hoveredIdx)}
              y2={PLOT.bottom}
              stroke="#F43F5E"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points — Commission */}
          {commPoints.map((p, i) => (
            <g key={`comm-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4.5}
                fill={hoveredIdx === i ? "#F43F5E" : "#FFFFFF"}
                stroke="#F43F5E"
                strokeWidth={hoveredIdx === i ? 3 : 2.5}
                className="transition-all"
              />
              {hoveredIdx !== i && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] font-black fill-rose-600 font-mono">
                  {fmtShort(p.val)}
                </text>
              )}
            </g>
          ))}
          {/* Data Points — Reward */}
          {rewPoints.map((p, i) => (
            <g key={`rew-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 5.5 : 4}
                fill={hoveredIdx === i ? "#F59E0B" : "#FFFFFF"}
                stroke="#F59E0B"
                strokeWidth="2"
                className="transition-all"
              />
              {hoveredIdx !== i && p.val > 0 && Math.abs(p.y - commPoints[i].y) > 16 && (
                <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[9px] font-extrabold fill-amber-600 font-mono">
                  {fmtShort(p.val)}
                </text>
              )}
            </g>
          ))}
          {/* Data Points — Profit */}
          {profPoints.map((p, i) => (
            <circle
              key={`prof-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 5 : 3.5}
              fill={hoveredIdx === i ? "#10B981" : "#FFFFFF"}
              stroke="#10B981"
              strokeWidth="2"
              className="transition-all"
            />
          ))}

          {/* Labels & Interactive Hover/Click Columns */}
          {chartItems.map((m, i) => {
            const cx = getX(i);
            const isHovered = hoveredIdx === i;
            const hasData = m.count > 0;
            const canDrillThisItem = canDrill && (viewLevel !== "year" || hasData);

            // Smart tooltip positioning
            const tooltipBoxX = Math.max(10, Math.min(cx - 85, 420));
            const commY = commPoints[i]?.y ?? PLOT.bottom;
            const tooltipBoxY = commY < 100 ? commY + 14 : commY - 72;

            return (
              <g
                key={`col-${i}`}
                className={canDrillThisItem ? "cursor-pointer" : hasData ? "cursor-default" : "cursor-not-allowed"}
                onMouseEnter={() => setHoveredIdx(i)}
                onClick={() => canDrillThisItem && handleDrillDown(i)}
              >
                {/* Invisible hover area */}
                <rect
                  x={cx - 35}
                  y={PLOT.top - 10}
                  width="70"
                  height={PLOT.bottom - PLOT.top + 45}
                  fill="transparent"
                />

                {/* Label */}
                <text
                  x={cx}
                  y={PLOT.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-black transition-colors ${
                    isHovered
                      ? "fill-rose-600 font-extrabold"
                      : hasData
                      ? "fill-neutral-700"
                      : "fill-neutral-400"
                  }`}
                >
                  {m.label}
                </text>
                <text
                  x={cx}
                  y={PLOT.bottom + 31}
                  textAnchor="middle"
                  className={`text-[9px] font-bold transition-colors ${
                    isHovered
                      ? "fill-rose-600 font-black"
                      : hasData
                      ? "fill-neutral-400"
                      : "fill-neutral-300"
                  }`}
                >
                  {m.count} đơn
                </text>

                {/* Drill-down hint icon */}
                {canDrillThisItem && isHovered && (
                  <g transform={`translate(${cx + 18}, ${PLOT.bottom + 12})`}>
                    <ZoomIn size={10} className="fill-none stroke-rose-400" />
                  </g>
                )}

                {/* Floating Rich Tooltip on Hover */}
                {isHovered && (
                  <g className="pointer-events-none">
                    {hasData ? (
                      <>
                        <rect
                          x={tooltipBoxX}
                          y={tooltipBoxY}
                          width="170"
                          height="65"
                          rx="12"
                          fill="#0F172A"
                          opacity="0.96"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 16}
                          className="text-[10px] font-extrabold fill-rose-300"
                        >
                          {m.label.toUpperCase()} ({m.count} ĐƠN HÀNG)
                        </text>
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 30}
                          className="text-[10px] font-bold fill-white"
                        >
                          • Sàn trả: {formatCurrency(m.commission)}
                        </text>
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 43}
                          className="text-[10px] font-bold fill-amber-300"
                        >
                          • Hoàn khách: {formatCurrency(m.reward)}
                        </text>
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 56}
                          className="text-[10px] font-bold fill-emerald-400"
                        >
                          • Lợi nhuận: {formatCurrency(m.profit)}
                        </text>
                      </>
                    ) : (
                      <>
                        <rect
                          x={tooltipBoxX}
                          y={tooltipBoxY}
                          width="170"
                          height="44"
                          rx="12"
                          fill="#0F172A"
                          opacity="0.96"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 17}
                          className="text-[10px] font-extrabold fill-neutral-300"
                        >
                          {m.label.toUpperCase()} (0 ĐƠN HÀNG)
                        </text>
                        <text
                          x={tooltipBoxX + 12}
                          y={tooltipBoxY + 32}
                          className="text-[10px] font-medium fill-neutral-400 italic"
                        >
                          • Chưa có dữ liệu giao dịch
                        </text>
                      </>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer info */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 font-medium gap-2">
        <span className={`flex items-center gap-1 font-bold ${growthInfo.pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {growthInfo.pct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          {growthInfo.pct >= 0 ? "+" : ""}{growthInfo.pct}% hoa hồng {growthInfo.currentLabel ? `(${growthInfo.currentLabel} so với ${growthInfo.prevLabel || "kỳ trước"})` : `so với ${growthInfo.prevLabel || "kỳ trước"}`}
        </span>
        <span>
          {canDrill ? "Click vào tháng/tuần có dữ liệu để xem chi tiết hơn" : "Rà chuột vào từng điểm để hiển thị số tiền đầy đủ"}
        </span>
      </div>
    </div>
  );
}
