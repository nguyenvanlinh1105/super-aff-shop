"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Check, Copy, ExternalLink, Link2, Plus, Package, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { formatCurrency } from "@/lib/format";

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
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [originalUrl, setOriginalUrl] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const selectedPlatform = platforms.find((p) => p.id === platformId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setImgBroken(false);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl,
        platformId,
        channelSource: "web",
        productPrice: productPrice ? Number(productPrice) : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không tạo được link");
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
    setProductPrice("");
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
          {platforms.map((p) => {
            const style = platformStyle(p.code);
            const Icon = style.icon;
            const active = p.id === platformId;
            const isTiktok = p.code.toUpperCase() === "TIKTOK";
            return (
              <div key={p.id} className="relative">
                <button
                  type="button"
                  onClick={() => !isTiktok && setPlatformId(p.id)}
                  disabled={isTiktok}
                  className={`group flex h-[88px] w-[100px] flex-col items-center justify-center gap-1 rounded-3xl border transition-all duration-200 ${
                    isTiktok
                      ? "border-primary-100 bg-neutral-100/50 opacity-40 cursor-not-allowed"
                      : active
                      ? "border-primary-400 bg-white shadow-cute scale-105"
                      : "border-primary-100/80 bg-white hover:border-primary-300 hover:bg-primary-50/50 hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 ${active && !isTiktok ? "scale-110" : "group-hover:scale-110"}`}
                    style={{ color: style.color, backgroundColor: `${style.color}15` }}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={`text-[12px] font-bold ${active && !isTiktok ? "text-neutral-900" : "text-neutral-500"}`}>
                    {p.label}
                  </span>
                </button>
                {isTiktok && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-neutral-400 px-1.5 py-0.5 text-[9px] font-bold text-white leading-tight">
                    Tạm tắt
                  </span>
                )}
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <TextInput
                placeholder={`Dán link ${selectedPlatform?.label ?? "sản phẩm"} muốn tích nơ hoàn tiền vào đây...`}
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="h-12 bg-primary-50/40 border-primary-200 focus:border-primary-500 focus:ring-primary-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-primary-50 border border-primary-200 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-200 text-accent-bow">
              <Wallet size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-extrabold text-neutral-900 mb-1">Nhập giá để tính hoàn tiền ước tính 🎀</p>
              <input
                type="number"
                min={0}
                placeholder="VD: 183000"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full bg-white rounded-xl border border-primary-200 px-3 py-1.5 text-[14px] font-bold text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 placeholder:font-normal placeholder:text-neutral-400"
              />
            </div>
            {productPrice && Number(productPrice) > 0 && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Giá nhập</p>
                <p className="text-[14px] font-extrabold text-primary-600">{formatCurrency(Number(productPrice))}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium -mt-1">
            Shopee không cho phép lấy giá tự động — nhập giá sản phẩm để xem ước tính số tiền hoàn về ví!
          </p>
          <Button
            type="submit"
            disabled={loading || !platformId}
            className="h-12 w-fit rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute hover:shadow-cute-lg px-6 font-bold"
          >
            {loading ? "Đang tạo..." : (
              <>
                <Plus size={16} strokeWidth={2.5} />
                Tạo link hoàn tiền 🧶
              </>
            )}
          </Button>
        </form>
        {error && <div className="mt-2 text-[13px] font-bold text-negative">{error}</div>}
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

            {(result.productPrice != null || (result.estimatedCashback != null && Number(result.estimatedCashback) > 0)) && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-primary-50/60 p-3 border border-primary-100">
                {result.productPrice != null && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Giá sản phẩm</span>
                    <span className="text-[15px] font-extrabold text-neutral-900 tabular-nums">
                      {formatCurrency(result.productPrice)}
                    </span>
                  </div>
                )}
                {result.productPrice != null && result.estimatedCashback != null && Number(result.estimatedCashback) > 0 && (
                  <div className="h-8 w-px bg-primary-200 shrink-0" />
                )}
                {result.estimatedCashback != null && Number(result.estimatedCashback) > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D8A56]">Hoàn tiền ước tính</span>
                    <span className="text-[15px] font-extrabold text-[#2D8A56] tabular-nums">
                      {formatCurrency(result.estimatedCashback)} 🎀
                    </span>
                  </div>
                )}
              </div>
            )}
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

