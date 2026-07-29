"use client";

import { useEffect, useState, useRef } from "react";
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

export function PublicFloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const enabledChannels = getEnabledSupportChannels();

  // Đóng khi click ngoài hoặc nhấn ESC
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
      className="fixed right-6 bottom-20 z-50 flex flex-col items-end"
    >
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
  );
}
