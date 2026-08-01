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
          "fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 flex-col justify-between bg-white/70 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.03)] border-r border-white/60 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] flex",
          "md:relative md:translate-x-0 md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[2rem] md:border",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex-1 overflow-y-auto hide-scrollbar">
          {/* Brand header */}
          <div className="px-6 pt-8 pb-6 mb-2 relative">
            <button 
              className="absolute top-6 right-4 p-2 text-neutral-400 hover:text-neutral-900 md:hidden rounded-full hover:bg-neutral-100/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Link href="/" title="MeoTrở lại">
                <LogoMeowBack />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 px-4 pb-6">
            {sections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-6" : ""}>
                {section.title && (
                  <div className="mb-3 px-4 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-neutral-400">
                    {section.title}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                          "group relative flex items-center gap-4 rounded-2xl px-4 py-3 text-[14px] font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98]",
                          active
                            ? "bg-primary-100/80 text-primary-600 shadow-sm ring-1 ring-primary-200/50"
                            : "text-neutral-500 hover:bg-white/60 hover:text-neutral-900 hover:shadow-sm"
                        )}
                      >
                        <span className={cn(
                          "shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110",
                          active ? "text-primary-500" : "text-neutral-400"
                        )}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {!item.badge && active && (
                          <span className="ml-auto transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                            <IconBow className="w-5 h-5 text-primary-400" />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Logout button integrated into navigation */}
            <div className="mt-6">
              <div className="mb-3 px-4 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-neutral-400">
                Tài khoản
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleLogout}
                  className="group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-[14px] font-bold text-neutral-500 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98] hover:bg-negative-bg hover:text-negative hover:shadow-sm"
                >
                  <span className="shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 text-neutral-400 group-hover:text-negative">
                    <LogOut size={20} strokeWidth={2.25} />
                  </span>
                  <span className="truncate">Đăng xuất</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
