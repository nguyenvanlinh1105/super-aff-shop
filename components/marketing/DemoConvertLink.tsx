"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ShopeeIcon, LazadaIcon, TiktokIcon } from "@/components/icons/PlatformIcons";

export const PENDING_LINK_STORAGE_KEY = "meowback_pending_link";

type PreviewResult = {
  platformCode: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: number | null;
  estimatedCashback: number | null;
  categoryName: string | null;
};

const SAMPLE_LINKS = [
  {
    name: "Shopee",
    icon: ShopeeIcon,
    url: "https://shopee.vn/product/Tai-nghe-Bluetooth-Meow-Cute-i.12345.67890",
    color: "hover:border-[#EE4D2D] hover:text-[#EE4D2D] hover:bg-[#EE4D2D]/5 hover:shadow-[0_4px_12px_rgba(238,77,45,0.2)]",
    activeColor: "border-[#EE4D2D] text-[#EE4D2D] bg-[#EE4D2D]/10",
    demoData: {
      platformCode: "SHOPEE",
      productTitle: "Tai Nghe Bluetooth Tai Mèo Phát Sáng Edition",
      productImage: "/meowback_lucky_cat_logo.png",
      productPrice: 380000,
      estimatedCashback: 30400,
      categoryName: "Thiết Bị Điện Tử",
    },
  },
  {
    name: "Lazada",
    icon: LazadaIcon,
    url: "https://s.lazada.vn/s.LazMall-Kem-Duong-Da-Meow-Phuc-Hoi-123",
    color: "hover:border-[#0F146D] hover:text-[#0F146D] hover:bg-[#0F146D]/5 hover:shadow-[0_4px_12px_rgba(15,20,109,0.2)]",
    activeColor: "border-[#0F146D] text-[#0F146D] bg-[#0F146D]/10",
    demoData: {
      platformCode: "LAZADA",
      productTitle: "Kem Dưỡng Da Phục Hồi Chính Hãng LazMall Super Brand",
      productImage: "/meowback_lucky_cat_logo.png",
      productPrice: 520000,
      estimatedCashback: 41600,
      categoryName: "Chăm Sóc Sắc Đẹp",
    },
  },
  {
    name: "TikTok",
    icon: TiktokIcon,
    url: "https://vt.tiktok.com/ZS2TikTok-Ao-Khoac-No-Meow-Trend/",
    color: "hover:border-[#FE2C55] hover:text-[#FE2C55] hover:bg-[#FE2C55]/5 hover:shadow-[0_4px_12px_rgba(254,44,85,0.2)]",
    activeColor: "border-[#FE2C55] text-[#FE2C55] bg-[#FE2C55]/10",
    demoData: {
      platformCode: "TIKTOK",
      productTitle: "Áo Thun Unisex Nơ Hồng Trend TikTok Shop Hot Hit",
      productImage: "/meowback_lucky_cat_logo.png",
      productPrice: 220000,
      estimatedCashback: 17600,
      categoryName: "Thời Trang & Phụ Kiện",
    },
  },
];

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function triggerSuccessConfetti() {
  try {
    if (typeof window !== "undefined") {
      confetti({
        particleCount: 26,
        spread: 55,
        origin: { y: 0.65 },
        colors: ["#FF6D9E", "#FF3B7B", "#EE4D2D", "#F5C56B", "#7ED9A8"],
      });
    }
  } catch {}
}

