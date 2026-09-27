"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Link2, Wallet, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_ROUNDS = [
  {
    name: "Shopee",
    color: "#EE4D2D",
    url: "https://shopee.vn/iPhone-16-Pro-Max-Titan-i.12345.67890",
    cashback: "+450.000đ",
    item: "iPhone 16 Pro Max",
  },
  {
    name: "Lazada",
    color: "#0F146D",
    url: "https://s.lazada.vn/s.LazMall-Kem-Duong-Da-SKII-Phuc-Hoi",
    cashback: "+380.000đ",
    item: "Kem Dưỡng Da LazMall",
  },
  {
    name: "TikTok Shop",
    color: "#FE2C55",
    url: "https://vt.tiktok.com/ZS2TikTok-Ao-Khoac-Unisex-Trend/",
    cashback: "+195.000đ",
    item: "Áo Khoác Unisex Trend",
  },
];

const STEPS = [
  { id: 0, icon: Link2, label: "Dán link sản phẩm (Shopee, Lazada, TikTok)", color: "#FF3B7B" },
  { id: 1, icon: Sparkles, label: "Mèo Thần Tài xử lý mã hoàn tiền", color: "#8B5CF6" },
  { id: 2, icon: ShoppingBag, label: "Mua sắm qua link hoàn tiền", color: "#3B82F6" },
  { id: 3, icon: Wallet, label: "Nhận tiền hoàn tự động vào ví MeowBack", color: "#10B981" },
];

export function ShopeeLiveDemo({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);

  const currentPlatform = PLATFORM_ROUNDS[roundIdx % PLATFORM_ROUNDS.length];

  useEffect(() => {
    const delays = [1900, 1900, 2000, 2600];
    let timeout: NodeJS.Timeout;

    const advance = (currStep: number, currRound: number) => {
      timeout = setTimeout(() => {
        const nextStep = (currStep + 1) % 4;
        let nextRound = currRound;
        if (nextStep === 0) {
          nextRound = (currRound + 1) % PLATFORM_ROUNDS.length;
          setRoundIdx(nextRound);
        }
        setStep(nextStep);
        advance(nextStep, nextRound);
      }, delays[currStep]);
    };

    advance(step, roundIdx);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("w-full max-w-[1200px] mx-auto px-4 md:px-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border-2 border-primary-200/90 rounded-3xl p-6 sm:p-8 md:p-12 shadow-cute">
        {/* LEFT: Step tracker */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <motion.div
                key={s.id}
                animate={{
                  opacity: isActive ? 1 : isDone ? 0.6 : 0.35,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all"
                style={{
                  background: isActive ? `${s.color}12` : "transparent",
                  border: isActive ? `2px solid ${s.color}40` : "2px solid transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs"
                  style={{ backgroundColor: isActive || isDone ? s.color : "#E5E7EB" }}
                >
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <Icon size={18} className={isActive ? "text-white" : "text-neutral-400"} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-bold text-[13.5px] sm:text-[15px] transition-colors duration-300 leading-snug",
                      isActive ? "text-neutral-900 font-black" : "text-neutral-500"
                    )}
                  >
                    Bước {s.id + 1}: {s.label}
                  </p>
                </div>
                {isActive && (
                  <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
                    <ArrowRight size={16} style={{ color: s.color }} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT: Animated preview */}
        <div className="bg-gradient-to-b from-primary-50/40 via-white to-neutral-50 rounded-2xl border-2 border-primary-100 p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
          {/* Dot + Platform active pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-500"
                style={{ backgroundColor: currentPlatform.color }}
              />
              <span className="text-[11px] font-black tracking-widest uppercase text-neutral-500">
                Demo Trực Quan
              </span>
            </div>
            <div
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-xs transition-colors duration-500"
              style={{
                borderColor: `${currentPlatform.color}40`,
                backgroundColor: `${currentPlatform.color}10`,
                color: currentPlatform.color,
              }}
            >
              Sàn: {currentPlatform.name}
            </div>
          </div>

          {/* Input Bar */}
          <div
            className="relative h-13 bg-white rounded-xl border border-neutral-200 flex items-center px-4 overflow-hidden shadow-inner"
            style={{ height: "52px" }}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.span
                  key={`ph-${currentPlatform.name}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-neutral-400 font-mono text-[12px] sm:text-sm flex items-center gap-1 truncate"
                >
                  <span className="animate-pulse">|</span> Dán link {currentPlatform.name} vào đây...
                </motion.span>
              )}
              {step >= 1 && (
                <motion.span
                  key={`link-${currentPlatform.name}`}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[11px] sm:text-[12.5px] font-bold truncate pr-32"
                  style={{ color: currentPlatform.color }}
                >
                  {currentPlatform.url}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="absolute right-2">
              <motion.div
                animate={{
                  backgroundColor: step >= 2 ? "#10B981" : currentPlatform.color,
                  scale: step === 1 ? [1, 0.9, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm whitespace-nowrap"
              >
                {step >= 2 ? (
                  <>
                    <CheckCircle2 size={13} /> Đã chuyển đổi
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Nhận Link 🐾
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Cashback Badge */}
          <div className="flex justify-center min-h-[50px] items-center">
            <AnimatePresence>
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 sm:px-6 py-2.5 rounded-full font-black text-[13.5px] sm:text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  💰 Tiền hoàn dự kiến ({currentPlatform.name}): {currentPlatform.cashback} 🎀
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hint text */}
          <div className="text-center min-h-[22px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${step}-${currentPlatform.name}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[12px] font-bold text-neutral-500"
              >
                {step === 0 && `① Copy link ${currentPlatform.name} bất kỳ và dán vào MeowBack`}
                {step === 1 && `② Hệ thống tự động gắn mã hoàn tiền MeowBack chỉ trong 1s`}
                {step === 2 && `③ Bấm mở link hoàn tiền để mua hàng trên ${currentPlatform.name}`}
                {step === 3 && `💸 Tiền hoàn tự động cộng thẳng vào ví MeowBack của bạn!`}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
