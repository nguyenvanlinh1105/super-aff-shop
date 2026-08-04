"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Copy, Check, QrCode, X, ChevronRight, Star } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";

type Props = {
  customerCode: string;
  qrDataUrl: string;
  referralRate: number;
  maxReferralOrders: number;
  referralValidityMonths: number;
  isPartner: boolean;
};

export function InviteSection({
  customerCode,
  qrDataUrl,
  referralRate,
  maxReferralOrders,
  referralValidityMonths,
  isPartner,
}: Props) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const referralPercent = Math.round(referralRate * 1000) / 10;

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/register?ref=${customerCode}`);
    setMounted(true);
  }, [customerCode]);

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 flex-1 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="mb-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <IconBow className="w-5 h-5 text-accent-bow shrink-0" />
          <h2 className="text-[15px] font-extrabold text-neutral-900 whitespace-nowrap">Mời bạn bè 🎀</h2>
        </div>
        <Link
          href="/app/referral"
          className="flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-primary-500 hover:text-primary-600 transition-colors whitespace-nowrap"
        >
          Xem chi tiết
          <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <p className="text-[13px] text-neutral-600 mb-3 leading-relaxed font-medium">
        {isPartner ? (
          <>
            Bạn là <span className="font-bold text-[#2D8A56]">🤝 Đối tác</span> — nhận{" "}
            <span className="font-bold text-primary-500">{referralPercent}% hoa hồng</span> trên{" "}
            <strong>tất cả</strong> đơn hàng của mỗi người bạn mời!
          </>
        ) : (
          <>
            Mời bạn bè tham gia MeowBack và nhận{" "}
            <span className="font-bold text-primary-500">{referralPercent}% hoa hồng</span> từ{" "}
            {maxReferralOrders} đơn hàng đầu tiên của bạn bè!
          </>
        )}
      </p>

      {/* Stars + badge */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
        ))}
        <span className="text-[11px] font-semibold text-neutral-500 ml-1">
          {isPartner ? `${referralPercent}% hoa hồng / không giới hạn` : `${referralPercent}% / ${maxReferralOrders} đơn đầu tiên`}
        </span>
      </div>

      {/* Link display */}
      {inviteUrl && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary-50 border border-primary-100 p-2.5">
          <span className="flex-1 truncate text-[12px] font-bold text-neutral-700 px-2">
            {inviteUrl}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        <button
          onClick={handleCopy}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 px-4 text-[13px] font-bold whitespace-nowrap transition-all ${
            copied
              ? "bg-[#2D8A56] text-white shadow-sm"
              : "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute hover:shadow-cute-lg"
          }`}
        >
          {copied ? (
            <>
              <Check size={15} strokeWidth={2.5} className="shrink-0" />
              Đã sao chép 🎀
            </>
          ) : (
            <>
              <Copy size={15} strokeWidth={2} className="shrink-0" />
              Copy link 🐾
            </>
          )}
        </button>

        <button
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-1 rounded-full bg-primary-100 px-5 py-2.5 text-[13px] font-bold text-primary-600 hover:bg-primary-200 whitespace-nowrap transition-all shrink-0"
          title="Xem mã QR"
        >
          <QrCode size={16} strokeWidth={2} className="shrink-0" />
          QR
        </button>
      </div>

      {/* QR Modal */}
      {showQR && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md" />
          <div
            className="relative w-full max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-300 to-pink-200" />
              <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative px-6 pt-6 pb-5 text-center">
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white/80 hover:bg-white/30 hover:text-white transition-all"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
                <div className="h-16 w-16 rounded-full overflow-hidden bg-white mx-auto mb-3 shadow-lg shadow-primary-500/20">
                  <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="h-full w-full object-cover" />
                </div>
                <h3 className="text-[18px] font-extrabold text-white drop-shadow-sm">
                  Mã QR giới thiệu
                </h3>
                <p className="text-[12px] font-medium text-white/80 mt-0.5">
                  Cho bạn bè quét để đăng ký MeowBack ngay
                </p>
              </div>
            </div>

            {/* QR Code section */}
            <div className="flex flex-col items-center px-6 pt-5 pb-6 gap-4">
              {/* QR Frame with decorative border */}
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-primary-300 via-primary-200 to-pink-200 shadow-lg shadow-primary-200/40">
                <div className="rounded-xl bg-white p-3">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code giới thiệu"
                      className="h-48 w-48 object-contain"
                    />
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center text-neutral-300">
                      <QrCode size={80} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>

              {/* Link display */}
              <div className="w-full rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50 px-4 py-3 text-center border border-primary-100/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">Link giới thiệu của bạn</p>
                <p className="text-[12px] font-bold text-primary-600 break-all leading-relaxed">
                  {inviteUrl}
                </p>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold transition-all ${
                  copied
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Đã sao chép! ✅
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2} />
                    Sao chép link giới thiệu 🎀
                  </>
                )}
              </button>

              <p className="text-[11px] text-neutral-400 font-medium text-center">
                Chia sẻ link hoặc mã QR cho bạn bè qua Zalo, Facebook, Messenger...
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

