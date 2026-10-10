import {
  Users,
  Link2,
  Package,
  CircleDollarSign,
  TriangleAlert,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Store,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import { TopReferrersWidget } from "@/components/admin/TopReferrersWidget";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";

export default async function AdminDashboardPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(currentYear, now.getMonth(), 1);
  const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Dọn dẹp tài khoản SYSTEM (Link chia sẻ công khai) nếu còn sót trên database production
  try {
    const sysCust = await prisma.customer.findUnique({
      where: { customerCode: "SYSTEM" },
      select: { id: true },
    });
    if (sysCust) {
      await prisma.trackingLink.deleteMany({ where: { customerId: sysCust.id } });
      await prisma.customer.delete({ where: { id: sysCust.id } });
    }
  } catch {
    // ignore
  }

  const [
    totalCustomers,
    totalLinks,
    totalOrders,
    commissionAgg,
    rewardAgg,
    profitAgg,
    paidAgg,
    unmappedOrders,
    orders,
    platforms,
    topBuyersRaw,
    topReferrersMonthRaw,
    topReferrersAllTimeRaw,
    totalReferralsThisMonth,
  ] = await Promise.all([
    prisma.customer.count({ where: { customerCode: { not: "SYSTEM" } } }),
    prisma.trackingLink.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { commissionAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: { not: "paid" } } }),
    prisma.order.aggregate({ _sum: { systemProfitAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: "paid" } }),
    prisma.order.count({ where: { OR: [{ customerId: null }, { trackingLinkId: null }] } }),
    prisma.order.findMany({
      select: {
        commissionAmount: true,
        customerRewardAmount: true,
        systemProfitAmount: true,
        orderedAt: true,
        createdAt: true,
        platformId: true,
        orderStatus: true,
      },
    }),
    prisma.platform.findMany({ select: { id: true, name: true, code: true } }),
    prisma.order.groupBy({
      by: ["customerId"],
      _count: { _all: true },
      _sum: { customerRewardAmount: true },
      orderBy: { _count: { customerId: "desc" } },
      take: 5,
      where: { customerId: { not: null } },
    }),
    prisma.customer.groupBy({
      by: ["referredById"],
      where: {
        referredById: { not: null },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.customer.groupBy({
      by: ["referredById"],
      where: {
        referredById: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.customer.count({
      where: {
        customerCode: { not: "SYSTEM" },
        referredById: { not: null },
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  const commission = Number(commissionAgg._sum.commissionAmount ?? 0);
  const profit = Number(profitAgg._sum.systemProfitAmount ?? 0);
  const debt = Number(rewardAgg._sum.customerRewardAmount ?? 0);
  const paid = Number(paidAgg._sum.customerRewardAmount ?? 0);

  const topBuyerIds = topBuyersRaw.map((t) => t.customerId).filter(Boolean) as string[];
  const topBuyersData = await prisma.customer.findMany({
    where: { id: { in: topBuyerIds } },
    select: { id: true, fullName: true, customerCode: true },
  });
  const buyerMap = new Map(topBuyersData.map((c) => [c.id, c]));

  const topBuyersList = topBuyersRaw.map((t) => {
    const c = t.customerId ? buyerMap.get(t.customerId) : null;
    return {
      id: t.customerId ?? "",
      name: c?.fullName ?? "Khách hàng ẩn danh",
      code: c?.customerCode ?? "C000",
      orderCount: t._count._all,
      totalReward: Number(t._sum.customerRewardAmount ?? 0),
    };
  });

  const maxOrders = topBuyersList[0]?.orderCount || 1;

  // ─── TOP 10 NGƯỜI MỜI NHIỀU NHẤT TRONG THÁNG & TOÀN THỜI GIAN ───
  const allReferrerIds = Array.from(
    new Set([
      ...topReferrersMonthRaw.map((r) => r.referredById).filter(Boolean),
      ...topReferrersAllTimeRaw.map((r) => r.referredById).filter(Boolean),
    ])
  ) as string[];

  const referrersData = await prisma.customer.findMany({
    where: { id: { in: allReferrerIds } },
    select: {
      id: true,
      fullName: true,
      customerCode: true,
      phone: true,
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
      momoNumber: true,
      momoName: true,
      _count: {
        select: { referredUsers: true },
      },
    },
  });
  const refMap = new Map(referrersData.map((c) => [c.id, c]));

  const monthTopList = topReferrersMonthRaw.map((r) => {
    const c = r.referredById ? refMap.get(r.referredById) : null;
    return {
      id: r.referredById ?? "",
      name: c?.fullName ?? "Khách hàng ẩn danh",
      code: c?.customerCode ?? "C000",
      phone: c?.phone ?? null,
      bankName: c?.bankName ?? null,
      bankAccountNumber: c?.bankAccountNumber ?? null,
      bankAccountName: c?.bankAccountName ?? null,
      momoNumber: c?.momoNumber ?? null,
      momoName: c?.momoName ?? null,
      countThisMonth: r._count.id,
      totalReferrals: c?._count.referredUsers ?? r._count.id,
    };
  });

  const allTimeTopList = topReferrersAllTimeRaw.map((r) => {
    const c = r.referredById ? refMap.get(r.referredById) : null;
    return {
      id: r.referredById ?? "",
      name: c?.fullName ?? "Khách hàng ẩn danh",
      code: c?.customerCode ?? "C000",
      phone: c?.phone ?? null,
      bankName: c?.bankName ?? null,
      bankAccountNumber: c?.bankAccountNumber ?? null,
      bankAccountName: c?.bankAccountName ?? null,
      momoNumber: c?.momoNumber ?? null,
      momoName: c?.momoName ?? null,
      countThisMonth: 0,
      totalReferrals: r._count.id,
    };
  });

  // Serialize dữ liệu order cho biểu đồ drill-down (Year → Month → Week)
  const orderData = orders.map((o) => {
    const d = new Date(o.orderedAt ?? o.createdAt);
    return {
      date: d.toISOString().slice(0, 10),
      commission: Number(o.commissionAmount),
      reward: Number(o.customerRewardAmount),
      profit: Number(o.systemProfitAmount),
    };
  });

  // ─── TỔNG HỢP HOA HỒNG & LỢI NHUẬN THEO THÁNG (TÀI CHÍNH TOÀN DIỆN) ───
  const byMonth = new Map<string, { count: number; commission: number; reward: number; profit: number }>();
  for (const o of orders) {
    const d = new Date(o.orderedAt ?? o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = byMonth.get(key) ?? { count: 0, commission: 0, reward: 0, profit: 0 };
    cur.count += 1;
    cur.commission += Number(o.commissionAmount);
    cur.reward += Number(o.customerRewardAmount);
    cur.profit += Number(o.systemProfitAmount);
    byMonth.set(key, cur);
  }
  const monthRows = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  // ─── TỶ TRỌNG SÀN THƯƠNG MẠI ĐIỆN TỬ (SHOPEE, TIKTOK SHOP, LAZADA) ───
  const PLATFORM_CONFIG: Record<
    string,
    {
      name: string;
      color: string;
      barGradient: string;
      badgeBg: string;
      borderColor: string;
      bgLight: string;
      brandCode: "SHOPEE" | "TIKTOK" | "LAZADA" | "OTHER";
    }
  > = {
    SHOPEE: {
      name: "Shopee",
      color: "#EE4D2D",
      barGradient: "from-[#EE4D2D] to-[#FF6B4A]",
      badgeBg: "bg-[#EE4D2D]",
      borderColor: "border-orange-200/70",
      bgLight: "bg-orange-50/50",
      brandCode: "SHOPEE",
    },
    TIKTOK: {
      name: "TikTok Shop",
      color: "#0F172A",
      barGradient: "from-neutral-900 to-neutral-700",
      badgeBg: "bg-neutral-900",
      borderColor: "border-neutral-200/80",
      bgLight: "bg-neutral-50/80",
      brandCode: "TIKTOK",
    },
    LAZADA: {
      name: "Lazada",
      color: "#0F146D",
      barGradient: "from-[#0F146D] via-[#1054DE] to-[#F3006C]",
      badgeBg: "bg-[#0F146D]",
      borderColor: "border-blue-200/70",
      bgLight: "bg-blue-50/50",
      brandCode: "LAZADA",
    },
  };

  // Khởi tạo trước tất cả các sàn có trong hệ thống (Shopee, TikTok, Lazada)
  const platformStatsMap = new Map<
    string,
    {
      id: string;
      code: string;
      name: string;
      count: number;
    }
  >();

  for (const p of platforms) {
    const code = p.code.toUpperCase();
    platformStatsMap.set(p.id, {
      id: p.id,
      code,
      name: p.name,
      count: 0,
    });
  }

  for (const o of orders) {
    if (o.platformId && platformStatsMap.has(o.platformId)) {
      platformStatsMap.get(o.platformId)!.count += 1;
    }
  }

  const totalPlatformOrders = Array.from(platformStatsMap.values()).reduce((sum, item) => sum + item.count, 0) || 1;

  const platformShare = Array.from(platformStatsMap.values())
    .map((item) => {
      const config = PLATFORM_CONFIG[item.code] || {
        name: item.name,
        color: "#6B7280",
        barGradient: "from-neutral-600 to-neutral-400",
        badgeBg: "bg-neutral-700",
        borderColor: "border-neutral-200",
        bgLight: "bg-neutral-50",
        brandCode: "OTHER" as const,
      };
      const pct = Math.round((item.count / totalPlatformOrders) * 100);
      return {
        ...item,
        pct,
        ...config,
      };
    })
    .sort((a, b) => b.count - a.count);

  // ─── SỨC KHOẺ ĐƠN HÀNG (TRẠNG THÁI DUYỆT & HOÀN TIỀN) ───
  const statusCounts = { approved: 0, pending: 0, cancelled: 0 };
  for (const o of orders) {
    if (o.orderStatus === "approved") statusCounts.approved += 1;
    else if (o.orderStatus === "cancelled") statusCounts.cancelled += 1;
    else statusCounts.pending += 1;
  }
  const statusTotal = statusCounts.approved + statusCounts.pending + statusCounts.cancelled || 1;
  const approvedPct = Math.round((statusCounts.approved / statusTotal) * 100);
  const pendingPct = Math.round((statusCounts.pending / statusTotal) * 100);
  const cancelledPct = Math.max(0, 100 - approvedPct - pendingPct);

  const statusRows = [
    {
      key: "approved",
      label: "Đã duyệt",
      sublabel: "Đủ điều kiện hoàn tiền",
      value: statusCounts.approved,
      pct: approvedPct,
      color: "#10B981",
      barGradient: "from-emerald-500 to-teal-500",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      dotBg: "bg-emerald-500",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border border-emerald-100",
    },
    {
      key: "pending",
      label: "Đang chờ",
      sublabel: "Chờ sàn đối soát kỳ này",
      value: statusCounts.pending,
      pct: pendingPct,
      color: "#F59E0B",
      barGradient: "from-amber-400 to-amber-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/70",
      dotBg: "bg-amber-400",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border border-amber-100",
    },
    {
      key: "cancelled",
      label: "Đã huỷ",
      sublabel: "Đơn hoàn hoặc huỷ mua",
      value: statusCounts.cancelled,
      pct: cancelledPct,
      color: "#94A3B8",
      barGradient: "from-neutral-400 to-slate-400",
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200/70",
      dotBg: "bg-slate-400",
      icon: XCircle,
      iconColor: "text-slate-500",
      iconBg: "bg-slate-50 border border-slate-200",
    },
  ];

  // ─── PHÂN TÍCH KHUNG GIỜ SĂN DEAL (PEAK SHOPPING HOURS) ───
  const hourBuckets = { night: 0, morning: 0, afternoon: 0, evening: 0 };
  for (const o of orders) {
    const d = new Date(o.orderedAt ?? o.createdAt);
    const hour = d.getHours();
    if (hour >= 0 && hour < 6) hourBuckets.night += 1;
    else if (hour >= 6 && hour < 12) hourBuckets.morning += 1;
    else if (hour >= 12 && hour < 18) hourBuckets.afternoon += 1;
    else hourBuckets.evening += 1;
  }
  const peakTotal = orders.length || 1;
  const peakRows = [
    {
      slot: "12:00 - 18:00",
      label: "Chiều Mua Sắm",
      subtext: "Giờ nghỉ trưa & săn deal xế chiều",
      count: hourBuckets.afternoon,
      pct: Math.round((hourBuckets.afternoon / peakTotal) * 100),
      emoji: "🛍️",
      barGradient: "from-amber-400 to-orange-500",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      color: "#F59E0B",
    },
    {
      slot: "18:00 - 24:00",
      label: "Tối Giờ Vàng",
      subtext: "Livestream & flash sale tối",
      count: hourBuckets.evening,
      pct: Math.round((hourBuckets.evening / peakTotal) * 100),
      emoji: "⚡",
      barGradient: "from-rose-500 to-pink-500",
      badgeClass: "bg-rose-50 text-rose-800 border-rose-200/70",
      color: "#F43F5E",
    },
    {
      slot: "06:00 - 12:00",
      label: "Sáng Công Sở",
      subtext: "Bắt đầu ngày mới & check giỏ hàng",
      count: hourBuckets.morning,
      pct: Math.round((hourBuckets.morning / peakTotal) * 100),
      emoji: "☕",
      barGradient: "from-sky-400 to-blue-500",
      badgeClass: "bg-sky-50 text-sky-800 border-sky-200/70",
      color: "#0EA5E9",
    },
    {
      slot: "00:00 - 06:00",
      label: "Flash Sale Đêm",
      subtext: "Săn deal 0h cực hời",
      count: hourBuckets.night,
      pct: Math.round((hourBuckets.night / peakTotal) * 100),
      emoji: "🌙",
      barGradient: "from-indigo-400 to-violet-500",
      badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/70",
      color: "#6366F1",
    },
  ].sort((a, b) => b.count - a.count);

  const topPeak = peakRows[0];

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">

      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-xl shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-amber-100/50 to-rose-100/30 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-mascot.png" alt="MeowBack Mascot" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-rose-200/80 text-[11px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-2">
                <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                MeowBack Admin Hub
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Bảng Điều Khiển Trung Tâm
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Hệ thống quản lý đối soát hoa hồng, số dư khả dụng & chi trả hoàn tiền toàn diện.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-200/70 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Hệ Thống Đang Hoạt Động</span>
          </div>
        </div>
      </div>

      {/* 4 KPI CARDS: 4 MÀU SẮC BIỆT LẬP, HIỆN ĐẠI, SẮC SẢO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Khách hàng (Sắc Hồng Rose / Pink) */}
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 p-3.5 sm:p-5 shadow-xs border border-rose-200/80 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <Users className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 text-rose-500/[0.06] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5 mb-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Users size={18} strokeWidth={2.4} />
            </div>
            <span className="rounded-full bg-rose-100/90 text-rose-700 border border-rose-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
              Thành viên
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-900/60 mb-0.5">
              Khách hàng
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-950 tabular-nums leading-tight">
              {totalCustomers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-[10px] sm:text-[11px] font-semibold text-rose-600/90 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0" />
              <span>Tài khoản kích hoạt</span>
            </div>
          </div>
        </div>

        {/* Card 2: Link tracking (Sắc Xanh Biển Sky / Blue) */}
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-50/70 via-white to-blue-50/50 p-3.5 sm:p-5 shadow-xs border border-sky-200/80 hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <Link2 className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 text-sky-500/[0.06] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5 mb-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Link2 size={18} strokeWidth={2.4} />
            </div>
            <span className="rounded-full bg-sky-100/90 text-sky-700 border border-sky-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
              Affiliate
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-900/60 mb-0.5">
              Link Tracking
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-950 tabular-nums leading-tight">
              {totalLinks.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-[10px] sm:text-[11px] font-semibold text-sky-600/90 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 shrink-0" />
              <span>Link đã khởi tạo</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tổng đơn hàng (Sắc Vàng Cam Amber / Orange) */}
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 p-3.5 sm:p-5 shadow-xs border border-amber-200/80 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <Package className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 text-amber-500/[0.06] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5 mb-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Package size={18} strokeWidth={2.4} />
            </div>
            <span className="rounded-full bg-amber-100/90 text-amber-800 border border-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
              Giao dịch
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900/60 mb-0.5">
              Tổng Đơn Hàng
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 tabular-nums leading-tight">
              {totalOrders.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-[10px] sm:text-[11px] font-semibold text-amber-700/90 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 shrink-0" />
              <span>Đơn hàng đối soát</span>
            </div>
          </div>
        </div>

        {/* Card 4: Đã chi trả (Sắc Xanh Ngọc Emerald / Teal) */}
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-3.5 sm:p-5 shadow-xs border border-emerald-200/80 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <CircleDollarSign className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-20 text-emerald-500/[0.06] -rotate-12 transition-transform group-hover:scale-110" />

          <div className="relative z-10 flex items-center justify-between gap-1.5 mb-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <CircleDollarSign size={18} strokeWidth={2.4} />
            </div>
            <span className="rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
              Đã hoàn
            </span>
          </div>

          <div className="relative z-10">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/60 mb-0.5">
              Đã Chi Trả
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-950 tabular-nums leading-tight truncate">
              {formatCurrency(paid)}
            </div>
            <div className="mt-1 flex items-center text-[10px] sm:text-[11px] font-semibold text-emerald-700/90 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
              <span>Đã rút về TK ngân hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 1. FULL-WIDTH TREND LINE CHART (INTERACTIVE HOVER TOOLTIP) ═══ */}
      <AdminRevenueChart orderData={orderData} />

      {/* ═══ 2. TỶ TRỌNG SÀN, SỨC KHOẺ ĐƠN HÀNG & KHUNG GIỜ SĂN DEAL (3 CARDS IN 1 ROW) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── CARD 1: TỶ TRỌNG ĐƠN THEO SÀN (SHOPEE, TIKTOK SHOP, LAZADA) ── */}
        <div className="group relative rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Ambient soft glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-orange-200/30 via-rose-100/20 to-transparent blur-2xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 border border-orange-200/70 flex items-center justify-center shadow-xs shrink-0 text-orange-600">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Tỷ Trọng Đơn Theo Sàn
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Phân bố {totalPlatformOrders.toLocaleString()} đơn trên 3 sàn TMĐT
                </p>
              </div>
            </div>

            {/* Visual Cumulative Multi-Segment Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-1.5 px-0.5">
                <span>Phân bố thị phần (3 sàn)</span>
                <span>100% tổng đơn</span>
              </div>
              <div className="h-3 w-full rounded-full bg-neutral-100 flex gap-0.5 p-0.5 overflow-hidden border border-neutral-200/60 shadow-inner">
                {platformShare.map((s) => (
                  <div
                    key={s.id}
                    style={{ width: `${Math.max(s.pct, 3)}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${s.barGradient} transition-all duration-500`}
                    title={`${s.name}: ${s.pct}% (${s.count} đơn)`}
                  />
                ))}
              </div>
            </div>

            {/* Platform List (Shopee, TikTok, Lazada) */}
            <div className="flex flex-col gap-3">
              {platformShare.map((s) => {
                const isShopee = s.brandCode === "SHOPEE";
                const isTiktok = s.brandCode === "TIKTOK";
                const isLazada = s.brandCode === "LAZADA";

                return (
                  <div
                    key={s.id}
                    className={`flex flex-col gap-2 p-3.5 rounded-2xl border ${s.borderColor} ${s.bgLight} hover:bg-white hover:shadow-xs transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs border border-neutral-200/70 shrink-0 p-1">
                          {isShopee ? (
                            <ShopeeIcon size={20} />
                          ) : isTiktok ? (
                            <TiktokIcon size={20} />
                          ) : isLazada ? (
                            <LazadaIcon size={20} />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: s.color }} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-extrabold text-neutral-900 leading-tight">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium leading-tight">
                            {isShopee && "Chiết khấu cao & phổ biến"}
                            {isTiktok && "Tăng trưởng qua livestream"}
                            {isLazada && "Voucher & flash sale sàn"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-neutral-500 tabular-nums">
                          {s.count} đơn
                        </span>
                        <span
                          className="text-xs font-black px-2.5 py-0.5 rounded-full text-white tabular-nums shadow-xs"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.pct}%
                        </span>
                      </div>
                    </div>

                    {/* Individual Visual Bar */}
                    <div className="h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(s.pct, 3)}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${s.barGradient} transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer: Sàn Dẫn Đầu */}
          <div className="relative z-10 mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-pink-50/80 border border-orange-200/70 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <span className="text-xs font-extrabold text-orange-950">Sàn Dẫn Đầu Doanh Số</span>
            </div>
            <span className="text-xs font-black text-orange-800 bg-white px-3 py-1 rounded-xl shadow-xs border border-orange-200 flex items-center gap-1.5">
              <span>🏆</span>
              <span>
                {platformShare[0]?.name || "Shopee"} ({platformShare[0]?.pct || 0}% - {platformShare[0]?.count || 0} đơn)
              </span>
            </span>
          </div>
        </div>

        {/* ── CARD 2: SỨC KHOẺ ĐƠN HÀNG (TRẠNG THÁI DUYỆT & TỶ LỆ HOÀN TIỀN) ── */}
        <div className="group relative rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Ambient soft glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-emerald-200/30 via-teal-100/20 to-transparent blur-2xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200/70 flex items-center justify-center shadow-xs shrink-0 text-emerald-600">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Sức Khoẻ Đơn Hàng
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Tỷ lệ duyệt đơn quyết định dòng tiền hoàn
                </p>
              </div>
            </div>

            {/* Visual Cumulative Stacked Health Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-1.5 px-0.5">
                <span>Trạng thái chuyển đổi</span>
                <span>{statusTotal.toLocaleString()} đơn tổng</span>
              </div>
              <div className="h-3 w-full rounded-full bg-neutral-100 flex gap-0.5 p-0.5 overflow-hidden border border-neutral-200/60 shadow-inner">
                <div
                  style={{ width: `${Math.max(approvedPct, 3)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  title={`Đã duyệt: ${approvedPct}%`}
                />
                <div
                  style={{ width: `${Math.max(pendingPct, 3)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  title={`Đang chờ: ${pendingPct}%`}
                />
                <div
                  style={{ width: `${Math.max(cancelledPct, 2)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-neutral-400 to-slate-400 transition-all duration-500"
                  title={`Đã huỷ: ${cancelledPct}%`}
                />
              </div>
            </div>

            {/* Status Breakdown List */}
            <div className="flex flex-col gap-3">
              {statusRows.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/60 hover:bg-white hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl ${row.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <row.icon size={18} className={row.iconColor} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate">
                          {row.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {row.sublabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-neutral-600 tabular-nums">
                        {row.value} đơn
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border tabular-nums shadow-2xs ${row.badgeClass}`}>
                        {row.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Individual Bar */}
                  <div className="h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(row.pct, 3)}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${row.barGradient} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Tỷ lệ duyệt */}
          <div className="relative z-10 mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border border-emerald-200/70 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-extrabold text-emerald-950">Tỷ Lệ Duyệt Thành Công</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-700 tabular-nums">
                {approvedPct}%
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                Vận hành tốt
              </span>
            </div>
          </div>
        </div>

        {/* ── CARD 3: KHUNG GIỜ SĂN DEAL (PEAK HOURS) ── */}
        <div className="group relative rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Ambient soft glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-rose-200/30 via-pink-100/20 to-transparent blur-2xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 border border-rose-200/70 flex items-center justify-center shadow-xs shrink-0 text-rose-600">
                <Flame className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Khung Giờ Săn Deal
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Thời điểm người dùng chốt đơn nhiều nhất
                </p>
              </div>
            </div>

            {/* Visual Cumulative Stacked Peak Hour Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-1.5 px-0.5">
                <span>Phân bố theo chu kỳ 24h</span>
                <span>4 khung giờ</span>
              </div>
              <div className="h-3 w-full rounded-full bg-neutral-100 flex gap-0.5 p-0.5 overflow-hidden border border-neutral-200/60 shadow-inner">
                {peakRows.map((row) => (
                  <div
                    key={row.slot}
                    style={{ width: `${Math.max(row.pct, 3)}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${row.barGradient} transition-all duration-500`}
                    title={`${row.label} (${row.slot}): ${row.pct}%`}
                  />
                ))}
              </div>
            </div>

            {/* Time Slots List */}
            <div className="flex flex-col gap-2.5">
              {peakRows.map((row, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={row.slot}
                    className={`flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 ${
                      isTop
                        ? "bg-rose-50/40 border-rose-200/90 shadow-xs"
                        : "bg-neutral-50/70 border-neutral-200/60 hover:bg-white hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center text-sm shrink-0">
                          {row.emoji}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-neutral-900 whitespace-nowrap">
                              {row.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                              ({row.slot})
                            </span>
                            {isTop && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-rose-500 text-white shadow-2xs">
                                HOT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-neutral-600 tabular-nums">
                          {row.count} đơn
                        </span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border tabular-nums shadow-2xs ${row.badgeClass}`}>
                          {row.pct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(row.pct, 3)}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${row.barGradient} transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer: Khung giờ cao điểm */}
          <div className="relative z-10 mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/90 via-amber-50/70 to-pink-50/80 border border-rose-200/70 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-600 shrink-0" />
              <span className="text-xs font-extrabold text-rose-950">Giờ Vàng Săn Deal</span>
            </div>
            <span className="text-xs font-black text-rose-700 bg-white px-3 py-1 rounded-xl shadow-xs border border-rose-200 flex items-center gap-1.5">
              <span>{topPeak?.emoji}</span>
              <span>
                {topPeak?.label} ({topPeak?.slot})
              </span>
            </span>
          </div>
        </div>

      </div>

      {/* ═══ 3. DOANH THU & LỢI NHUẬN HỆ THỐNG (FULL-WIDTH BANNER) ═══ */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-rose-50/70 via-primary-50/40 to-white border-b border-rose-100/60">
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white p-2 shadow-xs border border-rose-100 flex items-center justify-center">
              <IconBow className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight">Doanh Thu & Lợi Nhuận Hệ Thống 🎀</h2>
              <p className="text-xs text-neutral-500 font-medium">Tổng hợp luồng tiền hoa hồng affiliate từ sàn thương mại</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white/80 border border-neutral-200/60 shadow-xs">
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1.5">
                Hoa Hồng Sàn Trả (Shopee/TikTok)
              </div>
              <div className="flex items-end gap-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 leading-none tabular-nums">
                  {formatCurrency(commission)}
                </div>
                <TrendingUp size={20} className="text-emerald-600 mb-0.5" />
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/60 border border-rose-200/70 shadow-xs">
              <div className="text-[11px] font-extrabold text-rose-600/70 uppercase tracking-widest mb-1.5">
                Lợi Nhuận Giữ Lại (Admin Profit)
              </div>
              <div className="flex items-end gap-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-600 leading-none tabular-nums">
                  {formatCurrency(profit)}
                </div>
                <CircleDollarSign size={20} className="text-rose-500 mb-0.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
                <Wallet size={20} strokeWidth={2.3} className="text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-neutral-900 block">Công Nợ Ví Khách Hàng</span>
                <span className="text-[11px] text-neutral-400 font-medium">Chờ hoàn tiền về ví</span>
              </div>
            </div>
            <div className="text-2xl font-black text-neutral-900 tabular-nums">{formatCurrency(debt)}</div>
            <a href="/admin/payments" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors group">
              <span>Duyệt yêu cầu rút tiền</span>
              <ArrowUpRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
                <CheckCircle2 size={20} strokeWidth={2.3} className="text-emerald-700" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-neutral-900 block">Đã Chi Trả Thành Công</span>
                <span className="text-[11px] text-neutral-400 font-medium">Chuyển khoản thành công</span>
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-900 tabular-nums">{formatCurrency(paid)}</div>
            <a href="#monthly-financial-breakdown" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors group">
              <span>Xem bảng chi tiết theo tháng ↓</span>
              <ArrowUpRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ═══ BẢNG BÁO CÁO HOA HỒNG & LỢI NHUẬN THEO THÁNG (TỔNG HỢP TÀI CHÍNH TOÀN DIỆN) ═══ */}
      <div id="monthly-financial-breakdown" className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/80 via-rose-50/20 to-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black shadow-xs">
              <BarChart3 size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                Báo Cáo Hoa Hồng & Lợi Nhuận Chi Tiết Theo Tháng
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                Dữ liệu tài chính tổng hợp đối soát hoa hồng sàn, hoàn tiền khách và lợi nhuận thực tế
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full w-fit">
            {monthRows.length} kỳ đối soát
          </span>
        </div>

        {monthRows.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-neutral-400">
            Chưa có dữ liệu báo cáo tài chính
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60">
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400">Tháng Báo Cáo</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-center">Số Đơn</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Hoa Hồng Sàn Trả</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Hoàn Cho Khách</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Lợi Nhuận Giữ Lại</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Tỷ Lệ Giữ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {monthRows.map(([month, v]) => {
                  const profitRatio = v.commission > 0 ? Math.round((v.profit / v.commission) * 100) : 0;
                  return (
                    <tr key={month} className="transition-colors hover:bg-neutral-50/60">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                          Tháng {month}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-neutral-100 font-mono text-[11px] font-bold text-neutral-700">
                          {v.count.toLocaleString()} đơn
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-neutral-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(v.commission)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-rose-600 tabular-nums whitespace-nowrap">
                        {formatCurrency(v.reward)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-700 tabular-nums whitespace-nowrap">
                        {formatCurrency(v.profit)}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                          {profitRatio}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-200 bg-neutral-50/90 font-black">
                  <td className="px-5 py-3.5 uppercase text-[10px] tracking-wider text-neutral-600">TỔNG CỘNG HỆ THỐNG</td>
                  <td className="px-5 py-3.5 text-center font-mono text-[11px] text-neutral-800">
                    {orders.length.toLocaleString()} đơn
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-neutral-900">
                    {formatCurrency(commission)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-rose-600">
                    {formatCurrency(orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0))}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-emerald-700">
                    {formatCurrency(profit)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-emerald-800">
                    {commission > 0 ? `${Math.round((profit / commission) * 100)}%` : "0%"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ═══ BẢNG XẾP HẠNG TOP 10 NGƯỜI MỜI NHIỀU NHẤT (ĐUA TOP THÁNG & TOÀN THỜI GIAN) ═══ */}
      <TopReferrersWidget
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthTopList={monthTopList}
        allTimeTopList={allTimeTopList}
        totalReferralsThisMonth={totalReferralsThisMonth}
      />

      {/* ═══ 4. TOP THÀNH VIÊN MUA NHIỀU NHẤT & CHỈ SỐ VẬN HÀNH (KẾT HỢP DƯỚI CÙNG THÀNH 1 HÀNG) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cột trái (lg:col-span-2): TOP THÀNH VIÊN MUA NHIỀU NHẤT */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 p-1 flex items-center justify-center shadow-xs border border-amber-100 shrink-0 overflow-hidden">
                  <img src="/meow-back-voucher.png" alt="Top Buyers" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Top Thành Viên Mua Nhiều Nhất</h2>
                  <p className="text-xs text-neutral-500 font-medium">Bảng xếp hạng chốt đơn & mua sắm tích cực</p>
                </div>
              </div>
              <a href="/admin/customers" className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors shrink-0">
                Xem tất cả &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topBuyersList.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-xs font-medium text-neutral-400">
                  Chưa có dữ liệu giao dịch thành viên
                </div>
              ) : (
                topBuyersList.map((buyer, idx) => {
                  const pct = Math.max(Math.round((buyer.orderCount / maxOrders) * 100), 12);
                  const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}", "4", "5"];

                  return (
                    <div key={buyer.id || idx} className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex flex-col gap-2 hover:border-amber-200 hover:bg-amber-50/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-neutral-200 text-xs font-black text-neutral-600 shrink-0">{medals[idx] || String(idx + 1)}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-neutral-900 truncate">{buyer.name}</div>
                            <div className="font-mono text-[10px] text-neutral-400 font-bold">{buyer.code}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-rose-600 tabular-nums">{buyer.orderCount} đơn hàng</div>
                          <div className="text-[10px] text-emerald-700 font-bold tabular-nums">+{formatCurrency(buyer.totalReward)}</div>
                        </div>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : idx === 1
                              ? "bg-gradient-to-r from-rose-500 to-pink-500"
                              : "bg-gradient-to-r from-sky-500 to-indigo-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <span className="text-xs font-extrabold text-neutral-900">Khách Hàng Tích Cực Nhất</span>
            </div>
            <div className="text-sm font-black text-amber-700 tabular-nums">
              {topBuyersList[0] ? `${topBuyersList[0].name} (${topBuyersList[0].orderCount} đơn)` : "Chưa có dữ liệu"}
            </div>
          </div>
        </div>

        {/* Cột phải (lg:col-span-1): CHỈ SỐ VẬN HÀNH */}
        <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/meow-back-hero.png" alt="" className="w-6 h-6 object-contain shrink-0" />
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Chỉ Số Vận Hành</h2>
              </div>
              <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">Live</span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { href: "/admin/customers", icon: Users, label: "Khách hàng đăng ký", value: totalCustomers, bg: "bg-rose-50 text-rose-600" },
                { href: "/admin/links", icon: Link2, label: "Link Affiliate đã tạo", value: totalLinks, bg: "bg-sky-50 text-sky-600" },
                { href: "/admin/orders", icon: Package, label: "Tổng đơn hàng hệ thống", value: totalOrders, bg: "bg-amber-50 text-amber-600" },
              ].map(({ href, icon: Icon, label, value, bg }) => (
                <a key={label} href={href}
                  className="group flex items-center justify-between rounded-2xl bg-neutral-50/80 border border-neutral-200/50 p-3.5 hover:bg-rose-50/60 hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} transition-transform group-hover:scale-105 shrink-0`}>
                      <Icon size={17} strokeWidth={2.2} />
                    </div>
                    <span className="text-xs font-bold text-neutral-800">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-neutral-900 tabular-nums">{value.toLocaleString()}</span>
                    <ChevronRightIcon />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {unmappedOrders > 0 ? (
            <a href="/admin/orders?tab=unassigned" className="group flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-3.5 hover:bg-rose-100/70 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-200/80 text-rose-700 shrink-0">
                  <TriangleAlert size={17} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-rose-800 block">Đơn chưa gán khách</span>
                  <span className="text-[10px] text-rose-600 font-medium">Cần xử lý đối soát ngay</span>
                </div>
              </div>
              <span className="text-base font-black text-rose-700 tabular-nums">{unmappedOrders}</span>
            </a>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
              <span>✅</span>
              <span>Tất cả đơn hàng đã được map chính xác</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 group-hover:text-rose-500 transition-colors">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
