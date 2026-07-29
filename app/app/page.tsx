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
import { InviteSection } from "@/components/customer/InviteSection";
import { PhoneNumberPrompt } from "@/components/customer/PhoneNumberPrompt";
import { IconBow, IllustCatWelcome } from "@/components/icons/CatRibbonIcons";

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
    <div className="flex flex-col gap-6 fade-in">

      {!customer?.phone && <PhoneNumberPrompt />}

      {/* ═══ HEADER CHÀO MỪNG ═══ */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-100 shadow-cute"
        style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #FFE4EC 50%, #FFF9FB 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary-200 opacity-40" />
        <div className="pointer-events-none absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-secondary-100 opacity-50" />

        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-3xl shadow-cute shrink-0">
              🐱
            </div>
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-primary-600 mb-1">
                MeowBack Member 🎀
              </p>
              <h1 className="text-[24px] sm:text-[30px] font-extrabold leading-tight text-neutral-900">
                Xin chào, <span className="text-primary-500">{firstName}</span>! 🐾
              </h1>
              <p className="mt-1 text-[13px] text-neutral-600 leading-relaxed font-medium">
                {allOrders.length === 0
                  ? "Chưa có đơn nào — hãy tạo link hoàn tiền ngay thôi 🧶"
                  : `Bạn có ${allOrders.length} đơn hàng đã ghi nhận. Tiếp tục tích nơ nhé! 🎀`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <a href="/app/refunds">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-2.5 text-[14px] font-bold text-white shadow-cute hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                Hoàn tiền ngay 🧶
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ═══ 4 STAT CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chờ duyệt */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shadow-sm">
              ⏳
            </div>
            <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Đang xử lý</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Chờ duyệt</div>
          <div className="text-[22px] font-extrabold text-neutral-900 tabular-nums leading-tight">{formatCurrency(pendingIncome)}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">
            {allOrders.filter((o) => o.orderStatus === "pending").length} đơn hàng
          </div>
        </div>

        {/* Card 2: Sẵn sàng rút */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#E6F8EE]/50 p-5 shadow-cute border border-[#B3EBD0] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F8EE] text-[#2D8A56] flex items-center justify-center font-bold text-lg shadow-sm">
              💰
            </div>
            <span className="rounded-full bg-[#E6F8EE] px-2.5 py-0.5 text-[10px] font-bold text-[#2D8A56]">Rút được</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Sẵn sàng rút</div>
          <div className="text-[22px] font-extrabold text-neutral-900 tabular-nums leading-tight">{formatCurrency(availableBalance)}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">
            {allOrders.filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid").length} đơn hàng
          </div>
        </div>

        {/* Card 3: Đã rút */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg shadow-sm">
              🏦
            </div>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold text-primary-600">Đã nhận</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Đã rút về ví</div>
          <div className="text-[22px] font-extrabold text-neutral-900 tabular-nums leading-tight">{formatCurrency(paidTotal)}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">
            {allOrders.filter((o) => o.payoutStatus === "paid").length} đơn hàng
          </div>
        </div>

        {/* Card 4: Tổng tích luỹ */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-primary-100/40 p-5 shadow-cute border border-primary-200/60 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-200 text-accent-bow flex items-center justify-center font-bold text-lg shadow-sm">
              🎀
            </div>
            <span className="rounded-full bg-primary-200 px-2.5 py-0.5 text-[10px] font-bold text-accent-bow">Tổng cộng</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Tổng tích luỹ</div>
          <div className="text-[22px] font-extrabold text-neutral-900 tabular-nums leading-tight">{formatCurrency(totalIncome)}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">{allOrders.length} đơn hàng</div>
        </div>
      </div>

      {/* ═══ BOTTOM PANELS ═══ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">

        {/* LỊCH SỬ ĐƠN HÀNG */}
        <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80 overflow-hidden">
          <div className="mb-4 flex items-center justify-between border-b border-primary-100 pb-4">
            <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-neutral-900">
              <span className="text-xl">📋</span>
              Lịch sử đơn hàng
            </h2>
            <a
              href="/app/orders"
              className="flex items-center gap-1 text-[13px] font-bold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Xem tất cả
              <ChevronRight size={16} strokeWidth={2.5} />
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="text-4xl mb-2">🐾</div>
              <div className="text-[15px] font-bold text-neutral-800">Chưa có đơn hàng nào</div>
              <div className="mt-1 text-[13px] text-neutral-500">Tạo link Shopee & TikTok Shop ngay để tích nơ hoàn tiền!</div>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-primary-50">
              {recentOrders.map((order) => {
                const platformCode = order.platform?.code?.toUpperCase() ?? "";
                const platformColor = PLATFORM_STYLE[platformCode]?.color ?? "#FF6D9E";
                const productImage = order.trackingLink?.productImage ?? null;
                const productTitle =
                  order.trackingLink?.productTitle ??
                  order.itemName ??
                  `Đơn hàng ${order.orderExternalId}`;

                return (
                  <li
                    key={order.id}
                    className="flex items-center gap-3 py-3.5 px-2 hover:bg-primary-50/50 rounded-2xl transition-colors"
                  >
                    <ProductThumb image={productImage} color={platformColor} platform={platformCode} />

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-bold text-neutral-900">{productTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-extrabold uppercase"
                          style={{ color: platformColor }}
                        >
                          {order.platform?.name ?? platformCode}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-[11px] text-neutral-500">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[13px] font-extrabold text-positive-deep whitespace-nowrap">
                        +{formatCurrency(order.customerRewardAmount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback"
                            ? "bg-negative-bg text-negative border border-primary-200"
                            : order.payoutStatus === "paid"
                            ? "bg-[#E6F8EE] text-[#2D8A56]"
                            : order.orderStatus === "processing"
                            ? "bg-[#EBF5FF] text-[#1E70BF]"
                            : order.orderStatus === "approved"
                            ? "bg-primary-100 text-primary-600"
                            : "bg-[#FFF8E1] text-[#B87A14]"
                        }`}
                      >
                        {order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback"
                          ? "Đã huỷ"
                          : order.payoutStatus === "paid"
                          ? "Đã rút"
                          : order.orderStatus === "processing"
                          ? "Đang đối soát"
                          : order.orderStatus === "approved"
                          ? "Sẵn sàng rút 🎀"
                          : "Chờ duyệt"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* PANEL RIGHT: Referral & Quick Nav */}
        <div className="flex flex-col gap-6">
          <InviteSection
            customerCode={customerCode}
            qrDataUrl={qrDataUrl}
            referralRate={referralRate}
            maxReferralOrders={maxReferralOrders}
            referralValidityMonths={referralValidityMonths}
            isPartner={customer?.isPartner ?? false}
          />

          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
            <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-neutral-900">
              <span>⚡</span>
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/app/wallet", label: "Ví tiền 💰", icon: "👛", bg: "bg-primary-50", text: "text-primary-600" },
                { href: "/app/refunds", label: "Hoàn tiền 🧶", icon: "🎀", bg: "bg-secondary-50", text: "text-neutral-900" },
                { href: "/app/orders", label: "Đơn hàng 📦", icon: "🛍️", bg: "bg-primary-50", text: "text-primary-600" },
                { href: "/app/deals", label: "Ưu đãi 🔥", icon: "✨", bg: "bg-secondary-50", text: "text-neutral-900" },
              ].map(({ href, label, icon, bg, text }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 rounded-2xl ${bg} p-3 transition-all hover:scale-[1.02] hover:shadow-sm border border-primary-100/50`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-[12px] font-bold ${text}`}>{label}</span>
                </a>
              ))}
            </div>
          </div>
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
      <img
        src={image}
        alt=""
        className="h-11 w-11 shrink-0 rounded-2xl object-cover border border-primary-100 shadow-sm"
      />
    );
  }
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm bg-primary-100 text-primary-500"
    >
      <ShoppingBag size={18} strokeWidth={2} />
    </div>
  );
}

