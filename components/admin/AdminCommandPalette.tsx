"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Zap,
  Users,
  Link2,
  Flame,
  MessagesSquare,
  Package,
  Download,
  Wallet,
  BarChart3,
  Send,
  Settings,
  ArrowRight,
  Command,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
  keywords: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: "dash", title: "Tổng quan Dashboard", category: "Vận hành", href: "/admin", icon: <LayoutDashboard size={18} />, keywords: "dashboard tong quan home admin" },
  { id: "quick-link", title: "Tạo Link Affiliate Nhanh", category: "Vận hành", href: "/admin/quick-link", icon: <Zap size={18} />, keywords: "tao link aff convert chuyen doi shopee tiktok" },
  { id: "customers", title: "Quản lý Khách hàng", category: "Vận hành", href: "/admin/customers", icon: <Users size={18} />, keywords: "khach hang user thanh vien customer list" },
  { id: "links", title: "Danh sách Link Affiliate", category: "Vận hành", href: "/admin/links", icon: <Link2 size={18} />, keywords: "link tracking lich su tao link" },
  { id: "deals", title: "Quản lý Deals Hot", category: "Vận hành", href: "/admin/deals", icon: <Flame size={18} />, keywords: "deals ưu đãi khuyen mai khuyen mai" },
  { id: "community", title: "Quản lý Cộng đồng", category: "Vận hành", href: "/admin/community", icon: <MessagesSquare size={18} />, keywords: "cong dong nhom zalo facebook telegram group" },
  { id: "orders", title: "Đối soát Đơn hàng", category: "Tài chính", href: "/admin/orders", icon: <Package size={18} />, keywords: "don hang order doi soat csv gan khach" },
  { id: "import", title: "Import File CSV Đơn hàng", category: "Tài chính", href: "/admin/orders/import", icon: <Download size={18} />, keywords: "import excel csv shopee tiktok accestrade" },
  { id: "payments", title: "Duyệt Thanh toán & Rút tiền", category: "Tài chính", href: "/admin/payments", icon: <Wallet size={18} />, keywords: "thanh toan rut tien vi rut ve ngan hang bank" },
  { id: "reports", title: "Báo cáo Doanh thu & Lợi nhuận", category: "Tài chính", href: "/admin/reports", icon: <BarChart3 size={18} />, keywords: "bao cao doanh thu loi nhuan analytics report" },
  { id: "telegram", title: "Tích hợp Telegram Bot", category: "Hệ thống", href: "/admin/telegram", icon: <Send size={18} />, keywords: "telegram bot webhook message chat" },
  { id: "settings", title: "Cài đặt Tỷ lệ Hoa hồng", category: "Hệ thống", href: "/admin/settings", icon: <Settings size={18} />, keywords: "cai dat setting tỷ le hoa hong nganh hang % commission" },
];

export function AdminCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

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
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex].href);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-950/50 backdrop-blur-md animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200/80 z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 bg-gradient-to-r from-rose-50/40 via-white to-sky-50/40">
          <Search size={20} className="text-primary-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ tên trang hoặc từ khóa tìm kiếm (VD: Đơn hàng, Rút tiền, Telegram...)..."
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X size={16} />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-[10px] font-bold text-neutral-500 shrink-0">
            ESC đóng
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1 divide-y divide-neutral-50">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs font-semibold text-neutral-400">
              Không tìm thấy trang hoặc chức năng phù hợp với &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.01]"
                      : "hover:bg-primary-50/60 text-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isSelected ? "bg-white/20 text-white" : "bg-primary-100/70 text-primary-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black truncate">{item.title}</div>
                      <div
                        className={`text-[10px] font-semibold ${
                          isSelected ? "text-white/80" : "text-neutral-400"
                        }`}
                      >
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {item.href}
                    </span>
                    <ArrowRight
                      size={16}
                      className={`transition-transform ${
                        isSelected ? "translate-x-0.5 text-white" : "text-neutral-300"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-neutral-50 border-t border-neutral-100 text-[11px] font-semibold text-neutral-400">
          <span className="flex items-center gap-1">
            <Command size={12} /> Phím tắt nhanh cho Admin
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span>↑↓ di chuyển</span>
            <span>↵ chọn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
