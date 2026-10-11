"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Copy, Check, QrCode, X, ChevronRight, Gift, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { useToast } from "@/components/ui/Toast";

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
  isPartner,
}: Props) {
  const { toast } = useToast();
  const [inviteUrl, setInviteUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const referralPercent = Math.round(referralRate * 1000) / 10;

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/register?ref=${customerCode}`);
    setMounted(true);
  }, [customerCode]);

  function handleCopyLink() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success("Đã sao chép link giới thiệu của bạn! 🎀", "Đã chép link");
    setTimeout(() => setCopiedLink(false), 2200);
  }

  function handleCopyCode() {
    if (!customerCode) return;
    navigator.clipboard.writeText(customerCode);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã giới thiệu "${customerCode}"! 🎀`, "Đã chép mã");
    setTimeout(() => setCopiedCode(false), 2200);
  }

  function handleCopyMessage() {
    const msg = `Săn sale Shopee & TikTok Shop nhận hoàn tiền tự động cùng MeowBack! Đăng ký qua link của mình để được hoàn tiền nhé:\n${inviteUrl}\n(Mã giới thiệu: ${customerCode})`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    toast.success("Đã sao chép tin nhắn mời kèm link! Dán vào Zalo / Messenger để gửi ngay 💬", "Đã sao chép tin nhắn");
    setTimeout(() => setCopiedMsg(false), 2200);
  }

  function handleDownloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `meowback-referral-${customerCode}.png`;
    a.click();
    toast.success("Đã tải ảnh mã QR về máy 📲", "Đã tải QR");
  }

  return (
    <div className="h-full rounded-3xl bg-gradient-to-b from-white via-primary-50/20 to-white p-4 sm:p-6 shadow-cute border border-primary-200/80 flex flex-col justify-between gap-4">
      {/* ═══ 1. HEADER ═══ */}
      <div>
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-pink-500 text-white shadow-sm shrink-0">
              <Gift size={18} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-primary-500 whitespace-nowrap">Giới thiệu bạn bè</div>
              <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                Nhận {referralPercent}% Hoa Hồng 🎀
              </h3>
            </div>
          </div>
          <Link
            href="/app/referral"
            className="flex items-center gap-0.5 text-[11.5px] sm:text-xs font-extrabold text-primary-600 hover:text-primary-700 transition-colors shrink-0 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200/60 whitespace-nowrap"
          >
            <span>Chi tiết</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        <p className="text-xs sm:text-[12.5px] text-neutral-600 leading-relaxed font-medium">
          {isPartner ? (
            <>
              Bạn là <strong className="text-emerald-700">Đối tác</strong> — nhận trọn{" "}
              <strong className="text-primary-600">{referralPercent}% hoa hồng</strong> trên toàn bộ đơn mua của bạn bè!
            </>
          ) : (
            <>
              Nhận <strong className="text-primary-600">{referralPercent}% hoa hồng</strong> trên{" "}
              {maxReferralOrders} đơn hàng đầu tiên của mỗi người bạn mời. Bạn bè vẫn giữ trọn 100% tiền hoàn!
            </>
          )}
        </p>
      </div>

      {/* ═══ 2. EXCLUSIVE REFERRAL CODE BOX ═══ */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-50 via-pink-50/60 to-primary-50 border border-primary-200/80 p-3 shadow-2xs">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Mã giới thiệu của bạn</span>
          <span className="font-mono text-base sm:text-lg font-black text-primary-600 tracking-wider truncate">
            {customerCode || "---"}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all shadow-2xs shrink-0 ${
            copiedCode
              ? "bg-emerald-500 text-white"
              : "bg-white text-primary-600 border border-primary-200 hover:bg-primary-50"
          }`}
        >
          {copiedCode ? (
            <>
              <Check size={13} strokeWidth={2.5} />
              <span>Đã chép</span>
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={2} />
              <span>Chép mã</span>
            </>
          )}
        </button>
      </div>

      {/* ═══ 3. LINK DISPLAY & COPY ═══ */}
      <div className="flex items-center gap-2 rounded-2xl bg-neutral-50 border border-neutral-200/80 p-1.5 pl-3 shadow-2xs">
        <span className="flex-1 truncate text-xs font-bold text-neutral-700 select-all">
          {inviteUrl || "Đang tải link..."}
        </span>
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white transition-all shrink-0 shadow-2xs ${
            copiedLink
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          }`}
        >
          {copiedLink ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
          <span>{copiedLink ? "Đã chép" : "Copy link"}</span>
        </button>
      </div>

      {/* ═══ 4. TWO QUICK ACTION BUTTONS (QR & Tin nhắn) ═══ */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-primary-50/70 border border-primary-200/80 py-2.5 px-3 text-xs font-extrabold text-neutral-700 hover:text-primary-600 transition-all shadow-2xs"
        >
          <QrCode size={15} strokeWidth={2.2} className="text-primary-500" />
          <span>Xem mã QR</span>
        </button>

        <button
          onClick={handleCopyMessage}
          className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 px-3 text-xs font-extrabold transition-all shadow-2xs border ${
            copiedMsg
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white hover:bg-primary-50/70 text-neutral-700 hover:text-primary-600 border-primary-200/80"
          }`}
        >
          {copiedMsg ? (
            <>
              <Check size={14} strokeWidth={2.5} className="text-emerald-600" />
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <MessageSquare size={14} strokeWidth={2.2} className="text-primary-500" />
              <span>Lời mời mẫu</span>
            </>
          )}
        </button>
      </div>

      {/* ═══ 5. MINI HIGHLIGHT BULLETS ═══ */}
      <div className="pt-2 border-t border-primary-100/60 grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-neutral-500 text-center select-none">
        <div className="flex items-center justify-center gap-1 min-w-0">
          <Sparkles size={11} className="text-primary-500 shrink-0" />
          <span className="truncate">Thưởng {referralPercent}%/đơn</span>
        </div>
        <div className="flex items-center justify-center gap-1 min-w-0 border-x border-primary-100/70 px-0.5">
          <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
          <span className="truncate">Bạn bè giữ 100%</span>
        </div>
        <div className="flex items-center justify-center gap-1 min-w-0">
          <IconBow className="w-3 h-3 text-accent-bow shrink-0" />
          <span className="truncate">Cộng ví tự động</span>
        </div>
      </div>

      {/* ═══ QR MODAL POPUP ═══ */}
      {showQR && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-md" />
          <div
            className="relative w-full max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl fade-in border border-primary-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 p-6 text-center text-white">
              <button
                onClick={() => setShowQR(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              <div className="h-16 w-16 rounded-full overflow-hidden mx-auto mb-2.5 shadow-lg ring-2 ring-white/60">
                <img
                  src="/meow-back-mascot.png"
                  alt="MeowBack"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-base font-extrabold text-white">Mã QR Giới Thiệu 🎀</h3>
              <p className="text-xs text-white/85 mt-0.5">Quét bằng camera hoặc Zalo để đăng ký</p>
            </div>

            {/* QR Section */}
            <div className="flex flex-col items-center p-6 gap-4">
              <div className="p-3 rounded-2xl bg-white border border-primary-100 shadow-cute">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="h-48 w-48 object-contain" />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-neutral-300">
                    <QrCode size={64} />
                  </div>
                )}
              </div>

              <div className="w-full text-center py-2 px-3 rounded-xl bg-primary-50 border border-primary-100">
                <span className="text-[11px] font-bold text-neutral-500">Mã giới thiệu: </span>
                <span className="font-mono text-xs font-black text-primary-600">{customerCode}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 py-2.5 text-xs font-bold text-neutral-700 transition-colors"
                >
                  <Copy size={13} />
                  <span>Sao chép link</span>
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 text-xs font-bold shadow-cute hover:shadow-cute-lg transition-all"
                >
                  <QrCode size={13} />
                  <span>Tải ảnh QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
