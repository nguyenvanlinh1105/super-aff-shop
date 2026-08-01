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
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white shadow-cute-lg fade-in border border-primary-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="relative overflow-hidden p-6 text-center bg-gradient-to-b from-primary-100 to-primary-50"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                🐱
              </div>
              <h3 className="text-[17px] font-extrabold text-neutral-900">
                Mã QR MeowBack 🎀
              </h3>
              <p className="text-[12px] font-medium text-neutral-500 mt-0.5">
                Cho bạn bè quét để đăng ký ngay
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center p-6 gap-4">
              <div className="p-3 rounded-2xl bg-white shadow-inner border border-primary-100">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code giới thiệu"
                    className="h-44 w-44 object-contain"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center text-neutral-300">
                    <QrCode size={80} strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="w-full rounded-2xl bg-primary-50 px-3 py-2 text-center border border-primary-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">Link giới thiệu của bạn</p>
                <p className="text-[12px] font-bold text-primary-600 break-all">
                  {inviteUrl}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-bold transition-all ${
                  copied
                    ? "bg-[#2D8A56] text-white"
                    : "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy size={16} strokeWidth={2} />
                    Sao chép link 🎀
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

