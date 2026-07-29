"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, Menu, X } from "lucide-react";
import { LogoMeowBack, IconBow } from "@/components/icons/CatRibbonIcons";

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
      <div className="md:hidden flex items-center justify-between bg-white border-b border-primary-100 px-4 py-3 sticky top-0 z-30 shadow-cute">
        <div className="flex items-center gap-2">
          <LogoMeowBack />
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-primary-50 rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-[2px] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 flex-col justify-between bg-white border-r border-primary-100/80 shadow-cute md:shadow-none transition-transform duration-300 md:relative md:translate-x-0 flex ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="px-5 pt-5 pb-4 border-b border-primary-100 mb-4 relative">
            <button 
              className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-neutral-900 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <LogoMeowBack />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 px-3 pb-6">
            {sections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-4" : ""}>
                {section.title && (
                  <div className="mb-2 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
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
                        className={`group relative flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[14px] font-bold transition-all duration-150 ${
                          active
                            ? "bg-primary-100 text-primary-600 shadow-sm"
                            : "text-neutral-600 hover:bg-primary-50 hover:text-neutral-900"
                        }`}
                      >
                        <span className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? "text-primary-500" : "text-neutral-500"}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-bow px-1.5 text-[11px] font-bold text-white shadow-sm">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                        {!item.badge && active && (
                          <span className="ml-auto">
                            <IconBow className="w-4 h-4 text-accent-bow" />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer items */}
        <div className="px-3 py-4 border-t border-primary-100 bg-primary-50/40">
          <div className="flex w-full items-center justify-between rounded-2xl px-4 py-2 text-[13px] font-bold text-neutral-600 mb-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent-bow" />
              <span>Giao diện</span>
            </div>
            <span className="text-[12px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Hồng Pastel 🎀</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-[14px] font-bold text-negative transition-all duration-150 hover:bg-negative-bg group"
          >
            <LogOut
              size={18}
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

