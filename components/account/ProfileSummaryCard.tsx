"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, X, ArrowRight, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

export interface ProfileSummaryCardProps {
  customer: {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    isPartner: boolean;
    partnerRatePercent?: number;
    partnerPeriodText?: string;
    partnerRatePeriods?: Array<{
      id: string;
      rate: number;
      startsAt: string;
      endsAt: string | null;
      note: string | null;
    }>;
    hasPaymentPin?: boolean;
    hasBankInfo?: boolean;
    hasTelegram?: boolean;
    phone?: string | null;
  };
}

export function ProfileSummaryCard({ customer }: ProfileSummaryCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  const memberCode = `MB-${customer.id.substring(0, 8).toUpperCase()}`;
  const effectivePercent = customer.partnerRatePercent ?? (customer.isPartner ? 10 : 5);
  const periodText = customer.partnerPeriodText || "Trọn đời (Vô thời hạn)";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(memberCode);
      setCopied(true);
      toast.success(`Đã sao chép mã thành viên ${memberCode}! 🎀`, "Sao chép thành công");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép mã thành viên.");
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-primary-100/90 shadow-cute relative overflow-hidden flex flex-col transition-all">
        {/* ── Top Header Bar (Gọn gàng & Xinh xắn) ── */}
        <div className="bg-gradient-to-r from-primary-400 via-[#FF5E8E] to-primary-500 p-4 sm:p-5 text-white relative overflow-hidden">
          {/* Họa tiết trang trí nền */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-xs pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-xs pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Tên & Huy hiệu AI */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-md shadow-pink-900/10 shrink-0 border border-white/80 overflow-hidden flex items-center justify-center">
                {customer.isPartner ? (
                  <img
                    src="/partner_gold_badge.jpg"
                    alt="Đối Tác VIP"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src="/member_pink_badge.jpg"
                    alt="Thành Viên MeowBack"
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black tracking-tight truncate leading-tight text-white drop-shadow-xs">
                    {customer.fullName || "Khách hàng MeowBack"}
                  </h3>
                </div>
                <p className="text-[11.5px] sm:text-xs text-white/90 font-medium truncate mt-0.5">
                  {customer.email}
                </p>
              </div>
            </div>

            {/* Badge Đối tác / Thành viên */}
            <div className="shrink-0">
              {customer.isPartner ? (
                <button
                  type="button"
                  onClick={() => setShowBenefitsModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-[11px] uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-200"
                  title="Bấm để xem quyền lợi đối tác"
                >
                  <img src="/partner_gold_badge.jpg" alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>⭐ ĐỐI TÁC</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-primary-700 font-black text-[11px] uppercase tracking-wider shadow-sm border border-white/60">
                  <img src="/member_pink_badge.jpg" alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>THÀNH VIÊN</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Body Card (Bỏ avatar to, cực kỳ gọn và tiện ích) ── */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Dòng mã ID & Ngày tham gia */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-neutral-50/90 rounded-2xl p-2.5 sm:px-3 border border-neutral-100">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white text-neutral-700 hover:text-primary-600 text-xs font-bold transition-all border border-neutral-200/80 shadow-2xs cursor-pointer group"
              title="Bấm để sao chép mã thành viên"
            >
              <span className="text-[11px] text-neutral-400 font-semibold">Mã ID:</span>
              <span className="font-mono font-black text-neutral-800 group-hover:text-primary-600">
                {memberCode}
              </span>
              {copied ? (
                <Check size={12} className="text-emerald-600 shrink-0" />
              ) : (
                <Copy size={12} className="text-neutral-400 group-hover:text-primary-500 shrink-0" />
              )}
            </button>

            <span className="text-[11px] text-neutral-500 font-semibold">
              Gia nhập: <strong className="text-neutral-700">{formatDate(customer.createdAt)}</strong>
            </span>
          </div>

          {/* ── KHỐI QUYỀN LỢI ĐỐI TÁC (CHỈ HIỂN THỊ KHI LÀ ĐỐI TÁC) ── */}
          {customer.isPartner && (
            <div
              onClick={() => setShowBenefitsModal(true)}
              className="group rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50/70 to-amber-50/90 border border-amber-200/90 p-3 sm:p-3.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer relative overflow-hidden"
              title="Bấm để xem chi tiết quyền lợi đối tác"
            >
              {/* Dòng trên: Tiêu đề & Nút xem quyền lợi */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white p-0.5 border border-amber-200 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src="/partner_benefits_gift.jpg"
                      alt="Quyền Lợi Đối Tác"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-950">
                    Quyền Lợi Đối Tác
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBenefitsModal(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-black shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Xem quyền lợi</span>
                  <ArrowRight size={11} strokeWidth={2.5} />
                </button>
              </div>

              {/* Dòng dưới: % Hoa hồng to rõ & Thời gian hiệu lực trọn vẹn */}
              <div className="pt-1.5 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight tabular-nums">
                    +{effectivePercent}%
                  </span>
                  <span className="text-xs font-extrabold text-neutral-800">
                    hoa hồng trích từ mỗi đơn bạn bè
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-amber-900/90 flex items-center gap-1">
                  <span>📅</span>
                  <span className="font-bold">{periodText}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Bảng trạng thái tài khoản (Gọn gàng 2 cột, không icon rườm rà) ── */}
          <div className="rounded-2xl bg-neutral-50/70 border border-neutral-100 p-3 sm:p-3.5">
            <div className="text-[10.5px] font-black uppercase tracking-wider text-neutral-400 mb-2 px-0.5">
              Trạng thái xác thực
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Email */}
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-neutral-150 shadow-2xs">
                <span className="text-neutral-600 font-medium text-[11.5px]">Email</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đã xác thực
                </span>
              </div>

              {/* Mã PIN */}
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-neutral-150 shadow-2xs">
                <span className="text-neutral-600 font-medium text-[11.5px]">Mã PIN</span>
                {customer.hasPaymentPin ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Đã bật
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Chưa cài
                  </span>
                )}
              </div>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-neutral-150 shadow-2xs">
                <span className="text-neutral-600 font-medium text-[11.5px]">Ngân hàng</span>
                {customer.hasBankInfo ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Đã liên kết
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    Chưa liên kết
                  </span>
                )}
              </div>

              {/* Telegram */}
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-neutral-150 shadow-2xs">
                <span className="text-neutral-600 font-medium text-[11.5px]">Telegram</span>
                {customer.hasTelegram ? (
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Đã kết nối
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    Chưa kết nối
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Lối tắt tiện ích (Gọn xinh) ── */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <Link
              href="/app/refunds"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-primary-50/70 hover:bg-primary-100 text-primary-900 border border-primary-200/60 transition-all text-center group active:scale-95 shadow-2xs"
            >
              <span className="text-sm">🔗</span>
              <span className="text-[11px] font-bold mt-1 line-clamp-1 group-hover:text-primary-600">Tạo link</span>
            </Link>

            <Link
              href="/app/wallet"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/60 transition-all text-center group active:scale-95 shadow-2xs"
            >
              <span className="text-sm">👛</span>
              <span className="text-[11px] font-bold mt-1 line-clamp-1 group-hover:text-emerald-700">Rút tiền</span>
            </Link>

            <Link
              href="/app/referral"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100 text-purple-950 border border-purple-200/60 transition-all text-center group active:scale-95 shadow-2xs"
            >
              <span className="text-sm">🎁</span>
              <span className="text-[11px] font-bold mt-1 line-clamp-1 group-hover:text-purple-700">Mời bạn</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MODAL POPUP QUYỀN LỢI ĐỐI TÁC (SIÊU GỌN XINH - KHÔNG CẦN CUỘN) ── */}
      {showBenefitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-amber-200/80 animate-in zoom-in-95 duration-200 flex flex-col gap-3.5">
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setShowBenefitsModal(false)}
              className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-all cursor-pointer font-bold"
            >
              <X size={16} />
            </button>

            {/* Header Modal Gọn Xinh */}
            <div className="flex items-center gap-2.5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 p-0.5 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src="/partner_gold_badge.jpg"
                  alt="Đối Tác"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[9.5px] font-black uppercase tracking-wider">
                  Đặc quyền đối tác
                </span>
                <h4 className="text-[15px] font-black text-neutral-900 leading-tight truncate">
                  Quyền Lợi Đối Tác MeowBack
                </h4>
              </div>
            </div>

            {/* Box Tỷ lệ nổi bật Gọn gàng */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50/50 to-amber-50/80 p-3.5 border-2 border-amber-300 shadow-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-extrabold text-amber-900 uppercase tracking-wider block">
                  Tỷ lệ hoa hồng hiện tại
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-rose-600 leading-tight tabular-nums">
                    +{effectivePercent}%
                  </span>
                  <span className="text-[11px] font-bold text-neutral-700">
                    / mỗi đơn bạn bè
                  </span>
                </div>
                <span className="text-[11px] text-amber-900/90 font-medium block mt-0.5">
                  📅 Hiệu lực: <strong className="text-neutral-900">{periodText}</strong>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-xs border border-amber-200 bg-white p-0.5">
                <img
                  src="/partner_benefits_gift.jpg"
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Danh sách 3 đặc quyền súc tích (1 dòng mỗi cái, cực gọn) */}
            <div className="rounded-2xl bg-neutral-50/90 border border-neutral-150 p-2.5 flex flex-col gap-1.5 text-[11.5px]">
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0">♾️</span>
                <span className="text-neutral-700">
                  <strong className="text-neutral-900">Không giới hạn đơn:</strong> Nhận hoa hồng trọn đời
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0">⏳</span>
                <span className="text-neutral-700">
                  <strong className="text-neutral-900">Vô thời hạn:</strong> Tính vĩnh viễn, không chặn 6 tháng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0">💎</span>
                <span className="text-neutral-700">
                  <strong className="text-neutral-900">Ưu đãi linh hoạt:</strong> Tỷ lệ cao theo từng chiến dịch
                </span>
              </div>
            </div>

            {/* Actions Gọn Gàng */}
            <div className="pt-1 flex items-center gap-2">
              <Link
                href="/app/referral"
                onClick={() => setShowBenefitsModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white font-black text-xs sm:text-[13px] shadow-md shadow-primary-500/20 transition-all text-center whitespace-nowrap active:scale-[0.98]"
              >
                <Sparkles size={13} />
                <span>Giới thiệu bạn bè ngay</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowBenefitsModal(false)}
                className="py-2.5 px-3.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
