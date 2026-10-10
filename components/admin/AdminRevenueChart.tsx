"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ZoomIn, Calendar, Layers, BarChart3 } from "lucide-react";
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

  // Danh sách các NĂM hợp lệ (năm hiện tại, các năm gần kề và các năm có dữ liệu thực tế)
  const availableYears = useMemo(() => {
    const baseYears = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    const years = new Set<number>(baseYears);
    for (const o of parsedOrders) {
      years.add(o._date.getFullYear());
    }
    // Sắp xếp giảm dần: ví dụ [2027, 2026, 2025, 2024, 2023]
    return Array.from(years).sort((a, b) => b - a);
  }, [parsedOrders, currentYear]);

  // MẶC ĐỊNH: Hiển thị tháng hiện tại (viewLevel = "month" để xem 4-5 tuần)
  const [viewLevel, setViewLevel] = useState<ViewLevel>("month");
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (orderData.length === 0) return currentYear;
    const years = Array.from(new Set(orderData.map((o) => new Date(o.date).getFullYear()))).sort((a, b) => b - a);
    return years.includes(currentYear) ? currentYear : (years[0] || currentYear);
  });

  // Danh sách đầy đủ 12 THÁNG trong selectedYear kèm thống kê đơn hàng
  const allMonthsInYear = useMemo(() => {
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
    return Array.from({ length: 12 }, (_, m) => {
      const stats = map.get(m) ?? { count: 0, commission: 0, reward: 0, profit: 0 };
      return {
        month: m,
        name: MONTH_NAMES[m],
        fullName: `Tháng ${m + 1}`,
        ...stats,
      };
    });
  }, [parsedOrders, selectedYear]);

  // MẶC ĐỊNH: Tháng hiện tại
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return currentMonth;
  });

  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null); // null = cả 4 quý, 0..3 = Quý 1..Quý 4
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null); // ISO date of Monday
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Tổng hợp dữ liệu theo 4 Quý (phục vụ chọn Quý và chọn Tháng của Quý)
  const quartersSummary = useMemo(() => {
    return [0, 1, 2, 3].map((q) => {
      const startM = q * 3;
      let count = 0;
      let commission = 0;
      let reward = 0;
      let profit = 0;
      for (const o of parsedOrders) {
        if (o._date.getFullYear() !== selectedYear) continue;
        const m = o._date.getMonth();
        if (m >= startM && m <= startM + 2) {
          count++;
          commission += o.commission;
          reward += o.reward;
          profit += o.profit;
        }
      }
      return {
        quarter: q,
        label: `Quý ${q + 1}`,
        monthsLabel: `T${startM + 1}–T${startM + 3}`,
        count,
        commission,
        reward,
        profit,
        months: [startM, startM + 1, startM + 2].map((m) => {
          const mData = allMonthsInYear[m];
          return {
            month: m,
            name: MONTH_NAMES[m],
            fullName: `Tháng ${m + 1}`,
            count: mData ? mData.count : 0,
            commission: mData ? mData.commission : 0,
            reward: mData ? mData.reward : 0,
            profit: mData ? mData.profit : 0,
          };
        }),
      };
    });
  }, [parsedOrders, selectedYear, allMonthsInYear]);

  // Tổng hợp quý đang chọn
  const quarterTotals = useMemo(() => {
    if (selectedQuarter !== null && quartersSummary[selectedQuarter]) {
      return quartersSummary[selectedQuarter];
    }
    return { commission: 0, reward: 0, profit: 0, count: 0 };
  }, [selectedQuarter, quartersSummary]);

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

    // 2. Chế độ xem theo Quý
    if (viewLevel === "quarter") {
      // 2A. Nếu đã chọn 1 Quý cụ thể -> Hiển thị 3 tháng của Quý đó!
      if (selectedQuarter !== null) {
        const startMonth = selectedQuarter * 3;
        const qMonths: ChartItem[] = [
          { label: MONTH_NAMES[startMonth], subLabel: `Tháng ${startMonth + 1}`, commission: 0, reward: 0, profit: 0, count: 0 },
          { label: MONTH_NAMES[startMonth + 1], subLabel: `Tháng ${startMonth + 2}`, commission: 0, reward: 0, profit: 0, count: 0 },
          { label: MONTH_NAMES[startMonth + 2], subLabel: `Tháng ${startMonth + 3}`, commission: 0, reward: 0, profit: 0, count: 0 },
        ];
        for (const o of parsedOrders) {
          if (o._date.getFullYear() !== selectedYear) continue;
          const m = o._date.getMonth();
          if (m >= startMonth && m <= startMonth + 2) {
            const idx = m - startMonth;
            qMonths[idx].commission += o.commission;
            qMonths[idx].reward += o.reward;
            qMonths[idx].profit += o.profit;
            qMonths[idx].count += 1;
          }
        }
        return qMonths;
      }

      // 2B. Nếu chưa chọn Quý cụ thể -> Hiển thị cả 4 Quý (Q1 - Q4)
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
  }, [viewLevel, selectedYear, selectedMonth, selectedQuarter, selectedWeekStart, parsedOrders, currentYear, currentMonth]);

  // ═══ Growth calculation ═══
  const growthInfo = useMemo(() => {
    const itemsWithData = chartItems.filter((m) => m.count > 0);
    if (itemsWithData.length < 2) return { pct: 0, prevLabel: "", currentLabel: "" };
    const last = itemsWithData[itemsWithData.length - 1];
    const prev = itemsWithData[itemsWithData.length - 2];
    const pct = prev.commission > 0
      ? Math.round(((last.commission - prev.commission) / prev.commission) * 100)
      : 0;
    return { pct, prevLabel: prev.label, currentLabel: last.label };
  }, [chartItems]);

  // ═══ Active / Hovered item ═══
  const activeIdx = hoveredIdx !== null ? hoveredIdx : chartItems.length - 1;
  const activeItem = chartItems[activeIdx] ?? chartItems[chartItems.length - 1];
  const maxVal = Math.max(...chartItems.map((m) => m.commission), 1);

  // ═══ SVG Layout (Tối ưu riêng cho Mobile & Desktop) ═══
  const viewBoxWidth = isMobile ? (viewLevel === "year" ? 520 : 380) : 600;
  const viewBoxHeight = isMobile ? 260 : 230;

  const PLOT = useMemo(() => {
    if (isMobile) {
      const rightX = (viewLevel === "year" ? 520 : 380) - 18;
      return { left: 38, right: rightX, top: 30, bottom: 195 };
    }
    return { left: 48, right: 582, top: 32, bottom: 175 };
  }, [isMobile, viewLevel]);

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
      if (!targetItem) return;
      setSelectedMonth(idx);
      setViewLevel("month");
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "quarter") {
      if (selectedQuarter === null) {
        // Chạm vào 1 trong 4 quý -> Xem 3 tháng của Quý đó!
        setSelectedQuarter(idx);
        setHoveredIdx(null);
      } else {
        // Đang xem 3 tháng của quý -> Chạm vào tháng để xem chi tiết tuần!
        const targetMonth = selectedQuarter * 3 + idx;
        setSelectedMonth(targetMonth);
        setViewLevel("month");
        setSelectedWeekStart(null);
        setHoveredIdx(null);
      }
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
      if (selectedQuarter !== null) {
        setViewLevel("quarter"); // quay lại xem 3 tháng của quý
      } else {
        setViewLevel("quarter");
      }
      setSelectedWeekStart(null);
      setHoveredIdx(null);
    } else if (viewLevel === "quarter") {
      if (selectedQuarter !== null) {
        setSelectedQuarter(null); // từ 3 tháng quay lại 4 quý
      } else {
        setViewLevel("year"); // từ 4 quý quay lại cả năm
      }
      setHoveredIdx(null);
    }
  };

  // ═══ Quick Stepper Handlers ═══
  const handlePrevMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1);
    } else {
      const curYearIdx = availableYears.indexOf(selectedYear);
      if (curYearIdx < availableYears.length - 1) {
        setSelectedYear(availableYears[curYearIdx + 1]);
        setSelectedMonth(11);
      }
    }
    setSelectedWeekStart(null);
    setHoveredIdx(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1);
    } else {
      const curYearIdx = availableYears.indexOf(selectedYear);
      if (curYearIdx > 0) {
        setSelectedYear(availableYears[curYearIdx - 1]);
        setSelectedMonth(0);
      }
    }
    setSelectedWeekStart(null);
    setHoveredIdx(null);
  };

  const isAtMinMonth =
    selectedMonth === 0 && availableYears.indexOf(selectedYear) >= availableYears.length - 1;
  const isAtMaxMonth =
    selectedMonth === 11 && availableYears.indexOf(selectedYear) <= 0;

  const handlePrevYear = () => {
    const curIdx = availableYears.indexOf(selectedYear);
    if (curIdx < availableYears.length - 1) {
      setSelectedYear(availableYears[curIdx + 1]);
      setHoveredIdx(null);
    }
  };

  const handleNextYear = () => {
    const curIdx = availableYears.indexOf(selectedYear);
    if (curIdx > 0) {
      setSelectedYear(availableYears[curIdx - 1]);
      setHoveredIdx(null);
    }
  };

  const isAtMinYear = availableYears.indexOf(selectedYear) >= availableYears.length - 1;
  const isAtMaxYear = availableYears.indexOf(selectedYear) <= 0;

  // ═══ Breadcrumb ═══
  const breadcrumb = useMemo(() => {
    const parts: { label: string; onClick?: () => void }[] = [];
    parts.push({
      label: `Năm ${selectedYear}`,
      onClick: viewLevel !== "year" ? () => { setViewLevel("year"); setSelectedQuarter(null); setHoveredIdx(null); } : undefined,
    });
    if (viewLevel === "quarter") {
      if (selectedQuarter !== null) {
        parts.push({
          label: "4 Quý",
          onClick: () => { setSelectedQuarter(null); setHoveredIdx(null); },
        });
        parts.push({
          label: `Quý ${selectedQuarter + 1} (T${selectedQuarter * 3 + 1}–T${selectedQuarter * 3 + 3})`,
        });
      } else {
        parts.push({
          label: "Theo 4 Quý",
        });
      }
    }
    if (viewLevel === "month" || viewLevel === "week") {
      if (selectedQuarter !== null) {
        parts.push({
          label: `Quý ${selectedQuarter + 1}`,
          onClick: () => { setViewLevel("quarter"); setHoveredIdx(null); },
        });
      }
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
  }, [viewLevel, selectedYear, selectedMonth, selectedWeekStart, selectedQuarter]);

  // ═══ Summary Cards Calculations ═══
  const summaryDisplay = useMemo(() => {
    if (hoveredIdx !== null && chartItems[hoveredIdx]) {
      const it = chartItems[hoveredIdx];
      return {
        title: `${it.label}${it.subLabel ? ` (${it.subLabel})` : ""} (${it.count} đơn) 🔍`,
        commission: it.commission,
        reward: it.reward,
        profit: it.profit,
        count: it.count,
      };
    }

    if (viewLevel === "year") {
      return {
        title: `Cả năm ${selectedYear} (${yearTotals.count} đơn)`,
        commission: yearTotals.commission,
        reward: yearTotals.reward,
        profit: yearTotals.profit,
        count: yearTotals.count,
      };
    }

    if (viewLevel === "quarter") {
      if (selectedQuarter !== null) {
        return {
          title: `Quý ${selectedQuarter + 1} (${quarterTotals.count} đơn)`,
          commission: quarterTotals.commission,
          reward: quarterTotals.reward,
          profit: quarterTotals.profit,
          count: quarterTotals.count,
        };
      }
      return {
        title: `4 Quý năm ${selectedYear} (${yearTotals.count} đơn)`,
        commission: yearTotals.commission,
        reward: yearTotals.reward,
        profit: yearTotals.profit,
        count: yearTotals.count,
      };
    }

    if (viewLevel === "month") {
      return {
        title: `${MONTH_NAMES[selectedMonth]}/${selectedYear} (${monthTotals.count} đơn)`,
        commission: monthTotals.commission,
        reward: monthTotals.reward,
        profit: monthTotals.profit,
        count: monthTotals.count,
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
      count: totalCount,
    };
  }, [hoveredIdx, chartItems, viewLevel, selectedYear, selectedMonth, selectedQuarter, yearTotals, quarterTotals, monthTotals]);

  // ═══ Subtitle text ═══
  const subtitleText = useMemo(() => {
    if (viewLevel === "year") return "Hiển thị 12 tháng • Chạm vào tháng để xem chi tiết theo tuần";
    if (viewLevel === "quarter") {
      if (selectedQuarter !== null) {
        return `Hiển thị 3 tháng của Quý ${selectedQuarter + 1} • Chạm vào tháng để xem chi tiết các tuần`;
      }
      return "Hiển thị 4 Quý • Chạm vào từng quý để xem 3 tháng của quý đó";
    }
    if (viewLevel === "month") return `Hiển thị các tuần của ${MONTH_NAMES[selectedMonth]}/${selectedYear} • Chạm vào tuần để xem theo ngày`;
    return "Chạm vào từng ngày để hiển thị số tiền đầy đủ";
  }, [viewLevel, selectedMonth, selectedYear, selectedQuarter]);

  const canGoBack = viewLevel === "week" || (viewLevel === "month" && selectedQuarter !== null) || (viewLevel === "quarter" && selectedQuarter !== null);
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
    <div className="rounded-3xl bg-white p-4 sm:p-7 shadow-sm border border-neutral-200/70 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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

      {/* ═══════════════════════════════════════════════════════════════════
          BỘ ĐIỀU KHIỂN MOBILE FIRST (ĐƠN GIẢN - GỌN GÀNG - DỄ THAO TÁC)
          1. Tabs chuyển chế độ (Theo Tháng / Theo Quý / Cả năm)
          2. Breadcrumb / Nút Quay lại
          3. Dòng chọn thời gian tối ưu cho từng chế độ (1 dòng duy nhất)
          4. 3 Thẻ thống kê tài chính rõ ràng, không cắt chữ
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-2.5 mb-4">
        {/* 1. Tabs chuyển chế độ */}
        <div className="grid grid-cols-3 w-full bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80">
          <button
            type="button"
            onClick={() => {
              setViewLevel("month");
              setSelectedWeekStart(null);
              setHoveredIdx(null);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
              viewLevel === "month" || viewLevel === "week"
                ? "bg-white text-rose-600 shadow-xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Calendar size={14} strokeWidth={2.4} />
            <span>Theo Tháng</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewLevel("quarter");
              setSelectedWeekStart(null);
              setHoveredIdx(null);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
              viewLevel === "quarter"
                ? "bg-white text-rose-600 shadow-xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Layers size={14} strokeWidth={2.4} />
            <span>Theo Quý</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewLevel("year");
              setSelectedQuarter(null);
              setSelectedWeekStart(null);
              setHoveredIdx(null);
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
              viewLevel === "year"
                ? "bg-white text-rose-600 shadow-xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <BarChart3 size={14} strokeWidth={2.4} />
            <span>Cả năm</span>
          </button>
        </div>

        {/* 2. Nút Quay lại khi đang xem chi tiết tuần */}
        {canGoBack && (
          <div className="flex items-center justify-between gap-2 bg-rose-50/80 border border-rose-200/80 px-2.5 py-1.5 rounded-xl">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-extrabold text-xs py-1 px-2.5 rounded-lg bg-white shadow-2xs border border-rose-200/60 active:scale-95 transition-all shrink-0"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
              <span>Quay lại</span>
            </button>
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-600 overflow-x-auto scrollbar-none">
              {breadcrumb.map((part, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-neutral-300">›</span>}
                  {part.onClick ? (
                    <button
                      onClick={part.onClick}
                      className="text-rose-600 hover:text-rose-700 hover:underline font-bold"
                    >
                      {part.label}
                    </button>
                  ) : (
                    <span className="text-neutral-900 font-black bg-white px-2 py-0.5 rounded-md shadow-2xs">
                      {part.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3. DÒNG THỜI GIAN THEO CHẾ ĐỘ: 1 DÒNG DUY NHẤT, GỌN GÀNG, KHÔNG RỐI */}
        {(viewLevel === "month" || viewLevel === "week") && (
          <div className="flex items-center justify-between gap-1.5 bg-neutral-50 p-1 rounded-2xl border border-neutral-200 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isAtMinMonth}
              className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
              title="Tháng trước"
              aria-label="Tháng trước"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
              <CustomSelect
                value={String(selectedMonth)}
                onChange={(val) => {
                  setSelectedMonth(Number(val));
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                }}
                options={allMonthsInYear.map((m) => ({
                  value: String(m.month),
                  label: `Tháng ${m.month + 1}`,
                  count: m.count > 0 ? `${m.count} đơn` : undefined,
                }))}
                className="flex-1 max-w-[135px] min-w-[105px]"
                buttonClassName="h-9 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                ariaLabel="Chọn tháng"
              />

              <CustomSelect
                value={String(selectedYear)}
                onChange={(val) => {
                  setSelectedYear(Number(val));
                  setSelectedWeekStart(null);
                  setHoveredIdx(null);
                }}
                options={availableYears.map((y) => ({
                  value: String(y),
                  label: `Năm ${y}`,
                }))}
                className="flex-1 max-w-[135px] min-w-[115px]"
                buttonClassName="h-9 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                ariaLabel="Chọn năm"
              />
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isAtMaxMonth}
              className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
              title="Tháng sau"
              aria-label="Tháng sau"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {viewLevel === "quarter" && (
          <div className="flex flex-col gap-2">
            {/* Dòng chọn Năm */}
            <div className="flex items-center justify-between bg-neutral-50 p-1 rounded-2xl border border-neutral-200 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevYear}
                disabled={isAtMinYear}
                className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
                title="Năm trước"
                aria-label="Năm trước"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1.5 px-2 min-w-0">
                <CustomSelect
                  value={String(selectedYear)}
                  onChange={(val) => {
                    setSelectedYear(Number(val));
                    setHoveredIdx(null);
                  }}
                  options={availableYears.map((y) => ({
                    value: String(y),
                    label: `Năm ${y}`,
                  }))}
                  className="max-w-[135px] w-full min-w-[115px]"
                  buttonClassName="h-9 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                  ariaLabel="Chọn năm"
                />
                {yearTotals.count > 0 && (
                  <span className="text-[11px] font-bold text-neutral-500 shrink-0">
                    ({yearTotals.count} đơn)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextYear}
                disabled={isAtMaxYear}
                className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
                title="Năm sau"
                aria-label="Năm sau"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* 4 Quý chia đều */}
            <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80">
              {quartersSummary.map((q) => {
                const isActive = selectedQuarter === q.quarter;
                return (
                  <button
                    key={q.quarter}
                    type="button"
                    onClick={() => {
                      if (selectedQuarter === q.quarter) {
                        setSelectedQuarter(null);
                      } else {
                        setSelectedQuarter(q.quarter);
                      }
                      setHoveredIdx(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all ${
                      isActive
                        ? "bg-rose-600 text-white shadow-xs font-black"
                        : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/60 shadow-2xs"
                    }`}
                  >
                    <div>{q.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isActive ? "text-rose-100" : "text-neutral-400 font-normal"}`}>
                      {q.count > 0 ? `${q.count} đơn` : "0 đơn"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* KHI ĐÃ CHỌN 1 QUÝ: Hiển thị ngay 3 tháng của Quý đó */}
            {selectedQuarter !== null && (
              <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-rose-50/70 border border-rose-200/70 shadow-2xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-rose-900">
                  <span>Các tháng của {quartersSummary[selectedQuarter].label}:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuarter(null);
                      setHoveredIdx(null);
                    }}
                    className="text-rose-600 text-[11px] font-extrabold hover:underline"
                  >
                    Xem cả 4 quý ›
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {quartersSummary[selectedQuarter].months.map((m) => {
                    return (
                      <button
                        key={m.month}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(m.month);
                          setViewLevel("month");
                          setSelectedWeekStart(null);
                          setHoveredIdx(null);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white hover:bg-rose-100/60 text-rose-950 border border-rose-200/60 shadow-2xs active:scale-95 transition-all text-center"
                      >
                        <span className="text-xs font-black">{m.fullName}</span>
                        <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
                          {m.count > 0 ? `${m.count} đơn` : "0 đơn"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {viewLevel === "year" && (
          <div className="flex items-center justify-between bg-neutral-50 p-1 rounded-2xl border border-neutral-200 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevYear}
              disabled={isAtMinYear}
              className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
              title="Năm trước"
              aria-label="Năm trước"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex-1 flex items-center justify-center gap-1.5 px-2 min-w-0">
              <CustomSelect
                value={String(selectedYear)}
                onChange={(val) => {
                  setSelectedYear(Number(val));
                  setHoveredIdx(null);
                }}
                options={availableYears.map((y) => ({
                  value: String(y),
                  label: `Năm ${y}`,
                }))}
                className="max-w-[135px] w-full min-w-[115px]"
                buttonClassName="h-9 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                ariaLabel="Chọn năm"
              />
              {yearTotals.count > 0 && (
                <span className="text-[11px] font-bold text-neutral-500 shrink-0">
                  ({yearTotals.count} đơn)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextYear}
              disabled={isAtMaxYear}
              className="w-10 h-10 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95"
              title="Năm sau"
              aria-label="Năm sau"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3 THẺ KPI TÀI CHÍNH: ĐƠN GIẢN, GỌN GÀNG, KHÔNG CẮT CHỮ
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {/* Card 1: HOA HỒNG */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="truncate">Hoa hồng</span>
          </div>
          <div className="text-sm sm:text-base font-black text-rose-950 my-1 truncate tabular-nums">
            {formatCurrency(summaryDisplay.commission)}
          </div>
          <div className="text-[10px] font-semibold text-rose-600 truncate">
            {summaryDisplay.count > 0 ? `${summaryDisplay.count} đơn hàng` : "0 đơn"}
          </div>
        </div>

        {/* Card 2: HOÀN CHO KHÁCH */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Hoàn khách</span>
          </div>
          <div className="text-sm sm:text-base font-black text-amber-950 my-1 truncate tabular-nums">
            {formatCurrency(summaryDisplay.reward)}
          </div>
          <div className="text-[10px] font-semibold text-amber-700 truncate">
            {summaryDisplay.commission > 0
              ? `${Math.round((summaryDisplay.reward / summaryDisplay.commission) * 100)}% hoàn`
              : "0% hoàn"}
          </div>
        </div>

        {/* Card 3: LỢI NHUẬN RÒNG */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Lợi nhuận</span>
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-950 my-1 truncate tabular-nums">
            {formatCurrency(summaryDisplay.profit)}
          </div>
          <div className="text-[10px] font-semibold text-emerald-700 truncate">
            {summaryDisplay.commission > 0
              ? `${Math.round((summaryDisplay.profit / summaryDisplay.commission) * 100)}% lãi`
              : "0% lãi"}
          </div>
        </div>
      </div>

      {/* Interactive SVG Smooth Spline 3-Line Graph (To rõ, trực quan, chiều cao vượt trội trên mobile) */}
      <div className={`relative w-full ${isMobile && viewLevel === "year" ? "overflow-x-auto pb-2 scrollbar-none" : ""}`}>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className={`select-none overflow-visible ${
            isMobile && viewLevel === "year" ? "min-w-[500px] h-[260px]" : "w-full h-auto"
          }`}
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
              {hoveredIdx !== i && p.val > 0 && (
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
              {hoveredIdx !== i && p.val > 0 && Math.abs(p.y - commPoints[i].y) > 26 && (
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
            const tooltipBoxX = Math.max(10, Math.min(cx - 85, viewBoxWidth - 185));
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
