import {
  Users,
  Link2,
  Package,
  CircleDollarSign,
  Gift,
  CircleCheck,
  TriangleAlert,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { LogoMeowBack, IconBow } from "@/components/icons/CatRibbonIcons";

export default async function AdminDashboardPage() {
  const [
    totalCustomers,
    totalLinks,
    totalOrders,
    commissionAgg,
    rewardAgg,
    profitAgg,
    paidAgg,
    unmappedOrders,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.trackingLink.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { commissionAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: { not: "paid" } } }),
    prisma.order.aggregate({ _sum: { systemProfitAmount: true } }),
    prisma.order.aggregate({ _sum: { customerRewardAmount: true }, where: { payoutStatus: "paid" } }),
    prisma.order.count({ where: { OR: [{ customerId: null }, { trackingLinkId: null }] } }),
  ]);

  const commission = Number(commissionAgg._sum.commissionAmount ?? 0);
  const profit = Number(profitAgg._sum.systemProfitAmount ?? 0);
  const debt = Number(rewardAgg._sum.customerRewardAmount ?? 0);
  const paid = Number(paidAgg._sum.customerRewardAmount ?? 0);

  return (
    <div className="flex flex-col gap-6 fade-in">

      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-100 shadow-cute"
        style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #FFE4EC 50%, #FFF9FB 100%)" }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary-200 opacity-40" />
        <div className="pointer-events-none absolute -bottom-6 right-32 h-24 w-24 rounded-full bg-secondary-100 opacity-50" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-white flex items-center justify-center text-3xl shadow-cute shrink-0">
              🐱
            </div>
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-primary-600 mb-1">
                Bảng điều khiển Admin 🎀
              </p>
              <h1 className="text-[24px] sm:text-[30px] font-extrabold leading-tight text-neutral-900">
                MeowBack Admin Dashboard
              </h1>
              <p className="mt-1 text-[13px] text-neutral-600 leading-relaxed font-medium">
                Quản lý hoa hồng, đối soát & số dư chi trả toàn hệ thống.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <a href="/admin/orders/import">
              <button className="flex items-center gap-2 rounded-full bg-white/90 border border-primary-200 px-5 py-2.5 text-[13px] font-bold text-primary-600 shadow-sm transition-all hover:bg-white hover:shadow-cute">
                Import đối soát 📥
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </button>
            </a>
            <a href="/admin/payments">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all">
                Duyệt thanh toán 💳
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* ═══ 4 KPI CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Khách hàng */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold text-lg">
              👥
            </div>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold text-primary-600">Thành viên</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Khách hàng</div>
          <div className="text-[28px] font-extrabold text-neutral-900 tabular-nums leading-tight">{totalCustomers}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">tài khoản đã đăng ký</div>
        </div>

        {/* Link Affiliate */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-100 text-neutral-900 font-bold text-lg">
              🔗
            </div>
            <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-800">Affiliate</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Link Affiliate</div>
          <div className="text-[28px] font-extrabold text-neutral-900 tabular-nums leading-tight">{totalLinks}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">link đã sinh</div>
        </div>

        {/* Đơn hàng */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold text-lg">
              📦
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Đơn hàng</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Tổng đơn</div>
          <div className="text-[28px] font-extrabold text-neutral-900 tabular-nums leading-tight">{totalOrders}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">đơn hàng ghi nhận</div>
        </div>

        {/* Đã hoàn tiền */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#E6F8EE]/50 p-5 shadow-cute border border-[#B3EBD0] transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F8EE] text-[#2D8A56] font-bold text-lg">
              💸
            </div>
            <span className="rounded-full bg-[#E6F8EE] px-2.5 py-0.5 text-[10px] font-bold text-[#2D8A56]">Đã hoàn</span>
          </div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Đã hoàn tiền</div>
          <div className="text-[22px] font-extrabold text-neutral-900 tabular-nums leading-tight">{formatCurrency(paid)}</div>
          <div className="mt-1 text-[11px] text-neutral-500 font-medium">đã chi trả thành công</div>
        </div>
      </div>

      {/* ═══ DOANH THU + VẬN HÀNH ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Cột trái: TÀI CHÍNH */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-3xl bg-white shadow-cute border border-primary-100/80 overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-primary-100/70 via-primary-50 to-white">
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <IconBow className="w-6 h-6 text-accent-bow" />
                <div>
                  <h2 className="text-[17px] font-extrabold text-neutral-900">Doanh thu & Lợi nhuận MeowBack 🎀</h2>
                  <p className="text-[13px] text-neutral-500">Tổng hợp tài chính affiliate toàn hệ thống</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
                <div>
                  <div className="text-[12px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">
                    Tổng hoa hồng sàn trả
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-neutral-900 leading-none">
                      {formatCurrency(commission)}
                    </div>
                    <TrendingUp size={18} className="text-[#2D8A56] mb-1" />
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-extrabold text-neutral-500 uppercase tracking-wider mb-1">
                    Lợi nhuận MeowBack giữ lại
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-primary-500 leading-none">
                      {formatCurrency(profit)}
                    </div>
                    <CircleDollarSign size={18} className="text-primary-500 mb-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-primary-100">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 font-bold">
                    👛
                  </div>
                  <span className="text-[14px] font-extrabold text-neutral-900">Công nợ ví khách hàng</span>
                </div>
                <div className="text-[24px] font-extrabold text-neutral-900 tabular-nums">{formatCurrency(debt)}</div>
                <p className="text-[12px] text-neutral-500 mt-1">Cần chi trả rút tiền cho khách</p>
                <a href="/admin/payments" className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-primary-500 hover:text-primary-600 transition-colors">
                  Xem danh sách rút money <ArrowUpRight size={14} strokeWidth={2.5} />
                </a>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E6F8EE] text-[#2D8A56] font-bold">
                    ✅
                  </div>
                  <span className="text-[14px] font-extrabold text-neutral-900">Đã thanh toán</span>
                </div>
                <div className="text-[24px] font-extrabold text-neutral-900 tabular-nums">{formatCurrency(paid)}</div>
                <p className="text-[12px] text-neutral-500 mt-1">Đã chuyển khoản thành công</p>
                <a href="/admin/reports" className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-primary-500 hover:text-primary-600 transition-colors">
                  Xem báo cáo <ArrowUpRight size={14} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: VẬN HÀNH */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white shadow-cute border border-primary-100/80 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐾</span>
              <h2 className="text-[15px] font-extrabold text-neutral-900">Chỉ số vận hành</h2>
            </div>

            {[
              { href: "/admin/customers", icon: Users, label: "Khách hàng", value: totalCustomers, bg: "bg-primary-50", color: "text-primary-600" },
              { href: "/admin/links", icon: Link2, label: "Link Affiliate", value: totalLinks, bg: "bg-secondary-50", color: "text-neutral-900" },
              { href: "/admin/orders", icon: Package, label: "Đơn hàng", value: totalOrders, bg: "bg-primary-50", color: "text-primary-600" },
            ].map(({ href, icon: Icon, label, value, bg, color }) => (
              <a key={label} href={href}
                className="group flex items-center justify-between rounded-2xl bg-primary-50/40 border border-primary-100 p-4 hover:bg-primary-100/60 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} transition-transform group-hover:scale-110`}>
                    <Icon size={18} className={color} strokeWidth={2} />
                  </div>
                  <span className="text-[14px] font-bold text-neutral-900">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-extrabold text-neutral-900 tabular-nums">{value}</span>
                  <ChevronRightIcon />
                </div>
              </a>
            ))}

            {unmappedOrders > 0 && (
              <a href="/admin/orders" className="group flex items-center justify-between rounded-2xl bg-negative-bg border border-primary-200 p-4 hover:bg-negative/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-negative/20">
                    <TriangleAlert size={18} className="text-negative" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-negative block">Đơn chưa gán khách</span>
                    <span className="text-[11px] text-neutral-500">Cần đối soát</span>
                  </div>
                </div>
                <span className="text-[18px] font-extrabold text-negative tabular-nums">{unmappedOrders}</span>
              </a>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl bg-white shadow-cute border border-primary-100/80 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-neutral-900">
              <span>⚡</span>
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin/customers", label: "Khách hàng 👥", bg: "bg-primary-50", text: "text-primary-600" },
                { href: "/admin/orders/import", label: "Import CSV 📥", bg: "bg-secondary-50", text: "text-neutral-900" },
                { href: "/admin/payments", label: "Thanh toán 💳", bg: "bg-primary-50", text: "text-primary-600" },
                { href: "/admin/reports", label: "Báo cáo 📊", bg: "bg-secondary-50", text: "text-neutral-900" },
              ].map(({ href, label, bg, text }) => (
                <a key={href} href={href}
                  className={`flex flex-col items-center gap-1 rounded-2xl ${bg} p-3 text-center transition-all hover:scale-[1.02] border border-primary-100/50`}>
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

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-400 group-hover:text-primary-500 transition-colors">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

