"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Users,
  UserCheck,
  UserX,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/format";

type ActivityLogItem = {
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
  ipAddress: string | null;
  referer: string | null;
  createdAt: string;
};

type RouteStat = {
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

interface Props {
  totalViews: number;
  uniqueVisitors: number;
  memberViews: number;
  guestViews: number;
  topRoutes: RouteStat[];
  hourlyDistribution: HourlyStat[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  browserBreakdown: { name: string; count: number }[];
  recentLogs: ActivityLogItem[];
  peakHour: number;
}

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
      // Lọc vai trò
      if (roleFilter === "member" && log.userRole === "guest") return false;
      if (roleFilter === "guest" && log.userRole !== "guest") return false;

      // Lọc thiết bị
      if (deviceFilter !== "all" && log.deviceType !== deviceFilter) return false;

      // Tìm kiếm theo tên / mã / path
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

  // Max views trong biểu đồ 24h để tính tỷ lệ % cột
  const maxHourlyViews = useMemo(() => {
    const max = Math.max(...hourlyDistribution.map((h) => h.total), 1);
    return max;
  }, [hourlyDistribution]);

  const memberPercent = totalViews > 0 ? Math.round((memberViews / totalViews) * 100) : 0;
  const guestPercent = totalViews > 0 ? 100 - memberPercent : 0;

  return (
    <div className="flex flex-col gap-6 fade-in pb-16">
      {/* ═══ 1. HEADER TRANG ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-rose-200/60 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <Activity size={24} strokeWidth={2.3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Lưu Lượng & Hành Vi Người Dùng
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-black uppercase tracking-wider">
                Real-time
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mt-0.5">
              Theo dõi router được xem nhiều nhất, khung giờ cao điểm và phân loại Khách vs Thành viên.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-200 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ═══ 2. 4 THẺ THỐNG KÊ TỔNG QUAN ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Tổng lượt xem */}
        <div className="bg-white p-4.5 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Tổng Lượt Xem</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Layers size={16} strokeWidth={2.3} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">
              {totalViews.toLocaleString("vi-VN")}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Lượt tải trang được ghi nhận</p>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Khách duy nhất */}
        <div className="bg-white p-4.5 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Khách Duy Nhất</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} strokeWidth={2.3} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 tabular-nums">
              {uniqueVisitors.toLocaleString("vi-VN")}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Unique Visitors (theo thiết bị)</p>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 3: Thành viên đã đăng nhập */}
        <div className="bg-white p-4.5 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Thành Viên</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} strokeWidth={2.3} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
              {memberViews.toLocaleString("vi-VN")}{" "}
              <span className="text-[14px] font-bold text-neutral-400">({memberPercent}%)</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Có tài khoản MeowBack</p>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${memberPercent}%` }} />
          </div>
        </div>

        {/* Card 4: Khách vãng lai */}
        <div className="bg-white p-4.5 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Khách Vãng Lai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX size={16} strokeWidth={2.3} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
              {guestViews.toLocaleString("vi-VN")}{" "}
              <span className="text-[14px] font-bold text-neutral-400">({guestPercent}%)</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Khách chưa đăng nhập</p>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${guestPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ═══ 3. TABS ĐIỀU HƯỚNG ═══ */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          📊 Khung Giờ & Phân Bổ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
            activeTab === "routes"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          🔗 Top Router Được Xem Nhiều ({topRoutes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          ⚡ Nhật Ký Trực Tiếp ({recentLogs.length})
        </button>
      </div>

      {/* ═══ NỘI DUNG TAB 1: OVERVIEW (KHUNG GIỜ & THIẾT BỊ) ═══ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* 1. BIỂU ĐỒ 24 KHUNG GIỜ TRONG NGÀY */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-rose-500" />
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Mật Độ Truy Cập Theo 24 Giờ Trong Ngày
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Xác định thời điểm người dùng vào web nhiều nhất để tối ưu giờ săn deal hoặc push tin nhắn.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                  <Sparkles size={12} />
                  <span>Khung giờ vàng: {peakHour}:00 - {peakHour + 1}:00</span>
                </span>
              </div>
            </div>

            {/* Thanh biểu đồ 24 cột trực quan */}
            <div className="pt-4 pb-2 overflow-x-auto">
              <div className="min-w-[680px] flex items-end justify-between gap-1.5 h-44 px-2">
                {hourlyDistribution.map((h) => {
                  const heightPercent = maxHourlyViews > 0 ? (h.total / maxHourlyViews) * 100 : 0;
                  const isPeak = h.hour === peakHour;

                  return (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Tooltip khi hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[11px] font-bold py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none z-20 shadow-md">
                        {h.hour}:00 ➔ {h.total} lượt ({h.members} thành viên, {h.guests} khách)
                      </div>

                      {/* Cột số liệu */}
                      <div className="w-full h-32 flex items-end justify-center">
                        <div
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                          className={`w-full max-w-[18px] rounded-t-md transition-all duration-300 ${
                            isPeak
                              ? "bg-gradient-to-t from-rose-600 to-pink-400 shadow-xs ring-2 ring-rose-300"
                              : h.total > 0
                              ? "bg-gradient-to-t from-rose-400 to-rose-300 hover:from-rose-500 hover:to-rose-400"
                              : "bg-neutral-100"
                          }`}
                        />
                      </div>

                      {/* Nhãn giờ */}
                      <span
                        className={`text-[10px] font-bold tabular-nums ${
                          isPeak ? "text-rose-600 font-extrabold" : "text-neutral-400"
                        }`}
                      >
                        {h.hour}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chú thích màu */}
            <div className="flex flex-wrap items-center justify-end gap-4 pt-2 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span>Khung giờ cao điểm nhất</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-300" />
                <span>Lưu lượng trung bình</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-neutral-200" />
                <span>Không có truy cập</span>
              </div>
            </div>
          </div>

          {/* 2. THIẾT BỊ & TRÌNH DUYỆT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột thiết bị */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
                  <Smartphone size={16} className="text-rose-500" />
                  <span>Thiết Bị Truy Cập</span>
                </h3>
                <span className="text-xs text-neutral-400">User-Agent</span>
              </div>

              <div className="space-y-3">
                {/* Mobile */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Smartphone size={14} className="text-rose-500" /> Điện thoại (Mobile)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.mobile} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
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
                      <Monitor size={14} className="text-indigo-500" /> Máy tính (Desktop)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.desktop} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
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
                      <Tablet size={14} className="text-amber-500" /> Máy tính bảng (Tablet)
                    </span>
                    <span className="tabular-nums font-black">{deviceBreakdown.tablet} lượt</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
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
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
                  <Globe size={16} className="text-rose-500" />
                  <span>Trình Duyệt & In-App Browser</span>
                </h3>
                <span className="text-xs text-neutral-400">Top phân bổ</span>
              </div>

              <div className="space-y-2.5">
                {browserBreakdown.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-700">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-black text-neutral-900">{b.count} lượt</span>
                      <span className="text-[10.5px] text-neutral-400">
                        ({totalViews > 0 ? Math.round((b.count / totalViews) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
                {browserBreakdown.length === 0 && (
                  <p className="text-xs text-neutral-400 py-3 text-center">Chưa có dữ liệu trình duyệt</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NỘI DUNG TAB 2: TOP ROUTER ═══ */}
      {activeTab === "routes" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">
                Xếp Hạng Router / Đường Dẫn Được Truy Cập Nhiều Nhất
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Đánh giá mức độ quan tâm của người dùng đối với từng tính năng và trang đích.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">Top {topRoutes.length} trang</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Thứ hạng</th>
                  <th className="py-3 px-4">Đường dẫn Router</th>
                  <th className="py-3 px-4 text-center">Tổng lượt xem</th>
                  <th className="py-3 px-4 text-center">Khách duy nhất</th>
                  <th className="py-3 px-4 text-center">Thành viên vs Khách</th>
                  <th className="py-3 px-4 text-right">Xem trang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {topRoutes.map((r, idx) => {
                  const rankBadge =
                    idx === 0
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : idx === 1
                      ? "bg-slate-100 text-slate-800 border-slate-300"
                      : idx === 2
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200";

                  return (
                    <tr key={r.path} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-black">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs border ${rankBadge}`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100/90 px-2.5 py-1 rounded-lg border border-neutral-200/60">
                          {r.path}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black tabular-nums text-neutral-900">
                        {r.totalViews.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold tabular-nums text-indigo-600">
                        {r.uniqueVisitors.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            {r.memberViews} TV
                          </span>
                          <span className="text-neutral-300">/</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                            {r.guestViews} Khách
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={r.path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          <span>Mở</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {topRoutes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      Chưa có dữ liệu lượt xem nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ NỘI DUNG TAB 3: NHẬT KÝ CHI TIẾT (LIVE LOGS) ═══ */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col gap-4 p-5">
          {/* Thanh công cụ tìm kiếm và bộ lọc */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo URL, tên người dùng, visitor ID..."
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-[13px] bg-neutral-50 rounded-2xl border border-neutral-200 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Lọc đối tượng */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="h-10 px-3 text-xs font-bold rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-700 cursor-pointer"
              >
                <option value="all">Tất cả đối tượng</option>
                <option value="member">Chỉ Thành viên</option>
                <option value="guest">Chỉ Khách vãng lai</option>
              </select>

              {/* Lọc thiết bị */}
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as any)}
                className="h-10 px-3 text-xs font-bold rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-700 cursor-pointer"
              >
                <option value="all">Mọi thiết bị</option>
                <option value="mobile">Chỉ Mobile</option>
                <option value="desktop">Chỉ Desktop</option>
              </select>
            </div>
          </div>

          {/* Danh sách nhật ký */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-3.5">Thời gian</th>
                  <th className="py-3 px-3.5">Đối tượng</th>
                  <th className="py-3 px-3.5">Đường dẫn (Path)</th>
                  <th className="py-3 px-3.5">Thiết bị & Trình duyệt</th>
                  <th className="py-3 px-3.5">Nguồn đến (Referer)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map((log) => {
                  const isGuest = log.userRole === "guest";
                  const isAdmin = log.userRole === "admin";

                  return (
                    <tr key={log.id} className="hover:bg-rose-50/25 transition-colors">
                      {/* Thời gian */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-neutral-500 font-medium">
                        {formatDate(log.createdAt)}
                      </td>

                      {/* Đối tượng */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                              isAdmin ? "bg-purple-500" : isGuest ? "bg-amber-400" : "bg-emerald-500"
                            }`}
                          />
                          <span
                            className={`font-bold truncate max-w-[170px] ${
                              isAdmin
                                ? "text-purple-700"
                                : isGuest
                                ? "text-amber-800"
                                : "text-emerald-700"
                            }`}
                            title={log.userDisplayName || undefined}
                          >
                            {log.userDisplayName || "Khách"}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[170px]">
                          id: {log.visitorId.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Path */}
                      <td className="py-3 px-3.5 max-w-[220px]">
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100/80 px-2 py-0.5 rounded-md border border-neutral-200/60 block truncate" title={log.path}>
                          {log.path}
                        </span>
                      </td>

                      {/* Thiết bị & Trình duyệt */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                          {log.deviceType === "mobile" ? (
                            <Smartphone size={13} className="text-rose-500 shrink-0" />
                          ) : log.deviceType === "tablet" ? (
                            <Tablet size={13} className="text-amber-500 shrink-0" />
                          ) : (
                            <Monitor size={13} className="text-indigo-500 shrink-0" />
                          )}
                          <span>{log.browser || "Trình duyệt"}</span>
                          {log.os && <span className="text-neutral-400">({log.os})</span>}
                        </div>
                      </td>

                      {/* Referer */}
                      <td className="py-3 px-3.5 max-w-[180px] text-neutral-500 truncate" title={log.referer || "Trực tiếp"}>
                        {log.referer || <span className="text-neutral-400 italic">Trực tiếp / Bookmark</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Không tìm thấy lượt truy cập nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
