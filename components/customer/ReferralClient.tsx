"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  Sparkles,
  Gift,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Award,
  ShoppingBag,
  Package,
  Clock,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { FloatingElement } from "@/components/ui/FloatingElement";
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
  clawed_back: { text: "Đã thu hồi", className: "text-rose-500" },
  not_eligible: { text: "Không đủ điều kiện", className: "text-neutral-400" },
  pending_eligible: { text: "Dự kiến", className: "text-primary-500 font-bold" },
  pending_capped: { text: "Đã đạt giới hạn", className: "text-neutral-400" },
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
  const [activeTab, setActiveTab] = useState<"timeline" | "friends">("timeline");

  useEffect(() => {
    if (!referralLink && typeof window !== "undefined") {
      setReferralLink(`${window.location.origin}/register?ref=${customerCode}`);
    }
  }, [customerCode, referralLink]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Đã copy link giới thiệu! Gửi ngay cho bạn bè nhé 🎀", "Đã sao chép");
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(customerCode);
    setCopiedCode(true);
    toast.success(`Đã copy mã giới thiệu "${customerCode}"! 🎀`, "Đã sao chép mã");
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleCopyInviteMessage = () => {
    const message = `Săn sale Shopee & TikTok Shop nhận thêm tiền hoàn cực hời cùng MeowBack! Đăng ký qua link của mình để được hoàn tiền tự động nhé:\n${referralLink}\n(Mã giới thiệu: ${customerCode})`;
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
    <div className="flex w-full flex-col gap-6 fade-in pb-28 sm:pb-14">
      {/* ═══ 1. BANNER HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <FloatingElement duration={4}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border-2 border-white">
                <Users size={28} strokeWidth={2.3} className="text-white drop-shadow-sm" />
              </div>
            </FloatingElement>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100/90 text-primary-700 text-[11px] font-bold mb-1.5 border border-primary-200/60 shadow-2xs">
                <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                <span>Chương Trình Giới Thiệu 🎀</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-neutral-900 tracking-tight">
                Mời Bạn Bè — Nhận Hoa Hồng Trọn Đời
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Nhận thêm 5% hoa hồng thưởng trên mỗi đơn hàng bạn bè mua sắm thành công. Bạn bè vẫn giữ trọn 100% tiền hoàn!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. TOP 3 THẺ THỐNG KÊ (Đồng bộ với Portal) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Bạn bè */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-primary-50/25 to-white p-4.5 sm:p-5 shadow-cute border border-primary-200/80 hover:border-primary-400 hover:shadow-cute-lg transition-all duration-300 flex flex-col justify-between gap-3">
          <div className="absolute -right-3 -bottom-3 text-primary-400/10 pointer-events-none group-hover:scale-110 transition-transform">
            <Users size={80} strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-100 text-primary-600 shadow-2xs">
                <Users size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block truncate">Mạng lưới</span>
                <div className="text-xs sm:text-[13px] font-extrabold text-neutral-800 whitespace-nowrap">Bạn bè đã mời</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-primary-50 border border-primary-200/80 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-primary-600 tracking-wider">
              {totalFriends > 0 ? "Đang tăng" : "Bắt đầu"}
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-primary-100/60">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Tổng số thành viên</div>
            <div className="text-2xl sm:text-3xl font-black text-primary-600 tabular-nums leading-tight mt-0.5">
              {totalFriends} <span className="text-[15px] font-bold text-neutral-500">người</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shrink-0" />
            <span>Đã đăng ký qua mã của bạn</span>
          </div>
        </div>

        {/* Card 2: Hoa hồng tích luỹ */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-4.5 sm:p-5 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3">
          <div className="absolute -right-3 -bottom-3 text-emerald-500/10 pointer-events-none group-hover:scale-110 transition-transform">
            <TrendingUp size={80} strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                <TrendingUp size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block truncate">Thu nhập</span>
                <div className="text-xs sm:text-[13px] font-extrabold text-neutral-800 whitespace-nowrap">Hoa hồng nhận được</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
              Vào ví
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-neutral-100">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Đã thanh toán</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
              {formatCurrency(totalCommission)}
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Tự động cộng trực tiếp vào ví MeowBack</span>
          </div>
        </div>

        {/* Card 3: Chính sách thưởng */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-4.5 sm:p-5 shadow-sm border border-neutral-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3">
          <div className="absolute -right-3 -bottom-3 text-amber-500/10 pointer-events-none group-hover:scale-110 transition-transform">
            <Gift size={80} strokeWidth={1.5} />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
                <Gift size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block truncate">Chính sách</span>
                <div className="text-xs sm:text-[13px] font-extrabold text-neutral-800 whitespace-nowrap">Tỷ lệ thưởng</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200/80 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-black uppercase text-amber-700 tracking-wider">
              {isPartner ? "Đối tác" : "Chuẩn"}
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-neutral-100">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Thưởng trên tiền hoàn</div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight mt-0.5">
              +{referralRate * 100}% <span className="text-[14px] font-bold text-neutral-500">/ mỗi đơn</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>{isPartner ? "Không giới hạn số đơn" : `Áp dụng ${maxReferralOrders} đơn đầu tiên / bạn`}</span>
          </div>
        </div>
      </div>

      {/* ═══ 3. MAIN GRID: CÔNG CỤ MỜI (TRÁI) & QUYỀN LỢI (PHẢI) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* CỘT TRÁI: CÔNG CỤ CHIA SẺ & QR CODE */}
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-cute border border-primary-100/80 flex flex-col justify-between gap-5 overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-primary-100/70 pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-primary-500" />
                <h2 className="text-[16px] font-extrabold text-neutral-900">Công cụ mời bạn bè</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                1 chạm chia sẻ
              </span>
            </div>

            {/* Mã giới thiệu & Link */}
            <div className="flex flex-col gap-4">
              {/* Mã giới thiệu nổi bật */}
              <div className="rounded-2xl bg-gradient-to-r from-primary-50/70 to-rose-50/40 p-4 border border-primary-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Mã giới thiệu độc quyền</div>
                  <div className="text-2xl font-black tracking-wider text-primary-600 font-mono mt-0.5">
                    {customerCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-[12.5px] font-bold border border-primary-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-primary-500" />}
                  <span>{copiedCode ? "Đã chép" : "Sao chép mã"}</span>
                </button>
              </div>

              {/* Link giới thiệu đầy đủ */}
              <div>
                <label className="text-[12px] font-bold text-neutral-700 mb-1.5 block">
                  Link đăng ký giới thiệu
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="h-11 w-full sm:flex-1 rounded-2xl bg-neutral-50/80 px-3.5 text-[13px] font-medium text-neutral-800 border border-neutral-200/80 focus:outline-none select-all min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="h-11 px-4 sm:px-5 shrink-0 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white text-[13px] font-extrabold shadow-cute hover:shadow-cute-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copiedLink ? "Đã copy" : "Sao chép 🎀"}</span>
                  </button>
                </div>
              </div>

              {/* QR Code & Quick Actions */}
              <div className="rounded-2xl bg-neutral-50/80 p-4 border border-neutral-200/80 flex flex-col sm:flex-row items-center gap-4">
                {qrDataUrl ? (
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-white p-1.5 shadow-2xs border border-primary-100 flex items-center justify-center">
                    <img src={qrDataUrl} alt="Referral QR" className="w-full h-full object-contain rounded-xl" />
                  </div>
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-white p-2 flex items-center justify-center border border-primary-100">
                    <QrCode size={32} className="text-primary-400" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2 w-full text-center sm:text-left">
                  <div className="text-[13px] font-extrabold text-neutral-900 leading-tight">
                    Mã QR chia sẻ nhanh
                  </div>
                  <p className="text-[11.5px] text-neutral-500 font-medium">
                    Bạn bè chỉ cần mở camera điện thoại quét mã là đăng ký tài khoản tự động nhận diện người mời.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {qrDataUrl && (
                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-[11.5px] font-bold border border-neutral-200 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download size={13} className="text-primary-500" />
                        <span>Tải ảnh QR</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyInviteMessage}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-[11.5px] font-bold border border-neutral-200 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedMsg ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-primary-500" />}
                      <span>{copiedMsg ? "Đã copy tin nhắn" : "Copy tin nhắn mời"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-neutral-400 font-medium -mt-2">
            💡 Gợi ý: Dán tin nhắn mời vào các nhóm bạn bè mua sắm Shopee để tăng nhanh hoa hồng.
          </p>
        </div>

        {/* CỘT PHẢI: QUYỀN LỢI & CÁCH THỨC HOẠT ĐỘNG */}
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-cute border border-primary-100/80 flex flex-col justify-between gap-5 overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-primary-100/70 pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <IconBow className="w-5 h-5 text-accent-bow" />
                <h2 className="text-[16px] font-extrabold text-neutral-900">Quyền lợi khi giới thiệu</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                100% minh bạch
              </span>
            </div>

            {/* Checklist 4 quyền lợi vàng */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 shadow-2xs">
                  <Gift size={16} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-neutral-900">
                    Nhận thêm {referralRate * 100}% hoa hồng từ MeowBack
                  </h3>
                  <p className="text-[12px] text-neutral-600 font-medium mt-0.5 leading-relaxed">
                    Bạn được tặng thêm {referralRate * 100}% trên số tiền hoàn mà bạn bè nhận được ở mỗi đơn hàng thành công.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-2xs">
                  <ShieldCheck size={16} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-neutral-900">
                    Bạn bè giữ nguyên 100% tiền hoàn
                  </h3>
                  <p className="text-[12px] text-neutral-600 font-medium mt-0.5 leading-relaxed">
                    Người được mời vẫn nhận trọn vẹn số tiền hoàn của họ. Tiền thưởng {referralRate * 100}% là chi phí MeowBack trích thưởng riêng cho bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-2xs">
                  <ShoppingBag size={16} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-neutral-900">
                    {isPartner ? "Đối tác — không giới hạn đơn hàng" : `Áp dụng cho ${maxReferralOrders} đơn hàng đầu tiên`}
                  </h3>
                  <p className="text-[12px] text-neutral-600 font-medium mt-0.5 leading-relaxed">
                    {isPartner
                      ? "Nhận hoa hồng không giới hạn trên toàn bộ đơn mua sắm của bạn bè."
                      : `${maxReferralOrders} đơn hàng đầu tiên tính độc lập cho từng người bạn được mời.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-2xs">
                  <Clock size={16} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-neutral-900">
                    Hiệu lực trong {referralValidityMonths} tháng
                  </h3>
                  <p className="text-[12px] text-neutral-600 font-medium mt-0.5 leading-relaxed">
                    Mọi đơn phát sinh trong {referralValidityMonths} tháng kể từ lúc bạn bè đăng ký tài khoản đều được ghi nhận hoa hồng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 bước đơn giản - Responsive Clean Layout */}
          <div className="rounded-2xl bg-gradient-to-r from-primary-50/70 via-pink-50/40 to-primary-50/70 p-3 sm:p-3.5 border border-primary-200/80 shadow-2xs">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center items-center">
              <div className="flex flex-col items-center">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  1
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-neutral-900 leading-tight">Gửi link mời</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  2
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-neutral-900 leading-tight">Bạn mua sắm</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black shadow-2xs mb-1">
                  3
                </span>
                <span className="text-[11px] sm:text-[12px] font-extrabold text-neutral-900 leading-tight">Nhận hoa hồng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 4. TIẾN TRÌNH ĐƠN HÀNG & DANH SÁCH BẠN BÈ ═══ */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-cute border border-primary-100/80 flex flex-col gap-4 overflow-hidden">
        {/* Navigation Tabs - Segmented Mobile-First Pill Design */}
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
            <span className="text-[10.5px] text-neutral-400">Tự động đối soát</span>
          </div>
        </div>

        {/* Tab 1: Tiến trình đơn hàng */}
        {activeTab === "timeline" && (
          <>
            {friendOrderTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-gradient-to-b from-primary-50/30 via-white to-white border border-dashed border-primary-200/70">
                <div className="relative mb-3.5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/25 ring-4 ring-primary-50 text-white">
                    <Users size={28} strokeWidth={2.3} />
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
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/25 ring-4 ring-primary-50 text-white">
                    <Users size={28} strokeWidth={2.3} />
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
    </div>
  );
}
