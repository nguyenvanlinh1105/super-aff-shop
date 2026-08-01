"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, Check, Copy, ExternalLink, Link2, Plus, Package, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { formatCurrency } from "@/lib/format";
import { useModal } from "@/components/ui/ModalProvider";

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

const PLATFORM_STYLE: Record<string, { icon: typeof ShopeeIcon; color: string; branded: boolean }> = {
  SHOPEE: { icon: ShopeeIcon, color: "#FF6D9E", branded: true },
  TIKTOK: { icon: TiktokIcon, color: "#3D2A30", branded: true },
};

function platformStyle(code: string) {
  return PLATFORM_STYLE[code.toUpperCase()] ?? { icon: Store, color: "#FF6D9E", branded: false };
}

export function CustomerLinkForm({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const modal = useModal();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const selectedPlatform = platforms.find((p) => p.id === platformId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      modal.alert({ title: "Lỗi tạo link", message: data.error ?? "Không tạo được link", iconType: "danger" });
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
    router.refresh();
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Platform selection (1 Chọn nền tảng) */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[12px] font-extrabold text-white shadow-sm">
            1
          </span>
          <span className="text-[15px] font-extrabold text-neutral-900">Chọn nền tảng mua sắm 🛍️</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {platforms.filter(p => p.code.toUpperCase() !== "TIKTOK").map((p) => {
            const style = platformStyle(p.code);
            const Icon = style.icon;
            const active = p.id === platformId;
            return (
              <div key={p.id} className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={() => setPlatformId(p.id)}
                  className={`group flex h-[88px] w-[100px] flex-col items-center justify-center gap-1 rounded-3xl border transition-colors duration-200 ${
                    active
                      ? "border-primary-400 bg-white shadow-xl shadow-primary-500/10"
                      : "border-primary-100/80 bg-white hover:border-primary-300 hover:bg-primary-50/50"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ color: style.color, backgroundColor: `${style.color}15` }}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={`text-[12px] font-bold ${active ? "text-neutral-900" : "text-neutral-500"}`}>
                    {p.label}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area (2 Dán link) */}
      <div className="rounded-3xl bg-white p-6 shadow-cute border border-primary-100/80">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[12px] font-extrabold text-white shadow-sm">
            2
          </span>
          <span className="text-[15px] font-extrabold text-neutral-900">
            Dán link {selectedPlatform?.label ?? "sản phẩm"}
          </span>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="url-input" className="text-[13px] font-bold text-neutral-600 ml-1">
              Dán link {selectedPlatform?.label ?? "sản phẩm"} muốn tích hoàn tiền vào ô bên dưới
            </label>
            <TextInput
              id="url-input"
              placeholder="https://..."
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="h-12 bg-primary-50/40 border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            disabled={loading || !platformId}
            className="flex items-center gap-2 h-12 w-fit rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-lg shadow-primary-500/20 px-6 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo..." : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Tạo link hoàn tiền 🧶
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Result Card */}
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
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-bold text-primary-600">
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

