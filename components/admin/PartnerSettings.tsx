"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Handshake,
  Users,
  UserPlus,
  Check,
  Sparkles,
  AlertCircle,
  Calendar,
  Percent,
  Trash2,
  Plus,
  Clock,
  ShieldCheck,
  Info,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { PARTNER_RATE_PRESETS } from "@/lib/commission";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/CustomSelect";

type Option = { id: string; label: string };
type LinkedCustomer = {
  id: string;
  fullName: string;
  customerCode: string;
  email?: string | null;
  phone?: string | null;
};

export type PartnerRatePeriodDto = {
  id: string;
  rate: number;
  startsAt: string;
  endsAt: string | null;
  note: string | null;
  createdAt: string;
};

export function PartnerSettings({
  customerId,
  isPartner,
  referredBy,
  referredUsers,
  partnerRatePeriods = [],
  customers,
}: {
  customerId: string;
  isPartner: boolean;
  referredBy: LinkedCustomer | null;
  referredUsers: LinkedCustomer[];
  partnerRatePeriods?: PartnerRatePeriodDto[];
  customers: Option[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referrerSelect, setReferrerSelect] = useState(referredBy?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state when referredBy changes after router.refresh()
  useEffect(() => {
    setReferrerSelect(referredBy?.id ?? "");
  }, [referredBy?.id]);

  // Form State cho việc thêm khoảng thời gian áp dụng tỷ lệ mới
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedPercent, setSelectedPercent] = useState<number>(7); // Default 7% như ví dụ của user
  const [startsAt, setStartsAt] = useState<string>(todayStr);
  const [endsAt, setEndsAt] = useState<string>("");
  const [isIndefinite, setIsIndefinite] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [submittingRate, setSubmittingRate] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const res = await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      if ("referredById" in body) {
        setSuccessMsg(body.referredById ? "Đã gán người giới thiệu thành công!" : "Đã chuyển về đăng ký trực tiếp thành công!");
      } else {
        setSuccessMsg("Đã cập nhật trạng thái đối tác thành công!");
      }
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Có lỗi xảy ra khi lưu thiết lập");
    }
  }

  async function handleCreateRatePeriod(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt) {
      setError("Vui lòng chọn ngày bắt đầu áp dụng");
      return;
    }
    if (!isIndefinite && !endsAt) {
      setError("Vui lòng chọn ngày kết thúc hoặc tích chọn 'Áp dụng vô thời hạn'");
      return;
    }
    if (!isIndefinite && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      return;
    }

    setSubmittingRate(true);
    setError(null);
    setSuccessMsg(null);

    const rateDecimal = selectedPercent / 100;
    const res = await fetch(`/api/customers/${customerId}/partner-rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rate: rateDecimal,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: isIndefinite || !endsAt ? null : new Date(endsAt + "T23:59:59").toISOString(),
        note: note.trim() || undefined,
      }),
    });

    setSubmittingRate(false);
    if (res.ok) {
      setNote("");
      setEndsAt("");
      setIsIndefinite(false);
      setSuccessMsg(`Đã thiết lập mức ${selectedPercent}% thành công!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không thể tạo cấu hình tỷ lệ");
    }
  }

  async function handleDeleteRatePeriod(rateId: string) {
    if (!confirm("Bạn có chắc chắn muốn xoá cấu hình tỷ lệ này không?")) return;

    setDeletingId(rateId);
    setError(null);
    const res = await fetch(`/api/customers/${customerId}/partner-rates?rateId=${rateId}`, {
      method: "DELETE",
    });
    setDeletingId(null);
    if (res.ok) {
      setSuccessMsg("Đã xoá cấu hình tỷ lệ.");
      setTimeout(() => setSuccessMsg(null), 3000);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không thể xoá cấu hình này");
    }
  }

  // Phân loại trạng thái của khoảng thời gian
  function getPeriodStatus(p: PartnerRatePeriodDto) {
    const now = new Date();
    const start = new Date(p.startsAt);
    const end = p.endsAt ? new Date(p.endsAt) : null;

    if (now < start) {
      return {
        label: "Sắp áp dụng",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        badge: "bg-amber-400",
      };
    }
    if (end && now > end) {
      return {
        label: "Đã kết thúc",
        color: "bg-neutral-100 text-neutral-500 border-neutral-200",
        badge: "bg-neutral-400",
      };
    }
    return {
      label: "Đang hiệu lực",
      color: "bg-emerald-50 text-emerald-800 border-emerald-300 font-black",
      badge: "bg-emerald-500 animate-pulse",
    };
  }

  function formatDateVi(isoStr: string) {
    const d = new Date(isoStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Tìm tỷ lệ đang có hiệu lực hiện tại (nếu có)
  const currentActivePeriod = partnerRatePeriods.find((p) => {
    const now = new Date();
    const start = new Date(p.startsAt);
    const end = p.endsAt ? new Date(p.endsAt) : null;
    return now >= start && (!end || now <= end);
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Alert Messages */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-extrabold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700 font-black p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 font-extrabold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-700 font-black p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Card 1: Toggle Chế độ Đối tác (Partner) */}
      <div
        className={`rounded-3xl border p-4 sm:p-5.5 transition-all duration-300 ${
          isPartner
            ? "bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border-emerald-300/80 shadow-xs"
            : "bg-white border-neutral-200/80 shadow-xs"
        }`}
      >
        {/* Hàng chính: Icon + Tiêu đề + Badge + Switch luôn nằm trên 1 hàng duy nhất */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl font-black shadow-xs transition-colors ${
                isPartner
                  ? "bg-emerald-500 text-white shadow-emerald-500/25"
                  : "bg-neutral-100 text-neutral-400 border border-neutral-200/80"
              }`}
            >
              <Handshake size={20} strokeWidth={2.4} />
            </div>

            {/* Title & Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight leading-snug">
                  Quyền Đối Tác
                </h3>
                {isPartner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap border border-emerald-200/80">
                    <Sparkles size={10} className="text-emerald-600" />
                    Đang Bật
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">
                    Đang Tắt
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium truncate sm:hidden">
                {isPartner ? "Hoa hồng vĩnh viễn, không giới hạn" : "Bật để cấp quyền đối tác VIP"}
              </p>
            </div>
          </div>

          {/* Toggle Switch: Cố định bên phải cùng hàng trên mobile & desktop */}
          <button
            type="button"
            role="switch"
            aria-checked={isPartner}
            onClick={() => patch({ isPartner: !isPartner })}
            disabled={loading}
            className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              isPartner ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-neutral-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 sm:h-7 sm:w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isPartner ? "translate-x-5 sm:translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Mô tả chi tiết: Trải đều full width bên dưới, thanh thoát và dễ đọc */}
        <div className="mt-3 pt-2.5 border-t border-emerald-100/70 sm:border-neutral-100 flex items-start gap-2">
          <Info size={13} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11.5px] sm:text-xs text-neutral-600 font-medium leading-relaxed">
            Khi bật, mọi khách hàng có <strong>&quot;Người giới thiệu&quot;</strong> trỏ về người này sẽ luôn được tính hoa hồng <strong>vĩnh viễn</strong> trên mọi đơn hàng — không bị giới hạn 5 đơn/người hay 6 tháng như người giới thiệu thông thường.
          </p>
        </div>
      </div>

      {/* Card 2: CẤU HÌNH % HOA HỒNG THEO KHOẢNG THỜI GIAN (CHỈ HIỂN THỊ KHI LÀ ĐỐI TÁC) */}
      {isPartner && (
        <div className="rounded-3xl bg-white border border-emerald-200/90 p-4 sm:p-6 md:p-7 shadow-sm flex flex-col gap-5 sm:gap-6 w-full max-w-full min-w-0 overflow-hidden box-border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 gap-3 w-full min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-500/20 shrink-0">
                <Percent size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight leading-snug">
                  Cấu Hình Tỷ Lệ Hoa Hồng Theo Giai Đoạn
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">
                  Thiết lập % (3%, 5%, 7%, 10%) kèm thời hạn áp dụng
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto shrink-0 max-w-full">
              {currentActivePeriod ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black shadow-2xs max-w-full">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Hiệu lực hiện tại:</span>
                  <strong className="text-sm font-black text-emerald-600 shrink-0">
                    {Math.round(currentActivePeriod.rate * 100)}%
                  </strong>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200 text-xs font-bold max-w-full">
                  <Clock size={13} className="text-neutral-400 shrink-0" />
                  <span>Mặc định hệ thống</span>
                </span>
              )}
            </div>
          </div>

          {/* Form thêm giai đoạn áp dụng tỷ lệ */}
          <form onSubmit={handleCreateRatePeriod} className="rounded-2xl bg-neutral-50/70 p-3.5 sm:p-5 border border-neutral-200/80 flex flex-col gap-4 w-full max-w-full min-w-0 overflow-hidden box-border">
            <div className="flex items-center gap-2 text-xs font-black text-neutral-900 uppercase tracking-wider">
              <Plus size={14} className="text-emerald-600 shrink-0" />
              <span>Thiết Lập Mức % Cho Giai Đoạn Mới</span>
            </div>

            {/* Bước 1: Chọn % với Selection 3%, 5%, 7%, 10% */}
            <div className="w-full min-w-0">
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">
                1. Chọn tỷ lệ hoa hồng đối tác nhận:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full min-w-0">
                {PARTNER_RATE_PRESETS.map((p) => {
                  const active = selectedPercent === p.percent;
                  return (
                    <button
                      key={p.percent}
                      type="button"
                      onClick={() => setSelectedPercent(p.percent)}
                      className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer min-w-0 w-full ${
                        active
                          ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-200"
                          : "border-neutral-200/90 bg-white text-neutral-700 font-extrabold hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black leading-tight">{p.label}</span>
                      <span className="text-[9.5px] sm:text-[10px] text-neutral-400 font-bold mt-0.5 truncate max-w-full">
                        {p.percent === 5 ? "Mặc định cũ" : p.percent === 7 ? "Ưu đãi vừa" : p.percent === 10 ? "VIP tối đa" : "Cơ bản"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bước 2: Chọn khoảng thời gian (startsAt -> endsAt) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-1 w-full min-w-0">
              <div className="w-full min-w-0">
                <label className="block text-xs font-extrabold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-600 shrink-0" />
                  <span>Từ ngày (Bắt đầu áp dụng):</span>
                </label>
                <input
                  type="date"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full max-w-full min-w-0 box-border rounded-xl border border-neutral-200 bg-white px-3 sm:px-3.5 py-2.5 text-xs font-bold text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="w-full min-w-0">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="text-xs font-extrabold text-neutral-700 flex items-center gap-1.5 shrink-0">
                    <Calendar size={13} className="text-emerald-600 shrink-0" />
                    <span>Đến ngày (Kết thúc):</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isIndefinite}
                      onChange={(e) => {
                        setIsIndefinite(e.target.checked);
                        if (e.target.checked) setEndsAt("");
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Vô thời hạn</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={isIndefinite}
                  required={!isIndefinite}
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  placeholder="Chọn ngày kết thúc..."
                  className="w-full max-w-full min-w-0 box-border rounded-xl border border-neutral-200 bg-white px-3 sm:px-3.5 py-2.5 text-xs font-bold text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bước 3: Ghi chú lý do / tên chiến dịch */}
            <div className="w-full min-w-0">
              <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">
                Ghi chú nội bộ (Tùy chọn):
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full min-w-0">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Chiến dịch tháng 10 ưu đãi 7%..."
                  className="w-full min-w-0 flex-1 box-border rounded-xl border border-neutral-200 bg-white px-3 sm:px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={submittingRate}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>{submittingRate ? "Đang lưu..." : `Áp Dụng Mức ${selectedPercent}%`}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Bảng Danh Sách Lịch Sử Hiệu Lực */}
          <div className="w-full min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-neutral-500 shrink-0" />
                <span>Lịch Sử Áp Dụng Tỷ Lệ ({partnerRatePeriods.length})</span>
              </h4>
              <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
                Đơn phát sinh mốc nào sẽ áp dụng đúng tỷ lệ mốc đó
              </span>
            </div>

            {partnerRatePeriods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-5 text-center text-xs text-neutral-400 font-medium">
                Chưa có cấu hình mốc thời gian riêng nào cho đối tác này. Hệ thống sẽ áp dụng tỷ lệ mặc định theo cài đặt chung.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-xs w-full bg-white">
                <table className="w-full text-left border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      <th className="py-3.5 px-4 whitespace-nowrap">Tỷ Lệ</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Khoảng Thời Gian Hiệu Lực</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Trạng Thái</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Ghi Chú</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {partnerRatePeriods.map((p) => {
                      const st = getPeriodStatus(p);
                      const percentVal = Math.round(p.rate * 100);
                      const isDeleting = deletingId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm whitespace-nowrap">
                              {percentVal}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              <span>{formatDateVi(p.startsAt)}</span>
                              <span className="text-neutral-400">→</span>
                              {p.endsAt ? (
                                <span>{formatDateVi(p.endsAt)}</span>
                              ) : (
                                <span className="text-emerald-700 font-bold">Vô thời hạn</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${st.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.badge}`} />
                              <span>{st.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 max-w-[200px] truncate whitespace-nowrap">
                            {p.note || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteRatePeriod(p.id)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-40"
                              title="Xoá khoảng thời gian này"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Chú thích giải thích */}
            <div className="mt-3.5 flex items-start gap-2 text-[11px] sm:text-[11.5px] text-neutral-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <Info size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo toàn tính toán lịch sử:</strong> Đơn hàng phát sinh lúc nào sẽ tính đúng mức % của giai đoạn đó. Đơn cũ <strong>không bị ảnh hưởng</strong> khi đổi tỷ lệ mới.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Người giới thiệu của khách này */}
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-4 sm:p-6 shadow-xs flex flex-col gap-3 w-full max-w-full min-w-0 relative z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
            <UserPlus size={16} className="text-rose-500 shrink-0" />
            <span>Người Giới Thiệu Khách Này:</span>
          </div>
          {referredBy && (
            <span className="text-xs text-neutral-500 font-medium truncate">
              Hiện tại: <strong className="text-rose-600 font-black">{referredBy.fullName}</strong> ({referredBy.customerCode})
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full min-w-0">
          <div className="relative flex-1 min-w-0 w-full">
            <CustomSelect
              value={referrerSelect}
              onChange={setReferrerSelect}
              options={[
                { value: "", label: "— Đăng ký trực tiếp (Không có người giới thiệu) —" },
                ...customers.map((c) => ({
                  value: c.id,
                  label: c.label,
                })),
              ]}
              placeholder="— Đăng ký trực tiếp (Không có người giới thiệu) —"
              className="w-full"
              buttonClassName="bg-neutral-50/80 hover:bg-white text-xs font-extrabold text-neutral-900 border-neutral-200"
              wrapLabels={true}
              searchable={true}
              searchPlaceholder="Tìm theo tên hoặc mã khách hàng..."
              ariaLabel="Người Giới Thiệu Khách Này"
            />
          </div>

          <button
            type="button"
            disabled={loading || referrerSelect === (referredBy?.id ?? "")}
            onClick={() => patch({ referredById: referrerSelect || null })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-900 px-5 py-2.5 sm:py-3 text-xs font-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>{loading ? "Đang lưu..." : "Cập Nhật"}</span>
          </button>
        </div>
      </div>

      {/* Card 4: Danh sách khách đã được gán cho đối tác này (nếu là đối tác) */}
      {isPartner && (
        <div className="rounded-3xl bg-white border border-emerald-200/80 p-4 sm:p-6 shadow-xs flex flex-col gap-4 w-full max-w-full min-w-0 box-border">
          <div className="flex items-center justify-between gap-3 border-b border-emerald-100/60 pb-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 min-w-0">
              <Users size={16} className="text-emerald-600 shrink-0" />
              <span className="truncate sm:whitespace-normal">Khách Hàng Được Gán Cho Đối Tác Này</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 whitespace-nowrap shrink-0">
              {referredUsers.length} khách hàng
            </span>
          </div>

          {referredUsers.length === 0 ? (
            <p className="text-xs text-neutral-400 font-medium py-3 italic text-center">
              Chưa có khách hàng nào được gán cho đối tác này.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-2xs w-full bg-white">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4 whitespace-nowrap">Khách Hàng</th>
                    <th className="py-3 px-4 whitespace-nowrap">Email</th>
                    <th className="py-3 px-4 whitespace-nowrap">Số Điện Thoại</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {referredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors group">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Link
                          href={`/admin/customers/${u.id}`}
                          className="flex items-center gap-2.5 group-hover:text-emerald-700 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            <img src="/logo-200.png" alt="Avatar" className="w-full h-full object-contain rounded-lg" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-xs text-neutral-900 group-hover:text-emerald-700 transition-colors">
                              {u.fullName}
                            </span>
                            <span className="font-mono text-[10.5px] font-bold text-neutral-400">
                              {u.customerCode}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-neutral-600">
                        {u.email ? (
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <Mail size={13} className="text-neutral-400 shrink-0" />
                            <span className="font-semibold text-xs">{u.email}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Chưa liên kết</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-neutral-600">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <Phone size={13} className="text-neutral-400 shrink-0" />
                            <span className="font-semibold font-mono text-[11.5px]">{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/customers/${u.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-emerald-100 text-neutral-700 hover:text-emerald-900 text-[11.5px] font-bold transition-all shadow-2xs"
                        >
                          <span>Hồ sơ</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
