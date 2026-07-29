"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TicketPercent, Store, ShoppingBag, Info, LogOut } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

export function CustomerTopNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/app", label: "Trang chủ", icon: <Home size={18} /> },
    { href: "/app/deals", label: "Ưu đãi 🎀", icon: <TicketPercent size={18} /> },
    { href: "/cua-hang", label: "Cửa hàng", icon: <Store size={18} /> },
    { href: "/app/orders", label: "Đơn hàng", icon: <ShoppingBag size={18} /> },
    { href: "/huong-dan", label: "Giới thiệu", icon: <Info size={18} /> },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-primary-100/80 shadow-cute sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/app" className="hover:scale-[1.02] transition-transform">
          <LogoMeowBack />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all ${
                  active
                    ? "bg-primary-100 text-primary-600 shadow-sm"
                    : "text-neutral-500 hover:bg-primary-50 hover:text-neutral-900"
                }`}
              >
                {l.icon}
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-primary-50 border border-primary-100 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-primary-100/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              🐱
            </div>
            <span className="text-[14px] font-bold text-neutral-900 truncate max-w-[120px]">{userName}</span>
          </div>
          <Link href="/api/auth/logout" className="p-2.5 text-neutral-500 hover:text-negative bg-primary-50 rounded-full hover:bg-negative-bg transition-colors" title="Đăng xuất">
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}

