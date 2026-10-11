"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  Layers,
  Users,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Search,
  ExternalLink,
  Flame,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { Pagination } from "@/components/ui/Pagination";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/CustomSelect";

type RouteGroup = {
  path: string;
  totalViews: number;
  uniqueVisitors: number;
  memberViews: number;
  guestViews: number;
};

type HourlyStat = {
  hour: number;
  total: number;
  members: number;
  guests: number;
};

type LogEntry = {
  id: string;
  path: string;
  title: string | null;
  userId: string | null;
  customerId: string | null;
  userRole: string;
  userDisplayName: string | null;
  visitorId: string;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress?: string | null;
  referer: string | null;
  createdAt: string;
};

interface Props {
  totalViews: number;
  uniqueVisitors: number;
  memberViews: number;
  guestViews: number;
  topRoutes: RouteGroup[];
  hourlyDistribution: HourlyStat[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  browserBreakdown: { name: string; count: number }[];
  recentLogs: LogEntry[];
  peakHour: number;
}

// ── BIỂU ĐỒ ĐƯỜNG CONG SVG HIỆN ĐẠI CHO 24 KHUNG GIỜ (LINE CHART) ──
function LineChart24h({
  data,
  peakHour,
}: {
  data: HourlyStat[];
  peakHour: number;
}) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(peakHour);

  const maxTotal = useMemo(() => {
    return Math.max(...data.map((d) => d.total), 4);
  }, [data]);

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 25;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Tọa độ các điểm (24 giờ)
  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = paddingX + (i / 23) * chartW;
      const y = paddingTop + chartH - (d.total / maxTotal) * chartH;
      return { x, y, ...d };
    });
  }, [data, maxTotal, chartW, chartH, paddingX, paddingTop]);

  // Tạo đường cong Bézier mượt mà (Smooth Spline)
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "" };

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

  const activePoint = points.find((p) => p.hour === hoveredHour) || points[peakHour] || points[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Thẻ hiển thị chi tiết điểm đang xem (Interactive Inspection Card) */}
      <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 p-3 sm:p-3.5 rounded-2xl border border-rose-200/70 shadow-2xs">
        {/* Header khung giờ & trạng thái */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-100/70">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="text-xs sm:text-[13px] font-black text-neutral-900 tracking-tight">
              Khung giờ {activePoint.hour}:00 – {activePoint.hour + 1}:00
            </span>
          </div>

          {activePoint.hour === peakHour ? (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-black text-rose-600 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
              <Flame size={11} className="text-rose-500 shrink-0" />
              <span>Giờ vàng cao điểm</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-[10.5px] font-bold text-neutral-400 shrink-0">
              Chi tiết thời gian thực
            </span>
          )}
        </div>

        {/* 3 Thẻ số liệu chi tiết (Grid 3 Cột cân đối, không bao giờ bị vỡ dòng) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Cột 1: Tổng lượt xem */}
          <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-rose-100/90 shadow-2xs flex flex-col items-center justify-center text-center">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
              Tổng lượt xem
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600 tabular-nums leading-tight mt-0.5">
              {activePoint.total.toLocaleString("vi-VN")}
            </span>
          </div>

          {/* Cột 2: Thành viên */}
          <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-emerald-100/90 shadow-2xs flex flex-col items-center justify-center text-center">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Thành viên</span>
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
              {activePoint.members.toLocaleString("vi-VN")}
            </span>
          </div>

          {/* Cột 3: Khách vãng lai */}
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

      {/* SVG Canvas Biểu Đồ Đường Responsive */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-white border border-neutral-100 p-1 sm:p-2 shadow-2xs">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            {/* Gradient màu hồng MeowBack lấp lánh dưới đường cong */}
            <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#fb7185" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
            </linearGradient>

            {/* Gradient cho đường stroke chính */}
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
            const isPeak = p.hour === peakHour;
            const isSelected = p.hour === hoveredHour;

            return (
              <g
                key={p.hour}
                className="cursor-pointer transition-transform"
                onClick={() => setHoveredHour(p.hour)}
                onMouseEnter={() => setHoveredHour(p.hour)}
              >
                {/* Dải chạm dọc toàn chiều cao (Vertical Hit Strip) - Giúp chạm trên mobile cực nhạy */}
                <rect
                  x={p.x - chartW / 46}
                  y={paddingTop}
                  width={chartW / 23}
                  height={chartH}
                  fill="transparent"
                />

                {/* Vòng sáng ngoài khi là Giờ Vàng */}
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
                  fill={isSelected ? "#e11d48" : isPeak ? "#f43f5e" : p.total > 0 ? "#fb7185" : "#cbd5e1"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="pointer-events-none"
                />
              </g>
            );
          })}

          {/* Nhãn trục hoành (Giờ: 0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h, 23h) */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => {
            const pt = points[h];
            if (!pt) return null;
            const isPeak = h === peakHour;
            const isSelected = h === hoveredHour;

            return (
              <text
                key={h}
                x={pt.x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill={isSelected ? "#e11d48" : isPeak ? "#f43f5e" : "#64748b"}
                fontSize={isSelected || isPeak ? "10.5" : "9.5"}
                fontWeight={isSelected || isPeak ? "900" : "700"}
              >
                {h}h
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chú thích & Tóm tắt dưới biểu đồ */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold text-neutral-500 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500" />
            <span>Lưu lượng người dùng</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Khung giờ vàng ({peakHour}h)</span>
          </span>
        </div>
        <span className="text-[10.5px] text-neutral-400">
          Chạm vào từng điểm trên đường để xem chi tiết
        </span>
      </div>
    </div>
  );
}

const ROLE_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "Tất cả đối tượng", icon: <Users size={13} className="text-neutral-500" /> },
  { value: "member", label: "Chỉ Thành viên", icon: <UserCheck size={13} className="text-emerald-500" /> },
  { value: "guest", label: "Chỉ Khách vãng lai", icon: <UserX size={13} className="text-amber-500" /> },
];

