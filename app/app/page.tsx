import { redirect } from "next/navigation";
import {
  Clock,
  Wallet,
  Package,
  ArrowUpRight,
  ShoppingBag,
  ChevronRight,
  Gift,
  Zap,
} from "lucide-react";
import QRCode from "qrcode";
import { getSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import {
  IconPaidSuccessBadge,
  IconAccumulatedBag,
  IconPendingHourglass,
  IconReadyToWithdraw,
} from "@/components/icons/FinanceBadgeIcons";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";
import { InviteSection } from "@/components/customer/InviteSection";
import { PhoneNumberPrompt } from "@/components/customer/PhoneNumberPrompt";
import { resolveDisplayProductName, resolveDisplayProductImage } from "@/lib/productInfo";
import { PwaInstallHorizontalCard } from "@/components/pwa/PwaInstallPrompt";
import { FadeUp } from "@/components/ui/FadeUp";
import { LiquidButton } from "@/components/ui/LiquidButton";
import { HoverCard } from "@/components/ui/HoverCard";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { ShineEffect } from "@/components/ui/ShineEffect";
import Link from "next/link";

const PLATFORM_STYLE: Record<string, { color: string }> = {
  SHOPEE: { color: "#FF6D9E" },
  TIKTOK: { color: "#3D2A30" },
  LAZADA: { color: "#0F146D" },
  TIKI: { color: "#1A73E8" },
};

export default async function CustomerHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin" || !session.customerId) redirect("/admin");

  let customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          trackingLink: { select: { productImage: true, productTitle: true } },
          platform: { select: { code: true, name: true } },
        },
      },
      trackingLinks: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!customer) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customer: true },
    });

    if (dbUser?.customer) {
      await setSessionCookie({
        userId: dbUser.id,
        role: dbUser.role as "admin" | "customer",
        fullName: dbUser.fullName,
        customerId: dbUser.customer.id,
      });
      redirect("/app");
    } else {
      clearSessionCookie();
      redirect("/login?error=" + encodeURIComponent("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại."));
    }
  }

  const [activeRule, allOrders] = await Promise.all([
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { customerId: customer.id },
      select: { orderStatus: true, payoutStatus: true, customerRewardAmount: true },
    }),
  ]);

  const recentOrders = customer?.orders ?? [];
  
  // 1. Đơn đang chờ đối soát từ sàn (pending: mới ghi nhận, processing: sàn báo hoàn thành trong 15 ngày đối soát)
  const pendingOrders = allOrders.filter(
    (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
  );
  const pendingIncome = pendingOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  // 2. Đơn đã duyệt đối soát xong, tiền đã về ví sẵn sàng rút
  const availableOrders = allOrders.filter(
    (o) => o.orderStatus === "approved" && o.payoutStatus !== "paid"
  );
  const availableBalance = availableOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  // 3. Đơn đã giải ngân thành công về ngân hàng
  const paidOrders = allOrders.filter((o) => o.payoutStatus === "paid");
  const paidTotal = paidOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  // 4. Tổng tích lũy thực nhận (chỉ tính tiền ĐÃ VỀ VÍ hoặc ĐÃ RÚT THÀNH CÔNG, không cộng tiền đang chờ đối soát)
  const totalIncome = availableBalance + paidTotal;

  const rawName = (customer?.fullName || session?.fullName || "").trim();
  const firstName = rawName.split(/\s+/).filter(Boolean).at(-1) || rawName || "bạn";
  const customerCode = customer?.customerCode ?? "";
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://meowback.shop"}/register?ref=${customerCode}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#3D2A30", light: "#ffffff" },
    });
  } catch (_) {}

  return (
    <div className="flex flex-col gap-10 sm:gap-12 pb-16">
      {(!customer?.phone || customer.phone.trim() === "") && (
        <FadeUp delay={0}>
          <PhoneNumberPrompt initialPhone={customer?.phone} />
        </FadeUp>
      )}

      {/* ═══ HEADER CHÀO MỪNG & PWA ═══ */}
      <div className="flex flex-col gap-4">
        <FadeUp delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
            <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
              <FloatingElement duration={4}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                  <img src="/meow-back-mascot.png" alt="MeowBack Mascot" className="w-full h-full object-contain rounded-2xl" />
                </div>
              </FloatingElement>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-primary-200/80 text-[11px] font-black uppercase tracking-widest text-primary-600 shadow-xs mb-2 backdrop-blur-md">
                  <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                  MeowBack Member
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                  Xin chào, <span className="text-primary-600 drop-shadow-sm">{firstName}</span>!
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-neutral-800 font-semibold leading-relaxed max-w-xl drop-shadow-sm">
                  {allOrders.length === 0
                    ? "Chưa có đơn nào — hãy tạo link hoàn tiền ngay thôi 🧶"
                    : `Bạn có ${allOrders.length} đơn hàng đã ghi nhận. Tiếp tục mua sắm và tích nơ cùng MeowBack nhé! 🎀`}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center pt-2 sm:pt-0 relative overflow-hidden group rounded-[2rem]">
              <ShineEffect />
              <Link href="/app/refunds">
                <LiquidButton icon={<ArrowUpRight size={18} strokeWidth={2.5} className="text-white" />}>
                  Hoàn tiền ngay 🎀
                </LiquidButton>
              </Link>
            </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <PwaInstallHorizontalCard />
        </FadeUp>
      </div>

      {/* ═══ 4 STAT CARDS (Bố cục 1 hàng 2 cột, giàu thông tin, không bị trống) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* CARD 1: CHỜ DUYỆT */}
        <FadeUp delay={0.2}>
          <HoverCard>
            <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
              {/* Watermark mờ nghệ thuật trang trí góc dưới phải */}
              <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <IconPendingHourglass size={96} />
              </div>

              {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/80 border border-amber-100/90 shadow-2xs group-hover:scale-105 transition-transform p-1">
                    <IconPendingHourglass size={38} />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Chờ duyệt</div>
                    <div className="text-[12px] font-semibold text-neutral-600">
                      {pendingOrders.length} đơn hàng đang xử lý
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-amber-700 tracking-wider">
                  Đang xử lý
                </span>
              </div>

              {/* Tầng 2: Số tiền lớn & Nút xem đơn */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-neutral-100">
                <div>
                  <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Tiền chờ đối soát</div>
                  <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight">
                    {formatCurrency(pendingIncome)}
                  </div>
                </div>
                <Link
                  href="/app/orders"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 text-[12px] font-bold border border-amber-200/60 transition-all hover:translate-x-0.5 shrink-0 shadow-2xs"
                >
                  <span>Xem đơn</span>
                  <ChevronRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
              <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="leading-snug">Chờ sàn xác nhận hoàn tất</span>
              </div>
            </div>
          </HoverCard>
        </FadeUp>

        {/* CARD 2: SẴN SÀNG RÚT */}
        <FadeUp delay={0.3}>
          <HoverCard>
            <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
              {/* Watermark mờ nghệ thuật trang trí góc dưới phải */}
              <div className="absolute -right-3 -bottom-3 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <IconReadyToWithdraw size={96} />
              </div>

              {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50/80 border border-emerald-100/90 shadow-2xs group-hover:scale-105 transition-transform p-1">
                    <IconReadyToWithdraw size={38} />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Sẵn sàng rút</div>
                    <div className="text-[12px] font-semibold text-neutral-600">
                      {availableOrders.length} đơn hàng khả dụng
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
                  Rút được
                </span>
              </div>

              {/* Tầng 2: Số tiền lớn & Nút rút tiền */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-neutral-100">
                <div>
                  <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Số dư khả dụng</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-tight">
                    {formatCurrency(availableBalance)}
                  </div>
                </div>
                <Link
                  href="/app/wallet"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[12px] font-bold shadow-sm shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Rút tiền</span>
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
              <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="leading-snug">Rút về ngân hàng 24/7 bất kỳ lúc nào</span>
              </div>
            </div>
          </HoverCard>
        </FadeUp>

        {/* CARD 3: ĐÃ RÚT VỀ VÍ (XANH LÁ NGỌC VỚI TIỀN & ĐỒNG XU & CHECKMARK) */}
        <FadeUp delay={0.4}>
          <HoverCard>
            <div className="group h-full relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
              {/* Watermark mờ nghệ thuật trang trí góc dưới phải */}
              <div className="absolute -right-3 -bottom-3 opacity-[0.09] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <IconPaidSuccessBadge size={96} />
              </div>

              {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50/80 border border-emerald-100/90 shadow-2xs group-hover:scale-105 transition-transform p-1">
                    <IconPaidSuccessBadge size={40} />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">Đã rút về ví</div>
                    <div className="text-[12px] font-semibold text-neutral-600">
                      {paidOrders.length} đơn đã giải ngân
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
                  Đã nhận
                </span>
              </div>

              {/* Tầng 2: Số tiền lớn & Nút lịch sử ví */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-neutral-100">
                <div>
                  <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Tổng tiền đã nhận</div>
                  <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight">
                    {formatCurrency(paidTotal)}
                  </div>
                </div>
                <Link
                  href="/app/wallet"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 text-[12px] font-bold border border-emerald-200/60 transition-all hover:translate-x-0.5 shrink-0 shadow-2xs"
                >
                  <span>Lịch sử ví</span>
                  <ChevronRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
              <div className="relative z-10 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="leading-snug">Đã giải ngân thành công về ngân hàng</span>
              </div>
            </div>
          </HoverCard>
        </FadeUp>

        {/* CARD 4: TỔNG TÍCH LUỸ (TÚI TIỀN VÀNG KIM ĐẦY ĐẶN) */}
        <FadeUp delay={0.5}>
          <HoverCard>
            <div className="group h-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0] p-5 sm:p-6 shadow-sm border border-primary-200/80 hover:border-primary-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5">
              {/* Watermark mờ nghệ thuật trang trí góc dưới phải */}
              <div className="absolute -right-3 -bottom-3 opacity-[0.09] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <IconAccumulatedBag size={96} />
              </div>

              {/* Tầng 1: Icon + Phân loại + Badge trạng thái */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50/90 border border-amber-200/70 shadow-2xs group-hover:scale-105 transition-transform p-1">
                    <IconAccumulatedBag size={40} />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold uppercase tracking-wider text-primary-800/60">Tổng tích luỹ</div>
                    <div className="text-[12px] font-semibold text-primary-700">
                      {allOrders.length} đơn hàng đã mua
                    </div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-primary-50 border border-primary-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-primary-700 tracking-wider">
                  Tổng cộng
                </span>
              </div>

              {/* Tầng 2: Số tiền lớn & Nút tất cả đơn */}
              <div className="relative z-10 flex items-end justify-between gap-3 pt-2.5 border-t border-primary-200/60">
                <div>
                  <div className="text-[10.5px] font-semibold text-primary-800/60 uppercase tracking-wider">Tổng thu nhập trọn đời</div>
                  <div className="text-2xl sm:text-3xl font-black text-primary-900 tabular-nums leading-tight">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>
                <Link
                  href="/app/orders"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white text-[12px] font-bold shadow-sm shadow-primary-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Tất cả đơn</span>
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Tầng 3: Dòng trạng thái ngữ cảnh */}
              <div className="relative z-10 flex items-center gap-2 text-[11px] text-primary-700/85 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="leading-snug">Đã tích luỹ thành công về ví</span>
              </div>
            </div>
          </HoverCard>
        </FadeUp>
      </div>

      {/* ═══ 2 BẢNG CHÍNH: ĐƠN HÀNG & MỜI BẠN BÈ (Cân xứng 50-50, Dễ nhìn, Rõ ràng) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* CỘT 1: LỊCH SỬ ĐƠN HÀNG */}
        <FadeUp delay={0.6}>
          <div className="h-full rounded-3xl bg-white border border-neutral-200/80 shadow-sm p-4 sm:p-6 flex flex-col justify-between gap-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2.5 mb-3.5 sm:mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-2xs shrink-0">
                    <ShoppingBag size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-400 whitespace-nowrap">
                      Hoạt động mua sắm
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight whitespace-nowrap">
                      Đơn hàng gần đây
                    </h2>
                  </div>
                </div>

                <Link
                  href="/app/orders"
                  className="flex items-center gap-1 text-[11.5px] sm:text-xs font-bold text-neutral-500 hover:text-primary-600 bg-neutral-100 hover:bg-primary-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all shrink-0 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Xem tất cả ({allOrders.length})</span>
                  <span className="sm:hidden">Tất cả ({allOrders.length})</span>
                  <ChevronRight size={13} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Order List */}
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <img src="/meow-back-mascot.png" alt="" className="h-20 w-20 object-contain opacity-70" />
                  <div className="text-sm font-extrabold text-neutral-800">Chưa có đơn hàng nào</div>
                  <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                    Tạo link mua sắm ngay để nhận hoàn tiền tự động từ Shopee, TikTok Shop, Lazada 🎀
                  </p>
                  <Link
                    href="/app/refunds"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-100 transition-colors"
                  >
                    <span>Tạo link ngay</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {recentOrders.slice(0, 4).map((order) => {
                    const platformCode = order.platform?.code?.toUpperCase() ?? "SHOPEE";
                    const isCancelled = order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback";
                    const isPaid = order.payoutStatus === "paid";
                    const isApproved = order.orderStatus === "approved";
                    const isProcessing = order.orderStatus === "processing";
                    const productImage = resolveDisplayProductImage(order.trackingLink?.productImage);
                    const productTitle = resolveDisplayProductName(order.trackingLink?.productTitle, order.itemName, `Đơn hàng ${order.orderExternalId}`);

                    return (
                      <Link
                        key={order.id}
                        href="/app/orders"
                        className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-white hover:bg-primary-50/40 border-[1.5px] border-primary-200/90 hover:border-primary-300 shadow-2xs transition-all"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover border border-neutral-200"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-50/80 border border-neutral-200/80 shadow-2xs shrink-0">
                                {platformCode === "SHOPEE" ? (
                                  <ShopeeIcon className="w-6 h-6" />
                                ) : platformCode === "TIKTOK" ? (
                                  <TiktokIcon className="w-6 h-6" />
                                ) : platformCode === "LAZADA" ? (
                                  <LazadaIcon className="w-6 h-6" />
                                ) : (
                                  <Package size={20} className="text-primary-500" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pr-1">
                            <p className="truncate text-[13px] font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                              {productTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400 font-medium">
                              <span
                                className="font-extrabold uppercase text-[10px] px-1.5 py-0.2 rounded bg-white border border-neutral-200"
                                style={{ color: PLATFORM_STYLE[platformCode]?.color ?? "#FF6D9E" }}
                              >
                                {order.platform?.name ?? platformCode}
                              </span>
                              <span>•</span>
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Status Badge */}
                        <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                          <span
                            className={`text-[14px] font-black tabular-nums ${
                              isCancelled
                                ? "text-neutral-400 line-through"
                                : isPaid
                                ? "text-emerald-600"
                                : isApproved
                                ? "text-primary-600"
                                : "text-amber-600"
                            }`}
                          >
                            {isCancelled ? "" : "+"}{formatCurrency(order.customerRewardAmount)}
                          </span>

                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCancelled
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isProcessing
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : isApproved
                                ? "bg-primary-100 text-primary-700 border border-primary-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {isCancelled
                              ? "Đã huỷ"
                              : isPaid
                              ? "Đã rút"
                              : isProcessing
                              ? "Đối soát"
                              : isApproved
                              ? "Sẵn sàng"
                              : "Chờ duyệt"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer action */}
            {allOrders.length > 0 && (
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Ghi nhận hoàn tiền trong 24h</span>
                <Link
                  href="/app/orders"
                  className="font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                >
                  <span>Xem toàn bộ {allOrders.length} đơn</span>
                  <ChevronRight size={12} strokeWidth={2.5} />
                </Link>
              </div>
            )}
          </div>
        </FadeUp>

        {/* CỘT 2: MỜI BẠN BÈ */}
        <FadeUp delay={0.7}>
          <InviteSection
            customerCode={customerCode}
            qrDataUrl={qrDataUrl}
            referralRate={referralRate}
            maxReferralOrders={maxReferralOrders}
            referralValidityMonths={referralValidityMonths}
            isPartner={customer?.isPartner ?? false}
          />
        </FadeUp>
      </div>
    </div>
  );
}

function ProductThumb({
  image,
  color,
  platform,
}: {
  image: string | null;
  color: string;
  platform: string;
}) {
  if (image) {
    return (
      <div className="p-1 rounded-[1.25rem] border border-neutral-100 bg-neutral-50 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
        <img
          src={image}
          alt=""
          className="h-12 w-12 rounded-2xl object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="p-1 rounded-[1.25rem] border border-primary-100 bg-primary-50 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-500 shadow-sm">
        <ShoppingBag size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
}
