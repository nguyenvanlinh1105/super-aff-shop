"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { OrderActions } from "@/components/admin/OrderActions";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  UserRoundX,
  UserRoundCheck,
  Hourglass,
  ScanSearch,
  PiggyBank,
  Clock3,
  CircleCheckBig,
  Ban,
  Archive,
  AlertTriangle,
  Gift,
  Calendar,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import type { ComboboxOption } from "@/components/ui/SearchableSelect";

type Order = {
  id: string;
  orderExternalId: string;
  itemName: string | null;
  platformName: string;
  customerName: string | null;
  customerId: string | null;
  trackingCode: string | null;
  sourceType: string;
  orderAmount: number;
  commissionAmount: number;
  customerRewardAmount: number;
  systemProfitAmount: number;
  referralBonusDeducted: number;
  referralInfo?: {
    referrerName: string;
    referrerCode: string;
    isPartner: boolean;
    ratePercent: number;
    bonusAmount: number;
  } | null;
  orderStatus: string;
  payoutStatus: string;
  orderedAt: string | null;
  completedAt: string | null;
  clawbackWarning: boolean;
};

type Props = {
  orders: Order[];
  customers: ComboboxOption[];
  totalPages: number;
  currentPage: number;
  totalItems?: number;
  pageSize?: number;
  counts: { all: number; unassigned: number; assigned: number; pending: number; processing: number; moneyIn: number; unpaid: number; paid: number; cancelled: number; completed: number; clawback: number; referral: number };
  sums: { orderAmount: number; commissionAmount: number; customerRewardAmount: number; systemProfitAmount: number; referralBonusDeductedTotal: number; moneyInTotal: number; unpaidTotal: number };
};

const orderStatusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "🕐 Đang đối soát",
  completed: "🗄️ Dữ liệu cũ — cần re-import",
  approved: "💰 Tiền đã về",
  cancelled: "Đã huỷ",
  rejected: "Từ chối",
  clawback: "Clawback",
};

const orderStatusTone: Record<string, "positive" | "negative" | "warning" | "neutral" | "info"> = {
  pending: "warning",
  processing: "warning",
  completed: "info",
  approved: "positive",
  cancelled: "negative",
  rejected: "negative",
  clawback: "negative",
};

