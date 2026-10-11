"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Users,
  TrendingUp,
  Gift,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Clock,
  X,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { IconPaidSuccessBadge } from "@/components/icons/FinanceBadgeIcons";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { HoverCard } from "@/components/ui/HoverCard";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { ShineEffect } from "@/components/ui/ShineEffect";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";

type Friend = {
  id: string;
  fullName: string;
  customerCode: string;
  joinedAt: string;
  bonusOrderCount: number;
  totalEarned: number;
};

type FriendOrderTimelineEntry = {
  id: string;
  friendName: string;
  friendCode: string;
  platformId?: string;
  orderExternalId: string;
  itemName: string | null;
  shopName: string | null;
  orderStatus: string;
  createdAt: string;
  bonusState: "received" | "clawed_back" | "not_eligible" | "pending_eligible" | "pending_capped";
  bonusAmount: number;
};

interface Props {
  customerCode: string;
  totalFriends: number;
  totalCommission: number;
  referralRate: number;
  maxReferralOrders: number;
  referralValidityMonths: number;
  isPartner: boolean;
  friends: Friend[];
  friendOrderTimeline: FriendOrderTimelineEntry[];
  inviteUrl?: string;
  qrDataUrl?: string;
}

const ORDER_STATUS_LABEL: Record<string, { text: string; className: string }> = {
  approved: { text: "Đã hoàn tất", className: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" },
  pending: { text: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 border border-amber-200/80" },
  processing: { text: "Đang đối soát", className: "bg-blue-50 text-blue-700 border border-blue-200/80" },
  clawback: { text: "Đã thu hồi", className: "bg-rose-50 text-rose-600 border border-rose-200/80" },
};

const BONUS_STATE_LABEL: Record<FriendOrderTimelineEntry["bonusState"], { text: string; className: string }> = {
  received: { text: "Đã nhận 🎀", className: "text-emerald-600 font-extrabold" },
  clawed_back: { text: "Đã thu hồi", className: "text-rose-500 font-semibold" },
  not_eligible: { text: "Không đủ điều kiện", className: "text-neutral-400 font-medium" },
  pending_eligible: { text: "Dự kiến 🎀", className: "text-primary-500 font-bold" },
  pending_capped: { text: "Đã đạt giới hạn", className: "text-neutral-400 font-medium" },
};

export function ReferralClient({
  customerCode,
  totalFriends,
  totalCommission,
  referralRate,
  maxReferralOrders,
  referralValidityMonths,
  isPartner,
  friends,
  friendOrderTimeline,
  inviteUrl,
  qrDataUrl,
}: Props) {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState(inviteUrl || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "friends">("timeline");

  const referralPercent = Math.round(referralRate * 1000) / 10;

  useEffect(() => {
    setMounted(true);
    if (!referralLink && typeof window !== "undefined") {
      setReferralLink(`${window.location.origin}/register?ref=${customerCode}`);
    }
  }, [customerCode, referralLink]);

  const handleCopyLink = () => {
    if (!referralLink || copiedLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Đã copy link giới thiệu! Gửi ngay cho bạn bè nhé 🎀", "Đã sao chép");
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCode = () => {
    if (copiedCode) return;
    navigator.clipboard.writeText(customerCode);
    setCopiedCode(true);
    toast.success(`Đã copy mã giới thiệu "${customerCode}"! 🎀`, "Đã sao chép mã");
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleCopyInviteMessage = () => {
    if (copiedMsg) return;
    const message = `Săn sale Shopee, TikTok Shop & Lazada nhận thêm tiền hoàn cực hời cùng MeowBack! Đăng ký qua link của mình để được hoàn tiền tự động nhé:\n${referralLink}\n(Mã giới thiệu: ${customerCode})`;
    navigator.clipboard.writeText(message);
    setCopiedMsg(true);
    toast.success("Đã sao chép lời mời kèm link! Hãy dán vào Zalo / Messenger để gửi cho bạn bè 💬", "Đã sao chép tin nhắn");
    setTimeout(() => setCopiedMsg(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `meowback-referral-${customerCode}.png`;
    a.click();
    toast.success("Đã tải mã QR về máy! Bạn có thể chia sẻ lên Zalo hoặc Story 📲", "Đã tải mã QR");
  };

  return (
    <div className="flex w-full flex-col gap-8 sm:gap-10 fade-in pb-36 sm:pb-20">
      {/* ═══ 1. BANNER CHÀO MỪNG (ĐỒNG BỘ 100% VỚI /APP) ═══ */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img
          src="/welcome-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <FloatingElement duration={4}>
              <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/50 overflow-hidden p-1">
                <img
                  src="/meow-back-mascot.png"
                  alt="MeowBack Mascot"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            </FloatingElement>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/85 border border-primary-200/80 text-[10.5px] sm:text-[11px] font-black uppercase tracking-widest text-primary-600 shadow-xs mb-1.5 sm:mb-2 backdrop-blur-md">
                <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                <span>Chương Trình Giới Thiệu 🎀</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Mời Bạn Bè — <span className="text-primary-600 drop-shadow-sm">Nhận Hoa Hồng</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-800 font-semibold leading-relaxed max-w-xl drop-shadow-sm">
                Nhận thêm <strong className="text-primary-600 font-extrabold">{referralPercent}% hoa hồng</strong> thưởng trên mỗi đơn hàng bạn bè mua sắm thành công. Bạn bè vẫn giữ trọn 100% tiền hoàn!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center pt-1 md:pt-0 relative overflow-hidden group rounded-[2rem] self-start md:self-center">
            <ShineEffect />
            <LiquidButton
              onClick={handleCopyLink}
              icon={copiedLink ? <Check size={18} strokeWidth={2.5} className="text-white" /> : <Copy size={18} strokeWidth={2.5} className="text-white" />}
            >
              {copiedLink ? "Đã copy link 🎀" : "Sao chép link mời 🎀"}
            </LiquidButton>
          </div>
        </div>
      </div>

      {/* ═══ 2. TOP 3 STAT CARDS (ĐỒNG BỘ 100% VỚI STAT CARDS TRANG CHỦ) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5">
        {/* CARD 1: BẠN BÈ ĐÃ MỜI */}
        <HoverCard>
          <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-5.5 shadow-sm border border-neutral-200/80 hover:border-primary-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
            {/* Watermark góc mờ nghệ thuật */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 text-primary-600">
              <Users size={90} />
            </div>

            {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50/80 border border-primary-100/90 text-primary-600 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <Users size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Mạng lưới</div>
                  <div className="text-[12px] font-semibold text-neutral-700">Bạn bè đã mời</div>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-primary-50 border border-primary-200/80 px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-primary-700 tracking-wider">
                {totalFriends > 0 ? "Đang tăng" : "Bắt đầu"}
              </span>
            </div>

            {/* Tầng 2: Số thành viên lớn */}
            <div className="relative z-10 pt-2.5 border-t border-neutral-100 flex items-end justify-between gap-2">
              <div>
                <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Tổng số thành viên</div>
                <div className="text-2xl sm:text-3xl font-black text-primary-600 tabular-nums leading-tight mt-0.5">
                  {totalFriends} <span className="text-[14px] font-bold text-neutral-500">người</span>
                </div>
              </div>
            </div>

            {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
            <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shrink-0" />
              <span className="leading-snug truncate">Đã đăng ký qua mã của bạn</span>
            </div>
          </div>
        </HoverCard>

        {/* CARD 2: HOA HỒNG NHẬN ĐƯỢC */}
        <HoverCard>
          <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-5.5 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
            {/* Watermark góc mờ nghệ thuật */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 text-emerald-600">
              <IconPaidSuccessBadge size={92} />
            </div>

            {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50/80 border border-emerald-100/90 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <IconPaidSuccessBadge size={38} />
                </div>
                <div>
                  <div className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Thu nhập</div>
                  <div className="text-[12px] font-semibold text-neutral-700">Hoa hồng nhận được</div>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
                Vào ví
              </span>
            </div>

            {/* Tầng 2: Số tiền lớn */}
            <div className="relative z-10 pt-2.5 border-t border-neutral-100 flex items-end justify-between gap-2">
              <div>
                <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Đã thanh toán</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
                  {formatCurrency(totalCommission)}
                </div>
              </div>
            </div>

            {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
            <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="leading-snug truncate">Tự động cộng trực tiếp vào ví MeowBack</span>
            </div>
          </div>
        </HoverCard>

        {/* CARD 3: CHÍNH SÁCH TỶ LỆ THƯỞNG */}
        <HoverCard>
          <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-5.5 shadow-sm border border-neutral-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
            {/* Watermark góc mờ nghệ thuật */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 text-amber-500">
              <Gift size={90} />
            </div>

            {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/80 border border-amber-100/90 text-amber-600 shadow-2xs group-hover:scale-105 transition-transform p-1">
                  <Gift size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Chính sách</div>
                  <div className="text-[12px] font-semibold text-neutral-700">Tỷ lệ thưởng</div>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-amber-700 tracking-wider">
                {isPartner ? "Đối tác" : "Chuẩn"}
              </span>
            </div>

            {/* Tầng 2: Tỷ lệ thưởng lớn */}
            <div className="relative z-10 pt-2.5 border-t border-neutral-100 flex items-end justify-between gap-2">
              <div>
                <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Thưởng trên tiền hoàn</div>
                <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight mt-0.5">
                  +{referralPercent}% <span className="text-[14px] font-bold text-neutral-500">/ mỗi đơn</span>
                </div>
              </div>
            </div>

            {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
            <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="leading-snug truncate">
                {isPartner ? "Không giới hạn số đơn" : `Áp dụng ${maxReferralOrders} đơn đầu tiên / bạn`}
              </span>
            </div>
          </div>
        </HoverCard>
      </div>

      {/* ═══ 3. MAIN SECTION: CÔNG CỤ MỜI BẠN BÈ & QUYỀN LỢI (THIẾT KẾ CÂN ĐỐI, ĐẸP MẮT TRÊN MOBILE & DESKTOP) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* CỘT TRÁI: THẺ GIỚI THIỆU & CÔNG CỤ CHIA SẺ */}
        <div className="h-full rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-primary-200 transition-all duration-300 flex flex-col justify-between gap-4 overflow-hidden">
          <div className="flex flex-col gap-3.5">
            {/* Header Box */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 border border-primary-100/90 shadow-2xs shrink-0">
                  <Gift size={20} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14.5px] sm:text-[16px] font-black text-neutral-900 leading-snug truncate">
                    Mời Bạn Bè Nhận Thưởng
                  </h2>
                  <p className="text-[11px] sm:text-[11.5px] text-neutral-500 font-medium truncate">
                    Nhận thêm +{referralPercent}% hoa hồng trên mỗi đơn hàng
                  </p>
                </div>
              </div>
            </div>

            {/* VIP REFERRAL TICKET (Thẻ Giới Thiệu Tinh Tế, Gọn Gàng, Thoáng Đãng) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50/70 via-pink-50/30 to-white border border-primary-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-2.5">
              {/* Dòng 1: Tiêu đề vé & Badge thưởng */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-primary-500" />
                  <span>Mã giới thiệu của bạn</span>
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-primary-600 border border-primary-200/80 shadow-2xs">
                  Thưởng {referralPercent}% trọn đời
                </span>
              </div>

              {/* Hộp mã to đẹp + nút chép */}
              <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-2.5 sm:p-3 border border-primary-100 shadow-2xs">
                <span className="font-mono text-xl sm:text-2xl font-black text-primary-600 tracking-wider truncate select-all pl-1">
                  {customerCode || "---"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 sm:py-2 text-xs font-black transition-all shadow-2xs shrink-0 cursor-pointer ${
                    copiedCode
                      ? "bg-emerald-500 text-white"
                      : "bg-primary-500 hover:bg-primary-600 text-white shadow-cute active:scale-95"
                  }`}
                >
                  {copiedCode ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
                  <span>{copiedCode ? "Đã chép" : "Chép mã"}</span>
                </button>
              </div>

              {/* Hộp link đăng ký */}
              <div className="flex items-center gap-1.5 bg-white rounded-xl p-1.5 pl-3 border border-primary-100 shadow-2xs">
                <span className="flex-1 truncate text-[11px] sm:text-[11.5px] font-bold text-neutral-600 select-all min-w-0">
                  {referralLink || "Đang tạo link..."}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                    copiedLink
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-2xs active:scale-95"
                  }`}
                >
                  {copiedLink ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
                  <span>{copiedLink ? "Đã copy" : "Copy link"}</span>
                </button>
              </div>
            </div>

            {/* BỘ 2 NÚT HÀNH ĐỘNG NHANH */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={handleCopyInviteMessage}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-bold transition-all shadow-2xs border cursor-pointer active:scale-95 ${
                  copiedMsg
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white hover:bg-primary-50/70 text-neutral-800 hover:text-primary-600 border-neutral-200 hover:border-primary-200"
                }`}
              >
                {copiedMsg ? (
                  <>
                    <Check size={14} strokeWidth={2.5} className="text-emerald-600" />
                    <span>Đã chép tin nhắn</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={14} strokeWidth={2.2} className="text-primary-500" />
                    <span>Lời mời Zalo 💬</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-primary-50/70 border border-neutral-200 hover:border-primary-200 py-2.5 px-2 text-xs font-bold text-neutral-800 hover:text-primary-600 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <QrCode size={14} strokeWidth={2.2} className="text-primary-500" />
                <span>Mã QR quét 📲</span>
              </button>
            </div>
          </div>

          {/* 3 Mini Highlight Bullets dạng banner màu mềm */}
          <div className="mt-1 rounded-xl bg-primary-50/70 p-2 sm:p-2.5 border border-primary-100/80 grid grid-cols-3 gap-1 text-[10.5px] sm:text-[11px] font-black text-neutral-600 text-center select-none">
            <div className="flex items-center justify-center gap-1 min-w-0">
              <Sparkles size={11} className="text-primary-500 shrink-0" />
              <span className="truncate">Thưởng {referralPercent}%/đơn</span>
            </div>
            <div className="flex items-center justify-center gap-1 min-w-0 border-x border-primary-200/80 px-0.5">
              <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
              <span className="truncate">Bạn bè giữ 100%</span>
            </div>
            <div className="flex items-center justify-center gap-1 min-w-0">
              <IconBow className="w-3.5 h-3.5 text-accent-bow shrink-0" />
              <span className="truncate">Cộng ví tự động</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: QUYỀN LỢI & CÁCH HOẠT ĐỘNG (THIẾT KẾ GRID 2x2 CÂN ĐỐI, KHÔNG TRÀN CHỮ, ĐẸP NHƯ CÁC CARD KHÁC) */}
        <div className="h-full rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-primary-200 transition-all duration-300 flex flex-col justify-between gap-4 overflow-hidden">
          <div className="flex flex-col gap-3.5">
            {/* Header Box */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 border border-primary-100/90 shadow-2xs shrink-0">
                  <IconBow className="w-5 h-5 text-accent-bow" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14.5px] sm:text-[16px] font-black text-neutral-900 leading-snug truncate">
                    Quyền Lợi Giới Thiệu
                  </h2>
                  <p className="text-[11px] sm:text-[11.5px] text-neutral-500 font-medium truncate">
                    Chính sách minh bạch & tự động cộng ví
                  </p>
                </div>
              </div>
            </div>

            {/* Grid 2x2: 4 Quyền Lợi Nổi Bật Siêu Đẹp & Gọn Gàng */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Box 1: Thưởng hoa hồng */}
              <div className="group rounded-2xl p-3 sm:p-3.5 bg-gradient-to-b from-primary-50/70 via-pink-50/30 to-white border border-primary-200/70 hover:border-primary-300 transition-all shadow-2xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary-100/80 text-primary-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Gift size={15} strokeWidth={2.4} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-primary-100/90 text-primary-700 uppercase tracking-wider">
                    Thưởng thêm
                  </span>
                </div>
                <div>
                  <div className="text-[12.5px] sm:text-[13px] font-black text-neutral-900 leading-snug">
                    +{referralPercent}% Hoa hồng
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-relaxed mt-0.5">
                    Thưởng trên tiền hoàn ở mỗi đơn hàng
                  </p>
                </div>
              </div>

              {/* Box 2: Bạn bè giữ 100% */}
              <div className="group rounded-2xl p-3 sm:p-3.5 bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-white border border-emerald-200/70 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck size={15} strokeWidth={2.4} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-700 uppercase tracking-wider">
                    Giữ trọn 100%
                  </span>
                </div>
                <div>
                  <div className="text-[12.5px] sm:text-[13px] font-black text-neutral-900 leading-snug">
                    Bạn bè giữ trọn vẹn
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-relaxed mt-0.5">
                    Người được mời nhận đủ 100% tiền hoàn
                  </p>
                </div>
              </div>

              {/* Box 3: Số đơn áp dụng */}
              <div className="group rounded-2xl p-3 sm:p-3.5 bg-gradient-to-b from-amber-50/60 via-yellow-50/30 to-white border border-amber-200/70 hover:border-amber-300 transition-all shadow-2xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShoppingBag size={15} strokeWidth={2.4} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100/90 text-amber-700 uppercase tracking-wider">
                    {isPartner ? "Đối tác" : "Số lượng đơn"}
                  </span>
                </div>
                <div>
                  <div className="text-[12.5px] sm:text-[13px] font-black text-neutral-900 leading-snug">
                    {isPartner ? "Vô hạn đơn hàng" : `${maxReferralOrders} đơn đầu / bạn`}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-relaxed mt-0.5">
                    {isPartner ? "Thưởng hoa hồng không giới hạn mọi đơn" : `Áp dụng riêng cho ${maxReferralOrders} đơn của mỗi bạn`}
                  </p>
                </div>
              </div>

              {/* Box 4: Thời hạn hiệu lực */}
              <div className="group rounded-2xl p-3 sm:p-3.5 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-white border border-blue-200/70 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock size={15} strokeWidth={2.4} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100/90 text-blue-700 uppercase tracking-wider">
                    Thời hạn
                  </span>
                </div>
                <div>
                  <div className="text-[12.5px] sm:text-[13px] font-black text-neutral-900 leading-snug">
                    Hạn {referralValidityMonths} tháng
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-relaxed mt-0.5">
                    Ghi nhận toàn bộ đơn trong {referralValidityMonths} tháng
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Bước nhận hoa hồng tự động */}
          <div className="rounded-2xl bg-neutral-50/90 p-3 sm:p-3.5 border border-neutral-200/70 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider text-neutral-400">
                Quy trình 3 bước
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-bold text-primary-600 flex items-center gap-1">
                Tự động cộng ví 🐾
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center items-center">
              <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-neutral-100 shadow-2xs">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  1
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-neutral-900 leading-tight">Gửi link mời</span>
                <span className="text-[9.5px] text-neutral-400 mt-0.5">Zalo / QR / Mã</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-neutral-100 shadow-2xs">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  2
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-neutral-900 leading-tight">Bạn mua sắm</span>
                <span className="text-[9.5px] text-neutral-400 mt-0.5">Shopee & TikTok</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-emerald-100/90 bg-emerald-50/40 shadow-2xs">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  3
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-emerald-800 leading-tight">Nhận hoa hồng</span>
                <span className="text-[9.5px] text-emerald-600 font-semibold mt-0.5">Vào ví tức thì</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4. TIẾN TRÌNH ĐƠN HÀNG & DANH SÁCH BẠN BÈ ═══ */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-primary-200 transition-all duration-300 flex flex-col gap-4 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex flex-col gap-2.5 pb-2 border-b border-primary-100/60">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/60">
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
                  activeTab === "timeline"
                    ? "bg-white text-primary-600 shadow-sm border border-neutral-200/70"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <ShoppingBag size={14} className={activeTab === "timeline" ? "text-primary-500" : "text-neutral-400"} />
                <span className="truncate">
                  <span className="sm:hidden">Đơn bạn bè</span>
                  <span className="hidden sm:inline">Đơn hàng của bạn bè</span>
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-black shrink-0 ${
                    activeTab === "timeline" ? "bg-primary-100 text-primary-700" : "bg-neutral-200/80 text-neutral-600"
                  }`}
                >
                  {friendOrderTimeline.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("friends")}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
                  activeTab === "friends"
                    ? "bg-white text-primary-600 shadow-sm border border-neutral-200/70"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Users size={14} className={activeTab === "friends" ? "text-primary-500" : "text-neutral-400"} />
                <span className="truncate">
                  <span className="sm:hidden">Bạn bè</span>
                  <span className="hidden sm:inline">Danh sách bạn bè</span>
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-black shrink-0 ${
                    activeTab === "friends" ? "bg-primary-100 text-primary-700" : "bg-neutral-200/80 text-neutral-600"
                  }`}
                >
                  {friends.length}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeTab === "timeline" ? "Tiền ở đơn chưa xong là dự kiến" : "Cập nhật tự động theo thời gian thực"}</span>
              </span>
              <span className="text-[10.5px] text-neutral-400">Tự động đối soát 🎀</span>
            </div>
          </div>

          {/* Tab 1: Tiến trình đơn hàng */}
          {activeTab === "timeline" && (
            <>
              {friendOrderTimeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-gradient-to-b from-primary-50/30 via-white to-white border border-dashed border-primary-200/70">
                  <div className="relative mb-3.5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/25 ring-4 ring-primary-50 text-white overflow-hidden p-1">
                      <img src="/meow-back-mascot.png" alt="Mascot" className="w-full h-full object-contain rounded-2xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm ring-2 ring-white">
                      <Sparkles size={12} />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-extrabold text-neutral-900">
                    {totalFriends === 0 ? "Chưa có bạn bè nào đăng ký 🎀" : `Bạn đã mời được ${totalFriends} người bạn!`}
                  </h3>
                  <p className="mt-1 text-[12px] sm:text-[12.5px] text-neutral-500 max-w-sm font-medium leading-relaxed">
                    {totalFriends === 0
                      ? "Hãy gửi link hoặc mã giới thiệu cho bạn bè ngay hôm nay. Chỉ cần 1 đơn hàng đầu tiên của họ, bạn sẽ bắt đầu nhận hoa hồng tự động!"
                      : "Bạn bè chưa phát sinh đơn hàng mới nào. Ngay khi họ mua sắm qua MeowBack, đơn sẽ tự động hiển thị tại đây."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Sao chép link mời bạn bè</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-700 text-[12px] font-bold border border-neutral-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Copy size={13} className="text-primary-500" />
                      <span>Mã: <span className="font-mono text-primary-600 font-extrabold">{customerCode}</span></span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto rounded-2xl border border-primary-100/70">
                    <table className="w-full text-left text-[13px]">
                      <thead>
                        <tr className="bg-primary-50/60 border-b border-primary-100 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                          <th className="py-3 px-4">Bạn bè</th>
                          <th className="py-3 px-4">Đơn hàng / Sản phẩm</th>
                          <th className="py-3 px-4">Thời gian</th>
                          <th className="py-3 px-4">Trạng thái đơn</th>
                          <th className="py-3 px-4 text-right">Hoa hồng của bạn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary-50">
                        {friendOrderTimeline.map((entry) => {
                          const orderStatus = ORDER_STATUS_LABEL[entry.orderStatus] ?? {
                            text: entry.orderStatus,
                            className: "bg-neutral-100 text-neutral-600",
                          };
                          const bonus = BONUS_STATE_LABEL[entry.bonusState];
                          const showAmount =
                            entry.bonusState === "received" ||
                            entry.bonusState === "clawed_back" ||
                            entry.bonusState === "pending_eligible";
                          const platformLower = entry.platformId?.toLowerCase() ?? "";

                          return (
                            <tr key={entry.id} className="hover:bg-primary-50/30 transition-colors">
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-extrabold text-neutral-900">{entry.friendName}</div>
                                {entry.friendCode && (
                                  <div className="font-mono text-[11px] text-neutral-400">#{entry.friendCode}</div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top max-w-[240px]">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-center shrink-0">
                                    {platformLower.includes("shopee") ? (
                                      <ShopeeIcon className="w-4 h-4" />
                                    ) : platformLower.includes("tiktok") ? (
                                      <TiktokIcon className="w-4 h-4" />
                                    ) : platformLower.includes("lazada") ? (
                                      <LazadaIcon className="w-4 h-4" />
                                    ) : (
                                      <ShoppingBag size={13} className="text-primary-500" />
                                    )}
                                  </div>
                                  <div className="truncate font-bold text-neutral-900" title={entry.itemName ?? undefined}>
                                    {entry.itemName ?? `Đơn ${entry.orderExternalId}`}
                                  </div>
                                </div>
                                <div className="truncate text-[11px] text-neutral-500 font-medium ml-8">
                                  {entry.shopName ? `${entry.shopName} · ` : ""}
                                  <span className="font-mono">{entry.orderExternalId}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 align-top text-neutral-500 font-medium whitespace-nowrap">
                                {formatDate(entry.createdAt)}
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${orderStatus.className}`}>
                                  {orderStatus.text}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                {showAmount && (
                                  <div
                                    className={`text-[13.5px] font-black ${
                                      entry.bonusState === "clawed_back"
                                        ? "text-rose-500 line-through"
                                        : entry.bonusState === "received"
                                        ? "text-emerald-600"
                                        : "text-primary-500"
                                    }`}
                                  >
                                    {entry.bonusState === "pending_eligible" ? "~" : "+"}
                                    {formatCurrency(entry.bonusAmount)}
                                  </div>
                                )}
                                <div className={`text-[10px] font-bold ${bonus.className}`}>{bonus.text}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden flex flex-col gap-2.5">
                    {friendOrderTimeline.map((entry) => {
                      const orderStatus = ORDER_STATUS_LABEL[entry.orderStatus] ?? {
                        text: entry.orderStatus,
                        className: "bg-neutral-100 text-neutral-600",
                      };
                      const bonus = BONUS_STATE_LABEL[entry.bonusState];
                      const showAmount =
                        entry.bonusState === "received" ||
                        entry.bonusState === "clawed_back" ||
                        entry.bonusState === "pending_eligible";
                      const platformLower = entry.platformId?.toLowerCase() ?? "";

                      return (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200/80 hover:border-primary-300 bg-white p-3.5 shadow-2xs flex flex-col gap-2 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center shrink-0">
                                {platformLower.includes("shopee") ? (
                                  <ShopeeIcon className="w-5 h-5" />
                                ) : platformLower.includes("tiktok") ? (
                                  <TiktokIcon className="w-5 h-5" />
                                ) : platformLower.includes("lazada") ? (
                                  <LazadaIcon className="w-5 h-5" />
                                ) : (
                                  <ShoppingBag size={16} className="text-primary-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[13px] font-extrabold text-neutral-900 block truncate">{entry.friendName}</span>
                                {entry.friendCode && (
                                  <span className="font-mono text-[10.5px] text-neutral-400">#{entry.friendCode}</span>
                                )}
                              </div>
                            </div>
                            <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${orderStatus.className}`}>
                              {orderStatus.text}
                            </span>
                          </div>
                          <div className="text-[12.5px] font-semibold text-neutral-800 truncate" title={entry.itemName ?? undefined}>
                            {entry.itemName ?? `Đơn ${entry.orderExternalId}`}
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 text-[11.5px]">
                            <span className="text-neutral-500">{formatDate(entry.createdAt)}</span>
                            <div className="text-right">
                              {showAmount && (
                                <span className={`font-black ${entry.bonusState === "received" ? "text-emerald-600" : "text-primary-500"}`}>
                                  {entry.bonusState === "pending_eligible" ? "~" : "+"}
                                  {formatCurrency(entry.bonusAmount)}
                                </span>
                              )}
                              <span className={`ml-1 font-bold ${bonus.className}`}>• {bonus.text}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab 2: Danh sách bạn bè */}
          {activeTab === "friends" && (
            <>
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-gradient-to-b from-primary-50/30 via-white to-white border border-dashed border-primary-200/70">
                  <div className="relative mb-3.5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/25 ring-4 ring-primary-50 text-white overflow-hidden p-1">
                      <img src="/meow-back-mascot.png" alt="Mascot" className="w-full h-full object-contain rounded-2xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm ring-2 ring-white">
                      <Sparkles size={12} />
                    </div>
                  </div>
                  <h3 className="text-[15px] font-extrabold text-neutral-900">Danh sách bạn bè trống 🎀</h3>
                  <p className="mt-1 text-[12px] sm:text-[12.5px] text-neutral-500 max-w-sm font-medium leading-relaxed">
                    Khi có bạn bè đăng ký qua link hoặc mã của bạn, danh sách thành viên sẽ được cập nhật đầy đủ tại đây.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Sao chép link mời bạn bè</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-700 text-[12px] font-bold border border-neutral-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Copy size={13} className="text-primary-500" />
                      <span>Mã: <span className="font-mono text-primary-600 font-extrabold">{customerCode}</span></span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 rounded-2xl bg-neutral-50/80 p-3.5 border border-primary-100 shadow-2xs hover:border-primary-300 transition-all"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 text-[14px] font-black border border-primary-200/60 shadow-2xs">
                        {f.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-extrabold text-neutral-900">
                          {f.fullName} <span className="font-mono text-[11px] font-normal text-neutral-400">({f.customerCode})</span>
                        </div>
                        <div className="truncate text-[11.5px] font-medium text-neutral-500 mt-0.5">
                          Tham gia {formatDate(f.joinedAt)}
                          {!isPartner && ` · ${f.bonusOrderCount}/${maxReferralOrders} đơn`}
                          {isPartner && ` · ${f.bonusOrderCount} đơn`}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-[13.5px] font-black ${f.totalEarned > 0 ? "text-emerald-600" : "text-neutral-300"}`}>
                          {f.totalEarned > 0 ? `+${formatCurrency(f.totalEarned)}` : "0đ"}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-400">Hoa hồng</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      {/* ═══ QR CODE MODAL POPUP (ĐỒNG BỘ POPUP CỦA MEOWBACK) ═══ */}
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
            {/* Header Modal */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 p-6 text-center text-white">
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              <div className="h-16 w-16 rounded-full overflow-hidden mx-auto mb-2.5 shadow-lg ring-2 ring-white/60 p-0.5 bg-white">
                <img
                  src="/meow-back-mascot.png"
                  alt="MeowBack"
                  className="h-full w-full object-contain rounded-full"
                />
              </div>
              <h3 className="text-base font-extrabold text-white">Mã QR Giới Thiệu 🎀</h3>
              <p className="text-xs text-white/85 mt-0.5">Quét bằng camera hoặc Zalo để nhận hoa hồng</p>
            </div>

            {/* QR Content */}
            <div className="flex flex-col items-center p-6 gap-4">
              <div className="p-3 rounded-2xl bg-white border border-primary-100 shadow-cute">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Referral QR" className="h-48 w-48 object-contain" />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-neutral-300">
                    <QrCode size={64} />
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Mã giới thiệu của bạn
                </span>
                <p className="font-mono text-xl font-black text-primary-600 tracking-wider">
                  {customerCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-primary-50 text-neutral-800 border border-primary-200 py-2.5 px-3 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
                  >
                    <Download size={14} className="text-primary-500" />
                    <span>Tải ảnh QR</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 px-3 text-xs font-extrabold transition-all shadow-cute hover:shadow-cute-lg cursor-pointer"
                >
                  <Copy size={14} />
                  <span>{copiedLink ? "Đã copy" : "Copy link"}</span>
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