const DEVICE_FILTER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "Mọi thiết bị", icon: <Globe size={13} className="text-neutral-500" /> },
  { value: "mobile", label: "Chỉ Mobile", icon: <Smartphone size={13} className="text-rose-500" /> },
  { value: "desktop", label: "Chỉ Desktop", icon: <Monitor size={13} className="text-indigo-500" /> },
];

export function AdminAnalyticsClient({
  totalViews,
  uniqueVisitors,
  memberViews,
  guestViews,
  topRoutes,
  hourlyDistribution,
  deviceBreakdown,
  browserBreakdown,
  recentLogs,
  peakHour,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "member" | "guest">("all");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "routes" | "logs">("overview");

  // Lọc nhật ký trực tiếp
  const filteredLogs = useMemo(() => {
    return recentLogs.filter((log) => {
      if (roleFilter === "member" && log.userRole === "guest") return false;
      if (roleFilter === "guest" && log.userRole !== "guest") return false;
      if (deviceFilter !== "all" && log.deviceType !== deviceFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchPath = log.path.toLowerCase().includes(q);
        const matchUser = (log.userDisplayName || "").toLowerCase().includes(q);
        const matchVisitor = log.visitorId.toLowerCase().includes(q);
        if (!matchPath && !matchUser && !matchVisitor) return false;
      }
      return true;
    });
  }, [recentLogs, roleFilter, deviceFilter, searchTerm]);

  // Phân trang cho Top Router
  const [routesPage, setRoutesPage] = useState(1);
  const ROUTES_PER_PAGE = 8;
  const totalRoutesPages = Math.ceil(topRoutes.length / ROUTES_PER_PAGE);
  const paginatedRoutes = useMemo(() => {
    const start = (routesPage - 1) * ROUTES_PER_PAGE;
    return topRoutes.slice(start, start + ROUTES_PER_PAGE);
  }, [topRoutes, routesPage]);

  // Phân trang cho Nhật ký hoạt động
  const [logsPage, setLogsPage] = useState(1);
  const LOGS_PER_PAGE = 10;
  const totalLogsPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredLogs, logsPage]);

  // Tự động về trang 1 khi thay đổi điều kiện tìm kiếm/lọc
  useEffect(() => {
    setLogsPage(1);
  }, [searchTerm, roleFilter, deviceFilter]);

  const memberPercent = totalViews > 0 ? Math.round((memberViews / totalViews) * 100) : 0;
  const guestPercent = totalViews > 0 ? 100 - memberPercent : 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 fade-in pb-16">
      {/* ═══ 1. HEADER TRANG GỌN GÀNG, SANG TRỌNG ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Activity size={20} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-black text-neutral-900 tracking-tight leading-snug truncate">
                Lưu Lượng & Hành Vi
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                Live User
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate mt-0.5">
              Chỉ ghi nhận khách & thành viên thực tế • Đã loại trừ truy cập của Admin 🐾
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-200/90 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw size={12} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ═══ 2. 4 THẺ THỐNG KÊ CÂN ĐỐI, CÓ MÀU BACKGROUND RIÊNG BIỆT (GRID 2x2 MOBILE, 4 CỘT DESKTOP) ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tổng lượt xem (Rose Pink Theme) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-pink-100/90 p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-rose-300/80 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between gap-3">
          <Layers className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-rose-500/[0.12] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-800">
              Tổng Lượt Xem
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers size={15} strokeWidth={2.4} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-rose-950 tabular-nums leading-tight">
              {totalViews.toLocaleString("vi-VN")}
            </div>
            <p className="text-[10.5px] sm:text-[11.5px] text-rose-800/80 font-bold mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              Lượt tải trang người dùng
            </p>
          </div>

          <div className="w-full bg-rose-200/90 rounded-full h-1.5 sm:h-2 overflow-hidden relative z-10 shadow-2xs">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Khách duy nhất (Indigo Blue Theme) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50 to-blue-100/90 p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-indigo-300/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between gap-3">
          <Users className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-indigo-500/[0.12] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-800">
              Khách Duy Nhất
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users size={15} strokeWidth={2.4} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-indigo-950 tabular-nums leading-tight">
              {uniqueVisitors.toLocaleString("vi-VN")}
            </div>
            <p className="text-[10.5px] sm:text-[11.5px] text-indigo-800/80 font-bold mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              Unique Visitors (theo máy)
            </p>
          </div>

          <div className="w-full bg-indigo-200/90 rounded-full h-1.5 sm:h-2 overflow-hidden relative z-10 shadow-2xs">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 3: Thành viên đã đăng nhập (Emerald Green Theme) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100/90 p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-emerald-300/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between gap-3">
          <UserCheck className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-emerald-500/[0.12] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
              Thành Viên
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck size={15} strokeWidth={2.4} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tabular-nums leading-tight flex items-baseline gap-1.5 flex-wrap">
              <span>{memberViews.toLocaleString("vi-VN")}</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">
                ({memberPercent}%)
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11.5px] text-emerald-800/80 font-bold mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Khách đã có tài khoản
            </p>
          </div>

          <div className="w-full bg-emerald-200/90 rounded-full h-1.5 sm:h-2 overflow-hidden relative z-10 shadow-2xs">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${memberPercent}%` }} />
          </div>
        </div>

        {/* Card 4: Khách vãng lai (Amber Orange Theme) */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100/90 p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-amber-300/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between gap-3">
          <UserX className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-amber-500/[0.12] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800">
              Khách Vãng Lai
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserX size={15} strokeWidth={2.4} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-amber-950 tabular-nums leading-tight flex items-baseline gap-1.5 flex-wrap">
              <span>{guestViews.toLocaleString("vi-VN")}</span>
              <span className="text-xs sm:text-sm font-black text-amber-700">
                ({guestPercent}%)
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11.5px] text-amber-800/80 font-bold mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              Khách chưa đăng nhập
            </p>
          </div>

          <div className="w-full bg-amber-200/90 rounded-full h-1.5 sm:h-2 overflow-hidden relative z-10 shadow-2xs">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full" style={{ width: `${guestPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ═══ 3. TABS ĐIỀU HƯỚNG GỌN GÀNG (SEGMENTED PILL) ═══ */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/70 gap-1 text-center">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`py-2 px-1 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer truncate ${
            activeTab === "overview"
              ? "bg-white text-rose-600 shadow-sm border border-neutral-200/60"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <span className="hidden sm:inline">📈 Biểu Đồ 24H</span>
          <span className="sm:hidden">Biểu Đồ 24H</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`py-2 px-1 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer truncate ${
            activeTab === "routes"
              ? "bg-white text-rose-600 shadow-sm border border-neutral-200/60"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Top Router ({topRoutes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`py-2 px-1 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer truncate ${
            activeTab === "logs"
              ? "bg-white text-rose-600 shadow-sm border border-neutral-200/60"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Nhật Ký ({recentLogs.length})
        </button>
      </div>

      {/* ═══ NỘI DUNG TAB 1: OVERVIEW (BIỂU ĐỒ ĐƯỜNG 24H & THIẾT BỊ) ═══ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5">
          {/* 1. BIỂU ĐỒ ĐƯỜNG MẬT ĐỘ TRUY CẬP 24H */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-rose-500" />
                  <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                    Biểu Đồ Xu Hướng Truy Cập 24 Giờ
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                  Đường lưu lượng theo thời gian thực để tối ưu khung giờ push deal & thông báo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-extrabold border border-rose-200">
                  <Flame size={12} className="text-rose-500" />
                  <span>Khung giờ vàng: {peakHour}:00 - {peakHour + 1}:00</span>
                </span>
              </div>
            </div>

            {/* Component Biểu Đồ Đường */}
            <LineChart24h data={hourlyDistribution} peakHour={peakHour} />
          </div>

          {/* 2. THIẾT BỊ & TRÌNH DUYỆT TRUY CẬP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột thiết bị */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3.5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                  <Smartphone size={15} className="text-rose-500" />
                  <span>Thiết Bị Người Dùng</span>
                </h3>
                <span className="text-[11px] text-neutral-400 font-bold">Tỷ lệ %</span>
              </div>

              <div className="space-y-2.5">
                {/* Mobile */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Smartphone size={13} className="text-rose-500" /> Điện thoại (Mobile)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.mobile} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{
                        width: `${totalViews > 0 ? (deviceBreakdown.mobile / totalViews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Desktop */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Monitor size={13} className="text-indigo-500" /> Máy tính (Desktop)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.desktop} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${totalViews > 0 ? (deviceBreakdown.desktop / totalViews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tablet */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Tablet size={13} className="text-amber-500" /> Máy tính bảng (Tablet)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.tablet} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${totalViews > 0 ? (deviceBreakdown.tablet / totalViews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cột trình duyệt */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3.5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                  <Globe size={15} className="text-rose-500" />
                  <span>Trình Duyệt & In-App Browser</span>
                </h3>
                <span className="text-[11px] text-neutral-400 font-bold">Phổ biến</span>
              </div>

              <div className="space-y-2">
                {browserBreakdown.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-700">{b.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums font-black text-neutral-900">{b.count} lượt</span>
                      <span className="text-[10px] text-neutral-400 font-bold">
                        ({totalViews > 0 ? Math.round((b.count / totalViews) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {browserBreakdown.length === 0 && (
                  <p className="text-xs text-neutral-400 py-2 text-center">Chưa có dữ liệu trình duyệt</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NỘI DUNG TAB 2: TOP ROUTER ═══ */}
      {activeTab === "routes" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                Top Router Được Xem Nhiều Nhất
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                Các trang được khách hàng quan tâm và truy cập thường xuyên nhất.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">{topRoutes.length} trang</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[10.5px] font-extrabold uppercase tracking-wider text-neutral-500">
                  <th className="py-2.5 px-3.5">Hạng</th>
                  <th className="py-2.5 px-3.5">Đường dẫn Router</th>
                  <th className="py-2.5 px-3.5 text-center">Tổng xem</th>
                  <th className="py-2.5 px-3.5 text-center">Khách duy nhất</th>
                  <th className="py-2.5 px-3.5 text-center">Thành viên vs Khách</th>
                  <th className="py-2.5 px-3.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedRoutes.map((r, idx) => {
                  const actualRank = (routesPage - 1) * ROUTES_PER_PAGE + idx + 1;
                  const rankBadge =
                    actualRank === 1
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : actualRank === 2
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : actualRank === 3
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200";

                  return (
                    <tr key={r.path} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3 px-3.5 font-black">
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] border ${rankBadge}`}
                        >
                          {actualRank}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100/90 px-2 py-0.5 rounded-md border border-neutral-200/60 text-[11px]">
                          {r.path}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-black tabular-nums text-neutral-900">
                        {r.totalViews.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold tabular-nums text-indigo-600">
                        {r.uniqueVisitors.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-[10.5px]">
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {r.memberViews} TV
                          </span>
                          <span className="text-neutral-300">/</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                            {r.guestViews} Khách
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <a
                          href={r.path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          <span>Mở</span>
                          <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {topRoutes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400">
                      Chưa có dữ liệu lượt xem nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang cho Top Router */}
          {totalRoutesPages > 1 && (
            <div className="p-3 border-t border-neutral-100 flex items-center justify-center bg-neutral-50/50">
              <Pagination
                totalPages={totalRoutesPages}
                currentPage={routesPage}
                onPageChange={setRoutesPage}
                totalItems={topRoutes.length}
                pageSize={ROUTES_PER_PAGE}
                itemName="router"
                showSinglePage={false}
              />
            </div>
          )}
        </div>
      )}

      {/* ═══ NỘI DUNG TAB 3: NHẬT KÝ CHI TIẾT (LIVE LOGS) ═══ */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col gap-3.5 p-4 sm:p-5">
          {/* Thanh công cụ tìm kiếm và bộ lọc */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm URL, tên khách, visitor ID..."
                className="w-full h-9 pl-8 pr-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              <CustomSelect
                value={roleFilter}
                onChange={(val) => setRoleFilter(val as any)}
                options={ROLE_FILTER_OPTIONS}
                className="w-full sm:w-[155px]"
                buttonClassName="h-9 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 rounded-xl px-2.5"
                menuClassName="min-w-[195px] w-max shadow-xl"
                fullWidthMenu={false}
                direction="down"
                ariaLabel="Lọc đối tượng"
              />

              <CustomSelect
                value={deviceFilter}
                onChange={(val) => setDeviceFilter(val as any)}
                options={DEVICE_FILTER_OPTIONS}
                className="w-full sm:w-[140px]"
                buttonClassName="h-9 text-xs font-bold text-neutral-700 bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 rounded-xl px-2.5"
                menuClassName="min-w-[160px] w-max shadow-xl"
                fullWidthMenu={false}
                align="right"
                direction="down"
                ariaLabel="Lọc thiết bị"
              />
            </div>
          </div>

          {/* Danh sách nhật ký */}
          <div className="overflow-x-auto rounded-xl border border-neutral-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[10.5px] font-extrabold uppercase tracking-wider text-neutral-500">
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Đối tượng</th>
                  <th className="py-2.5 px-3">Đường dẫn</th>
                  <th className="py-2.5 px-3">Thiết bị</th>
                  <th className="py-2.5 px-3">Nguồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedLogs.map((log) => {
                  const isGuest = log.userRole === "guest";

                  return (
                    <tr key={log.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-neutral-500 text-[11px] font-medium">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                              isGuest ? "bg-amber-400" : "bg-emerald-500"
                            }`}
                          />
                          <span
                            className={`font-bold truncate max-w-[150px] ${
                              isGuest ? "text-amber-800" : "text-emerald-700"
                            }`}
                            title={log.userDisplayName || undefined}
                          >
                            {log.userDisplayName || "Khách"}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-[180px]">
                        <span
                          className="font-mono font-bold text-neutral-900 bg-neutral-100/80 px-1.5 py-0.5 rounded text-[10.5px] border border-neutral-200/60 block truncate"
                          title={log.path}
                        >
                          {log.path}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1 font-medium text-neutral-700">
                          {log.deviceType === "mobile" ? (
                            <Smartphone size={12} className="text-rose-500 shrink-0" />
                          ) : log.deviceType === "tablet" ? (
                            <Tablet size={12} className="text-amber-500 shrink-0" />
                          ) : (
                            <Monitor size={12} className="text-indigo-500 shrink-0" />
                          )}
                          <span>{log.browser || "Web"}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-[140px] text-neutral-500 text-[11px] truncate" title={log.referer || "Trực tiếp"}>
                        {log.referer || <span className="text-neutral-400 italic">Trực tiếp</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-400">
                      Không tìm thấy lượt truy cập nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang cho Nhật Ký */}
          {totalLogsPages > 1 && (
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-center">
              <Pagination
                totalPages={totalLogsPages}
                currentPage={logsPage}
                onPageChange={setLogsPage}
                totalItems={filteredLogs.length}
                pageSize={LOGS_PER_PAGE}
                itemName="bản ghi"
                showSinglePage={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
