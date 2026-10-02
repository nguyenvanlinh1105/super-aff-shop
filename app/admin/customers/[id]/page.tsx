import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Link2,
  Package,
  Wallet,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Calendar,
  Globe,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Handshake,
  Sparkles,
  ShoppingBag,
  Send,
  MessageCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PartnerSettings } from "@/components/admin/PartnerSettings";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, allCustomers] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, email: true, createdAt: true, status: true } },
        trackingLinks: { orderBy: { createdAt: "desc" }, take: 20, include: { platform: true } },
        orders: { orderBy: { createdAt: "desc" }, take: 20, include: { platform: true } },
        paymentBatches: { orderBy: { createdAt: "desc" }, take: 20 },
        referredBy: { select: { id: true, fullName: true, customerCode: true, phone: true } },
        referredUsers: { select: { id: true, fullName: true, customerCode: true }, orderBy: { fullName: "asc" } },
      },
    }),
    prisma.customer.findMany({
      select: { id: true, fullName: true, customerCode: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!customer) notFound();

  // Summary Metrics
  const totalReward = customer.orders.reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
  const paidAmount = customer.orders
    .filter((o) => o.payoutStatus === "paid")
    .reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
  const pendingReward = customer.orders
    .filter((o) => o.payoutStatus !== "paid")
    .reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
  const totalOrderAmount = customer.orders.reduce((sum, o) => sum + Number(o.orderAmount || 0), 0);
  const ordersCount = customer.orders.length;
  const linksCount = customer.trackingLinks.length;
  const referredCount = customer.referredUsers.length;

  const registeredDate = customer.user?.createdAt || customer.createdAt;
  const email = customer.user?.email;

  return (
    <div className="flex flex-col gap-6 fade-in pb-12">
      {/* ── TOP BREADCRUMB ── */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 hover:bg-white text-xs font-extrabold text-neutral-600 hover:text-rose-600 border border-neutral-200/80 shadow-2xs transition-all"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Quay lại Danh Sách Khách Hàng</span>
        </Link>
      </div>

      {/* ── LUXURY PROFILE HEADER CARD ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-300/20 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white p-2 shadow-xl shadow-rose-500/15 border-2 border-rose-200/80 shrink-0 overflow-hidden flex items-center justify-center">
                <img src="/icon-512.png" alt="MeowBack" className="w-full h-full object-contain rounded-2xl" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-xs ${
                  customer.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                }`}
                title={customer.status === "active" ? "Đang hoạt động" : "Bị tạm khoá"}
              />
            </div>

            {/* Info details */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  {customer.fullName}
                </h1>
                {customer.isPartner && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-300/80 shadow-2xs">
                    <Handshake size={13} strokeWidth={2.5} />
                    Đối tác
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border ${
                    customer.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  <UserCheck size={11} strokeWidth={2.5} />
                  {customer.status === "active" ? "Hoạt Động" : "Bị Khoá"}
                </span>
              </div>

              {/* Chips row */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600 font-semibold pt-1">
                {/* Customer Code */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 border border-neutral-200/90 font-mono font-bold text-neutral-800 shadow-2xs">
                  Mã: <strong className="text-rose-600">{customer.customerCode}</strong>
                </span>

                {/* Email */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-700 shadow-2xs">
                  <Mail size={13} className="text-rose-500" />
                  <span>{email || "Chưa có email"}</span>
                </span>

                {/* Phone */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-700 shadow-2xs">
                  <Phone size={13} className="text-emerald-600" />
                  <span>{customer.phone || "Chưa cập nhật SĐT"}</span>
                </span>

                {/* Registered Date */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-700 shadow-2xs">
                  <Calendar size={13} className="text-purple-500" />
                  <span>Đăng ký: {formatDate(registeredDate)}</span>
                </span>

                {/* Referrer Source */}
                {customer.referredBy ? (
                  <Link
                    href={`/admin/customers/${customer.referredBy.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-black shadow-2xs transition-colors"
                  >
                    <Users size={13} className="text-purple-500" />
                    <span>Mời bởi: {customer.referredBy.fullName}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100/90 text-neutral-600 border border-neutral-200/80 shadow-2xs">
                    <Globe size={13} className="text-neutral-400" />
                    <span>Nguồn: Trực tiếp</span>
                  </span>
                )}
              </div>

              {/* Social Channels (Zalo / Telegram) */}
              {(customer.zaloUserId || customer.telegramUsername) && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {customer.zaloUserId && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-bold">
                      <MessageCircle size={12} className="text-blue-500" />
                      <span>Zalo ID: {customer.zaloUserId}</span>
                    </span>
                  )}
                  {customer.telegramUsername && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/70 text-[11px] font-bold">
                      <Send size={12} className="text-sky-500" />
                      <span>Telegram: @{customer.telegramUsername}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Link to Portal */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/admin/links?q=${customer.customerCode}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-neutral-800 border border-neutral-200/80 shadow-xs hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Link2 size={15} />
              <span>Xem Link Khách Này</span>
            </Link>
            <Link
              href={`/admin/orders?q=${customer.customerCode}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
            >
              <Package size={15} />
              <span>Xem Đơn Hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── STAT METRICS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reward */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-100 shadow-2xs">
              <Wallet size={18} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              Tổng Hoàn
            </span>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Tổng Tiền Hoàn</div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums leading-tight">
            {formatCurrency(totalReward)}
          </div>
        </div>

        {/* Pending / Debt */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-100 shadow-2xs">
              <Clock size={18} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Chờ Rút
            </span>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Công Nợ Khả Dụng</div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tabular-nums leading-tight">
            {formatCurrency(pendingReward)}
          </div>
        </div>

        {/* Orders Count */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 shadow-2xs">
              <Package size={18} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Đơn Hàng
            </span>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Số Lượng Đơn</div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums leading-tight">
            {ordersCount}{" "}
            <span className="text-xs font-semibold text-neutral-400 font-normal">
              ({formatCurrency(totalOrderAmount)})
            </span>
          </div>
        </div>

        {/* Tracking Links Count */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100 shadow-2xs">
              <Link2 size={18} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              Links
            </span>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Link Đã Tạo</div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums leading-tight">
            {linksCount} <span className="text-xs font-medium text-neutral-400">link</span>
          </div>
        </div>

        {/* Referrals Count */}
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/80 flex flex-col justify-between hover:border-emerald-200 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 shadow-2xs">
              <Users size={18} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Giới Thiệu
            </span>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Bạn Bè Đã Mời</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums leading-tight">
            {referredCount} <span className="text-xs font-medium text-neutral-400">thành viên</span>
          </div>
        </div>
      </div>

      {/* ── TRẠNG THÁI THIẾT LẬP TÀI KHOẢN RÚT TIỀN ── */}
      {(() => {
        const hasSetup = !!(customer.bankAccountNumber || customer.momoNumber);
        return (
          <div
            className={`rounded-3xl p-5 sm:p-6 shadow-sm border transition-all ${
              hasSetup
                ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90"
                : "bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border-amber-200/80"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    hasSetup
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-amber-100 text-amber-700 border border-amber-200/80"
                  }`}
                >
                  <CreditCard size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                      Tài Khoản Rút Tiền Hoàn
                    </h2>
                    {hasSetup ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-300/80 shadow-2xs">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Đã thiết lập tài khoản rút tiền
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider border border-amber-300/80 shadow-2xs">
                        <Clock size={13} className="text-amber-600" />
                        Chưa thiết lập tài khoản rút tiền
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 font-medium">
                    {hasSetup
                      ? "Khách hàng đã hoàn tất thiết lập tài khoản nhận tiền hoàn."
                      : "Khách hàng chưa thiết lập tài khoản nhận tiền hoàn."}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-xs font-black px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 border shadow-2xs ${
                    hasSetup
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasSetup ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {hasSetup ? "Đã liên kết" : "Chưa liên kết"}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── CẤU HÌNH ĐỐI TÁC & GIỚI THIỆU ── */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-2xs">
              <Handshake size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Đối Tác &amp; Giới Thiệu (Affiliate Partner)</h2>
              <p className="text-xs text-neutral-500 font-medium">Thiết lập quan hệ giới thiệu và hoa hồng trọn đời</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Referral Policy
          </span>
        </div>

        <PartnerSettings
          customerId={customer.id}
          isPartner={customer.isPartner}
          referredBy={customer.referredBy}
          referredUsers={customer.referredUsers}
          customers={allCustomers
            .filter((c) => c.id !== customer.id)
            .map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }))}
        />
      </div>

      {/* ── HOẠT ĐỘNG: LINK AFFILIATE GẦN ĐÂY ── */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-2xs">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Link Affiliate Gần Đây</h2>
              <p className="text-xs text-neutral-500 font-medium">Danh sách các liên kết sản phẩm khách đã tạo để mua sắm</p>
            </div>
          </div>
          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
            {customer.trackingLinks.length} link gần nhất
          </span>
        </div>

        {customer.trackingLinks.length === 0 ? (
          <EmptyState title="Chưa có link affiliate nào" description="Khách hàng chưa tạo liên kết mua sắm nào trên hệ thống." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/70">
            <Table>
              <Thead>
                <Tr>
                  <Th>Thời Gian Tạo</Th>
                  <Th>Sàn TMĐT</Th>
                  <Th>Mã Tracking (SubID)</Th>
                  <Th>Kênh Nguồn</Th>
                  <Th align="center">Trạng Thái</Th>
                </Tr>
              </Thead>
              <tbody>
                {customer.trackingLinks.map((l) => (
                  <Tr key={l.id}>
                    <Td>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold whitespace-nowrap">
                        <Calendar size={12} className="text-neutral-400" />
                        <span>{formatDate(l.createdAt)}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-neutral-100 text-xs font-black text-neutral-800 border border-neutral-200/80">
                        {l.platform.name}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {l.trackingCode}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs font-medium text-neutral-600">{l.channelSource || "Web/App"}</span>
                    </Td>
                    <Td align="center">
                      <Badge tone={l.status === "active" ? "positive" : "neutral"} dot>
                        {l.status === "active" ? "Đang chạy" : l.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* ── HOẠT ĐỘNG: ĐƠN HÀNG GẦN ĐÂY ── */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-2xs">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Lịch Sử Đơn Hàng Hoàn Tiền</h2>
              <p className="text-xs text-neutral-500 font-medium">Các đơn hàng phát sinh hoa hồng được đối soát từ sàn</p>
            </div>
          </div>
          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
            {customer.orders.length} đơn hàng gần nhất
          </span>
        </div>

        {customer.orders.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng nào" description="Khách hàng chưa có đơn mua sắm nào được ghi nhận trên hệ thống." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/70">
            <Table>
              <Thead>
                <Tr>
                  <Th>Mã Đơn Sàn</Th>
                  <Th>Sàn</Th>
                  <Th align="right">Giá Trị Mua</Th>
                  <Th align="right">Tiền Hoàn Về Ví</Th>
                  <Th align="center">Trạng Thái Đơn</Th>
                  <Th align="center">Thanh Toán</Th>
                  <Th>Thời Gian</Th>
                </Tr>
              </Thead>
              <tbody>
                {customer.orders.map((o) => (
                  <Tr key={o.id}>
                    <Td>
                      <span className="font-mono text-xs font-extrabold text-neutral-800 bg-neutral-100 px-2 py-1 rounded-lg border border-neutral-200/70">
                        {o.orderExternalId}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs font-black text-neutral-700">{o.platform.name}</span>
                    </Td>
                    <Td align="right">
                      <span className="text-xs font-bold text-neutral-600 tabular-nums">
                        {formatCurrency(o.orderAmount ?? 0)}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="text-xs font-black text-rose-600 tabular-nums">
                        +{formatCurrency(o.customerRewardAmount)}
                      </span>
                    </Td>
                    <Td align="center">
                      <Badge tone={o.orderStatus === "approved" ? "positive" : o.orderStatus === "rejected" ? "negative" : "warning"} dot>
                        {o.orderStatus === "approved" ? "Đã Duyệt" : o.orderStatus === "rejected" ? "Huỷ Bỏ" : "Chờ Duyệt"}
                      </Badge>
                    </Td>
                    <Td align="center">
                      <Badge tone={o.payoutStatus === "paid" ? "positive" : "neutral"} dot>
                        {o.payoutStatus === "paid" ? "Đã Chi Trả" : "Chưa Trả"}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* ── LỊCH SỬ PHIẾU CHI / RÚT TIỀN ── */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-neutral-200/80 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-2xs">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Lịch Sử Phiếu Chi / Rút Tiền</h2>
              <p className="text-xs text-neutral-500 font-medium">Các đợt chuyển khoản hoàn tiền đã quyết toán cho khách</p>
            </div>
          </div>
          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
            {customer.paymentBatches.length} phiếu chi
          </span>
        </div>

        {customer.paymentBatches.length === 0 ? (
          <EmptyState title="Chưa có phiếu chi nào" description="Khách hàng chưa thực hiện rút tiền hoặc chưa có đợt thanh toán nào." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/70">
            <Table>
              <Thead>
                <Tr>
                  <Th>Mã Phiếu Chi</Th>
                  <Th align="right">Số Tiền Đã Chuyển</Th>
                  <Th align="center">Trạng Thái</Th>
                  <Th>Ngày Chuyển Tiền</Th>
                </Tr>
              </Thead>
              <tbody>
                {customer.paymentBatches.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <span className="font-mono text-xs font-bold text-neutral-800">{p.paymentCode}</span>
                    </Td>
                    <Td align="right">
                      <span className="text-xs font-black text-emerald-600 tabular-nums">
                        {formatCurrency(p.totalAmount)}
                      </span>
                    </Td>
                    <Td align="center">
                      <Badge tone={p.status === "paid" ? "positive" : "neutral"} dot>
                        {p.status === "paid" ? "Thành Công" : p.status}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="text-xs font-medium text-neutral-600">
                        {p.paidAt ? formatDate(p.paidAt) : "—"}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
