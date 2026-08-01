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
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { InviteSection } from "@/components/customer/InviteSection";
import { PhoneNumberPrompt } from "@/components/customer/PhoneNumberPrompt";
import { PwaInstallHorizontalCard } from "@/components/pwa/PwaInstallPrompt";
import { FadeUp } from "@/components/ui/FadeUp";
import { LiquidButton } from "@/components/ui/LiquidButton";
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

  const [customer, activeRule, allOrders] = await Promise.all([
    prisma.customer.findUnique({
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
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { customerId: session.customerId },
      select: { orderStatus: true, payoutStatus: true, customerRewardAmount: true },
    }),
  ]);

  const recentOrders = customer?.orders ?? [];
  const totalIncome = allOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const pendingIncome = allOrders
    .filter((o) => o.orderStatus === "pending")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const availableBalance = allOrders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const paidTotal = allOrders
    .filter((o) => o.payoutStatus === "paid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  const firstName = (customer?.fullName ?? session.fullName).split(" ").at(-1) ?? "bạn";
  const customerCode = customer?.customerCode ?? "";
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://meowback.vn"}/register?ref=${customerCode}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#3D2A30", light: "#ffffff" },
    });
  } catch (_) {}

  return (
    <div className="flex flex-col gap-16 py-8 pb-32">
      {!customer?.phone && (
        <FadeUp delay={0}>
          <PhoneNumberPrompt />
        </FadeUp>
      )}

      {/* ═══ HEADER CHÀO MỪNG & PWA ═══ */}
      <div className="flex flex-col gap-4">
        <FadeUp delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-200/40 to-pink-300/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-accent-bow/20 to-primary-100/30 blur-xl" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                  <img src="/meow-back-mascot.png" alt="MeowBack Mascot" className="w-full h-full object-contain rounded-2xl" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-primary-200/80 text-[11px] font-black uppercase tracking-widest text-primary-600 shadow-xs mb-2">
                    <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                    MeowBack Member
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                    Xin chào, <span className="text-primary-500">{firstName}</span>!
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                    {allOrders.length === 0
                      ? "Chưa có đơn nào — hãy tạo link hoàn tiền ngay thôi 🧶"
                      : `Bạn có ${allOrders.length} đơn hàng đã ghi nhận. Tiếp tục mua sắm và tích nơ cùng MeowBack nhé! 🎀`}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center pt-2 sm:pt-0">
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

      {/* ═══ 4 STAT CARDS (Asymmetrical Bento & Hover Physics) ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <FadeUp delay={0.2}>
          <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/70 hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-black text-xl border border-amber-100 group-hover:scale-105 transition-transform">
                ⏳
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 tracking-wider">Đang xử lý</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Chờ duyệt</div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight">{formatCurrency(pendingIncome)}</div>
            <div className="mt-1 text-[11px] text-neutral-500 font-medium">
              {allOrders.filter((o) => o.orderStatus === "pending").length} đơn hàng
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/70 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xl border border-emerald-100 group-hover:scale-105 transition-transform">
                💰
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700 tracking-wider">Rút được</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Sẵn sàng rút</div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight">{formatCurrency(availableBalance)}</div>
            <div className="mt-1 text-[11px] text-neutral-500 font-medium">
              {allOrders.filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid").length} đơn hàng
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/70 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl border border-indigo-100 group-hover:scale-105 transition-transform">
                🏦
              </div>
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-700 tracking-wider">Đã nhận</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Đã rút về ví</div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight">{formatCurrency(paidTotal)}</div>
            <div className="mt-1 text-[11px] text-neutral-500 font-medium">
              {allOrders.filter((o) => o.payoutStatus === "paid").length} đơn hàng
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.5}>
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0] p-5 sm:p-6 shadow-sm border border-primary-200/80 hover:border-primary-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-black text-xl border border-primary-200 group-hover:scale-105 transition-transform">
                🎀
              </div>
              <span className="rounded-full bg-primary-50 border border-primary-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-primary-700 tracking-wider">Tổng cộng</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary-800/60 mb-1">Tổng tích luỹ</div>
            <div className="text-2xl sm:text-3xl font-black text-primary-900 tabular-nums leading-tight">{formatCurrency(totalIncome)}</div>
            <div className="mt-1 text-[11px] text-primary-700 font-medium">
              {allOrders.length} đơn hàng
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ═══ BOTTOM PANELS (Editorial Split / Bento Asymmetric) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LỊCH SỬ ĐƠN HÀNG (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <FadeUp delay={0.6}>
            <div className="flex items-end justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center shadow-xs border border-neutral-200 shrink-0 text-lg">
                  📋
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-0.5">Activity</div>
                  <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Lịch sử đơn hàng</h2>
                </div>
              </div>
              <Link
                href="/app/orders"
                className="group flex items-center gap-2 text-[14px] font-bold text-neutral-500 hover:text-primary-600 transition-colors pb-2"
              >
                Xem tất cả
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <ChevronRight size={14} strokeWidth={3} className="text-neutral-400 group-hover:text-primary-600" />
                </div>
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.7}>
            <div className="p-2 rounded-[2.5rem] bg-white ring-1 ring-neutral-100 shadow-sm">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-neutral-50/50 p-4 sm:p-8 border border-neutral-100/50">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <div className="text-5xl mb-6 opacity-50 grayscale">🐾</div>
                    <div className="text-[18px] font-extrabold text-neutral-900">Chưa có đơn hàng nào</div>
                    <div className="mt-2 text-[15px] text-neutral-500 max-w-sm">Tạo link Shopee & TikTok Shop ngay để tích nơ hoàn tiền!</div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {recentOrders.map((order) => {
                      const platformCode = order.platform?.code?.toUpperCase() ?? "";
                      const platformColor = PLATFORM_STYLE[platformCode]?.color ?? "#FF6D9E";
                      const productImage = order.trackingLink?.productImage ?? null;
                      const productTitle = order.trackingLink?.productTitle ?? order.itemName ?? `Đơn hàng ${order.orderExternalId}`;

                      return (
                        <li
                          key={order.id}
                          className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-5 px-6 bg-white hover:bg-primary-50/30 rounded-[1.5rem] border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-500"
                        >
                          <div className="flex items-center gap-5 flex-1 min-w-0">
                            <ProductThumb image={productImage} color={platformColor} platform={platformCode} />
                            
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="truncate text-[15px] font-bold text-neutral-900 tracking-tight">{productTitle}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span
                                  className="text-[11px] font-extrabold uppercase tracking-wider"
                                  style={{ color: platformColor }}
                                >
                                  {order.platform?.name ?? platformCode}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-neutral-200"></span>
                                <span className="text-[12px] font-medium text-neutral-400">{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-4 sm:pt-0 sm:pl-6">
                            <span className="text-[16px] font-black text-positive-deep whitespace-nowrap">
                              +{formatCurrency(order.customerRewardAmount)}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap ${
                                order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback"
                                  ? "bg-negative-bg text-negative"
                                  : order.payoutStatus === "paid"
                                  ? "bg-[#E6F8EE] text-[#2D8A56]"
                                  : order.orderStatus === "processing"
                                  ? "bg-[#EBF5FF] text-[#1E70BF]"
                                  : order.orderStatus === "approved"
                                  ? "bg-primary-100 text-primary-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback"
                                ? "Đã huỷ"
                                : order.payoutStatus === "paid"
                                ? "Đã rút"
                                : order.orderStatus === "processing"
                                ? "Đang đối soát"
                                : order.orderStatus === "approved"
                                ? "Sẵn sàng"
                                : "Chờ duyệt"}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* PANEL RIGHT: Referral & Quick Nav (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-10">

          <FadeUp delay={0.9}>
            <div className="h-full flex flex-col gap-6">
              <InviteSection
                customerCode={customerCode}
                qrDataUrl={qrDataUrl}
                referralRate={referralRate}
                maxReferralOrders={maxReferralOrders}
                referralValidityMonths={referralValidityMonths}
                isPartner={customer?.isPartner ?? false}
              />
            </div>
          </FadeUp>
        </div>
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
