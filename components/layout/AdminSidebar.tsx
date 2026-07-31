"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, ShieldCheck, Sparkles, Search, Command } from "lucide-react";
import { LogoMeowBack, IconBow } from "@/components/icons/CatRibbonIcons";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

export type AdminNavItem = {
  href: string;
  label: string;
  emoji?: string;
  icon: React.ReactNode;
  badge?: number;
};

export type AdminNavSection = {
  title?: string;
  items: AdminNavItem[];
};

export function AdminSidebar({
  adminName,
  sections,
}: {
  adminName: string;
  sections: AdminNavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <div className="md:hidden flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-primary-100/80 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <LogoMeowBack />
          <span className="text-[10px] bg-gradient-to-r from-primary-500 to-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
            Admin Suite
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-primary-50 rounded-xl transition-all"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[275px] shrink-0 flex-col justify-between bg-white/95 backdrop-blur-xl border-r border-primary-100/70 shadow-xl md:shadow-none transition-transform duration-300 md:relative md:translate-x-0 flex ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex-1 overflow-y-auto custom-scrollbar">
          {/* Brand header */}
          <div className="px-5 pt-6 pb-5 border-b border-primary-100/60 mb-3 relative bg-gradient-to-b from-primary-50/50 to-transparent">
            <button
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-800 md:hidden rounded-lg hover:bg-primary-100/50"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LogoMeowBack />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] font-bold text-neutral-700 bg-white/90 px-3 py-1.5 rounded-2xl border border-primary-200/50 shadow-xs backdrop-blur-sm">
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck size={14} className="text-primary-500 shrink-0" />
                  <span className="truncate text-neutral-800">{adminName}</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                  <Sparkles size={10} /> HQ
                </span>
              </div>

              {/* Quick Command Search Button */}
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="mt-1 flex items-center justify-between gap-2 w-full px-3 py-2 rounded-2xl bg-neutral-100/80 hover:bg-rose-50/80 text-neutral-600 hover:text-rose-600 text-xs font-semibold border border-neutral-200/60 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Search size={14} className="text-neutral-400 group-hover:text-rose-500" />
                  <span>Tìm kiếm nhanh...</span>
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-black text-neutral-400 bg-white px-1.5 py-0.5 rounded-md border border-neutral-200 shadow-2xs">
                  <Command size={10} /> K
                </span>
              </button>
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
                        className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-bold transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-md shadow-primary-500/20"
                            : "text-neutral-600 hover:bg-primary-50/80 hover:text-neutral-900"
                        }`}
                      >
                        <span
                          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            active ? "text-white" : "text-neutral-400 group-hover:text-primary-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {!!item.badge && item.badge > 0 && (
                          <span
                            className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-xs ${
                              active
                                ? "bg-white text-primary-600"
                                : "bg-primary-500 text-white"
                            }`}
                          >
                            {item.badge}
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
          </nav>
        </div>

        {/* Footer: logout */}
        <div className="px-3 py-4 border-t border-primary-100/60 bg-gradient-to-b from-transparent to-primary-50/50">
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

      <AdminCommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}


