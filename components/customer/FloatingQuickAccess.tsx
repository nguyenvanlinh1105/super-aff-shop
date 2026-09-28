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

export function FloatingQuickAccess({
  unreadCount,
  showBell = false,
}: {
  unreadCount: number;
  showBell?: boolean;
}) {
  const [count, setCount] = useState(unreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kéo thả nút hỗ trợ trên Mobile
  const [mobilePos, setMobilePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const EDGE_MARGIN = 8;
  const BUTTON_SIZE = 52;

  // Khôi phục vị trí đã lưu trong session (nếu có) trên mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      try {
        const saved = sessionStorage.getItem("meowback-support-pos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            const screenW = window.innerWidth;
            const maxY = window.innerHeight - 72;
            const clampedY = Math.max(60, Math.min(parsed.y, maxY));
            // Snap về cạnh gần nhất khi khôi phục
            const centerX = parsed.x + BUTTON_SIZE / 2;
            const snapX = centerX < screenW / 2
              ? EDGE_MARGIN
              : screenW - BUTTON_SIZE - EDGE_MARGIN;
            setMobilePos({ x: snapX, y: clampedY });
          }
        }
      } catch {}
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Chỉ kích hoạt kéo thả trên mobile/tablet (< 768px)
    if (window.innerWidth >= 768) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: rect.left,
      startY: rect.top,
    };
    hasDraggedRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current || window.innerWidth >= 768) return;

    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    if (!hasDraggedRef.current && Math.hypot(dx, dy) > 6) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      const buttonSize = 52;
      const minX = 8;
      const maxX = window.innerWidth - buttonSize - 8;
      const minY = 60;
      const maxY = window.innerHeight - buttonSize - 20;

      const nextX = Math.max(minX, Math.min(dragStartRef.current.startX + dx, maxX));
      const nextY = Math.max(minY, Math.min(dragStartRef.current.startY + dy, maxY));

      setMobilePos({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasDraggedRef.current && mobilePos) {
      // Snap về cạnh trái hoặc phải gần nhất (không cho ở giữa)
      const screenW = window.innerWidth;
      const centerX = mobilePos.x + BUTTON_SIZE / 2;
      const snapX = centerX < screenW / 2
        ? EDGE_MARGIN                          // Trôi về bên trái
        : screenW - BUTTON_SIZE - EDGE_MARGIN; // Trôi về bên phải

      const snappedPos = { x: snapX, y: mobilePos.y };

      // Bật animation transition trước khi thay đổi vị trí
      setIsSnapping(true);
      setMobilePos(snappedPos);

      try {
        sessionStorage.setItem("meowback-support-pos", JSON.stringify(snappedPos));
      } catch {}

      // Tắt transition sau khi animation kết thúc
      setTimeout(() => {
        setIsSnapping(false);
      }, 320);

      // Giữ cờ hasDraggedRef một chút để onClick không kích hoạt bật tắt menu
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    }

    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handleButtonClick = () => {
    if (hasDraggedRef.current) return;
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    setCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    const handleSet = (e: CustomEvent<number>) => {
      if (typeof e.detail === "number") setCount(e.detail);
    };
    const handleDelta = (e: CustomEvent<number>) => {
      if (typeof e.detail === "number") setCount((prev) => Math.max(0, prev + e.detail));
    };
    const handleNotif = () => setCount((prev) => prev + 1);

    window.addEventListener("meowback-unread-count" as any, handleSet);
    window.addEventListener("meowback-unread-delta" as any, handleDelta);
    window.addEventListener("meowback-notification" as any, handleNotif);

    return () => {
      window.removeEventListener("meowback-unread-count" as any, handleSet);
      window.removeEventListener("meowback-unread-delta" as any, handleDelta);
      window.removeEventListener("meowback-notification" as any, handleNotif);
    };
  }, []);

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

  const isTopHalf = mobilePos && typeof window !== "undefined"
    ? mobilePos.y < window.innerHeight / 2
    : false;
  const isLeftHalf = mobilePos && typeof window !== "undefined"
    ? mobilePos.x < window.innerWidth / 2
    : false;

  return (
    <div
      ref={containerRef}
      style={
        mobilePos && typeof window !== "undefined" && window.innerWidth < 768
          ? {
              top: `${mobilePos.y}px`,
              bottom: "auto",
              ...(isLeftHalf
                ? { left: `${mobilePos.x}px`, right: "auto" }
                : { right: `${Math.max(8, window.innerWidth - mobilePos.x - BUTTON_SIZE)}px`, left: "auto" }
              ),
              ...(isSnapping ? { transition: "left 0.3s cubic-bezier(0.25, 1, 0.5, 1), right 0.3s cubic-bezier(0.25, 1, 0.5, 1), top 0.3s cubic-bezier(0.25, 1, 0.5, 1)" } : {}),
            }
          : undefined
      }
      className={`fixed z-40 flex ${
        isTopHalf ? "flex-col-reverse" : "flex-col"
      } ${isLeftHalf ? "items-start" : "items-end"} ${
        !mobilePos ? "customer-floating-support" : ""
      }`}
    >
      {/* Speed Dial Menu Stack — Nổi phía trên/dưới nút hỗ trợ tuỳ theo vị trí kéo */}
      {isOpen && (
        <div
          className={`${
            isTopHalf ? "mt-3" : "mb-3"
          } flex flex-col ${
            isLeftHalf ? "items-start" : "items-end"
          } gap-2.5 animate-in fade-in ${
            isTopHalf ? "slide-in-from-top-4" : "slide-in-from-bottom-4"
          } duration-200 max-h-[calc(100vh-200px)] overflow-y-auto`}
        >
          {enabledChannels.map((c, index) => {
            const isReverse = isLeftHalf;

            if (c.key === "hotline") {
              const rawPhone = c.handle.replace(/\D/g, "");
              return (
                <div
                  key={c.key}
                  className={`group flex items-center gap-2 transition-all ${
                    isReverse ? "flex-row-reverse hover:translate-x-1" : "hover:-translate-x-1"
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Label badge — chỉ hiển thị số điện thoại + nút copy */}
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

                  {/* Circular Button */}
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

            return (
              <div
                key={c.key}
                className={`group flex items-center gap-2 transition-all ${
                  isReverse ? "flex-row-reverse hover:translate-x-1" : "hover:-translate-x-1"
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Label badge — chỉ hiển thị tên ngắn gọn như Cộng đồng Zalo, @meowback.official */}
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

                {/* Circular Button */}
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={c.label}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-cute hover:shadow-cute-lg transition-transform hover:scale-110 active:scale-95 border-2 border-primary-100 p-2 text-neutral-800"
                >
                  {IconComponent ? (
                    <IconComponent size={24} />
                  ) : (
                    <Headphones size={18} className="text-primary-500" />
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
          onClick={handleButtonClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "none" }}
          title={isOpen ? "Đóng menu hỗ trợ" : "Liên hệ hỗ trợ MeowBack (Kéo thả để di chuyển)"}
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-cute border border-primary-200/80 transition-transform ${
            isDragging
              ? "scale-110 shadow-cute-lg ring-4 ring-primary-300/60"
              : "hover:scale-105 active:scale-95"
          } ${
            isOpen ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white" : "bg-white text-primary-500 hover:text-primary-600"
          } cursor-grab active:cursor-grabbing select-none`}
        >
          <div className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-white" : "rotate-0"}`}>
            {isOpen ? <X size={24} strokeWidth={2.5} /> : <Headphones size={24} strokeWidth={2.25} />}
          </div>
        </button>

        {showBell && (
          <Link
            href="/app/notifications"
            title="Thông báo"
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-cute border border-primary-200/80 transition-transform hover:scale-105 active:scale-95 text-primary-500 hover:text-primary-600"
          >
            <Bell size={24} strokeWidth={2.25} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-extrabold text-white ring-2 ring-white shadow-sm">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
