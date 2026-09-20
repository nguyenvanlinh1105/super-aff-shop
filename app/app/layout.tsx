import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerHeader, NavSection } from "@/components/layout/CustomerHeader";
import { FloatingQuickAccess } from "@/components/customer/FloatingQuickAccess";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallPrompt";
import { PendingLinkClaimer } from "@/components/customer/PendingLinkClaimer";
import { CustomerGlobalUI } from "@/components/customer/CustomerGlobalUI";
import { Home, RotateCcw, Gift, Wallet, ShoppingBag, BookOpen, UserPlus, HelpCircle, UserCircle } from "lucide-react";

const sections: NavSection[] = [
  {
    title: "Hệ thống 🐾",
    items: [
      { href: "/app", label: "Trang chủ", icon: <Home size={19} strokeWidth={2.2} /> },
      { href: "/app/refunds", label: "Tạo link hoàn tiền", icon: <RotateCcw size={19} strokeWidth={2.2} /> },
      { href: "/app/deals", label: "Ưu đãi", icon: <Gift size={19} strokeWidth={2.2} /> },
      { href: "/app/wallet", label: "Ví tiền", icon: <Wallet size={19} strokeWidth={2.2} /> },
      { href: "/app/orders", label: "Đơn hàng", icon: <ShoppingBag size={19} strokeWidth={2.2} /> },
      { href: "/app/referral", label: "Mời bạn bè", icon: <UserPlus size={19} strokeWidth={2.2} /> },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { href: "/app/settings", label: "Thông tin cá nhân", icon: <UserCircle size={19} strokeWidth={2.2} /> },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { href: "/app/guide", label: "Hướng dẫn", icon: <BookOpen size={19} strokeWidth={2.2} /> },
      { href: "/app/faq", label: "FAQ", icon: <HelpCircle size={19} strokeWidth={2.2} /> },
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
    <div className="internal-app min-h-screen bg-neutral-50 flex flex-col text-neutral-900 selection:bg-primary-500 selection:text-white">
      <CustomerHeader unreadCount={unreadCount} sections={sections} />

      <main className="flex-1 w-full">
        <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 py-6 pb-20 fade-in">
          <PwaInstallBanner />
          {children}
        </div>
      </main>

      <FloatingQuickAccess unreadCount={unreadCount} showBell={false} />
      <PendingLinkClaimer />
      <CustomerGlobalUI platforms={platformOptions} />
    </div>
  );
}

