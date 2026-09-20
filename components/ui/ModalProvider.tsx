"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { X, AlertCircle, Info, HelpCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { IllustCatSuccess } from "@/components/icons/CatRibbonIcons";
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

  const getIcon = () => {
    switch (options?.iconType) {
      case "danger":
        return <AlertCircle className="text-rose-500" size={32} strokeWidth={2} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={32} strokeWidth={2} />;
      case "success":
        return <IllustCatSuccess className="w-16 h-16" />;
      default:
        return <Info className="text-primary-500" size={32} strokeWidth={2} />;
    }
  };

  const getIconContainerStyle = () => {
    switch (options?.iconType) {
      case "danger":
        return "bg-rose-50 border border-rose-100/80 shadow-xs";
      case "warning":
        return "bg-amber-50 border border-amber-100/80 shadow-xs";
      case "success":
        return "bg-primary-50 border border-primary-100 shadow-xs";
      default:
        return "bg-primary-50 border border-primary-100 shadow-xs";
    }
  };

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
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-md"
              onClick={() => handleClose(false)}
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 sm:p-8 shadow-cute-lg border border-primary-100/80 my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => handleClose(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-primary-50 hover:text-neutral-900 transition-colors"
                aria-label="Đóng"
              >
                <X size={18} strokeWidth={2.2} />
              </button>

              <div className="flex flex-col items-center text-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${getIconContainerStyle()}`}>
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-[19px] font-extrabold text-neutral-900 leading-tight mb-2 tracking-tight">
                    {options.title}
                  </h3>
                  <div className="text-[14px] text-neutral-600 leading-relaxed font-medium">
                    {options.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex items-center gap-3">
                {options.type === "confirm" && (
                  <Button
                    variant="tertiary"
                    className="flex-1 rounded-full text-[14px] py-2.5"
                    onClick={() => handleClose(false)}
                  >
                    {options.cancelText || "Hủy bỏ"}
                  </Button>
                )}
                <Button
                  variant={options.iconType === "danger" ? "danger" : "primary"}
                  className="flex-1 rounded-full text-[14px] py-2.5"
                  onClick={() => handleClose(true)}
                >
                  {options.confirmText || (options.type === "confirm" ? "Xác nhận" : "Đồng ý 🎀")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}
