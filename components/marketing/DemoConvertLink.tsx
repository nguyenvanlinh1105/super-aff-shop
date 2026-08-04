"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, ArrowRight, Sparkles } from "lucide-react";

export const PENDING_LINK_STORAGE_KEY = "meowback_pending_link";

type PreviewResult = {
  platformCode: string;
  productTitle: string | null;
  productImage: string | null;
  productPrice: number | null;
  estimatedCashback: number | null;
  categoryName: string | null;
};

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export function DemoConvertLink() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/links/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không phân tích được link");
      setPreview(data);
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra, thử lại nhé");
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterCta() {
    try {
      localStorage.setItem(PENDING_LINK_STORAGE_KEY, url.trim());
    } catch {}
    router.push("/register");
  }

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-md p-5 shadow-cute border border-primary-100 max-w-lg">
      <form onSubmit={handlePreview} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Link2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(null); setError(null); }}
            placeholder="Dán link Shopee để xem hoàn tiền..."
            className="h-12 w-full rounded-full bg-white pl-10 pr-4 text-[13.5px] font-extrabold text-neutral-900 placeholder:font-semibold placeholder:text-neutral-500 border-2 border-primary-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 shrink-0 rounded-full bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 px-6 text-[14px] font-extrabold text-white shadow-cute hover:shadow-cute-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Đang xem..." : "Xem thử 🎀"}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-[12px] font-bold text-negative">{error}</p>
      )}

      {preview && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary-50 p-4 border border-primary-100 fade-in">
          {preview.productImage ? (
            <img src={preview.productImage} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover border border-primary-100" />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-xl bg-primary-100 flex items-center justify-center text-primary-500 font-bold">
              🐱
            </div>
          )}
          <div className="min-w-0 flex-1">
            {preview.productTitle && (
              <p className="truncate text-[12px] font-bold text-neutral-900">{preview.productTitle}</p>
            )}
            <p className="text-[13px] font-extrabold text-primary-600">
              {preview.estimatedCashback
                ? `Ước tính hoàn ~${formatVnd(preview.estimatedCashback)} 🎀`
                : "Link đã sẵn sàng!"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegisterCta}
            className="shrink-0 flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-4 py-2 text-[12px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all"
          >
            Nhận hoàn tiền 🐾
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

