"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Check, Copy, ExternalLink, Link2, Plus, Package, Sparkles, Wallet, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { SevenTipsModal } from "@/components/customer/SevenTipsModal";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

type Option = { id: string; code: string; label: string };
type LinkResult = {
  shortUrl: string;
  generatedLink: string;
  trackingCode: string;
  shortCode: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: number | string | null;
  estimatedCashback: number | string | null;
  categoryName?: string | null;
  categoryRate?: number | null;
  customerEffectiveRate?: number | null;
  sampleCashbacks?: { orderAmount: number; cashback: number }[] | null;
};

const PLATFORM_META: Record<string, {
  icon: typeof ShopeeIcon;
  color: string;
  gradient: string;
  placeholder: string;
  tagline: string;
}> = {
  SHOPEE: {
    icon: ShopeeIcon,
    color: "#EE4D2D",
    gradient: "from-orange-500 to-red-500",
    placeholder: "https://shopee.vn/...",
    tagline: "Dán link sản phẩm Shopee",
  },
  TIKTOK: {
    icon: TiktokIcon,
    color: "#010101",
    gradient: "from-neutral-800 to-neutral-900",
    placeholder: "https://vt.tiktok.com/... hoặc https://www.tiktok.com/...",
    tagline: "Dán link sản phẩm TikTok Shop",
  },
  LAZADA: {
    icon: LazadaIcon,
    color: "#0F146D",
    gradient: "from-indigo-600 to-blue-700",
    placeholder: "https://www.lazada.vn/...",
    tagline: "Dán link sản phẩm Lazada",
  },
};

function getPlatformMeta(code: string) {
  return PLATFORM_META[code.toUpperCase()] ?? {
    icon: Store,
    color: "#FF6D9E",
    gradient: "from-primary-400 to-primary-500",
    placeholder: "https://...",
    tagline: "Dán link sản phẩm",
  };
}