const payoutStatusLabel: Record<string, string> = {
  unpaid: "Chưa trả khách",
  paid: "✅ Đã trả khách",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminOrdersClient({
  orders,
  customers,
  totalPages,
  currentPage,
  counts,
  sums,
  totalItems,
  pageSize = 10,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";
  const currentPeriod = searchParams.get("period") || "all";
  const currentYear = searchParams.get("year") || new Date().getFullYear().toString();
  const currentMonth = searchParams.get("month") || (new Date().getMonth() + 1).toString();
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePeriodChange = (
    newPeriod: string,
    extraParams?: { year?: string; month?: string; startDate?: string; endDate?: string }
  ) => {
    const params = new URLSearchParams(searchParams);
    if (newPeriod === "all") {
      params.delete("period");
      params.delete("year");
      params.delete("month");
      params.delete("startDate");
      params.delete("endDate");
    } else {
      params.set("period", newPeriod);
      if (extraParams?.year !== undefined) {
        if (extraParams.year) params.set("year", extraParams.year);
        else params.delete("year");
      }
      if (extraParams?.month !== undefined) {
        if (extraParams.month) params.set("month", extraParams.month);
        else params.delete("month");
      }
      if (extraParams?.startDate !== undefined) {
        if (extraParams.startDate) params.set("startDate", extraParams.startDate);
        else params.delete("startDate");
      }
      if (extraParams?.endDate !== undefined) {
        if (extraParams.endDate) params.set("endDate", extraParams.endDate);
        else params.delete("endDate");
      }
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* REDESIGNED FILTER PANEL */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white border border-neutral-200/80 p-5 shadow-xs">
        
        {/* HÀNG 1: Phân Loại Gán Khách & Tìm Kiếm */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Nhóm Gán Khách - Segmented Control Responsive Grid */}
          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/60 w-full">
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all leading-tight ${
                  currentTab === "all"
                    ? "bg-white text-neutral-900 shadow-xs scale-[1.02]"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <LayoutGrid size={13} className={currentTab === "all" ? "text-neutral-900 shrink-0" : "text-neutral-400 shrink-0"} />
                <span className="truncate">Tất cả</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black shrink-0 ${
                  currentTab === "all" ? "bg-neutral-900 text-white" : "bg-neutral-200/80 text-neutral-600"
                }`}>
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("assigned")}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all leading-tight ${
                  currentTab === "assigned"
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20 scale-[1.02]"
                    : "text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50/60"
                }`}
              >
                <UserRoundCheck size={13} className={currentTab === "assigned" ? "text-white shrink-0" : "text-emerald-500 shrink-0"} />
                <span className="truncate">Đã map</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black shrink-0 ${
                  currentTab === "assigned" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {counts.assigned}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("unassigned")}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all leading-tight ${
                  currentTab === "unassigned"
                    ? "bg-rose-500 text-white shadow-xs shadow-rose-500/20 scale-[1.02]"
                    : counts.unassigned > 0
                    ? "text-rose-700 bg-rose-50 border border-rose-200/60 hover:bg-rose-100/70"
                    : "text-neutral-600 hover:text-rose-600"
                }`}
              >
                <UserRoundX size={13} className={currentTab === "unassigned" ? "text-white shrink-0" : "text-rose-500 shrink-0"} />
                <span className="truncate">Chưa map</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black shrink-0 ${
                  currentTab === "unassigned" ? "bg-white/20 text-white" : "bg-rose-200/80 text-rose-900"
                }`}>
                  {counts.unassigned}
                </span>
              </button>
            </div>
          </div>

          {/* Ô Tìm Kiếm Nhanh */}
          <div className="w-full lg:w-96">
            <ServerSearchInput placeholder="Tìm mã đơn, sản phẩm, tên khách hoặc tracking..." />
          </div>
        </div>

        {/* HÀNG LỌC THEO THỜI GIAN (Năm, Tháng, Tuần, Ngày) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-neutral-50/90 p-3 rounded-2xl border border-neutral-200/70">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
              <Calendar size={14} className="shrink-0" />
            </div>
            <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Thời gian:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => handlePeriodChange("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "all"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("today")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "today"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "week"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Tuần này
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("month", { month: currentMonth, year: currentYear })}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "month"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("year", { year: currentYear })}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "year"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Theo năm
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("custom_range")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                currentPeriod === "custom_range"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Khoảng ngày
            </button>
          </div>

          {/* CONTROLS BỔ SUNG CHO THEO THÁNG / THEO NĂM / KHOẢNG NGÀY */}
          {currentPeriod === "month" && (
            <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-neutral-200 shadow-xs">
              <select
                value={currentMonth}
                onChange={(e) => handlePeriodChange("month", { month: e.target.value, year: currentYear })}
                className="text-xs font-black text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              <span className="text-neutral-300 font-bold">/</span>
              <select
                value={currentYear}
                onChange={(e) => handlePeriodChange("month", { month: currentMonth, year: e.target.value })}
                className="text-xs font-black text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
          )}

          {currentPeriod === "year" && (
            <div className="flex items-center gap-1.5 shrink-0 bg-white px-3 py-1 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-400 font-bold">Năm:</span>
              <select
                value={currentYear}
                onChange={(e) => handlePeriodChange("year", { year: e.target.value })}
                className="text-xs font-black text-neutral-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {currentPeriod === "custom_range" && (
            <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-neutral-200 shadow-xs">
              <input
                type="date"
                value={currentStartDate}
                onChange={(e) => handlePeriodChange("custom_range", { startDate: e.target.value, endDate: currentEndDate })}
                className="text-xs font-bold text-neutral-900 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200 focus:outline-none"
              />
              <span className="text-xs text-neutral-400 font-bold px-0.5">đến</span>
              <input
                type="date"
                value={currentEndDate}
                onChange={(e) => handlePeriodChange("custom_range", { startDate: currentStartDate, endDate: e.target.value })}
                className="text-xs font-bold text-neutral-900 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Đường phân cách nhẹ */}
        <div className="h-px w-full bg-neutral-100" />

        {/* HÀNG 2: Bố Cục Lưới 2 Cột Trên Mobile (Không Cần Lướt Ngang) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2 w-full">
          <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả đơn" count={counts.all} icon={LayoutGrid} />
          <TabButton active={currentTab === "pending"} onClick={() => handleTabChange("pending")} label="Chờ xác nhận" count={counts.pending} icon={Hourglass} />
          {counts.processing > 0 && (
            <TabButton active={currentTab === "processing"} onClick={() => handleTabChange("processing")} label="Đang đối soát" count={counts.processing} icon={ScanSearch} highlight />
          )}
          <TabButton active={currentTab === "money_in"} onClick={() => handleTabChange("money_in")} label="Tiền đã về" count={counts.moneyIn} icon={PiggyBank} />
          <TabButton active={currentTab === "unpaid"} onClick={() => handleTabChange("unpaid")} label="Chưa trả khách" count={counts.unpaid} icon={Clock3} />
          <TabButton active={currentTab === "paid"} onClick={() => handleTabChange("paid")} label="Đã trả khách" count={counts.paid} icon={CircleCheckBig} />
          <TabButton active={currentTab === "cancelled"} onClick={() => handleTabChange("cancelled")} label="Đã huỷ" count={counts.cancelled} icon={Ban} />
          {counts.completed > 0 && (
            <TabButton active={currentTab === "completed"} onClick={() => handleTabChange("completed")} label="Dữ liệu cũ" count={counts.completed} icon={Archive} highlight />
          )}
          {counts.clawback > 0 && (
            <TabButton active={currentTab === "clawback"} onClick={() => handleTabChange("clawback")} label="Clawback" count={counts.clawback} icon={AlertTriangle} highlight />
          )}
          {counts.referral > 0 && (
            <TabButton active={currentTab === "referral"} onClick={() => handleTabChange("referral")} label="🎁 Giới thiệu" count={counts.referral} icon={Gift} />
          )}
        </div>
      </div>

      {/* INFO BANNER PER TAB */}
      {currentTab === "pending" && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
          <img src="/meow-back-mascot.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Shopee <strong>chưa xác nhận</strong> sản phẩm nào trong đơn là "Hoàn thành" hay "Đã huỷ" — số tiền hiển thị chỉ là ước tính,
            có thể thay đổi khi <strong>import lại CSV mới</strong> sau khi Shopee cập nhật trạng thái.
          </p>
        </div>
      )}
      {currentTab === "cancelled" && (
        <div className="flex items-start gap-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4">
          <img src="/meow-back-mascot.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-rose-800 font-medium leading-relaxed">
            Shopee báo <strong>tất cả sản phẩm trong đơn đều bị huỷ</strong> (khách huỷ đơn hoặc trả hàng trước khi được duyệt) — không tính hoa hồng.
            Đơn đã duyệt rồi mới bị huỷ nằm ở tab <strong>⚠️ Clawback</strong> riêng.
          </p>
        </div>
      )}
      {currentTab === "completed" && (
        <div className="flex items-start gap-3 bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4">
          <img src="/meow-back-voucher.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-sky-800 font-medium leading-relaxed">
            Đây là đơn được import <strong>trước khi hệ thống sửa lại logic đọc CSV</strong> nên còn kẹt ở trạng thái cũ.
            <strong> Import lại đúng file CSV đã dùng cho các đơn này</strong> để hệ thống tự phân loại lại chính xác.
          </p>
        </div>
      )}
      {currentTab === "processing" && (
        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
          <img src="/meow-back-analytics.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Shopee đã báo <strong>"Hoàn thành"</strong> nhưng hoa hồng còn trong thời gian đối soát — hệ thống tính là
            <strong> "💰 Tiền đã về"</strong> sau <strong>15 ngày kể từ ngày hoàn thành</strong>.
          </p>
        </div>
      )}
      {currentTab === "money_in" && (
        <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4">
          <img src="/meow-back-quick-link.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-emerald-800 font-medium leading-relaxed">
            Toàn bộ đơn ở đây <strong>Shopee đã duyệt và trả hoa hồng thật cho bạn</strong>.
            Xem riêng phần <strong>chưa trả khách</strong> hay <strong>đã trả khách</strong> tại 2 tab bên cạnh.
          </p>
        </div>
      )}
      {currentTab === "unpaid" && (
        <div className="flex items-start gap-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4">
          <img src="/meow-back-mascot.png" alt="" className="h-6 w-6 object-contain shrink-0 rounded-lg" />
          <p className="text-xs text-rose-800 font-medium leading-relaxed">
            Tiền Shopee đã về (approved) nhưng <strong>bạn chưa chuyển cho khách</strong>. Vào trang <strong>Thanh toán</strong> để tạo phiếu chi cho khách.
          </p>
        </div>
      )}
      {currentTab === "referral" && (
        <div className="flex items-start gap-3 bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4">
          <span className="text-xl leading-none">🎁</span>
          <p className="text-xs text-purple-800 font-medium leading-relaxed">
            Hoa hồng giới thiệu tự động sinh khi đơn của F1 được duyệt. Số tiền trích từ phần hệ thống giữ và cộng trực tiếp vào ví người giới thiệu.
          </p>
        </div>
      )}

      {/* COMPACT TABLE WITH SUMMARY */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden flex flex-col w-full">

        {/* Summary Header Matrix */}
        <div className="bg-gradient-to-r from-rose-50/60 via-neutral-50 to-white border-b border-neutral-200/70 p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1 whitespace-nowrap">Giá Trị Đơn</span>
            <span className="text-base font-black text-neutral-900 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.orderAmount)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1 whitespace-nowrap">HH Trước Thuế</span>
            <span className="text-base font-black text-neutral-700 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.commissionAmount)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1 whitespace-nowrap">💰 Tiền Đã Về</span>
            <span className="text-base font-black text-emerald-700 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.moneyInTotal)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider mb-1 whitespace-nowrap">Tổng Hoàn Khách</span>
            <span className="text-base font-black text-rose-600 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.customerRewardAmount)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1 whitespace-nowrap">Admin Lợi Nhuận</span>
            <span className="text-base font-black text-neutral-700 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.systemProfitAmount)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider mb-1 whitespace-nowrap">🎁 Trích Giới Thiệu</span>
            <span className="text-base font-black text-purple-600 leading-none tabular-nums whitespace-nowrap">
              {formatCurrency(sums.referralBonusDeductedTotal)}
            </span>
          </div>
        </div>

        <div className="responsive-table overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1360px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80">
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] whitespace-nowrap">Đơn hàng / Tracking</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] whitespace-nowrap min-w-[140px]">Khách hàng</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] whitespace-nowrap">Thời Gian</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] text-right whitespace-nowrap">Giá trị đơn</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] text-right whitespace-nowrap">HH Trước Thuế</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-rose-600 text-[10px] text-right whitespace-nowrap">Tiền Hoàn / Giữ Lại</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-purple-600 text-[10px] text-right whitespace-nowrap">Trích Giới Thiệu</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] whitespace-nowrap w-[150px]">Trạng thái</th>
                <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] whitespace-nowrap min-w-[320px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
                        <img src="/logo-200.png" alt="MeowBack Orders" className="h-full w-full object-contain rounded-lg" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">Không tìm thấy đơn hàng nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className={`border-b border-neutral-100 transition-colors ${o.orderStatus === "clawback" ? "bg-rose-50/50" : o.sourceType === "referral" ? "bg-purple-50/40" : o.clawbackWarning ? "bg-amber-50/40" : "hover:bg-rose-50/20"}`}>
                    {/* Order Info */}
                    <td className="px-4 py-3" data-label="Đơn hàng / Tracking">
                      <div className="flex flex-col items-end sm:items-start text-right sm:text-left min-w-0 flex-1 overflow-hidden">
                        <div className="font-mono font-bold text-neutral-900 flex items-center justify-end sm:justify-start gap-1.5 text-xs truncate max-w-full">
                          {o.clawbackWarning && (
                            <span title="Quá 15 ngày — kiểm tra Shopee đã thanh toán chưa">
                              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                            </span>
                          )}
                          <span className="truncate">{o.orderExternalId}</span>
                        </div>
                        {o.itemName && (
                          <div className="mt-0.5 max-w-[180px] sm:max-w-[260px] truncate text-[11px] font-medium text-neutral-600" title={o.itemName}>
                            {o.itemName}
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-end sm:justify-start gap-1.5 flex-wrap max-w-full">
                          {o.sourceType === "referral" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9px] font-black text-purple-700 shrink-0">
                              🎁 Hoa hồng GT
                            </span>
                          ) : (
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-black text-neutral-600 uppercase shrink-0">{o.platformName}</span>
                          )}
                          <span className="font-mono text-[10px] text-neutral-400 truncate max-w-[120px] sm:max-w-none">{o.trackingCode || "No tracking"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 whitespace-nowrap" data-label="Khách hàng">
                      {o.customerName ? (
                        <span className="font-extrabold text-neutral-900 whitespace-nowrap">{o.customerName}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600 border border-rose-200 whitespace-nowrap shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" /> Chưa map
                        </span>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3" data-label="Thời Gian">
                      <div className="text-[10px] text-neutral-500 font-medium space-y-0.5">
                        <div><span className="font-bold text-neutral-400 mr-1">ĐH:</span>{formatDate(o.orderedAt)}</div>
                        <div><span className="font-bold text-neutral-400 mr-1">HT:</span>{formatDate(o.completedAt)}</div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-semibold text-neutral-700 tabular-nums" data-label="Giá trị đơn">
                      {formatCurrency(o.orderAmount)}
                    </td>

                    {/* Hoa hồng trước thuế */}
                    <td className="px-4 py-3 text-right font-medium text-neutral-500 tabular-nums" data-label="HH Trước Thuế">
                      {formatCurrency(o.commissionAmount)}
                    </td>

                    {/* Commissions */}
                    <td className="px-4 py-3 text-right" data-label="Tiền Hoàn / Giữ Lại">
                      <div className={`font-black text-xs tabular-nums ${o.customerRewardAmount < 0 ? "text-rose-600" : "text-rose-600"}`}>
                        {formatCurrency(o.customerRewardAmount)}
                      </div>
                      <div className="text-[10px] font-medium text-neutral-400 mt-0.5 tabular-nums">
                        Giữ: {formatCurrency(o.systemProfitAmount)}
                      </div>
                      {o.referralBonusDeducted > 0 && (
                        <div
                          className="mt-1 inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[9px] font-black text-purple-700 border border-purple-100"
                          title="Số tiền trích từ phần hệ thống giữ trả người giới thiệu"
                        >
                          🎁 -{formatCurrency(o.referralBonusDeducted)} cho GT
                        </div>
                      )}
                    </td>

                    {/* Trích Giới Thiệu */}
                    <td className="px-4 py-3 text-right" data-label="Trích Giới Thiệu">
                      {o.sourceType === "referral" ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-black text-xs tabular-nums text-purple-600">
                            +{formatCurrency(o.customerRewardAmount)}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-black bg-purple-100 text-purple-700">
                            🎁 Đơn nhận thưởng
                          </span>
                        </div>
                      ) : o.referralInfo ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="font-black text-xs tabular-nums text-purple-600">
                            {o.referralInfo.bonusAmount > 0
                              ? `+${formatCurrency(o.referralInfo.bonusAmount)}`
                              : "0đ"}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-black text-[9.5px] bg-purple-100 text-purple-800 border border-purple-200">
                              {o.referralInfo.ratePercent}%
                            </span>
                            {o.referralInfo.isPartner && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-black text-[8.5px] bg-amber-100 text-amber-900 border border-amber-200"
                                title="Đối tác hệ thống"
                              >
                                ⭐ Đối tác
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[10.5px] font-bold text-neutral-700 max-w-[140px] truncate"
                            title={`Người GT: ${o.referralInfo.referrerName} (${o.referralInfo.referrerCode})`}
                          >
                            {o.referralInfo.referrerName}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] text-neutral-400 font-semibold" title="Không có người giới thiệu">
                            —
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Statuses */}
                    <td className="px-4 py-3" data-label="Trạng thái">
                      <div className="flex flex-wrap items-center justify-end gap-1 sm:justify-start">
                        <Badge tone={orderStatusTone[o.orderStatus] ?? "neutral"} dot>
                          {orderStatusLabel[o.orderStatus] ?? o.orderStatus}
                        </Badge>
                        {o.customerId ? (
                          <Badge tone={o.payoutStatus === "paid" ? "positive" : "neutral"}>
                            {payoutStatusLabel[o.payoutStatus] ?? o.payoutStatus}
                          </Badge>
                        ) : (
                          <Badge tone="warning">
                            Chưa gán khách
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" data-label="Thao tác">
                      <OrderActions
                        orderId={o.id}
                        orderStatus={o.orderStatus}
                        payoutStatus={o.payoutStatus}
                        hasCustomer={Boolean(o.customerId)}
                        customers={customers}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalItems={totalItems ?? counts.all}
          pageSize={pageSize}
          itemName="đơn hàng"
          showSinglePage={true}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon: Icon, highlight }: { active: boolean; onClick: () => void; label: string; count: number; icon?: LucideIcon; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 md:h-9 w-full md:w-auto shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-extrabold transition-all ${
        active
          ? "bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-sm scale-[1.02]"
          : highlight
          ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          : "bg-white text-neutral-600 border border-neutral-200/70 hover:bg-rose-50/60 hover:text-neutral-900"
      }`}
    >
      {Icon && <Icon size={14} strokeWidth={2.2} className="shrink-0" />}
      <span className="truncate">{label}</span>
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black shrink-0 ${
        active ? "bg-white/20 text-white" : highlight ? "bg-amber-200 text-amber-900" : "bg-neutral-100 text-neutral-600"
      }`}>
        {count}
      </span>
    </button>
  );
}

