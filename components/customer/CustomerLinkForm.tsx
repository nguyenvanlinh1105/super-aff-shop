"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Check, Copy, ExternalLink, Link2, Plus, Package, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";
import { IconBow } from "@/components/icons/CatRibbonIcons";
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

export function CustomerLinkForm({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

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
        {/* Phần 1: Chọn sàn mua sắm */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-extrabold text-neutral-800 flex items-center gap-2">
              <Store size={17} className="text-primary-500" />
              Chọn sàn mua sắm
            </span>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
              Nhấn để đổi sàn
            </span>
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

                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 transition-transform ${
                      active ? "scale-105" : ""
                    }`}
                    style={{
                      color: pm.color,
                      backgroundColor: active ? "#ffffff" : `${pm.color}15`,
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="flex flex-col text-center sm:text-left min-w-0">
                    <span className={`text-[13px] sm:text-[14px] font-bold leading-tight truncate ${active ? "text-neutral-900" : "text-neutral-700"}`}>
                      {p.label}
                    </span>
                    {p.code === "SHOPEE" && (
                      <span className="text-[10px] text-primary-600 font-semibold hidden sm:inline leading-tight mt-0.5">
                        Mặc định ⭐
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

        {/* Phần 2: Dán link sản phẩm */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <label htmlFor="url-input" className="text-[13px] font-bold text-neutral-700 flex items-center gap-1.5">
            <Link2 size={15} className="text-primary-500" />
            {meta.tagline}
          </label>
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
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white shadow-lg shadow-primary-500/25 px-6 font-bold disabled:opacity-70 disabled:cursor-not-allowed shrink-0 transition-all cursor-pointer"
            >
              {loading ? "Đang tạo..." : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  Tạo link hoàn tiền 🧶
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* ─── Kết quả ─── */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">
          {/* Panel left: PRODUCT INFO */}
          <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
            <div className="mb-3 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-neutral-500">
              <Package size={14} strokeWidth={2.5} />
              Thông tin sản phẩm
            </div>
            <div className="flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100 overflow-hidden">
                {result.productImage && !imgBroken ? (
                  <img
                    src={result.productImage}
                    alt=""
                    onError={() => setImgBroken(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Link2 size={24} strokeWidth={1.5} className="text-primary-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14px] font-bold text-neutral-900 leading-snug">
                  {result.productTitle ?? "Sản phẩm mua sắm"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: meta.color }}
                  >
                    {selectedPlatform?.label ?? "Sản phẩm"}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400 truncate">{result.trackingCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel right: GENERATED LINK */}
          <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-white p-6 shadow-cute border border-primary-200">
            <div className="mb-3 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-primary-600">
              <Sparkles size={14} strokeWidth={2.5} />
              Link hoàn tiền của bạn
            </div>
            <input
              readOnly
              value={result.shortUrl}
              onFocus={(e) => e.target.select()}
              className="mb-4 h-11 w-full rounded-2xl bg-white px-4 text-[13px] font-bold text-neutral-900 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold shadow-cute"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Đã copy 🎀" : "Copy link"}
              </Button>
              <a href={result.shortUrl} target="_blank" rel="noreferrer">
                <Button type="button" variant="tertiary" className="rounded-full">
                  <ExternalLink size={16} />
                  Mở
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
