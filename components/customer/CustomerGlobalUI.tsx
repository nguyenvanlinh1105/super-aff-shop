"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, RotateCcw, Gift, Wallet, ShoppingBag, Settings, UserPlus, BookOpen, HelpCircle } from "lucide-react";
import { CustomerLinkForm } from "./CustomerLinkForm";
import { useModal } from "@/components/ui/ModalProvider";

type PlatformOption = { id: string; code: string; label: string };

const COMMAND_ITEMS = [
  { id: "home", title: "Trang chủ", category: "Chung", href: "/app", icon: <Home size={18} />, keywords: "trang chu home dashboard" },
  { id: "quick-link", title: "Tạo link hoàn tiền", category: "Kiếm tiền", href: "/app/refunds", icon: <RotateCcw size={18} />, keywords: "tao link hoan tien rut shopee tiktok" },
  { id: "deals", title: "Ưu đãi", category: "Kiếm tiền", href: "/app/deals", icon: <Gift size={18} />, keywords: "uu dai khuyen mai deal hot" },
  { id: "wallet", title: "Ví tiền", category: "Tài chính", href: "/app/wallet", icon: <Wallet size={18} />, keywords: "vi tien rut tien so du balance" },
  { id: "orders", title: "Đơn hàng", category: "Tài chính", href: "/app/orders", icon: <ShoppingBag size={18} />, keywords: "don hang order doi soat" },
  { id: "referral", title: "Mời bạn bè", category: "Chung", href: "/app/referral", icon: <UserPlus size={18} />, keywords: "moi ban be gioi thieu referral" },
  { id: "settings", title: "Thông tin cá nhân", category: "Cá nhân", href: "/app/settings", icon: <Settings size={18} />, keywords: "cai dat setting thong tin ca nhan mat khau pin" },
  { id: "guide", title: "Hướng dẫn", category: "Hỗ trợ", href: "/app/guide", icon: <BookOpen size={18} />, keywords: "huong dan guide faq" },
];

export function CustomerGlobalUI({ platforms }: { platforms: PlatformOption[] }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickLinkOpen, setIsQuickLinkOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const modal = useModal();

  // Listen for custom events
  useEffect(() => {
    const handleOpenCommand = () => setIsCommandOpen(true);
    const handleOpenQuickLink = () => setIsQuickLinkOpen(true);

    document.addEventListener("open-customer-command", handleOpenCommand);
    document.addEventListener("open-quick-link", handleOpenQuickLink);
    return () => {
      document.removeEventListener("open-customer-command", handleOpenCommand);
      document.removeEventListener("open-quick-link", handleOpenQuickLink);
    };
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Command Palette Logic
  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (item: typeof COMMAND_ITEMS[0]) => {
      setIsCommandOpen(false);
      if (item.id === "quick-link") {
        // Mở luôn modal tạo link nhanh thay vì chuyển trang nếu muốn
        setIsQuickLinkOpen(true);
      } else {
        router.push(item.href);
      }
    },
    [router]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handlePaletteKey(e: KeyboardEvent) {
      if (!isCommandOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsCommandOpen(false);
      }
    }
    window.addEventListener("keydown", handlePaletteKey);
    return () => window.removeEventListener("keydown", handlePaletteKey);
  }, [isCommandOpen, filteredItems, selectedIndex, handleSelect]);

  return (
    <>
      {/* Command Palette */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsCommandOpen(false)} />
          <div className="relative w-full max-w-[500px] rounded-2xl bg-white shadow-2xl overflow-hidden fade-in border border-primary-100">
            <div className="flex items-center gap-3 border-b border-primary-100 px-4 py-3 bg-gradient-to-r from-primary-50/50 to-white">
              <Search className="text-primary-400" size={20} />
              <input
                autoFocus
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-400 text-neutral-900"
                placeholder="Tìm kiếm tính năng, thao tác (VD: tạo link, rút tiền)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">
                ESC
              </div>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-none scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  Không tìm thấy kết quả phù hợp.
                </div>
              ) : (
                filteredItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${i === selectedIndex
                      ? "bg-primary-50 text-primary-900"
                      : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${i === selectedIndex ? "bg-white text-primary-500 shadow-sm" : "bg-neutral-100 text-neutral-500"}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold">{item.title}</div>
                      <div className="text-[12px] text-neutral-400 font-medium">{item.category}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Link Modal */}
      {isQuickLinkOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsQuickLinkOpen(false)} />
          <div className="relative w-full max-w-[500px] rounded-3xl bg-white shadow-2xl fade-in overflow-hidden border border-primary-100">
            <div className="bg-gradient-to-r from-primary-50 to-white px-5 py-4 border-b border-primary-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <RotateCcw size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[16px] text-neutral-900">Tạo Link Nhanh 🪄</h3>
                  <p className="text-[12px] font-medium text-neutral-500">Tạo link mọi lúc mọi nơi</p>
                </div>
              </div>
              <button onClick={() => setIsQuickLinkOpen(false)} className="text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <CustomerLinkForm platforms={platforms} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
