"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Headphones, Bell, Phone, Copy, Check } from "lucide-react";
import {
  FacebookIcon,
  ZaloIcon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  ThreadsIcon,
} from "@/components/icons/PlatformIcons";
import { getEnabledSupportChannels } from "@/lib/supportConfig";

const ICON_MAP = {
  facebook: FacebookIcon,
  zalo: ZaloIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  instagram: InstagramIcon,
  threads: ThreadsIcon,
};

export function FloatingQuickAccess({ unreadCount }: { unreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const enabledChannels = getEnabledSupportChannels();

  // Đóng menu khi click ra ngoài hoặc nhấn ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyHotline = (e: React.MouseEvent, phoneRaw: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phoneRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="fixed right-lg z-50 flex flex-col items-end bottom-[calc(58px+env(safe-area-inset-bottom)+16px)] md:bottom-lg"
    >
      {/* Speed Dial Menu Stack — Nổi phía trên nút hỗ trợ giống UI Home */}
      {isOpen && (
        <div className="mb-3 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[calc(100vh-200px)] overflow-y-auto">
          {enabledChannels.map((c, index) => {
            if (c.key === "hotline") {
              const rawPhone = c.handle.replace(/\D/g, "");
              return (
                <div
                  key={c.key}
                  className="group flex items-center gap-2.5 transition-all hover:-translate-x-1"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Label badge bên trái */}
                  <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2 shadow-cute border border-primary-100 backdrop-blur-md">
                    <span className="text-[13px] font-extrabold text-neutral-900">
                      {c.label}:{" "}
                      <span className="text-primary-600 font-black">
                        {c.handle}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyHotline(e, rawPhone)}
                      title="Copy số Hotline"
                      className="flex h-7 items-center gap-1 rounded-full bg-primary-100 px-2 text-[11px] font-bold text-primary-600 hover:bg-primary-200 transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Đã copy" : "Copy"}
                    </button>
                  </div>

                  {/* Circular Button bên phải */}
                  <a
                    href={c.href}
                    title="Gọi hotline ngay"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-cute hover:shadow-cute-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                  >
                    <Phone size={20} className="animate-pulse text-white" />
                  </a>
                </div>
              );
            }

            const IconComponent = ICON_MAP[c.iconType as keyof typeof ICON_MAP];

            return (
              <div
                key={c.key}
                className="group flex items-center gap-2.5 transition-all hover:-translate-x-1"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Label badge bên trái */}
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2 shadow-cute border border-primary-100/90 hover:border-primary-300 transition-colors backdrop-blur-md"
                >
                  <span className="text-[13px] font-extrabold text-neutral-800">
                    {c.label}
                  </span>
                  <span className="text-[11px] font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                    {c.handle}
                  </span>
                </a>

                {/* Circular Button bên phải */}
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={c.label}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-cute hover:shadow-cute-lg transition-transform hover:scale-110 active:scale-95 border-2 border-primary-100 p-2 text-neutral-800"
                >
                  {IconComponent ? (
                    <IconComponent size={28} />
                  ) : (
                    <Headphones size={20} className="text-primary-500" />
                  )}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons Stack */}
      <div className="flex flex-col items-center gap-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Đóng menu hỗ trợ" : "Liên hệ hỗ trợ MeowBack"}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 active:scale-95 ${
            isOpen ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white" : "bg-white text-[#e86a33]"
          }`}
        >
          <div className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-white" : "rotate-0"}`}>
            {isOpen ? <X size={24} strokeWidth={2.5} /> : <Headphones size={24} strokeWidth={2.25} />}
          </div>
        </button>

        <Link
          href="/app/notifications"
          title="Thông báo"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105 active:scale-95"
        >
          <Bell size={24} strokeWidth={2.25} className="text-[#e86a33]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-negative px-1 text-[11px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
