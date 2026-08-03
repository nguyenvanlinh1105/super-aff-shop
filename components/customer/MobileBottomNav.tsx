"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RotateCcw, Gift, Wallet, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { href: "/app", label: "Trang chủ", icon: Home },
  { href: "/app/refunds", label: "Hoàn tiền", icon: RotateCcw },
  { href: "/app/deals", label: "Ưu đãi 🎀", icon: Gift },
  { href: "/app/wallet", label: "Ví tiền", icon: Wallet },
  { href: "/app/orders", label: "Đơn hàng", icon: ShoppingBag },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/app") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden items-stretch bg-white/95 backdrop-blur-md border-t border-primary-100/80 shadow-[0_-4px_20px_rgba(255,109,158,0.15)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-[3px] py-1.5 min-h-[60px] transition-colors ${
              active ? "bg-primary-50/60" : "active:bg-primary-50/30"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mobile-nav-indicator"
                className="absolute top-0 h-[3.5px] w-9 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <motion.div
              animate={active ? { scale: [1, 1.25, 1], y: [0, -4, 0] } : { scale: 1, y: 0 }}
              transition={
                active
                  ? { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }
                  : { duration: 0.2 }
              }
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-primary-500" : "text-neutral-500"}
              />
            </motion.div>
            <span
              className={`text-[10px] leading-none ${
                active ? "font-extrabold text-primary-600" : "font-medium text-neutral-500"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
