"use client";

import { useEffect, useState } from "react";
import { X, Headphones, Phone, Copy, Check } from "lucide-react";
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

const CHANNEL_STYLE: Record<string, { bg: string; iconSize: number; pure: boolean }> = {
  hotline: {
    bg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white",
    iconSize: 18,
    pure: true,
  },
  zalo: {
    bg: "bg-gradient-to-br from-[#0068FF] to-[#0084FF] text-white",
    iconSize: 26,
    pure: true,
  },
  tiktok: {
    bg: "bg-black text-white",
    iconSize: 22,
    pure: true,
  },
  facebook: {
    bg: "bg-[#1877F2] text-white",
    iconSize: 22,
    pure: true,
  },
  youtube: {
    bg: "bg-[#FF0000] text-white",
    iconSize: 22,
    pure: true,
  },
  instagram: {
    bg: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white",
    iconSize: 22,
    pure: true,
  },
  threads: {
    bg: "bg-black text-white",
    iconSize: 20,
    pure: true,
  },
};

export function PublicFloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const enabledChannels = getEnabledSupportChannels();

  // Đóng khi nhấn ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
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
    <>
      {/* Overlay vô hình — click vào đây sẽ đóng menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed right-6 bottom-20 z-50 flex flex-col items-end">
        {/* Floating Speed Dial Stack - Hiển thị danh sách dọc phía trên nút liên hệ */}
        {isOpen && (
          <div className="mb-3 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
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
                    <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1.5 shadow-cute border border-primary-200/90 backdrop-blur-md">
                      <a
                        href={c.href}
                        className="text-[13px] font-black text-primary-600 tracking-tight whitespace-nowrap hover:underline"
                      >
                        {c.handle}
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleCopyHotline(e, rawPhone)}
                        title="Copy số điện thoại"
                        className="flex h-6 items-center gap-1 rounded-full bg-primary-100 px-2 text-[10.5px] font-bold text-primary-700 hover:bg-primary-200 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? "Đã copy" : "Copy"}
                      </button>
                    </div>

                    {/* Circular Button bên phải */}
                    <a
                      href={c.href}
                      title="Gọi hotline ngay"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-cute hover:shadow-cute-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                    >
                      <Phone size={18} className="animate-pulse text-white" />
                    </a>
                  </div>
                );
              }

              const IconComponent = ICON_MAP[c.iconType as keyof typeof ICON_MAP];
              const channelStyle = CHANNEL_STYLE[c.key] ?? {
                bg: "bg-neutral-900 text-white",
                iconSize: 22,
                pure: true,
              };

              return (
                <div
                  key={c.key}
                  className="group flex items-center gap-2 transition-all hover:-translate-x-1"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Label badge bên trái — chỉ hiển thị handle ngắn gọn */}
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center rounded-2xl bg-white/95 px-3 py-1.5 shadow-cute border border-primary-200/90 hover:border-primary-400 transition-colors backdrop-blur-md"
                  >
                    <span className="text-[12.5px] font-black text-neutral-800 whitespace-nowrap">
                      {c.handle}
                    </span>
                  </a>

                  {/* Circular Button bên phải — đồng bộ kích thước và viền trắng với Hotline */}
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={c.label}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-cute hover:shadow-cute-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white ${channelStyle.bg}`}
                  >
                    {IconComponent ? (
                      <IconComponent size={channelStyle.iconSize} pure={channelStyle.pure} />
                    ) : (
                      <Headphones size={18} className="text-white" />
                    )}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Đóng menu hỗ trợ" : "Liên hệ hỗ trợ MeowBack"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute hover:shadow-cute-lg transition-all hover:scale-105 active:scale-95 border-2 border-white relative overflow-hidden"
        >
          <div
            className={`transition-transform duration-300 flex items-center justify-center ${
              isOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            {isOpen ? (
              <X size={26} strokeWidth={2.5} className="text-white" />
            ) : (
              <Headphones size={24} strokeWidth={2.25} className="text-white" />
            )}
          </div>
        </button>
      </div>
    </>
  );
}
