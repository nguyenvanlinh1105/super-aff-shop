"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Link2, Wallet, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, icon: Link2,        label: "Dán link Shopee",       color: "#EE4D2D" },
  { id: 1, icon: Sparkles,     label: "Hệ thống xử lý",        color: "#FF3B7B" },
  { id: 2, icon: ShoppingBag,  label: "Mua hàng qua link mới", color: "#8B5CF6" },
  { id: 3, icon: Wallet,       label: "Nhận hoàn tiền vào ví", color: "#10B981" },
];

export function ShopeeLiveDemo({ className }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const delays = [1800, 1800, 2000, 2500];
    let timeout: NodeJS.Timeout;
    const advance = (current: number) => {
      timeout = setTimeout(() => {
        const next = (current + 1) % 4;
        setStep(next);
        advance(next);
      }, delays[current]);
    };
    advance(step);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("w-full max-w-[1200px] mx-auto px-4 md:px-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border-2 border-primary-100 rounded-3xl p-8 md:p-12 shadow-cute">

        {/* LEFT: Step tracker */}
        <div className="flex flex-col gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <motion.div
                key={s.id}
                animate={{
                  opacity: isActive ? 1 : isDone ? 0.5 : 0.3,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: isActive ? `${s.color}10` : "transparent",
                  border: isActive ? `2px solid ${s.color}30` : "2px solid transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{ backgroundColor: isActive || isDone ? s.color : "#E5E7EB" }}
                >
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <Icon size={18} className={isActive ? "text-white" : "text-neutral-400"} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-bold text-[15px] transition-colors duration-300",
                    isActive ? "text-neutral-900" : "text-neutral-400"
                  )}>
                    Bước {s.id + 1}: {s.label}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <ArrowRight size={16} style={{ color: s.color }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT: Animated preview */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 flex flex-col gap-5">
          {/* Dot + label */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-500",
              step >= 2 ? "bg-emerald-400" : "bg-[#EE4D2D]"
            )} />
            <span className="text-[11px] font-black tracking-widest uppercase text-neutral-400">Live Demo</span>
          </div>

          {/* Input Bar */}
          <div className="relative h-13 bg-white rounded-xl border border-neutral-200 flex items-center px-4 overflow-hidden shadow-sm" style={{ height: "52px" }}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.span key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-neutral-400 font-mono text-sm flex items-center gap-1">
                  <span className="animate-pulse">|</span> Dán link Shopee vào đây...
                </motion.span>
              )}
              {step >= 1 && (
                <motion.span key="link" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[#EE4D2D] font-mono text-[12px] sm:text-[13px] font-semibold truncate pr-36">
                  https://shopee.vn/iPhone-15-Pro-Max-i.12345.67890
                </motion.span>
              )}
            </AnimatePresence>
            <div className="absolute right-2">
              <motion.div
                animate={{ backgroundColor: step >= 2 ? "#10B981" : "#EE4D2D", scale: step === 1 ? [1, 0.88, 1] : 1 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm whitespace-nowrap"
              >
                {step >= 2 ? <><CheckCircle2 size={13} /> Đã chuyển đổi</> : <><Sparkles size={13} /> Nhận Link</>}
              </motion.div>
            </div>
          </div>

          {/* Cashback Badge */}
          <div className="flex justify-center min-h-[48px] items-center">
            <AnimatePresence>
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-6 py-2.5 rounded-full font-black text-base shadow-lg shadow-emerald-400/30 flex items-center gap-2"
                >
                  💰 Hoàn tiền dự kiến: +450.000đ
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint text */}
          <div className="text-center min-h-[20px]">
            <AnimatePresence mode="wait">
              <motion.p key={step}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[12px] font-semibold text-neutral-400"
              >
                {step === 0 && "① Dán link sản phẩm Shopee bất kỳ"}
                {step === 1 && "② Hệ thống tự động xử lý trong 1 giây"}
                {step === 2 && "③ Link hoàn tiền đã sẵn sàng!"}
                {step === 3 && "💸 Tiền hoàn tự động vào ví MeowBack!"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
