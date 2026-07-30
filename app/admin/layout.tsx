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

// ─── Nav sections with emoji icons ───────────────────────────────────────────
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
      { href: "/admin/orders",        label: "Đơn hàng",       emoji: "📦", icon: <Package  size={16} strokeWidth={1.75} /> },
      { href: "/admin/orders/import", label: "Import đối soát", emoji: "📥", icon: <Download size={16} strokeWidth={1.75} /> },
      { href: "/admin/payments",      label: "Thanh toán",      emoji: "💳", icon: <Wallet   size={16} strokeWidth={1.75} /> },
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div
      className="flex h-screen overflow-hidden flex-col md:flex-row bg-gradient-to-br from-[#FFF9FB] via-[#FFF5F8] to-[#FFF2F6] text-neutral-900 font-sans"
    >
      <AdminSidebar adminName={session.fullName} sections={sections} />

      {/* ── Main content ── */}
      <main className="relative flex-1 overflow-y-auto bg-transparent selection:bg-rose-500 selection:text-white">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}



