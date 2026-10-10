"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ZoomIn, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { CustomSelect } from "@/components/ui/CustomSelect";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface OrderDataPoint {
  date: string; // ISO string: "2026-07-15"
  commission: number;
  reward: number;
  profit: number;
}

type ViewLevel = "year" | "quarter" | "month" | "week";

interface ChartItem {
  label: string;
  subLabel?: string;
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

  // MẶC ĐỊNH: Hiển thị tháng hiện tại (viewLevel = "month" để xem 4-5 tuần)
  const [viewLevel, setViewLevel] = useState<ViewLevel>("month");
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (orderData.length === 0) return currentYear;
    const years = Array.from(new Set(orderData.map((o) => new Date(o.date).getFullYear()))).sort((a, b) => b - a);
    return years.includes(currentYear) ? currentYear : (years[0] || currentYear);
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

  // MẶC ĐỊNH: Tháng hiện tại
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return currentMonth;
  });

  // Tự động đồng bộ selectedMonth với tháng gần nhất có dữ liệu khi đổi năm sang năm khác
  useEffect(() => {
    if (selectedYear !== currentYear && availableMonthsInYear.length > 0) {
      const exists = availableMonthsInYear.some((m) => m.month === selectedMonth);
      if (!exists) {
        setSelectedMonth(availableMonthsInYear[availableMonthsInYear.length - 1].month);
      }
    }
  }, [selectedYear, availableMonthsInYear, selectedMonth, currentYear]);

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
    // 1. Chế độ xem cả năm (12 tháng)
    if (viewLevel === "year") {
      const buckets: ChartItem[] = Array.from({ length: 12 }, (_, i) => ({
        label: MONTH_NAMES[i],
        subLabel: `Tháng ${i + 1}`,
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

      if (selectedYear === currentYear) {
        return buckets.slice(0, currentMonth + 1);
      }
      return buckets;
    }

    // 2. Chế độ xem theo 4 Quý (Q1 - Q4)
    if (viewLevel === "quarter") {
      const quarters: ChartItem[] = [
        { label: "Quý 1", subLabel: "T1 – T3", commission: 0, reward: 0, profit: 0, count: 0 },
        { label: "Quý 2", subLabel: "T4 – T6", commission: 0, reward: 0, profit: 0, count: 0 },
        { label: "Quý 3", subLabel: "T7 – T9", commission: 0, reward: 0, profit: 0, count: 0 },
        { label: "Quý 4", subLabel: "T10 – T12", commission: 0, reward: 0, profit: 0, count: 0 },
      ];

      for (const o of parsedOrders) {
        if (o._date.getFullYear() !== selectedYear) continue;
        const q = Math.floor(o._date.getMonth() / 3);
        if (q >= 0 && q < 4) {
          quarters[q].commission += o.commission;
          quarters[q].reward += o.reward;
          quarters[q].profit += o.profit;
          quarters[q].count += 1;
        }
      }

      if (selectedYear === currentYear) {
        const curQ = Math.floor(currentMonth / 3);
        return quarters.slice(0, curQ + 1);
      }
      return quarters;
    }

    // 3. Chế độ xem theo tuần của tháng (Mặc định: tháng hiện tại)
    if (viewLevel === "month") {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const weeksMap = new Map<string, ChartItem>();

      let weekIdx = 1;
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const monday = getMonday(new Date(d));
        const key = monday.toISOString().slice(0, 10);
        if (!weeksMap.has(key)) {
          const endOfWeek = new Date(monday);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          const startD = monday < firstDay ? firstDay : monday;
          const endD = endOfWeek > lastDay ? lastDay : endOfWeek;
          const startLabel = `${startD.getDate()}/${startD.getMonth() + 1}`;
          const endLabel = `${endD.getDate()}/${endD.getMonth() + 1}`;
          weeksMap.set(key, {
            label: `Tuần ${weekIdx}`,
            subLabel: `${startLabel} – ${endLabel}`,
            commission: 0,
            reward: 0,
            profit: 0,
            count: 0,
          });
          weekIdx++;
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

    // 4. Chế độ xem theo ngày trong tuần (7 ngày)
    if (viewLevel === "week" && selectedWeekStart) {
      const monday = new Date(selectedWeekStart);
      const buckets: ChartItem[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dayOfWeek = day.getDay();
        buckets.push({
          label: `${DAY_LABELS[dayOfWeek]} ${day.getDate()}/${day.getMonth() + 1}`,
          subLabel: `${day.getDate()}/${day.getMonth() + 1}`,
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

  /**
   * Tạo đường cong Bezier mềm mại (Smooth Spline) đi qua từng toạ độ điểm
   * - Giữ phẳng tại đáy biểu đồ nếu giá trị = 0 (không bị võng dưới đáy)
   * - Uốn lượn mượt mà tự nhiên, thanh thoát
   */
  const makeSmoothPath = (pts: typeof commPoints) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    if (pts.length === 2) {
      const dx = (pts[1].x - pts[0].x) * 0.45;
      return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} C ${(pts[0].x + dx).toFixed(1)} ${pts[0].y.toFixed(1)}, ${(pts[1].x - dx).toFixed(1)} ${pts[1].y.toFixed(1)}, ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;
    }

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    const tension = 0.22;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      let cp1x = p1.x + (p2.x - p0.x) * tension;
      let cp1y = p1.y + (p2.y - p0.y) * tension;
      let cp2x = p2.x - (p3.x - p1.x) * tension;
      let cp2y = p2.y - (p3.y - p1.y) * tension;

      // Khi cả 2 điểm đều ở mức 0 (đáy đồ thị), giữ phẳng tuyệt đối
      if (p1.y >= PLOT.bottom - 0.5 && p2.y >= PLOT.bottom - 0.5) {
        cp1y = PLOT.bottom;
        cp2y = PLOT.bottom;
      } else {
        cp1y = Math.min(PLOT.bottom, Math.max(PLOT.top - 8, cp1y));
        cp2y = Math.min(PLOT.bottom, Math.max(PLOT.top - 8, cp2y));
      }

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return d;
  };

  const makeSmoothArea = (pts: typeof commPoints) => {
    if (pts.length === 0) return "";
    const path = makeSmoothPath(pts);
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${path} L ${last.x.toFixed(1)} ${PLOT.bottom} L ${first.x.toFixed(1)} ${PLOT.bottom} Z`;
  };

  const midY = (PLOT.top + PLOT.bottom) / 2;

  // ═══ Drill-down handlers ═══
  const handleDrillDown = (idx: number) => {
    if (viewLevel === "year") {
      const targetItem = chartItems[idx];
      if (!targetItem || targetItem.count === 0) return;
      setSelectedMonth(idx);
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "quarter") {
      const startMonth = idx * 3;
      const mInQ = availableMonthsInYear.find((m) => m.month >= startMonth && m.month <= startMonth + 2);
      setSelectedMonth(mInQ ? mInQ.month : startMonth);
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "month") {
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
  };

  const handleGoBack = () => {
    if (viewLevel === "week") {
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "month") {
      setViewLevel("quarter");
      setHoveredIdx(null);
    } else if (viewLevel === "quarter") {
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
    if (viewLevel === "quarter") {
      parts.push({
        label: "Theo 4 Quý",
      });
    }
    if (viewLevel === "month" || viewLevel === "week") {
      parts.push({
        label: `${MONTH_NAMES[selectedMonth]} (Theo tuần)`,
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
        title: `${it.label}${it.subLabel ? ` (${it.subLabel})` : ""} (${it.count} đơn) 🔍`,
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

    if (viewLevel === "quarter") {
      return {
        title: `4 Quý năm ${selectedYear} (${yearTotals.count} đơn)`,
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
    if (viewLevel === "year") return "Hiển thị 12 tháng • Click vào tháng có dữ liệu để xem chi tiết theo tuần";
    if (viewLevel === "quarter") return "Hiển thị 4 Quý • Click vào từng quý để xem chi tiết các tuần";
    if (viewLevel === "month") return `Hiển thị 4 tuần của ${MONTH_NAMES[selectedMonth]}/${selectedYear} • Click vào tuần để xem theo ngày`;
    return "Hover vào từng ngày để xem chi tiết";
  }, [viewLevel, selectedMonth, selectedYear]);

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

      {/* Navigation Bar + Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
          {viewLevel === "week" && (
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

        {/* Filter Controls: Quick Segmented Switcher + Chọn Năm + Chọn Kỳ */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Quick Segmented View Mode Tabs */}
          <div className="flex items-center rounded-xl bg-neutral-100/90 p-0.5 border border-neutral-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSelectedMonth(currentMonth);
                setViewLevel("month");
                setSelectedWeekStart(null);
                setHoveredIdx(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewLevel === "month" && selectedMonth === currentMonth
                  ? "bg-white text-rose-600 shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              📅 Tháng {currentMonth + 1}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewLevel("quarter");
                setSelectedWeekStart(null);
                setHoveredIdx(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewLevel === "quarter"
                  ? "bg-white text-rose-600 shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              🏛️ Theo Quý
            </button>
            <button
              type="button"
              onClick={() => {
                setViewLevel("year");
                setSelectedWeekStart(null);
                setHoveredIdx(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewLevel === "year"
                  ? "bg-white text-rose-600 shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              📊 Cả năm
            </button>
          </div>

          {/* 1. BỘ CHỌN NĂM (Chỉ các năm có dữ liệu) */}
          <div className="flex items-center rounded-xl bg-neutral-100/90 p-0.5 border border-neutral-200/80 shadow-2xs">
            <button
              onClick={() => {
                const curIdx = availableYears.indexOf(selectedYear);
                if (curIdx < availableYears.length - 1) {
                  const newYear = availableYears[curIdx + 1];
                  setSelectedYear(newYear);
                  setViewLevel("month");
                  setHoveredIdx(null);
                }
              }}
              disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
              className="p-1 rounded-lg hover:bg-white text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Năm trước"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>

            <CustomSelect
              value={String(selectedYear)}
              onChange={(val) => {
                const y = Number(val);
                setSelectedYear(y);
                setHoveredIdx(null);
              }}
              options={availableYears.map((y) => ({
                value: String(y),
                label: `Năm ${y}`,
              }))}
              className="w-[95px]"
              buttonClassName="h-7 border-transparent hover:border-neutral-200 bg-transparent text-xs font-black text-neutral-900 px-2"
              ariaLabel="Chọn năm"
            />

            <button
              onClick={() => {
                const curIdx = availableYears.indexOf(selectedYear);
                if (curIdx > 0) {
                  const newYear = availableYears[curIdx - 1];
                  setSelectedYear(newYear);
                  setViewLevel("month");
                  setHoveredIdx(null);
                }
              }}
              disabled={availableYears.indexOf(selectedYear) <= 0}
              className="p-1 rounded-lg hover:bg-white text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Năm sau"
            >
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* 2. BỘ CHỌN KỲ CHI TIẾT (Tháng / Quý / Cả năm) */}
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
                title="Tháng trước"
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
            )}

            <CustomSelect
              value={
                viewLevel === "year"
                  ? "year"
                  : viewLevel === "quarter"
                  ? "quarter"
                  : `month_${selectedMonth}`
              }
              onChange={(val) => {
                if (val === "year") {
                  setViewLevel("year");
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                } else if (val === "quarter") {
                  setViewLevel("quarter");
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                } else if (val.startsWith("month_")) {
                  const mIdx = Number(val.replace("month_", ""));
                  setSelectedMonth(mIdx);
                  setViewLevel("month");
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                }
              }}
              options={[
                {
                  value: `month_${currentMonth}`,
                  label: `📅 ${MONTH_NAMES[currentMonth]}/${selectedYear} (Theo tuần) • Mặc định`,
                },
                { value: "quarter", label: `🏛️ Theo 4 Quý năm ${selectedYear}` },
                { value: "year", label: `📊 Cả năm ${selectedYear} (12 tháng)` },
                ...availableMonthsInYear
                  .filter((m) => m.month !== currentMonth)
                  .map((m) => ({
                    value: `month_${m.month}`,
                    label: `📅 ${m.fullName} (${m.count} đơn)`,
                  })),
              ]}
              className="w-[185px]"
              buttonClassName="h-7 border-transparent hover:border-rose-200 bg-transparent text-xs font-black text-rose-900 px-2"
              ariaLabel="Chọn kỳ hiển thị"
            />

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
                title="Tháng sau"
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

      {/* Interactive SVG Smooth Spline 3-Line Graph */}
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
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowRose" x="-10%" y="-20%" width="120%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#F43F5E" floodOpacity="0.25" />
            </filter>
            <filter id="glowEmerald" x="-10%" y="-20%" width="120%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10B981" floodOpacity="0.2" />
            </filter>
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

          {/* Area Fills với Smooth Curves */}
          {commPoints.length > 0 && <path d={makeSmoothArea(commPoints)} fill="url(#roseGradient)" />}
          {rewPoints.length > 0 && <path d={makeSmoothArea(rewPoints)} fill="url(#amberGradient)" />}
          {profPoints.length > 0 && <path d={makeSmoothArea(profPoints)} fill="url(#emeraldGradient)" />}

          {/* Smooth Curved Spline Lines (Đường cong mềm mại mượt mà) */}
          {commPoints.length > 1 && (
            <path
              d={makeSmoothPath(commPoints)}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowRose)"
            />
          )}
          {rewPoints.length > 1 && (
            <path
              d={makeSmoothPath(rewPoints)}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {profPoints.length > 1 && (
            <path
              d={makeSmoothPath(profPoints)}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowEmerald)"
            />
          )}

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
                r={hoveredIdx === i ? 6.5 : 4.5}
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
            const tooltipBoxX = Math.max(10, Math.min(cx - 90, 410));
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
                          width="180"
                          height="66"
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
                          {m.label.toUpperCase()}{m.subLabel ? ` (${m.subLabel})` : ""} • {m.count} ĐƠN
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
                          width="180"
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
                          {m.label.toUpperCase()}{m.subLabel ? ` (${m.subLabel})` : ""} (0 ĐƠN)
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
