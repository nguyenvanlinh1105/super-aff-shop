"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  RotateCcw,
  ShoppingBag,
  Wallet,
  Bell,
  Menu,
  X,
  LogOut,
  Gift,
  UserPlus,
  UserCircle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { LogoMeowBack, IconBow } from "@/components/icons/CatRibbonIcons";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

// 5 Item chính trên Header theo thiết kế của user
const MAIN_HEADER_NAV = [
  { href: "/app", label: "Trang chủ", icon: Home },
  { href: "/app/refunds", label: "Tạo link hoàn tiền", icon: RotateCcw },
  { href: "/app/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/app/wallet", label: "Ví tiền", icon: Wallet },
  { href: "/app/referral", label: "Mời bạn bè", icon: UserPlus },
];

export function CustomerHeader({
  unreadCount = 0,
  sections,
}: {
  unreadCount?: number;
  sections?: NavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Đóng sidebar drawer mỗi khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Đóng sidebar khi nhấn Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isMainActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isDrawerActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Fallback sections nếu không truyền vào
  const defaultSections: NavSection[] = sections || [
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

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          TOP HEADER
          - Tối đa 960px và căn giữa trên PC
          - Hàng 1: Logo MeowBack | Chuông thông báo + Hamburger Menu
          - Hàng 2: 4 mục chính (Trang chủ, Tạo link hoàn tiền, Đơn hàng, Ví tiền)
         ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-primary-100/70 shadow-xs">
        <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-3 pb-3 md:pb-2 flex flex-col md:gap-2.5">
          {/* Hàng 1: Logo + Thông báo + Hamburger */}
          <div className="flex items-center justify-between">
            <Link href="/app" title="MeowBack - Trang chủ" className="shrink-0">
              <LogoMeowBack />
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Chuông thông báo hồng */}
              <Link
                href="/app/notifications"
                title="Thông báo"
                className="relative p-2 text-primary-500 hover:text-primary-600 transition-transform active:scale-95 rounded-full hover:bg-primary-50/60"
              >
                <Bell size={24} strokeWidth={2.25} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white shadow-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Nút Hamburger menu màu hồng */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-1.5 text-primary-500 hover:text-primary-600 hover:bg-primary-50/60 rounded-xl transition-all active:scale-95 cursor-pointer"
                aria-label="Mở menu quản lý"
              >
                <Menu size={28} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Hàng 2: 5 mục điều hướng căn cách đều tuyệt đối (Equal visual gap giữa các item) */}
          <nav className="hidden md:flex w-full pt-1.5 pb-0.5 border-t border-neutral-100/80">
            <div className="flex items-center justify-between w-full px-2 sm:px-4">
              {MAIN_HEADER_NAV.map((item) => {
                const active = isMainActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center py-1 group cursor-pointer transition-colors"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center gap-2 py-1.5 text-[15px] sm:text-[15.5px] whitespace-nowrap transition-all border-b-2",
                        active
                          ? "text-primary-500 font-black border-primary-500"
                          : "text-neutral-700 hover:text-primary-500 font-bold border-transparent hover:border-primary-200"
                      )}
                    >
                      <Icon
                        size={20}
                        strokeWidth={active ? 2.5 : 2.2}
                        className={active ? "text-primary-500" : "text-neutral-500 group-hover:text-primary-500 transition-colors"}
                      />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER / SIDEBAR BÊN PHẢI (Mở khi bấm Hamburger)
         ═══════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer slide-in từ phải sang */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[70] w-[295px] sm:w-[325px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-l border-primary-100/70",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header Drawer: Chiều cao nhỏ gọn hơn */}
        <div className="px-4 py-2.5 sm:py-3 border-b border-primary-100/60 flex items-center justify-between bg-gradient-to-b from-primary-50/50 to-transparent shrink-0">
          <Link href="/app" onClick={() => setIsOpen(false)} title="Trang chủ">
            <LogoMeowBack className="h-8 text-primary-500" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </div>

        {/* Nội dung danh sách menu cuộn mượt và item Đăng xuất nằm ngay dưới FAQ */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5">
          {/* Danh sách mục menu */}
          <nav className="flex flex-col gap-3">
            {defaultSections.map((section, idx) => (
              <div key={idx} className={idx > 0 ? "mt-1" : ""}>
                {section.title && (
                  <div className="mb-2 px-3 text-[11px] font-black uppercase tracking-wider text-neutral-700">
                    {section.title}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = isDrawerActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] font-bold transition-all",
                          active
                            ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-cute"
                            : "text-neutral-700 hover:text-primary-500 hover:bg-primary-50/70"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={active ? "text-white" : "text-neutral-500"}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {active && (
                          <IconBow className="w-4 h-4 text-white shrink-0" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Item Đăng xuất nằm ngay dưới FAQ */}
                  {idx === defaultSections.length - 1 && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-[14px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer text-left"
                    >
                      <LogOut size={19} strokeWidth={2.2} className="shrink-0 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
