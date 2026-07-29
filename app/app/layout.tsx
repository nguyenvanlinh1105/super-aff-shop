import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar, NavSection } from "@/components/layout/Sidebar";
import { FloatingQuickAccess } from "@/components/customer/FloatingQuickAccess";
import { MobileBottomNav } from "@/components/customer/MobileBottomNav";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallPrompt";
import { PendingLinkClaimer } from "@/components/customer/PendingLinkClaimer";
import { Home, RotateCcw, Gift, Wallet, ShoppingBag, Send, BookOpen, Settings, UserPlus, HelpCircle } from "lucide-react";

const sections: NavSection[] = [
  {
    title: "Hệ thống 🐾",
    items: [
      { href: "/app",          label: "Trang chủ",  icon: <Home size={20} strokeWidth={2.25} /> },
      { href: "/app/refunds",  label: "Hoàn tiền 🧶",  icon: <RotateCcw size={20} strokeWidth={2.25} /> },
      { href: "/app/deals",    label: "Ưu đãi 🎀",     icon: <Gift size={20} strokeWidth={2.25} /> },
      { href: "/app/wallet",   label: "Ví tiền 💰",    icon: <Wallet size={20} strokeWidth={2.25} /> },
      { href: "/app/orders",   label: "Đơn hàng",   icon: <ShoppingBag size={20} strokeWidth={2.25} /> },
      { href: "/app/referral", label: "Mời bạn bè", icon: <UserPlus size={20} strokeWidth={2.25} /> },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { href: "/app/telegram", label: "Liên kết Telegram", icon: <Send size={20} strokeWidth={2.25} /> },
      { href: "/app/settings", label: "Cài đặt", icon: <Settings size={20} strokeWidth={2.25} /> },
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

  return (
    <div className="internal-app flex h-screen overflow-hidden bg-neutral-bg flex-col md:flex-row text-neutral-900">
      {/* Animated background soft pink ambient radial circles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#FFF9FB]">
        <svg className="absolute h-full w-full opacity-70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="bg-g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4EC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFE4EC" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg-g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF5F8" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFF5F8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bg-g3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF3E2" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFF3E2" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="95%" cy="10%" r="380" fill="url(#bg-g1)">
            <animate attributeName="cx" values="95%;90%;95%" dur="20s" repeatCount="indefinite" />
            <animate attributeName="cy" values="10%;15%;10%" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="85%" cy="85%" r="220" fill="url(#bg-g2)">
            <animate attributeName="cx" values="85%;80%;85%" dur="15s" repeatCount="indefinite" />
            <animate attributeName="cy" values="85%;90%;85%" dur="15s" repeatCount="indefinite" />
          </circle>
          <circle cx="5%" cy="80%" r="280" fill="url(#bg-g3)">
            <animate attributeName="cx" values="5%;10%;5%" dur="18s" repeatCount="indefinite" />
            <animate attributeName="cy" values="80%;75%;80%" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <Sidebar
        brandName={session.fullName}
        brandSubtitle="Thành viên MeowBack 🎀"
        sections={sections}
      />
      <main className="relative z-10 flex-1 overflow-y-auto w-full">
        <div className="min-h-full p-4 sm:p-6 md:p-8 pb-[88px] md:pb-8 fade-in w-full max-w-[100vw]">
          <PwaInstallBanner />
          {children}
        </div>
      </main>

      <FloatingQuickAccess unreadCount={unreadCount} />
      <MobileBottomNav />
      <PendingLinkClaimer />
    </div>
  );
}

