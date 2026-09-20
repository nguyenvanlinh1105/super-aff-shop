import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, NavSection } from "@/components/layout/Sidebar";
import { FloatingQuickAccess } from "@/components/customer/FloatingQuickAccess";
import { MobileBottomNav } from "@/components/customer/MobileBottomNav";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallPrompt";
import { PendingLinkClaimer } from "@/components/customer/PendingLinkClaimer";
import { CustomerGlobalUI } from "@/components/customer/CustomerGlobalUI";
import { Home, RotateCcw, Gift, Wallet, ShoppingBag, Send, BookOpen, Settings, UserPlus, HelpCircle, UserCircle } from "lucide-react";

const sections: NavSection[] = [
  {
    title: "Hệ thống 🐾",
    items: [
      { href: "/app", label: "Trang chủ", icon: <Home size={20} strokeWidth={2.25} /> },
      { href: "/app/refunds", label: "Tạo link hoàn tiền", icon: <RotateCcw size={20} strokeWidth={2.25} /> },
      { href: "/app/deals", label: "Ưu đãi", icon: <Gift size={20} strokeWidth={2.25} /> },
      { href: "/app/wallet", label: "Ví tiền", icon: <Wallet size={20} strokeWidth={2.25} /> },
      { href: "/app/orders", label: "Đơn hàng", icon: <ShoppingBag size={20} strokeWidth={2.25} /> },
      { href: "/app/referral", label: "Mời bạn bè", icon: <UserPlus size={20} strokeWidth={2.25} /> },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { href: "/app/settings", label: "Thông tin cá nhân", icon: <UserCircle size={20} strokeWidth={2.25} /> },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { href: "/app/guide", label: "Hướng dẫn", icon: <BookOpen size={20} strokeWidth={2.25} /> },
      { href: "/app/faq", label: "FAQ", icon: <HelpCircle size={20} strokeWidth={2.25} /> },
    ],
  },
];

export default async function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  const platforms = await prisma.platform.findMany({
    where: { status: "active" },
    select: { id: true, code: true, name: true },
    orderBy: { name: "asc" },
  });
  const platformOptions = platforms.map((p) => ({
    id: p.id,
    code: p.code,
    label: p.name,
  }));

  return (
    <div className="internal-app flex h-screen overflow-hidden bg-neutral-50 flex-col md:flex-row text-neutral-900">
      <Sidebar
        brandName={session.fullName}
        brandSubtitle="Thành viên MeowBack 🎀"
        sections={sections}
      />
      <main className="relative flex-1 overflow-y-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="min-h-full py-6 md:py-8 pb-[88px] md:pb-12 fade-in w-full max-w-5xl xl:max-w-6xl mx-auto">
          <PwaInstallBanner />
          {children}
        </div>
      </main>

      <FloatingQuickAccess unreadCount={unreadCount} />
      <MobileBottomNav />
      <PendingLinkClaimer />
      <CustomerGlobalUI platforms={platformOptions} />
    </div>
  );
}

