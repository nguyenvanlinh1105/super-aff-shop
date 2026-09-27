import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Link2,
  Package,
  Download,
  Wallet,
  BarChart3,
  Send,
  Settings,
  Flame,
  MessagesSquare,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  // Query đếm số công việc tồn đọng để hiển thị Badge cảnh báo realtime trên menu
  const [unmappedOrdersCount, pendingPaymentsCount] = await Promise.all([
    prisma.order.count({ where: { OR: [{ customerId: null }, { trackingLinkId: null }] } }),
    prisma.order.count({ where: { payoutStatus: "pending", customerRewardAmount: { gt: 0 } } }),
  ]);

  const sections = [
    {
      title: "Vận hành",
      items: [
        { href: "/admin",            label: "Tổng quan",           emoji: "🏠", icon: <LayoutDashboard size={16} strokeWidth={1.75} /> },
        { href: "/admin/quick-link", label: "Tạo Link Aff Nhanh",  emoji: "⚡", icon: <Zap             size={16} strokeWidth={1.75} /> },
        { href: "/admin/customers",  label: "Khách hàng",          emoji: "👥", icon: <Users           size={16} strokeWidth={1.75} /> },
        { href: "/admin/links",      label: "Link Affiliate",       emoji: "🔗", icon: <Link2           size={16} strokeWidth={1.75} /> },
        { href: "/admin/deals",      label: "Deals Hot",            emoji: "🔥", icon: <Flame           size={16} strokeWidth={1.75} /> },
        { href: "/admin/community",  label: "Cộng đồng",            emoji: "💬", icon: <MessagesSquare  size={16} strokeWidth={1.75} /> },
      ],
    },
    {
      title: "Đối soát & Thanh toán",
      items: [
        { href: "/admin/orders",        label: "Đơn hàng",       emoji: "📦", icon: <Package  size={16} strokeWidth={1.75} />, badge: unmappedOrdersCount },
        { href: "/admin/orders/import", label: "Import đối soát", emoji: "📥", icon: <Download size={16} strokeWidth={1.75} /> },
        { href: "/admin/payments",      label: "Thanh toán",      emoji: "💳", icon: <Wallet   size={16} strokeWidth={1.75} />, badge: pendingPaymentsCount },
        { href: "/admin/reports",       label: "Báo cáo",         emoji: "📊", icon: <BarChart3 size={16} strokeWidth={1.75} /> },
      ],
    },
    {
      title: "Tích hợp & Cài đặt",
      items: [
        { href: "/admin/telegram", label: "Telegram Bot",  emoji: "✈️", icon: <Send          size={16} strokeWidth={1.75} /> },
        { href: "/admin/settings", label: "Cài đặt",       emoji: "⚙️", icon: <Settings      size={16} strokeWidth={1.75} /> },
      ],
    },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden flex-col md:flex-row bg-gradient-to-br from-[#FFF9FB] via-[#FFF5F8] to-[#FFF2F6] text-neutral-900 font-sans"
    >
      <AdminSidebar adminName={session.fullName} sections={sections} />

      {/* ── Main content ── */}
      <main className="relative flex-1 overflow-y-auto bg-transparent selection:bg-rose-500 selection:text-white px-3 sm:px-6 lg:px-8">
        <div className="min-h-full py-5 sm:py-6 lg:py-8 w-full max-w-[1560px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}