export function DemoConvertLink() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const detectedPlatform = (() => {
    const u = url.toLowerCase();
    if (u.includes("shopee.") || u.includes("shp.ee")) return "Shopee";
    if (u.includes("lazada.") || u.includes("lzd.co") || u.includes("s.lazada.")) return "Lazada";
    if (u.includes("tiktok.") || u.includes("vt.tiktok") || u.includes("vm.tiktok")) return "TikTok Shop";
    return null;
  })();

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    let targetUrl = url.trim();
    if (!targetUrl) {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          const clipText = await navigator.clipboard.readText();
          if (clipText && clipText.trim()) {
            targetUrl = clipText.trim();
            setUrl(targetUrl);
          }
        }
      } catch {}
    }
    if (!targetUrl) {
      setError("Vui lòng dán link Shopee, Lazada hoặc TikTok để kiểm tra hoàn tiền nhé");
      return;
    }
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/links/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không phân tích được link");
      setPreview(data);
      triggerSuccessConfetti();
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra, thử lại nhé");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickSample(sample: (typeof SAMPLE_LINKS)[0]) {
    setUrl(sample.url);
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setPreview(sample.demoData);
      setLoading(false);
      triggerSuccessConfetti();
    }, 280);
  }

  function handleRegisterCta() {
    try {
      localStorage.setItem(PENDING_LINK_STORAGE_KEY, url.trim());
    } catch {}
    router.push("/register");
  }

  return (
    <div className="relative w-full max-w-[760px] mx-auto group">
      {/* Ambient glowing aura behind the card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-400/30 via-[#FF3B7B]/30 to-primary-500/30 rounded-[36px] blur-xl opacity-70 group-hover:opacity-100 transition-all duration-700 animate-pulse-glow pointer-events-none" />

      {/* Main Glass Card synchronized with lower sections */}
      <div className="relative z-10 w-full rounded-3xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-6 md:p-7 shadow-[0_20px_50px_-12px_rgba(255,109,158,0.22)] border-2 border-primary-200/90 text-left transition-all">
        {/* Top Header of Converter Box */}
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg shrink-0">🐾</span>
            <span className="text-[13px] sm:text-[15.5px] font-black text-neutral-900 tracking-tight whitespace-nowrap">
              Dán link kiểm tra hoàn tiền
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[10px] sm:text-[11.5px] font-black text-primary-700 bg-primary-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-primary-200/80 shrink-0 whitespace-nowrap shadow-2xs">
              Hoàn tới 80%
            </span>
          </div>
        </div>

        {/* Input Form with quick paste & clear button */}
        <form onSubmit={handlePreview} className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Link2 size={17} className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setPreview(null);
                setError(null);
              }}
              placeholder="Dán link Shopee, Lazada, TikTok..."
              className="h-11 sm:h-12 w-full rounded-2xl bg-white pl-9 sm:pl-11 pr-16 sm:pr-20 text-[13px] sm:text-[14.5px] font-bold text-neutral-900 placeholder:font-medium placeholder:text-neutral-400 border-2 border-primary-200 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all shadow-inner"
            />
            {url ? (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setPreview(null);
                  setError(null);
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg transition-all"
              >
                ✕ Xóa
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setUrl(text);
                        setError(null);
                      }
                    }
                  } catch {}
                }}
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-[11.5px] font-black text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-primary-200/80 transition-all active:scale-95 shadow-xs whitespace-nowrap"
                title="Dán link đã copy"
              >
                📋 Dán
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="btn-shine-effect h-11 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 hover:shadow-cute-lg px-5 sm:px-6 text-[13px] sm:text-[14px] font-black text-white shadow-cute transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-98"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <span>🐾</span>}
            {loading ? "Đang đọc..." : "Kiểm tra hoàn tiền"}
          </motion.button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] sm:text-[12px] font-bold text-neutral-400 whitespace-nowrap shrink-0">Thử nhanh:</span>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {SAMPLE_LINKS.map((s) => {
              const Icon = s.icon;
              const isMatch = detectedPlatform === (s.name === "TikTok" ? "TikTok Shop" : s.name);
              return (
                <motion.button
                  key={s.name}
                  type="button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickSample(s)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-black border transition-all whitespace-nowrap shrink-0 ${
                    isMatch ? s.activeColor : "border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-primary-50 hover:text-primary-600"
                  } ${s.color}`}
                >
                  <Icon size={12} />
                  <span>{s.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {error && <p className="mt-2 text-[12px] sm:text-[13px] font-bold text-negative pl-1">{error}</p>}

        {/* Animated Preview Card */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 rounded-2xl bg-gradient-to-r from-primary-50/90 via-white to-primary-50/60 p-3.5 sm:p-4 border-2 border-primary-200 shadow-sm"
            >
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-primary-200 flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                  <img src={preview.productImage || "/meowback_lucky_cat_logo.png"} alt="" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] sm:text-[10.5px] font-black uppercase px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                      {preview.platformCode || "ĐA SÀN"}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500">
                      Tự động hoàn 80% hoa hồng
                    </span>
                  </div>
                  {preview.productTitle && (
                    <p className="truncate text-[12.5px] sm:text-[13.5px] font-black text-neutral-900 leading-tight">
                      {preview.productTitle}
                    </p>
                  )}
                  <p className="text-[13px] sm:text-[14.5px] font-black text-emerald-600 mt-0.5">
                    {preview.estimatedCashback
                      ? `Nhận lại ~${formatVnd(preview.estimatedCashback)} về ví 🎀`
                      : "Link hợp lệ! Nhận hoàn tiền ngay."}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleRegisterCta}
                className="btn-shine-effect w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-5 sm:px-6 py-2.5 sm:py-3 text-[12.5px] sm:text-[13.5px] font-black text-white shadow-cute hover:shadow-cute-lg transition-all"
              >
                Nhận tiền ngay 🐾
                <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust points footer — 2x2 grid on mobile for ZERO orphan words */}
        <div className="mt-3 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-primary-100/70 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-1.5 sm:gap-3 text-[11px] sm:text-[12px] font-bold text-neutral-500">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Tự động 100%
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Rút từ 10k về ví
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Nhận link trong 1s
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Miễn phí 100%
          </span>
        </div>
      </div>
    </div>
  );
}