export function CustomerLinkForm({
  platforms,
  autoShowTips = false,
}: {
  platforms: Option[];
  autoShowTips?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  useEffect(() => {
    if (autoShowTips) {
      const hasSeen = sessionStorage.getItem("meow_seen_7_tips");
      if (!hasSeen) {
        setShowTipModal(true);
      }
    }
  }, [autoShowTips]);

  const handleCloseTips = () => {
    sessionStorage.setItem("meow_seen_7_tips", "true");
    setShowTipModal(false);
  };

  const selectedPlatform = platforms.find((p) => p.id === platformId);
  const meta = selectedPlatform ? getPlatformMeta(selectedPlatform.code) : getPlatformMeta("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!originalUrl.trim() || !platformId) return;

    setLoading(true);
    setResult(null);
    setImgBroken(false);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl,
        platformId,
        channelSource: "web",
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Không tạo được link hoàn tiền. Vui lòng kiểm tra lại đường dẫn sản phẩm.", "Lỗi tạo link");
      return;
    }

    const data = await res.json();
    setResult({
      shortUrl: data.link.shortUrl,
      generatedLink: data.link.generatedLink,
      trackingCode: data.link.trackingCode,
      shortCode: data.link.shortCode,
      productTitle: data.link.productTitle ?? null,
      productImage: data.link.productImage ?? null,
      productPrice: data.link.productPrice ?? null,
      estimatedCashback: data.link.estimatedCashback ?? null,
      categoryName: data.link.categoryName ?? null,
      categoryRate: data.link.categoryRate ?? null,
      customerEffectiveRate: data.link.customerEffectiveRate ?? null,
      sampleCashbacks: data.link.sampleCashbacks ?? null,
    });
    setOriginalUrl("");
    toast.success("Tạo link hoàn tiền thành công! Bạn có thể sao chép và mua sắm ngay.", "Tạo link thành công");
    router.refresh();
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success("Đã sao chép link hoàn tiền vào bộ nhớ tạm! 🛍️", "Đã copy");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── KHUNG TẠO LINK HOÀN TIỀN (Gộp gọn gàng, đơn giản & hiện đại) ─── */}
      <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-cute border border-primary-100/80">
        {/* Bước 1: Chọn sàn mua sắm */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-rose-500 text-[10.5px] font-black text-white shadow-xs">
                1
              </span>
              <span className="text-[13px] sm:text-[14px] font-black text-neutral-900 whitespace-nowrap">
                Bước 1: <span className="font-extrabold text-neutral-700">Chọn sàn<span className="hidden sm:inline"> mua sắm</span></span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTipModal(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-[11px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs group shrink-0 whitespace-nowrap"
            >
              <Lightbulb size={12} className="text-amber-500 fill-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span>7 lưu ý<span className="hidden sm:inline"> cần nhớ</span></span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {platforms.map((p) => {
              const pm = getPlatformMeta(p.code);
              const Icon = pm.icon;
              const active = p.id === platformId;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => {
                    setPlatformId(p.id);
                    setResult(null);
                  }}
                  className={`relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 p-3 sm:px-4 sm:py-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    active
                      ? "border-primary-500 bg-primary-50/70 text-primary-950 shadow-md shadow-primary-500/10 ring-2 ring-primary-100"
                      : "border-neutral-200/80 bg-neutral-50/50 text-neutral-600 hover:bg-white hover:border-neutral-300 hover:shadow-xs"
                  }`}
                >
                  {/* Active check badge */}
                  {active && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-xs">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}

                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center shrink-0 transition-transform">
                    <Icon size={34} />
                  </div>

                  <div className="flex flex-col text-center sm:text-left min-w-0">
                    <span className={`text-[13px] sm:text-[14px] font-bold leading-tight truncate ${active ? "text-neutral-900" : "text-neutral-700"}`}>
                      {p.label}
                    </span>
                    {p.code === "SHOPEE" && (
                      <span className="text-[10px] text-primary-700 bg-primary-100/70 px-1.5 py-0.5 rounded font-bold hidden sm:inline leading-tight mt-0.5 w-fit">
                        Mặc định
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Đường kẻ phân cách nhẹ nhàng */}
        <div className="h-px bg-neutral-100 mb-5" />

        {/* Bước 2: Dán link sản phẩm */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="url-input" className="text-[13px] font-black text-neutral-900 flex items-center gap-1.5 sm:gap-2 min-w-0 whitespace-nowrap">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-rose-500 text-[10.5px] font-black text-white shadow-xs">
                2
              </span>
              <span>Bước 2:</span>
              <span className="text-neutral-600 font-semibold truncate">{meta.tagline}</span>
            </label>
            <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline whitespace-nowrap shrink-0">
              Hỗ trợ link app &amp; web
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <TextInput
              id="url-input"
              placeholder={meta.placeholder}
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="h-12 flex-1 bg-neutral-50/60 border-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-2xl text-[14px]"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              disabled={loading || !platformId}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white shadow-md shadow-primary-500/20 px-6 font-bold disabled:opacity-70 disabled:cursor-not-allowed shrink-0 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </span>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={2.5} className="text-white fill-white/40" />
                  <span>Tạo link hoàn tiền</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* ─── Kết quả (Chỉ hiển thị card thông tin sản phẩm và button Mua ngay) ─── */}
      {result && (
        <div className="w-full fade-in">
          <div
            onClick={() => window.open(result.shortUrl, "_blank")}
            className="group rounded-3xl bg-white p-5 sm:p-6 shadow-cute hover:shadow-cute-lg border border-primary-100/80 hover:border-primary-300 transition-all cursor-pointer relative block overflow-hidden active:scale-[0.99]"
            title="Chạm vào để mở sàn & mua ngay"
          >
            {/* Top Tag & Platform */}
            <div className="mb-3.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-black text-white shadow-2xs"
                  style={{ backgroundColor: meta.color }}
                >
                  {selectedPlatform?.label ?? "Sàn mua sắm"}
                </span>
                {result.categoryName && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold bg-primary-50 text-primary-800 border border-primary-200/60 shadow-2xs">
                    🏷️ {result.categoryName}
                  </span>
                )}
                <span className="font-mono text-[11px] text-neutral-400 truncate">
                  {result.trackingCode}
                </span>
              </div>
            </div>

            <div className="flex gap-3.5 sm:gap-4 items-center">
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100 overflow-hidden">
                {result.productImage && !imgBroken ? (
                  <img
                    src={result.productImage}
                    alt=""
                    onError={() => setImgBroken(true)}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Link2 size={24} strokeWidth={1.5} className="text-primary-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between gap-2">
                <p className="line-clamp-2 text-[14px] sm:text-[15px] font-bold text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors">
                  {result.productTitle ?? "Sản phẩm mua sắm"}
                </p>

                {/* GIÁ SẢN PHẨM & ƯỚC TÍNH TIỀN HOÀN CHO KHÁCH HÀNG */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {result.productPrice && Number(result.productPrice) > 0 ? (
                    /* Có giá sản phẩm */
                    <>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block leading-none mb-0.5">
                          Giá sản phẩm
                        </span>
                        <span className="text-xs sm:text-[13px] font-black text-neutral-900 tabular-nums">
                          {formatCurrency(result.productPrice)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-bold block leading-none mb-0.5">
                          Hoàn tiền ước tính
                        </span>
                        <span className="text-xs sm:text-[13px] font-black text-emerald-600 tabular-nums">
                          +{formatCurrency(result.estimatedCashback ?? Math.round(Number(result.productPrice) * 0.05))} 🎀
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Chưa có giá sản phẩm: Tối giản, bỏ chữ thừa, 1 dòng gọn gàng */
                    <>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold block leading-none mb-0.5">
                          Tỷ lệ hoàn tiền
                        </span>
                        <span className="text-xs sm:text-[13px] font-black text-rose-600">
                          {result.customerEffectiveRate != null
                            ? `~${Number(result.customerEffectiveRate).toFixed(1)}%`
                            : "Lên tới 10% - 15%"} ✨
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200/70 shadow-2xs whitespace-nowrap">
                          <span>Tự động hoàn về ví</span>
                          <span>🎀</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>



            {/* CHỈ HIỂN THỊ BUTTON MUA NGAY */}
            <div className="mt-4 pt-3.5 border-t border-neutral-100">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex items-center justify-center gap-2 h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 hover:from-primary-600 hover:to-rose-600 text-white text-sm sm:text-base font-black shadow-md shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                <span>Mua ngay</span>
                <ArrowRight size={18} strokeWidth={2.8} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Popup 7 lưu ý cho người mới hoặc khi nhấn nút */}
      <SevenTipsModal isOpen={showTipModal} onClose={handleCloseTips} />
    </div>
  );
}
