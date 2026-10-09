"use client";

import { useState } from "react";
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
} from "lucide-react";
import { PARTNER_RATE_PRESETS } from "@/lib/commission";

type Option = { id: string; label: string };
type LinkedCustomer = { id: string; fullName: string; customerCode: string };

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
      setSuccessMsg("Đã cập nhật trạng thái đối tác thành công!");
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
    <div className="flex flex-col gap-6">
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
        className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
          isPartner
            ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 shadow-sm"
            : "bg-white border-neutral-200/80 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-xl shadow-xs transition-colors ${
                isPartner
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-neutral-100 text-neutral-500 border border-neutral-200/60"
              }`}
            >
              <Handshake size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Quyền Đối Tác (Partner)</h3>
                {isPartner && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={11} /> Đang Kích Hoạt
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500 font-medium leading-relaxed max-w-2xl">
                Khi kích hoạt, mọi khách hàng có <strong>&quot;Người giới thiệu&quot;</strong> trỏ về người này sẽ luôn được tính hoa hồng giới thiệu <strong>vĩnh viễn</strong> trên mọi đơn hàng — không bị giới hạn 5 đơn/người hay 6 tháng như người giới thiệu thông thường.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPartner}
            onClick={() => patch({ isPartner: !isPartner })}
            disabled={loading}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              isPartner ? "bg-emerald-500" : "bg-neutral-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isPartner ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card 2: CẤU HÌNH % HOA HỒNG THEO KHOẢNG THỜI GIAN (CHỈ HIỂN THỊ KHI LÀ ĐỐI TÁC) */}
      {isPartner && (
        <div className="rounded-3xl bg-white border border-emerald-200/90 p-5 sm:p-7 shadow-sm flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-sm shadow-emerald-500/20">
                <Percent size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Cấu Hình Tỷ Lệ Hoa Hồng Theo Giai Đoạn (Point-in-Time)
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Thiết lập mức % đối tác nhận được (3%, 5%, 7%, 10%) kèm thời hạn bắt đầu &amp; kết thúc
                </p>
              </div>
            </div>

            {currentActivePeriod ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Hiệu lực hiện tại:</span>
                <strong className="text-sm font-black text-emerald-600">
                  {Math.round(currentActivePeriod.rate * 100)}%
                </strong>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200 text-xs font-bold">
                <Clock size={13} className="text-neutral-400" />
                <span>Chưa có lịch riêng (Áp dụng mặc định hệ thống)</span>
              </span>
            )}
          </div>

          {/* Form thêm giai đoạn áp dụng tỷ lệ */}
          <form onSubmit={handleCreateRatePeriod} className="rounded-2xl bg-neutral-50/70 p-4 sm:p-5 border border-neutral-200/80 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-black text-neutral-900 uppercase tracking-wider">
              <Plus size={14} className="text-emerald-600" />
              <span>Thiết Lập Mức % Cho Giai Đoạn Mới</span>
            </div>

            {/* Bước 1: Chọn % với Selection 3%, 5%, 7%, 10% */}
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">
                1. Chọn tỷ lệ hoa hồng đối tác nhận:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PARTNER_RATE_PRESETS.map((p) => {
                  const active = selectedPercent === p.percent;
                  return (
                    <button
                      key={p.percent}
                      type="button"
                      onClick={() => setSelectedPercent(p.percent)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        active
                          ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-200"
                          : "border-neutral-200/90 bg-white text-neutral-700 font-extrabold hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="text-lg font-black leading-tight">{p.label}</span>
                      <span className="text-[10px] text-neutral-400 font-bold mt-0.5">
                        {p.percent === 5 ? "Mặc định cũ" : p.percent === 7 ? "Ưu đãi vừa" : p.percent === 10 ? "VIP tối đa" : "Cơ bản"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bước 2: Chọn khoảng thời gian (startsAt -> endsAt) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-600" />
                  <span>Từ ngày (Bắt đầu áp dụng):</span>
                </label>
                <input
                  type="date"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-bold text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold text-neutral-700 flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-600" />
                    <span>Đến ngày (Kết thúc):</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 cursor-pointer">
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
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-bold text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bước 3: Ghi chú lý do / tên chiến dịch */}
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-1.5">
                Ghi chú nội bộ (Tùy chọn):
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Chiến dịch tháng 10 ưu đãi 7%, Tháng 11 nâng lên 10%..."
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={submittingRate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>{submittingRate ? "Đang lưu..." : `Áp Dụng Mức ${selectedPercent}%`}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Bảng Danh Sách Lịch Sử Hiệu Lực */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-neutral-500" />
                <span>Lịch Sử Áp Dụng Tỷ Lệ Theo Mốc Thời Gian ({partnerRatePeriods.length})</span>
              </h4>
              <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
                Đơn hàng phát sinh thời điểm nào sẽ tự động áp dụng đúng mức % thời điểm đó
              </span>
            </div>

            {partnerRatePeriods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-400 font-medium">
                Chưa có cấu hình mốc thời gian riêng nào cho đối tác này. Hệ thống sẽ áp dụng tỷ lệ mặc định theo cài đặt chung.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                      <th className="py-3 px-4">Tỷ Lệ</th>
                      <th className="py-3 px-4">Khoảng Thời Gian Hiệu Lực</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Ghi Chú</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {partnerRatePeriods.map((p) => {
                      const st = getPeriodStatus(p);
                      const percentVal = Math.round(p.rate * 100);
                      const isDeleting = deletingId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                          {/* Tỷ lệ */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm">
                              {percentVal}%
                            </span>
                          </td>

                          {/* Khoảng thời gian */}
                          <td className="py-3 px-4 font-semibold text-neutral-800">
                            <span>{formatDateVi(p.startsAt)}</span>
                            <span className="text-neutral-400 mx-1.5">→</span>
                            {p.endsAt ? (
                              <span>{formatDateVi(p.endsAt)}</span>
                            ) : (
                              <span className="text-emerald-700 font-bold">Vô thời hạn</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] border ${st.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.badge}`} />
                              <span>{st.label}</span>
                            </span>
                          </td>

                          {/* Ghi chú */}
                          <td className="py-3 px-4 text-neutral-500 max-w-[200px] truncate">
                            {p.note || "—"}
                          </td>

                          {/* Thao tác xoá */}
                          <td className="py-3 px-4 text-right">
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

            {/* Chú thích giải thích chuyên gia IT */}
            <div className="mt-3.5 flex items-start gap-2 text-[11.5px] text-neutral-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <Info size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo toàn tính toán lịch sử:</strong> Khi sang tháng mới bạn đổi tỷ lệ (ví dụ tháng 10 là 7%, tháng 11 là 10%), hệ thống luôn căn cứ theo ngày đơn hàng phát sinh (Order Date) để tính đúng mức % của giai đoạn đó. Đơn hàng cũ của tháng trước hoàn toàn <strong>không bị ảnh hưởng</strong> hay bị tính lại theo tỷ lệ mới.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Người giới thiệu của khách này */}
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
            <UserPlus size={16} className="text-rose-500" />
            <span>Người Giới Thiệu Khách Này:</span>
          </div>
          {referredBy && (
            <span className="text-xs text-neutral-500 font-medium">
              Hiện tại: <strong className="text-rose-600 font-black">{referredBy.fullName}</strong> ({referredBy.customerCode})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[220px]">
            <select
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-xs font-extrabold text-neutral-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer"
              value={referrerSelect}
              onChange={(e) => setReferrerSelect(e.target.value)}
            >
              <option value="">— Đăng ký trực tiếp (Không có người giới thiệu) —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={loading || referrerSelect === (referredBy?.id ?? "")}
            onClick={() => patch({ referredById: referrerSelect || null })}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-900 px-5 py-3 text-xs font-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>{loading ? "Đang lưu..." : "Cập Nhật"}</span>
          </button>
        </div>
      </div>

      {/* Card 4: Danh sách khách đã được gán cho đối tác này (nếu là đối tác) */}
      {isPartner && (
        <div className="rounded-3xl bg-white border border-emerald-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
              <Users size={16} className="text-emerald-600" />
              <span>Khách Hàng Được Gán Cho Đối Tác Này</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              {referredUsers.length} khách hàng
            </span>
          </div>

          {referredUsers.length === 0 ? (
            <p className="text-xs text-neutral-400 font-medium py-2 italic">Chưa có khách hàng nào được gán cho đối tác này.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {referredUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/customers/${u.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200/70 hover:border-emerald-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white p-0.5 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                      <img src="/icon-512.png" alt="MeowBack" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <span className="font-extrabold text-xs text-neutral-800 group-hover:text-emerald-700 transition-colors truncate">
                      {u.fullName}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-neutral-400 group-hover:text-neutral-600 shrink-0 ml-2">
                    {u.customerCode}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
