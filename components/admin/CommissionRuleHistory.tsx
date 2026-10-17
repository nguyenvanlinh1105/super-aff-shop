"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Percent,
  Calendar,
  Gift,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export type CommissionRuleHistoryItem = {
  id: string;
  name: string;
  taxRate: number;
  customerRate: number;
  systemRate: number;
  referralRate: number; // in percent (e.g. 5, 10)
  maxReferralOrders: number;
  referralValidityMonths: number;
  active: boolean;
  createdAt: string; // ISO string
  createdByUser?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

function formatVietnameseDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function getTimeAgo(dateStr: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 30) return `${diffDays} ngày trước`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return `${Math.floor(diffMonths / 12)} năm trước`;
  } catch {
    return "";
  }
}

export function CommissionRuleHistory({
  history,
}: {
  history: CommissionRuleHistoryItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [reapplyingId, setReapplyingId] = useState<string | null>(null);
  const [selectedForReapply, setSelectedForReapply] = useState<CommissionRuleHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("all");

  const filteredHistory = history.filter((item) => {
    if (activeTab === "active") return item.active;
    if (activeTab === "archived") return !item.active;
    return true;
  });

  const handleReapply = async (rule: CommissionRuleHistoryItem) => {
    setReapplyingId(rule.id);
    try {
      const res = await fetch("/api/settings/commission-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxRate: rule.taxRate,
          customerRate: rule.customerRate,
          systemRate: rule.systemRate,
          referralRate: rule.referralRate / 100,
          maxReferralOrders: rule.maxReferralOrders,
          referralValidityMonths: rule.referralValidityMonths,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Không thể áp dụng lại cấu hình này");
      }

      toast.success(
        `Đã kích hoạt lại tỷ lệ: Khách ${rule.customerRate}% / Hệ thống ${rule.systemRate}%! ✨`
      );
      setSelectedForReapply(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi áp dụng lại cấu hình");
    } finally {
      setReapplyingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ─── BANNER GIẢI THÍCH TÍNH TOÀN VẸN LỊCH SỬ ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-sky-500/10 border border-emerald-200/80 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col gap-1 text-xs sm:text-sm">
            <h4 className="font-extrabold text-emerald-950 flex items-center gap-2">
              <span>Cơ chế bảo toàn đơn hàng lịch sử (Point-in-Time Immutability)</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Bảo vệ số liệu
              </span>
            </h4>
            <p className="text-emerald-900/90 leading-relaxed font-medium text-xs">
              Mỗi khi bạn thay đổi tỷ lệ phân bổ ở form trên, <strong>toàn bộ đơn hàng đã phát sinh trong lịch sử HOÀN TOÀN KHÔNG BỊ ẢNH HƯỞNG</strong>.
              Hệ thống lưu cố định số tiền hoàn của khách (<code className="bg-emerald-100/80 text-emerald-950 px-1 py-0.5 rounded font-mono text-[11px]">customer_reward_amount</code>)
              và tiền giữ lại của hệ thống (<code className="bg-emerald-100/80 text-emerald-950 px-1 py-0.5 rounded font-mono text-[11px]">system_profit_amount</code>)
              ngay lúc đơn được tạo. Tỷ lệ mới chỉ áp dụng cho các đơn hàng phát sinh hoặc đối soát từ thời điểm lưu trở đi.
            </p>
          </div>
        </div>
      </div>

      {/* ─── HEADER & TABS LỌC ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-neutral-200/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <History size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
                Lịch Sử Cập Nhật Phân Bổ Hoa Hồng
              </h3>
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                {history.length} bản ghi
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Nhật ký chi tiết các lần cập nhật tỷ lệ chia sẻ hoa hồng và người thực hiện.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-neutral-100/90 p-1 rounded-xl self-start sm:self-auto border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-neutral-900 shadow-2xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Tất cả ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-emerald-600 text-white shadow-2xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Đang áp dụng ({history.filter((h) => h.active).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("archived")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "archived"
                ? "bg-white text-neutral-900 shadow-2xs font-black"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Lịch sử cũ ({history.filter((h) => !h.active).length})
          </button>
        </div>
      </div>

      {/* ─── BẢNG LỊCH SỬ CHO DESKTOP ─── */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50/90 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-600">
              <th className="py-3 px-4">Thời Gian &amp; Phiên Bản</th>
              <th className="py-3 px-4">Người Cập Nhật</th>
              <th className="py-3 px-4 min-w-[200px]">Phân Bổ Hoa Hồng</th>
              <th className="py-3 px-3 text-center">Thuế TNCN</th>
              <th className="py-3 px-4">Referral F1</th>
              <th className="py-3 px-3 text-center">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-medium">
            {filteredHistory.map((item, idx) => {
              // Find older item to compute diff
              const olderItem = history[idx + 1];
              const custDiff = olderItem ? item.customerRate - olderItem.customerRate : 0;
              const timeAgo = getTimeAgo(item.createdAt);

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.active
                      ? "bg-rose-50/20 hover:bg-rose-50/40"
                      : "hover:bg-neutral-50/70"
                  }`}
                >
                  {/* Cột 1: Thời gian */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                        <Clock size={13} className="text-neutral-400 shrink-0" />
                        <span>{formatVietnameseDateTime(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        {timeAgo && <span>{timeAgo}</span>}
                        <span>•</span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          ID: {item.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Người cập nhật */}
                  <td className="py-3.5 px-4">
                    {item.createdByUser ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                          {item.createdByUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight">
                            {item.createdByUser.fullName}
                          </span>
                          <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {item.createdByUser.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-600 text-[11px] font-bold">
                        <User size={12} className="text-neutral-400" />
                        <span>Hệ thống (Mặc định)</span>
                      </div>
                    )}
                  </td>

                  {/* Cột 3: Tỷ lệ phân bổ */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-rose-600 flex items-center gap-1">
                          Khách: {item.customerRate}%
                          {custDiff !== 0 && (
                            <span
                              className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                custDiff > 0
                                  ? "text-emerald-700 bg-emerald-100"
                                  : "text-rose-700 bg-rose-100"
                              }`}
                            >
                              {custDiff > 0 ? `+${custDiff}%` : `${custDiff}%`}
                            </span>
                          )}
                        </span>
                        <span className="text-indigo-600 font-bold">
                          Hệ thống: {item.systemRate}%
                        </span>
                      </div>

                      {/* Visual mini bar */}
                      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden flex shadow-inner border border-neutral-200/50">
                        <div
                          style={{ width: `${item.customerRate}%` }}
                          className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                        />
                        <div
                          style={{ width: `${item.systemRate}%` }}
                          className="bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full ml-0.5"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Cột 4: Thuế TNCN */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
                      {item.taxRate}%
                    </span>
                  </td>

                  {/* Cột 5: Referral F1 */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <div className="font-bold text-neutral-900 flex items-center gap-1">
                        <Gift size={13} className="text-amber-500" />
                        <span>{item.referralRate}%</span>
                        <span className="text-[11px] text-neutral-400 font-normal">/ đơn</span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Max {item.maxReferralOrders} đơn • {item.referralValidityMonths} tháng
                      </span>
                    </div>
                  </td>

                  {/* Cột 6: Trạng thái */}
                  <td className="py-3.5 px-3 text-center">
                    {item.active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Đang áp dụng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-semibold">
                        Lịch sử cũ
                      </span>
                    )}
                  </td>

                  {/* Cột 7: Thao tác */}
                  <td className="py-3.5 px-4 text-right">
                    {item.active ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <Check size={14} />
                        <span>Hiện hành</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedForReapply(item)}
                        disabled={reapplyingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Khôi phục và kích hoạt lại tỷ lệ này"
                      >
                        <RotateCcw size={12} className={reapplyingId === item.id ? "animate-spin" : ""} />
                        <span>Áp dụng lại</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── DANH SÁCH THẺ CHO MOBILE (CARD VIEW) ─── */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredHistory.map((item, idx) => {
          const olderItem = history[idx + 1];
          const custDiff = olderItem ? item.customerRate - olderItem.customerRate : 0;
          const timeAgo = getTimeAgo(item.createdAt);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 flex flex-col gap-3 shadow-2xs transition-all ${
                item.active
                  ? "bg-white border-emerald-300 ring-2 ring-emerald-100"
                  : "bg-white border-neutral-200/80"
              }`}
            >
              {/* Header card: Trạng thái & Thời gian */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Clock size={13} className="text-neutral-400" />
                  <span>{formatVietnameseDateTime(item.createdAt)}</span>
                </div>
                {item.active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Đang áp dụng</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-neutral-400">
                    {timeAgo}
                  </span>
                )}
              </div>

              {/* Progress Bar & Phân bổ */}
              <div className="rounded-xl bg-neutral-50/80 p-3 flex flex-col gap-2 border border-neutral-100">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-rose-600 flex items-center gap-1">
                    Khách: {item.customerRate}%
                    {custDiff !== 0 && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          custDiff > 0
                            ? "text-emerald-700 bg-emerald-100"
                            : "text-rose-700 bg-rose-100"
                        }`}
                      >
                        {custDiff > 0 ? `+${custDiff}%` : `${custDiff}%`}
                      </span>
                    )}
                  </span>
                  <span className="text-indigo-600">Hệ thống: {item.systemRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden flex">
                  <div
                    style={{ width: `${item.customerRate}%` }}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                  />
                  <div
                    style={{ width: `${item.systemRate}%` }}
                    className="bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full ml-0.5"
                  />
                </div>
              </div>

              {/* Chi tiết phụ: Thuế, Referral, Người sửa */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-2 flex flex-col">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Thuế TNCN</span>
                  <span className="font-black text-amber-950 mt-0.5">{item.taxRate}%</span>
                </div>
                <div className="rounded-xl bg-sky-50/60 border border-sky-200/60 p-2 flex flex-col">
                  <span className="text-[10px] font-bold text-sky-800 uppercase">Referral F1</span>
                  <span className="font-black text-sky-950 mt-0.5">
                    {item.referralRate}% ({item.maxReferralOrders} đơn)
                  </span>
                </div>
              </div>

              {/* Footer card: User & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-2">
                <div className="text-[11px] text-neutral-500 truncate">
                  {item.createdByUser ? (
                    <span className="font-medium">Sửa bởi: <b>{item.createdByUser.fullName}</b></span>
                  ) : (
                    <span>Hệ thống mặc định</span>
                  )}
                </div>

                {!item.active && (
                  <button
                    type="button"
                    onClick={() => setSelectedForReapply(item)}
                    disabled={reapplyingId === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw size={12} className={reapplyingId === item.id ? "animate-spin" : ""} />
                    <span>Áp dụng lại</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200/60">
          Không có bản ghi lịch sử nào phù hợp bộ lọc.
        </div>
      )}

      {/* ─── MODAL XÁC NHẬN ÁP DỤNG LẠI (ROLLBACK CONFIRMATION) ─── */}
      {selectedForReapply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <RotateCcw size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  Xác nhận áp dụng lại tỷ lệ này?
                </h3>
                <p className="text-xs text-neutral-500">
                  Thời điểm lưu: {formatVietnameseDateTime(selectedForReapply.createdAt)}
                </p>
              </div>
            </div>

            {/* Chi tiết tỷ lệ chuẩn bị áp dụng */}
            <div className="rounded-2xl bg-neutral-50 border border-neutral-200/80 p-4 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
                <span className="text-neutral-600 font-medium">Khách hàng nhận:</span>
                <span className="font-black text-rose-600 text-sm">{selectedForReapply.customerRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
                <span className="text-neutral-600 font-medium">Hệ thống giữ:</span>
                <span className="font-black text-indigo-600 text-sm">{selectedForReapply.systemRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200/60">
                <span className="text-neutral-600 font-medium">Thuế TNCN khấu trừ:</span>
                <span className="font-black text-amber-800">{selectedForReapply.taxRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 font-medium">Thưởng Referral F1:</span>
                <span className="font-bold text-neutral-900">
                  {selectedForReapply.referralRate}% (Max {selectedForReapply.maxReferralOrders} đơn / {selectedForReapply.referralValidityMonths} tháng)
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-[11.5px] text-sky-950 flex items-start gap-2">
              <Info size={15} className="text-sky-600 shrink-0 mt-0.5" />
              <span>
                Hệ thống sẽ kích hoạt một phiên bản cấu hình mới với các tỷ lệ này. <b>Đơn hàng trong lịch sử vẫn được bảo toàn nguyên vẹn</b>, không bị thay đổi hồi tố.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForReapply(null)}
                disabled={reapplyingId === selectedForReapply.id}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleReapply(selectedForReapply)}
                disabled={reapplyingId === selectedForReapply.id}
                className="px-5 py-2.5 text-xs font-black shadow-md shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                {reapplyingId === selectedForReapply.id ? (
                  <span>Đang áp dụng...</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Xác nhận áp dụng</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
