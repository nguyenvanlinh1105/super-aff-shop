"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { useToast } from "./Toast";

type ModalType = "alert" | "confirm";

export interface ModalOptions {
  title: string;
  message: ReactNode;
  type?: ModalType;
  iconType?: "danger" | "info" | "warning" | "success";
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  alert: (options: Omit<ModalOptions, "type">) => Promise<void>;
  confirm: (options: Omit<ModalOptions, "type">) => Promise<boolean>;
  toast: ReturnType<typeof useToast>["toast"];
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const alert = useCallback((opts: Omit<ModalOptions, "type">) => {
    return new Promise<void>((resolve) => {
      setOptions({ ...opts, type: "alert" });
      setResolver({ resolve: () => resolve() });
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((opts: Omit<ModalOptions, "type">) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ ...opts, type: "confirm" });
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback((value: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(value);
      setResolver(null);
    }
  }, [resolver]);

  // Keyboard accessibility: ESC key to dismiss
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const getMascotBadge = () => {
    switch (options?.iconType) {
      case "danger":
        return {
          ring: "ring-rose-200/80",
          gradient: "from-rose-50 via-pink-50 to-red-100",
          badgeBg: "bg-gradient-to-r from-rose-500 to-red-600",
          badgeIcon: "🐾",
          badgeAnim: "",
        };
      case "warning":
        return {
          ring: "ring-amber-200/80",
          gradient: "from-amber-50 via-rose-50 to-pink-100",
          badgeBg: "bg-gradient-to-r from-amber-400 to-orange-500",
          badgeIcon: "⚡",
          badgeAnim: "animate-bounce",
        };
      case "success":
        return {
          ring: "ring-emerald-200/80",
          gradient: "from-emerald-50 via-teal-50 to-primary-100",
          badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
          badgeIcon: "✨",
          badgeAnim: "",
        };
      default:
        return {
          ring: "ring-primary-200/80",
          gradient: "from-primary-50 via-pink-50 to-rose-100",
          badgeBg: "bg-gradient-to-r from-primary-500 to-rose-500",
          badgeIcon: "🎀",
          badgeAnim: "",
        };
    }
  };

  const mascot = getMascotBadge();

  return (
    <ModalContext.Provider value={{ alert, confirm, toast }}>
      {children}

      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-950/45 backdrop-blur-md"
              onClick={() => handleClose(false)}
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="relative w-full max-w-[430px] rounded-[32px] bg-gradient-to-b from-rose-50/70 via-white to-white p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(255,109,158,0.35)] border border-primary-100/90 my-auto overflow-hidden text-neutral-900"
            >
              {/* Decorative background glow & sparkles */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-primary-200/35 to-pink-200/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-gradient-to-tr from-rose-200/30 to-amber-200/20 blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => handleClose(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors z-10 cursor-pointer"
                aria-label="Đóng"
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center gap-3.5">
                {/* Mascot Icon with 3D Ring & Floating Mini-badge */}
                <div className="relative">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${mascot.gradient} flex items-center justify-center p-2 shadow-cute border-2 border-white ring-4 ${mascot.ring} transition-transform`}
                  >
                    <img
                      src="/meowback_lucky_cat_logo.png"
                      alt="MeowBack Mascot"
                      className="w-full h-full object-contain drop-shadow-xs"
                    />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white text-[12px] font-black ${mascot.badgeBg} ${mascot.badgeAnim}`}
                  >
                    {mascot.badgeIcon}
                  </div>
                </div>

                {/* Sub ribbon pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/95 border border-primary-200/70 text-[10.5px] font-black uppercase tracking-wider text-primary-600 shadow-2xs">
                  <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                  <span>{options.type === "confirm" ? "Xác nhận hành động 🐾" : "Thông báo MeowBack 🐾"}</span>
                </div>

                {/* Title & Message */}
                <div className="w-full">
                  <h3 className="text-lg sm:text-[20px] font-black text-neutral-900 leading-tight mb-2 tracking-tight">
                    {options.title}
                  </h3>
                  <div className="text-[13.5px] text-neutral-600 leading-relaxed font-medium">
                    {options.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 mt-6 flex items-center gap-3 w-full">
                {options.type === "confirm" && (
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="flex-1 h-11 sm:h-12 flex items-center justify-center rounded-2xl border-2 border-neutral-200/90 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-extrabold text-[13px] sm:text-[14px] px-3 shadow-2xs transition-all active:scale-95 cursor-pointer text-center whitespace-nowrap"
                  >
                    {options.cancelText || "Hủy bỏ"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className={`flex-1 h-11 sm:h-12 flex items-center justify-center rounded-2xl font-black text-[13px] sm:text-[14px] px-3 text-white shadow-cute hover:shadow-cute-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center whitespace-nowrap ${
                    options.iconType === "danger"
                      ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                      : "bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 hover:from-primary-600 hover:to-rose-600"
                  }`}
                >
                  {options.confirmText || (options.type === "confirm" ? "Xác nhận" : "Đồng ý")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}
