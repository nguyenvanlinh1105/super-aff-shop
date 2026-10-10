"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Sparkles } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // in ms, default 4000
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextType {
  toast: {
    (options: ToastOptions | string): void;
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const TOAST_STYLES: Record<
  ToastType,
  {
    container: string;
    iconBg: string;
    iconColor: string;
    progressBar: string;
    IconComponent: React.ElementType;
    defaultTitle: string;
  }
> = {
  success: {
    container: "border-emerald-200/90 bg-white/95 text-neutral-900 shadow-cute shadow-emerald-500/10",
    iconBg: "bg-emerald-50 border border-emerald-200/70 text-emerald-600",
    iconColor: "text-emerald-500",
    progressBar: "bg-emerald-500",
    IconComponent: CheckCircle2,
    defaultTitle: "Thành công",
  },
  error: {
    container: "border-rose-200/90 bg-white/95 text-neutral-900 shadow-cute shadow-rose-500/10",
    iconBg: "bg-rose-50 border border-rose-200/70 text-rose-600",
    iconColor: "text-rose-500",
    progressBar: "bg-rose-500",
    IconComponent: AlertCircle,
    defaultTitle: "Thông báo lỗi",
  },
  warning: {
    container: "border-amber-200/90 bg-white/95 text-neutral-900 shadow-cute shadow-amber-500/10",
    iconBg: "bg-amber-50 border border-amber-200/70 text-amber-600",
    iconColor: "text-amber-500",
    progressBar: "bg-amber-500",
    IconComponent: AlertTriangle,
    defaultTitle: "Chú ý",
  },
  info: {
    container: "border-primary-200/90 bg-white/95 text-neutral-900 shadow-cute shadow-primary-500/10",
    iconBg: "bg-primary-50 border border-primary-200/70 text-primary-500",
    iconColor: "text-primary-500",
    progressBar: "bg-primary-500",
    IconComponent: Sparkles,
    defaultTitle: "Thông báo",
  },
};

function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const type = toast.type || "info";
  const style = TOAST_STYLES[type];
  const Icon = style.IconComponent;
  const duration = toast.duration ?? 4000;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, isHovered, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative pointer-events-auto flex w-full max-w-[400px] items-start gap-3 rounded-2xl border p-4 backdrop-blur-md transition-shadow hover:shadow-cute-lg overflow-hidden ${style.container}`}
    >
      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${style.iconBg}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-[14px] font-extrabold text-neutral-900 tracking-tight leading-tight">
          {toast.title || style.defaultTitle}
        </h4>
        <p className="mt-1 text-[13px] font-medium text-neutral-600 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 -mr-1 -mt-1 rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 transition-colors cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X size={15} strokeWidth={2.5} />
      </button>

      {/* Progress timer bar (nằm trọn dưới đáy và bo góc hoàn hảo theo khung thẻ) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-200/40">
          {!isHovered && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{ originX: 0 }}
              className={`h-full w-full opacity-80 ${style.progressBar}`}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: ToastOptions | string) => {
    const opts: ToastOptions =
      typeof options === "string" ? { message: options } : options;

    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newToast: ToastItem = {
      ...opts,
      id,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      // Limit to max 4 toasts at a time
      const next = [newToast, ...prev];
      return next.slice(0, 4);
    });
  }, []);

  const toastMethods = React.useMemo(() => {
    const fn = (options: ToastOptions | string) => addToast(options);
    fn.success = (message: string, title?: string, duration?: number) =>
      addToast({ message, title, type: "success", duration });
    fn.error = (message: string, title?: string, duration?: number) =>
      addToast({ message, title, type: "error", duration });
    fn.warning = (message: string, title?: string, duration?: number) =>
      addToast({ message, title, type: "warning", duration });
    fn.info = (message: string, title?: string, duration?: number) =>
      addToast({ message, title, type: "info", duration });
    return fn;
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: toastMethods, dismiss, dismissAll }}>
      {children}

      {/* Toast viewport: Top-center on mobile, Top-right on desktop */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-center gap-2.5 p-4 sm:items-end sm:p-6"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <SingleToast key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
