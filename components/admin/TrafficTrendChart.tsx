"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Clock,
  CalendarRange,
  Calendar,
  Layers,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getVietnamDateParts } from "@/lib/format";
import { CustomSelect } from "@/components/ui/CustomSelect";

export type ActivityLogStatItem = {
  path: string;
  userRole: string; // 'customer' | 'guest'
  visitorId: string;
  deviceType: string | null;
  browser: string | null;
  createdAt: string; // ISO string
};

export type TrafficViewLevel = "day" | "week" | "month" | "quarter" | "year";

interface HourlyStat {
  hour: number;
  total: number;
  members: number;
  guests: number;
}

interface TrafficTrendChartProps {
  activityLogs?: ActivityLogStatItem[];
  fallbackHourlyDistribution: HourlyStat[];
  initialPeakHour: number;
  initialDateKey?: string;
  onFilteredLogsChange?: (filteredLogs: ActivityLogStatItem[]) => void;
}

const WEEKDAY_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function addDaysToDateKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + delta));
  const ny = date.getUTCFullYear();
  const nm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nd = String(date.getUTCDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

function formatDateKeyText(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAY_NAMES[weekday]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function TrafficTrendChart({
  activityLogs = [],
  fallbackHourlyDistribution,
  initialPeakHour,
  initialDateKey,
  onFilteredLogsChange,
}: TrafficTrendChartProps) {
  // Pre-parse activity logs with Vietnam Timezone (GMT+7)
  const logsWithParts = useMemo(() => {
    return activityLogs.map((log) => ({
      ...log,
      parts: getVietnamDateParts(log.createdAt),
    }));
  }, [activityLogs]);

  // Today in Vietnam time
  const todayParts = useMemo(() => getVietnamDateParts(new Date()), []);
  const todayDateKey = todayParts.dateKey;

  // Available distinct dates with activity logs (most recent first)
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const l of logsWithParts) {
      set.add(l.parts.dateKey);
    }
    return Array.from(set).sort().reverse();
  }, [logsWithParts]);

  // Most recent date with data (hoặc hôm nay)
  const latestDateKey = useMemo(() => {
    if (initialDateKey) return initialDateKey;
    if (availableDates.length > 0) return availableDates[0];
    return todayDateKey;
  }, [initialDateKey, availableDates, todayDateKey]);

  // Available years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    set.add(todayParts.year);
    for (const l of logsWithParts) {
      set.add(l.parts.year);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [logsWithParts, todayParts.year]);

  // ── STATE ĐIỀU KHIỂN BỘ LỌC THỜI GIAN ──
  const [viewLevel, setViewLevel] = useState<TrafficViewLevel>("day");
  const [selectedDateKey, setSelectedDateKey] = useState<string>(latestDateKey);
  const [selectedWeekDateKey, setSelectedWeekDateKey] = useState<string>(latestDateKey);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const p = getVietnamDateParts(latestDateKey);
    return p.month;
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const p = getVietnamDateParts(latestDateKey);
    return p.year;
  });
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(() => {
    const p = getVietnamDateParts(latestDateKey);
    return Math.ceil(p.month / 3);
  });

  // Breadcrumb drilldown stack: lưu lại lịch sử drill-down để quay lại
  const [drillStack, setDrillStack] = useState<
    { level: TrafficViewLevel; label: string }[]
  >([]);

  // Hovered / selected index in chart
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Sync latestDateKey if initial changes
  useEffect(() => {
    if (initialDateKey && initialDateKey !== selectedDateKey) {
      setSelectedDateKey(initialDateKey);
      setSelectedWeekDateKey(initialDateKey);
      const p = getVietnamDateParts(initialDateKey);
      setSelectedMonth(p.month);
      setSelectedYear(p.year);
      setSelectedQuarter(Math.ceil(p.month / 3));
    }
  }, [initialDateKey]);

  // ── TÍNH TOÁN DỮ LIỆU ĐƯỢC LỌC THEO KỲ ĐANG XEM ──
  const { currentPeriodLogs, chartItems, titleInfo, peakItemIdx } = useMemo(() => {
    let filtered: typeof logsWithParts = [];
    let items: Array<{
      id: string;
      index: number;
      label: string;
      tickLabel: string;
      fullTitle: string;
      subTitle: string;
      total: number;
      members: number;
      guests: number;
      canDrill?: boolean;
      onDrill?: () => void;
    }> = [];

    let title = "Biểu Đồ Xu Hướng Truy Cập 24 Giờ";
    let subtitle = "Đường lưu lượng 24 khung giờ theo thời gian thực để tối ưu khung giờ push deal & thông báo.";
    let peakBadgeLabel = "";

    // 1. THEO NGÀY (24H)
    if (viewLevel === "day") {
      filtered = logsWithParts.filter((l) => l.parts.dateKey === selectedDateKey);
      const dayDateText = formatDateKeyText(selectedDateKey);

      title = `Biểu Đồ Xu Hướng Truy Cập 24 Giờ — ${selectedDateKey === todayDateKey ? "Hôm nay" : dayDateText}`;
      subtitle = `Chi tiết lưu lượng 24 khung giờ của ngày ${selectedDateKey} (Múi giờ Việt Nam GMT+7).`;

      // Nếu không có log nào trong hệ thống và đang xem ngày khởi tạo, dùng fallbackHourlyDistribution
      const useFallback = logsWithParts.length === 0;

      items = Array.from({ length: 24 }, (_, h) => {
        if (useFallback && fallbackHourlyDistribution[h]) {
          const fb = fallbackHourlyDistribution[h];
          return {
            id: `h-${h}`,
            index: h,
            label: `${h}h`,
            tickLabel: [0, 3, 6, 9, 12, 15, 18, 21, 23].includes(h) ? `${h}h` : "",
            fullTitle: `Khung giờ ${h}:00 – ${h + 1}:00`,
            subTitle: dayDateText,
            total: fb.total,
            members: fb.members,
            guests: fb.guests,
          };
        }

        const hLogs = filtered.filter((l) => l.parts.hour === h);
        const total = hLogs.length;
        const members = hLogs.filter((l) => l.userRole !== "guest").length;
        const guests = hLogs.filter((l) => l.userRole === "guest").length;

        return {
          id: `h-${h}`,
          index: h,
          label: `${h}h`,
          tickLabel: [0, 3, 6, 9, 12, 15, 18, 21, 23].includes(h) ? `${h}h` : "",
          fullTitle: `Khung giờ ${h}:00 – ${h + 1}:00`,
          subTitle: dayDateText,
          total,
          members,
          guests,
        };
      });

      // Tìm khung giờ cao điểm
      let maxT = -1;
      let pIdx = initialPeakHour;
      items.forEach((it, idx) => {
        if (it.total > maxT) {
          maxT = it.total;
          pIdx = idx;
        }
      });
      peakBadgeLabel = `Khung giờ vàng: ${pIdx}:00 - ${pIdx + 1}:00`;

      return {
        currentPeriodLogs: filtered,
        chartItems: items,
        titleInfo: { title, subtitle, peakBadgeLabel },
        peakItemIdx: pIdx,
      };
    }

    // 2. THEO TUẦN (7 NGÀY T2 -> CN)
    if (viewLevel === "week") {
      const parts = getVietnamDateParts(selectedWeekDateKey);
      const diff = parts.dayOfWeek === 0 ? -6 : 1 - parts.dayOfWeek;
      const weekDays: { dateKey: string; parts: ReturnType<typeof getVietnamDateParts>; weekdayIdx: number }[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + diff + i));
        const p = getVietnamDateParts(d);
        // Thứ Hai là index 0, Chủ Nhật là index 6
        weekDays.push({ dateKey: p.dateKey, parts: p, weekdayIdx: (i + 1) % 7 });
      }

      const weekKeySet = new Set(weekDays.map((w) => w.dateKey));
      filtered = logsWithParts.filter((l) => weekKeySet.has(l.parts.dateKey));

      const firstD = weekDays[0].parts;
      const lastD = weekDays[6].parts;
      const weekLabel = `Tuần ${firstD.day}/${firstD.month} – ${lastD.day}/${lastD.month}/${lastD.year}`;

      title = `Biểu Đồ Xu Hướng Truy Cập Theo Tuần — ${weekLabel}`;
      subtitle = "Đường lưu lượng 7 ngày trong tuần. Chạm vào ngày để xem chi tiết 24 giờ.";

      const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      const weekdayFull = [
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
        "Chủ Nhật",
      ];

      items = weekDays.map((w, idx) => {
        const dayLogs = filtered.filter((l) => l.parts.dateKey === w.dateKey);
        const total = dayLogs.length;
        const members = dayLogs.filter((l) => l.userRole !== "guest").length;
        const guests = dayLogs.filter((l) => l.userRole === "guest").length;

        return {
          id: w.dateKey,
          index: idx,
          label: weekdayLabels[idx],
          tickLabel: `${weekdayLabels[idx]} (${w.parts.day}/${w.parts.month})`,
          fullTitle: `${weekdayFull[idx]}, ngày ${w.parts.day}/${w.parts.month}/${w.parts.year}`,
          subTitle: weekLabel,
          total,
          members,
          guests,
          canDrill: true,
          onDrill: () => {
            setSelectedDateKey(w.dateKey);
            setViewLevel("day");
            setDrillStack((prev) => [
              ...prev,
              { level: "week", label: weekLabel },
            ]);
            setHoveredIdx(null);
          },
        };
      });

      let maxT = -1;
      let pIdx = 0;
      items.forEach((it, idx) => {
        if (it.total > maxT) {
          maxT = it.total;
          pIdx = idx;
        }
      });
      peakBadgeLabel = `Ngày cao điểm: ${items[pIdx].label} (${items[pIdx].total} lượt)`;

      return {
        currentPeriodLogs: filtered,
        chartItems: items,
        titleInfo: { title, subtitle, peakBadgeLabel },
        peakItemIdx: pIdx,
      };
    }

    // 3. THEO THÁNG (CÁC NGÀY TRONG THÁNG)
    if (viewLevel === "month") {
      filtered = logsWithParts.filter(
        (l) => l.parts.year === selectedYear && l.parts.month === selectedMonth
      );

      const daysInMonth = new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate();
      const monthLabel = `Tháng ${selectedMonth}/${selectedYear}`;

      title = `Biểu Đồ Xu Hướng Truy Cập — ${monthLabel}`;
      subtitle = `Mật độ truy cập ${daysInMonth} ngày trong tháng. Chạm vào ngày bất kỳ để xem chi tiết 24 giờ.`;

      items = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayLogs = filtered.filter((l) => l.parts.dateKey === dateKey);
        const total = dayLogs.length;
        const members = dayLogs.filter((l) => l.userRole !== "guest").length;
        const guests = dayLogs.filter((l) => l.userRole === "guest").length;

        const isTick =
          day === 1 ||
          day === 5 ||
          day === 10 ||
          day === 15 ||
          day === 20 ||
          day === 25 ||
          day === daysInMonth;

        return {
          id: dateKey,
          index: i,
          label: `${day}`,
          tickLabel: isTick ? `${day}` : "",
          fullTitle: `Ngày ${day}/${selectedMonth}/${selectedYear}`,
          subTitle: monthLabel,
          total,
          members,
          guests,
          canDrill: true,
          onDrill: () => {
            setSelectedDateKey(dateKey);
            setViewLevel("day");
            setDrillStack((prev) => [
              ...prev,
              { level: "month", label: monthLabel },
            ]);
            setHoveredIdx(null);
          },
        };
      });

      let maxT = -1;
      let pIdx = 0;
      items.forEach((it, idx) => {
        if (it.total > maxT) {
          maxT = it.total;
          pIdx = idx;
        }
      });
      peakBadgeLabel = `Ngày cao điểm: Ngày ${items[pIdx].label}/${selectedMonth} (${items[pIdx].total} lượt)`;

      return {
        currentPeriodLogs: filtered,
        chartItems: items,
        titleInfo: { title, subtitle, peakBadgeLabel },
        peakItemIdx: pIdx,
      };
    }

    // 4. THEO QUÝ (3 THÁNG CỦA QUÝ HOẶC CẢ 4 QUÝ)
    if (viewLevel === "quarter") {
      if (selectedQuarter !== null) {
        // Xem 3 tháng của Quý đã chọn (Q1: T1-T3, Q2: T4-T6, Q3: T7-T9, Q4: T10-T12)
        const startMonth = (selectedQuarter - 1) * 3 + 1;
        const quarterMonths = [startMonth, startMonth + 1, startMonth + 2];

        filtered = logsWithParts.filter(
          (l) =>
            l.parts.year === selectedYear &&
            quarterMonths.includes(l.parts.month)
        );

        const quarterLabel = `Quý ${selectedQuarter} (T${startMonth}–T${startMonth + 2}) năm ${selectedYear}`;
        title = `Biểu Đồ Xu Hướng Truy Cập — ${quarterLabel}`;
        subtitle = "Hiển thị 3 tháng của Quý. Chạm vào tháng để xem chi tiết các ngày.";

        items = quarterMonths.map((m, idx) => {
          const mLogs = filtered.filter((l) => l.parts.month === m);
          const total = mLogs.length;
          const members = mLogs.filter((l) => l.userRole !== "guest").length;
          const guests = mLogs.filter((l) => l.userRole === "guest").length;

          return {
            id: `q-m-${m}`,
            index: idx,
            label: `Tháng ${m}`,
            tickLabel: `Tháng ${m}`,
            fullTitle: `Tháng ${m}/${selectedYear} (${quarterLabel})`,
            subTitle: quarterLabel,
            total,
            members,
            guests,
            canDrill: true,
            onDrill: () => {
              setSelectedMonth(m);
              setViewLevel("month");
              setDrillStack((prev) => [
                ...prev,
                { level: "quarter", label: `Quý ${selectedQuarter}/${selectedYear}` },
              ]);
              setHoveredIdx(null);
            },
          };
        });

        let maxT = -1;
        let pIdx = 0;
        items.forEach((it, idx) => {
          if (it.total > maxT) {
            maxT = it.total;
            pIdx = idx;
          }
        });
        peakBadgeLabel = `Cao điểm: ${items[pIdx].label} (${items[pIdx].total} lượt)`;

        return {
          currentPeriodLogs: filtered,
          chartItems: items,
          titleInfo: { title, subtitle, peakBadgeLabel },
          peakItemIdx: pIdx,
        };
      } else {
        // Xem cả 4 Quý (Q1..Q4)
        filtered = logsWithParts.filter((l) => l.parts.year === selectedYear);
        title = `Biểu Đồ Xu Hướng Truy Cập 4 Quý — Năm ${selectedYear}`;
        subtitle = "Hiển thị tổng quan 4 Quý. Chạm vào từng quý để xem 3 tháng của quý đó.";

        const quarters = [1, 2, 3, 4];
        items = quarters.map((q, idx) => {
          const qMonths = [(q - 1) * 3 + 1, (q - 1) * 3 + 2, (q - 1) * 3 + 3];
          const qLogs = filtered.filter((l) => qMonths.includes(l.parts.month));
          const total = qLogs.length;
          const members = qLogs.filter((l) => l.userRole !== "guest").length;
          const guests = qLogs.filter((l) => l.userRole === "guest").length;

          return {
            id: `q-${q}`,
            index: idx,
            label: `Quý ${q}`,
            tickLabel: `Quý ${q} (T${qMonths[0]}–T${qMonths[2]})`,
            fullTitle: `Quý ${q} năm ${selectedYear} (Tháng ${qMonths[0]} – Tháng ${qMonths[2]})`,
            subTitle: `Năm ${selectedYear}`,
            total,
            members,
            guests,
            canDrill: true,
            onDrill: () => {
              setSelectedQuarter(q);
              setHoveredIdx(null);
            },
          };
        });

        let maxT = -1;
        let pIdx = 0;
        items.forEach((it, idx) => {
          if (it.total > maxT) {
            maxT = it.total;
            pIdx = idx;
          }
        });
        peakBadgeLabel = `Cao điểm: ${items[pIdx].label} (${items[pIdx].total} lượt)`;

        return {
          currentPeriodLogs: filtered,
          chartItems: items,
          titleInfo: { title, subtitle, peakBadgeLabel },
          peakItemIdx: pIdx,
        };
      }
    }

    // 5. CẢ NĂM (12 THÁNG)
    filtered = logsWithParts.filter((l) => l.parts.year === selectedYear);
    title = `Biểu Đồ Xu Hướng Truy Cập Cả Năm — ${selectedYear}`;
    subtitle = "Hiển thị 12 tháng trong năm. Chạm vào tháng để xem chi tiết các ngày.";

    items = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const mLogs = filtered.filter((l) => l.parts.month === m);
      const total = mLogs.length;
      const members = mLogs.filter((l) => l.userRole !== "guest").length;
      const guests = mLogs.filter((l) => l.userRole === "guest").length;

      return {
        id: `y-m-${m}`,
        index: i,
        label: `T${m}`,
        tickLabel: `T${m}`,
        fullTitle: `Tháng ${m}/${selectedYear}`,
        subTitle: `Năm ${selectedYear}`,
        total,
        members,
        guests,
        canDrill: true,
        onDrill: () => {
          setSelectedMonth(m);
          setViewLevel("month");
          setDrillStack((prev) => [
            ...prev,
            { level: "year", label: `Năm ${selectedYear}` },
          ]);
          setHoveredIdx(null);
        },
      };
    });

    let maxT = -1;
    let pIdx = 0;
    items.forEach((it, idx) => {
      if (it.total > maxT) {
        maxT = it.total;
        pIdx = idx;
      }
    });
    peakBadgeLabel = `Tháng cao điểm: Tháng ${items[pIdx].label.replace("T", "")} (${items[pIdx].total} lượt)`;

    return {
      currentPeriodLogs: filtered,
      chartItems: items,
      titleInfo: { title, subtitle, peakBadgeLabel },
      peakItemIdx: pIdx,
    };
  }, [
    viewLevel,
    selectedDateKey,
    selectedWeekDateKey,
    selectedMonth,
    selectedYear,
    selectedQuarter,
    logsWithParts,
    todayDateKey,
    initialPeakHour,
    fallbackHourlyDistribution,
  ]);

  // Thông báo dữ liệu lọc ra ngoài cho component cha (để cập nhật Device & Browser)
  useEffect(() => {
    if (onFilteredLogsChange) {
      onFilteredLogsChange(currentPeriodLogs);
    }
  }, [currentPeriodLogs, onFilteredLogsChange]);

  // Max value for scaling
  const maxTotal = useMemo(() => {
    return Math.max(...chartItems.map((d) => d.total), 4);
  }, [chartItems]);

  // SVG Geometry
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 25;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Điểm tọa độ
  const points = useMemo(() => {
    const len = chartItems.length;
    if (len === 0) return [];
    return chartItems.map((d, i) => {
      const x = len === 1 ? paddingX + chartW / 2 : paddingX + (i / (len - 1)) * chartW;
      const y = paddingTop + chartH - (d.total / maxTotal) * chartH;
      return { x, y, ...d };
    });
  }, [chartItems, maxTotal, chartW, chartH, paddingX, paddingTop]);

  // Đường cong Bézier spline
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "" };
    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y}`,
        areaPath: `M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y} L ${p.x + 10} ${paddingTop + chartH} L ${p.x - 10} ${paddingTop + chartH} Z`,
      };
    }

    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      line += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }

    const baselineY = paddingTop + chartH;
    const area = `${line} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return { linePath: line, areaPath: area };
  }, [points, paddingTop, chartH]);

  // Điểm đang được chọn xem chi tiết
  const activePoint =
    hoveredIdx !== null && points[hoveredIdx]
      ? points[hoveredIdx]
      : points[peakItemIdx] || points[0];

  // ── CÁC HÀM ĐIỀU HƯỚNG THỜI GIAN ──
  const handlePrev = () => {
    if (viewLevel === "day") {
      setSelectedDateKey((prev) => addDaysToDateKey(prev, -1));
    } else if (viewLevel === "week") {
      setSelectedWeekDateKey((prev) => addDaysToDateKey(prev, -7));
    } else if (viewLevel === "month") {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear((y) => y - 1);
      } else {
        setSelectedMonth((m) => m - 1);
      }
    } else if (viewLevel === "quarter") {
      if (selectedQuarter === null || selectedQuarter === 1) {
        setSelectedQuarter(4);
        setSelectedYear((y) => y - 1);
      } else {
        setSelectedQuarter((q) => (q ? q - 1 : 1));
      }
    } else if (viewLevel === "year") {
      setSelectedYear((y) => y - 1);
    }
    setHoveredIdx(null);
  };

  const handleNext = () => {
    if (viewLevel === "day") {
      setSelectedDateKey((prev) => addDaysToDateKey(prev, 1));
    } else if (viewLevel === "week") {
      setSelectedWeekDateKey((prev) => addDaysToDateKey(prev, 7));
    } else if (viewLevel === "month") {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear((y) => y + 1);
      } else {
        setSelectedMonth((m) => m + 1);
      }
    } else if (viewLevel === "quarter") {
      if (selectedQuarter === null || selectedQuarter === 4) {
        setSelectedQuarter(1);
        setSelectedYear((y) => y + 1);
      } else {
        setSelectedQuarter((q) => (q ? q + 1 : 1));
      }
    } else if (viewLevel === "year") {
      setSelectedYear((y) => y + 1);
    }
    setHoveredIdx(null);
  };

  const handleGoBack = () => {
    if (drillStack.length === 0) return;
    const nextStack = [...drillStack];
    const prev = nextStack.pop();
    setDrillStack(nextStack);
    if (prev) {
      setViewLevel(prev.level);
    }
    setHoveredIdx(null);
  };

  const canGoBack = drillStack.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ 1. BỘ TABS CHUYỂN CHẾ ĐỘ (5 CHẾ ĐỘ: NGÀY, TUẦN, THÁNG, QUÝ, NĂM) ═══ */}
      <div className="grid grid-cols-5 w-full bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setViewLevel("day");
            setDrillStack([]);
            setHoveredIdx(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            viewLevel === "day"
              ? "bg-white text-rose-600 shadow-xs font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Clock size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Theo </span>
          <span>Ngày</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewLevel("week");
            setDrillStack([]);
            setHoveredIdx(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            viewLevel === "week"
              ? "bg-white text-rose-600 shadow-xs font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <CalendarRange size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Theo </span>
          <span>Tuần</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewLevel("month");
            setDrillStack([]);
            setHoveredIdx(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            viewLevel === "month"
              ? "bg-white text-rose-600 shadow-xs font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Calendar size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Theo </span>
          <span>Tháng</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewLevel("quarter");
            setDrillStack([]);
            setHoveredIdx(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            viewLevel === "quarter"
              ? "bg-white text-rose-600 shadow-xs font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Layers size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Theo </span>
          <span>Quý</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewLevel("year");
            setDrillStack([]);
            setHoveredIdx(null);
          }}
          className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            viewLevel === "year"
              ? "bg-white text-rose-600 shadow-xs font-black"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <BarChart3 size={13} strokeWidth={2.4} />
          <span className="hidden sm:inline">Cả </span>
          <span>Năm</span>
        </button>
      </div>

      {/* ═══ 2. NÚT QUAY LẠI KHI DRILL-DOWN ═══ */}
      {canGoBack && (
        <div className="flex items-center justify-between gap-2 bg-rose-50/80 border border-rose-200/80 px-2.5 py-1.5 rounded-xl">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-extrabold text-xs py-1 px-2.5 rounded-lg bg-white shadow-2xs border border-rose-200/60 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
            <span>Quay lại</span>
          </button>
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-600 overflow-x-auto scrollbar-none">
            {drillStack.map((part, i) => (
              <span key={i} className="flex items-center gap-1 shrink-0">
                {i > 0 && <span className="text-neutral-300">›</span>}
                <span className="text-neutral-500 font-bold">{part.label}</span>
              </span>
            ))}
            <span className="text-neutral-300">›</span>
            <span className="text-neutral-900 font-black bg-white px-2 py-0.5 rounded-md shadow-2xs shrink-0">
              {viewLevel === "day"
                ? formatDateKeyText(selectedDateKey)
                : viewLevel === "month"
                ? `Tháng ${selectedMonth}/${selectedYear}`
                : "Chi tiết"}
            </span>
          </div>
        </div>
      )}

      {/* ═══ 3. DÒNG ĐIỀU HƯỚNG THỜI GIAN THEO CHẾ ĐỘ ═══ */}
      <div className="flex items-center justify-between gap-1.5 bg-neutral-50 p-1.5 rounded-2xl border border-neutral-200 shadow-2xs">
        <button
          type="button"
          onClick={handlePrev}
          className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95 cursor-pointer"
          title="Kỳ trước"
          aria-label="Kỳ trước"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
          {/* CHẾ ĐỘ THEO NGÀY */}
          {viewLevel === "day" && (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              {/* Dropdown danh sách ngày có dữ liệu gần đây hoặc nhập ngày */}
              {availableDates.length > 1 ? (
                <CustomSelect
                  value={selectedDateKey}
                  onChange={(val) => {
                    setSelectedDateKey(val);
                    setHoveredIdx(null);
                  }}
                  options={availableDates.slice(0, 15).map((dk) => ({
                    value: dk,
                    label:
                      dk === todayDateKey
                        ? `Hôm nay (${dk})`
                        : dk === latestDateKey
                        ? `Mới nhất (${dk})`
                        : dk,
                  }))}
                  className="max-w-[210px] min-w-[150px]"
                  buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                  ariaLabel="Chọn ngày"
                />
              ) : (
                <div className="text-xs font-black text-neutral-900 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs truncate">
                  {formatDateKeyText(selectedDateKey)}
                </div>
              )}

              {/* Badges / Nút nhảy nhanh Hôm nay / Mới nhất */}
              {selectedDateKey === todayDateKey ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hôm nay
                </span>
              ) : selectedDateKey === latestDateKey ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <Sparkles size={11} className="text-rose-500" />
                  Ngày mới nhất
                </span>
              ) : null}

              {/* Nút nhảy nhanh về Ngày mới nhất nếu đang ở ngày khác */}
              {selectedDateKey !== latestDateKey && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateKey(latestDateKey);
                    setHoveredIdx(null);
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer bg-white px-2 py-1 rounded-lg border border-rose-200/60 shadow-2xs"
                >
                  Về ngày mới nhất ›
                </button>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ THEO TUẦN */}
          {viewLevel === "week" && (
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <span className="text-xs font-black text-neutral-900 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-2xs truncate">
                {titleInfo.title.split("— ")[1] || "Tuần hiện tại"}
              </span>

              {selectedWeekDateKey !== latestDateKey && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeekDateKey(latestDateKey);
                    setHoveredIdx(null);
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer bg-white px-2 py-1 rounded-lg border border-rose-200/60 shadow-2xs"
                >
                  Về tuần mới nhất ›
                </button>
              )}
            </div>
          )}

          {/* CHẾ ĐỘ THEO THÁNG */}
          {viewLevel === "month" && (
            <div className="flex items-center gap-1.5 justify-center">
              <CustomSelect
                value={String(selectedMonth)}
                onChange={(val) => {
                  setSelectedMonth(Number(val));
                  setHoveredIdx(null);
                }}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1),
                  label: `Tháng ${i + 1}`,
                }))}
                className="max-w-[125px] min-w-[95px]"
                buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2 justify-center"
                ariaLabel="Chọn tháng"
              />

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
                className="max-w-[115px] min-w-[95px]"
                buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2 justify-center"
                ariaLabel="Chọn năm"
              />
            </div>
          )}

          {/* CHẾ ĐỘ THEO QUÝ */}
          {viewLevel === "quarter" && (
            <div className="flex items-center gap-1.5 justify-center">
              <CustomSelect
                value={selectedQuarter !== null ? String(selectedQuarter) : "all"}
                onChange={(val) => {
                  setSelectedQuarter(val === "all" ? null : Number(val));
                  setHoveredIdx(null);
                }}
                options={[
                  { value: "all", label: "Cả 4 Quý" },
                  { value: "1", label: "Quý 1 (T1–T3)" },
                  { value: "2", label: "Quý 2 (T4–T6)" },
                  { value: "3", label: "Quý 3 (T7–T9)" },
                  { value: "4", label: "Quý 4 (T10–T12)" },
                ]}
                className="max-w-[155px] min-w-[120px]"
                buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2 justify-center"
                ariaLabel="Chọn quý"
              />

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
                className="max-w-[115px] min-w-[95px]"
                buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2 justify-center"
                ariaLabel="Chọn năm"
              />
            </div>
          )}

          {/* CHẾ ĐỘ CẢ NĂM */}
          {viewLevel === "year" && (
            <div className="flex items-center gap-1.5 justify-center">
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
                className="max-w-[130px] min-w-[100px]"
                buttonClassName="h-8.5 bg-white border-neutral-200 shadow-2xs text-xs font-black text-neutral-900 px-2.5 justify-center"
                ariaLabel="Chọn năm"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 transition-all flex items-center justify-center shrink-0 shadow-2xs border border-neutral-200/80 active:scale-95 cursor-pointer"
          title="Kỳ sau"
          aria-label="Kỳ sau"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* ═══ 4. CARD BIỂU ĐỒ CHÍNH (GIỮ NGUYÊN THIẾT KẾ ĐẸP MẮT) ═══ */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-3.5">
        {/* Header biểu đồ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                {titleInfo.title}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              {titleInfo.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold border border-rose-200 shrink-0">
              <Flame size={12} className="text-rose-500 shrink-0" />
              <span>{titleInfo.peakBadgeLabel}</span>
            </span>
          </div>
        </div>

        {/* Thẻ hiển thị chi tiết điểm đang xem (Interactive Inspection Card) */}
        {activePoint && (
          <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 p-3 sm:p-3.5 rounded-2xl border border-rose-200/70 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-100/70 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
                <span className="text-xs sm:text-[13px] font-black text-neutral-900 tracking-tight truncate">
                  {activePoint.fullTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activePoint.index === peakItemIdx ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-black text-rose-600 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-200">
                    <Flame size={11} className="text-rose-500 shrink-0" />
                    <span>Cao điểm nhất</span>
                  </span>
                ) : null}

                {/* Nút gợi ý Drill-down nếu có */}
                {activePoint.canDrill && activePoint.onDrill && (
                  <button
                    type="button"
                    onClick={activePoint.onDrill}
                    className="inline-flex items-center gap-1 text-[10.5px] font-black text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-0.5 rounded-full shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Xem chi tiết ›</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Thẻ số liệu chi tiết: Tổng lượt xem, Thành viên, Khách */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-rose-100/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
                  Tổng lượt xem
                </span>
                <span className="text-base sm:text-lg font-black text-rose-600 tabular-nums leading-tight mt-0.5">
                  {activePoint.total.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-emerald-100/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Thành viên</span>
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
                  {activePoint.members.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-amber-100/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-[9.5px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Khách</span>
                </span>
                <span className="text-base sm:text-lg font-black text-amber-600 tabular-nums leading-tight mt-0.5">
                  {activePoint.guests.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SVG Canvas Biểu Đồ Đường Responsive */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-white border border-neutral-100 p-1 sm:p-2 shadow-2xs">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none overflow-visible"
          >
            <defs>
              <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#fb7185" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
              </linearGradient>

              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>

            {/* Đường lưới ngang (Grid lines) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + chartH - ratio * chartH;
              const val = Math.round(ratio * maxTotal);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray={ratio === 0 ? "none" : "3,3"}
                  />
                  <text
                    x={paddingX - 4}
                    y={y + 3}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Vùng đổ màu phía dưới đường cong */}
            <path d={areaPath} fill="url(#lineAreaGradient)" />

            {/* Đường cong chính (Spline Line) */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Đường chỉ dẫn trục dọc khi chọn/hover */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={paddingTop + chartH}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
            )}

            {/* Các điểm nút trên đường (Points) */}
            {points.map((p) => {
              const isPeak = p.index === peakItemIdx;
              const isSelected = activePoint && p.id === activePoint.id;
              const stripWidth = points.length > 1 ? chartW / (points.length - 1) : chartW;

              return (
                <g
                  key={p.id}
                  className="cursor-pointer transition-transform"
                  onClick={() => {
                    setHoveredIdx(p.index);
                    if (p.canDrill && isSelected && p.onDrill) {
                      p.onDrill();
                    }
                  }}
                  onMouseEnter={() => setHoveredIdx(p.index)}
                >
                  {/* Dải chạm dọc toàn chiều cao (Vertical Hit Strip) */}
                  <rect
                    x={p.x - stripWidth / 2}
                    y={paddingTop}
                    width={stripWidth}
                    height={chartH}
                    fill="transparent"
                  />

                  {/* Vòng sáng ngoài khi là Điểm Cao Điểm */}
                  {isPeak && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? "9" : "7"}
                      fill="#ffe4e6"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      className="animate-ping origin-center pointer-events-none"
                      style={{ animationDuration: "2.5s" }}
                    />
                  )}

                  {/* Chấm tròn chính */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "5.5" : isPeak ? "4.5" : p.total > 0 ? "3" : "2"}
                    fill={
                      isSelected
                        ? "#e11d48"
                        : isPeak
                        ? "#f43f5e"
                        : p.total > 0
                        ? "#fb7185"
                        : "#cbd5e1"
                    }
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="pointer-events-none"
                  />
                </g>
              );
            })}

            {/* Nhãn trục hoành (X-Axis Labels) */}
            {points.map((p) => {
              if (!p.tickLabel) return null;
              const isSelected = activePoint && p.id === activePoint.id;
              return (
                <text
                  key={`lbl-${p.id}`}
                  x={p.x}
                  y={paddingTop + chartH + 16}
                  textAnchor="middle"
                  fill={isSelected ? "#e11d48" : "#64748b"}
                  fontSize={viewLevel === "month" ? "8.5" : "9.5"}
                  fontWeight={isSelected ? "900" : "700"}
                  className="pointer-events-none"
                >
                  {p.tickLabel}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
