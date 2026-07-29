"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, AlertCircle, Info, HelpCircle } from "lucide-react";
import { Button } from "./Button";
import { IllustCatSuccess } from "@/components/icons/CatRibbonIcons";

type ModalType = "alert" | "confirm";

interface ModalOptions {
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

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(value);
      setResolver(null);
    }
  };

  const getIcon = () => {
    switch (options?.iconType) {
      case "danger":
        return <AlertCircle className="text-negative" size={32} strokeWidth={1.5} />;
      case "warning":
        return <HelpCircle className="text-amber-500" size={32} strokeWidth={1.5} />;
      case "success":
        return <IllustCatSuccess className="w-16 h-16" />;
      default:
        return <Info className="text-primary-500" size={32} strokeWidth={1.5} />;
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 fade-in">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" 
            onClick={() => handleClose(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-cute-lg border border-primary-100 fade-in">
            <button 
              onClick={() => handleClose(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-primary-50 hover:text-neutral-900 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                {getIcon()}
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-neutral-900 leading-tight mb-1">
                  {options.title}
                </h3>
                <div className="text-[14px] text-neutral-500 leading-relaxed font-medium">
                  {options.message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {options.type === "confirm" && (
                <Button 
                  variant="tertiary" 
                  className="flex-1 rounded-full"
                  onClick={() => handleClose(false)}
                >
                  {options.cancelText || "Hủy bỏ"}
                </Button>
              )}
              <Button 
                variant={options.iconType === "danger" ? "danger" : "primary"}
                className="flex-1 rounded-full"
                onClick={() => handleClose(true)}
              >
                {options.confirmText || "Đồng ý 🎀"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

