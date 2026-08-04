"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, Menu, X } from "lucide-react";
import { LogoMeowBack, IconBow } from "@/components/icons/CatRibbonIcons";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  pigIcon?: string;
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export function Sidebar({
  brandName,
  brandSubtitle,
  sections,
}: {
  brandName: string;
  brandSubtitle: string;
  sections: NavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      const hasMoreSpecific = sections.some((s) =>
        s.items.some((i) => i.href !== href && pathname.startsWith(i.href))
      );
      return !hasMoreSpecific;
    }
    return false;
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-primary-100/50 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" title="MeoTrở lại">
            <LogoMeowBack />
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-primary-50 rounded-xl transition-all"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm md:hidden transition-opacity duration-500 touch-manipulation",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container (Fluid Island Glassmorphism) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[275px] shrink-0 flex-col justify-between bg-white/95 backdrop-blur-xl border-r border-primary-100/70 shadow-xl md:shadow-none transition-transform duration-300 md:relative md:translate-x-0 flex",
          "md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[2rem] md:border",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex-1 overflow-y-auto custom-scrollbar">
          {/* Brand header */}
          <div className="px-5 pt-6 pb-5 border-b border-primary-100/60 mb-3 relative bg-gradient-to-b from-primary-50/50 to-transparent">
            <button 
              className="absolute top-6 right-4 p-2 text-neutral-400 hover:text-neutral-900 md:hidden rounded-full hover:bg-neutral-100/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Link href="/" title="Trang chủ">
                <LogoMeowBack />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 px-3 pb-6">
            {sections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-2" : ""}>
                {section.title && (
                  <div className="mb-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-900/40">
                    {section.title}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-bold transition-all duration-200",
                          active
                            ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-md shadow-primary-500/20"
                            : "text-neutral-600 hover:bg-primary-50/80 hover:text-neutral-900"
                        )}
                      >
                        <span className={cn(
                          "shrink-0 transition-transform duration-200 group-hover:scale-110",
                          active ? "text-white" : "text-neutral-400 group-hover:text-primary-500"
                        )}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span className={cn(
                            "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-xs",
                            active ? "bg-white text-primary-600" : "bg-primary-500 text-white"
                          )}>
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {!item.badge && active && (
                          <span className="ml-auto opacity-90">
                            <IconBow className="w-3.5 h-3.5 text-white" />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="mt-4 px-3">
              <button
                onClick={() => {
                  document.dispatchEvent(new Event("open-quick-link"));
                  if (window.innerWidth < 768) setIsOpen(false); // Đóng sidebar trên mobile
                }}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-neutral-900 px-4 py-3.5 text-[14px] font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Sparkles className="relative z-10" size={18} />
                <span className="relative z-10">Tạo Link Nhanh 🪄</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer: logout */}
        <div className="px-3 py-4 border-t border-primary-100/60 bg-gradient-to-b from-transparent to-primary-50/50 md:rounded-b-[2rem]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-bold text-negative transition-all duration-150 hover:bg-rose-50 group"
          >
            <LogOut
              size={17}
              strokeWidth={2.2}
              className="shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
            />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
