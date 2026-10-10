"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2, Link as LinkIcon, RefreshCw, Zap, Sparkles, ExternalLink, Globe, Smartphone, Send, ArrowRight } from "lucide-react";
import { TextInput } from "@/components/ui/TextInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type Option = { id: string; label: string };
type LinkResult = {
  shortUrl: string;
  generatedLink: string;
  trackingCode: string;
  shortCode: string;
};

export function QuickLinkForm({
  customers,
  platforms,
}: {
  customers: Option[];
  platforms: Option[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [channelSource, setChannelSource] = useState<"web" | "zalo" | "telegram">("web");
  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl, platformId, customerId, channelSource }),
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
    });
    setOriginalUrl("");
    router.refresh();
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-500/5 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Form */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-neutral-100 bg-gradient-to-br from-white via-white to-rose-50/20">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Input URL */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon size={14} className="text-rose-500" />
                  <span>Link Sản Phẩm Gốc (Shopee / Lazada / TikTok) *</span>
                </label>
                {originalUrl.includes("shopee") && (
                  <span className="text-[10px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                    🧡 Nhận diện Shopee
                  </span>
                )}
              </div>
              <div className="relative">
                <TextInput
                  placeholder="Dán đường dẫn https://shopee.vn/... hoặc https://s.lazada.vn/..."
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="bg-white h-13 text-sm rounded-2xl border-neutral-200/80 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 shadow-xs font-medium pl-4 pr-10"
                />
                {originalUrl && (
                  <button
                    type="button"
                    onClick={() => setOriginalUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold bg-neutral-100 h-6 w-6 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Platform Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                  👤 Gán Cho Khách Hàng
                </label>
                <SearchableSelect
                  options={customers}
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Tìm tên hoặc mã KH..."
                  inputClassName="h-12 bg-white rounded-2xl border-neutral-200/80 text-sm shadow-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                  🛍️ Nền Tảng Sàn
                </label>
                <CustomSelect
                  value={platformId}
                  onChange={setPlatformId}
                  options={platforms.map((p) => ({ value: p.id, label: p.label }))}
                  className="w-full"
                  buttonClassName="h-12 bg-white rounded-2xl border-neutral-200/80 text-sm shadow-xs font-extrabold text-neutral-900"
                  ariaLabel="Nền Tảng Sàn"
                />
              </div>
            </div>

            {/* Channel Source Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                📡 Kênh Phân Phối Đẩy Traffic
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "web", label: "Website", icon: Globe, color: "text-rose-500 bg-rose-50 border-rose-200" },
                  { value: "zalo", label: "Zalo OA", icon: Smartphone, color: "text-sky-600 bg-sky-50 border-sky-200" },
                  { value: "telegram", label: "Telegram", icon: Send, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
                ].map(({ value, label, icon: Icon, color }) => {
                  const isSelected = channelSource === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setChannelSource(value as "web" | "zalo" | "telegram")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-extrabold transition-all active:scale-[0.98] ${
                        isSelected
                          ? `bg-neutral-900 text-white border-neutral-900 shadow-sm`
                          : `bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50`
                      }`}
                    >
                      <Icon size={15} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-extrabold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !customerId || !platformId || !originalUrl}
              className="w-full mt-2 h-14 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-600 text-white font-extrabold text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Đang Khởi Tạo Mã Tracking...</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="fill-white" />
                  <span>Tạo Short Link Affiliate Ngay</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Result & Copy Card */}
        <div className="lg:w-[420px] bg-gradient-to-br from-rose-50/40 via-white to-pink-50/50 p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {!result ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-white border border-rose-100 shadow-md flex items-center justify-center p-2">
                  <img src="/meow-back-mascot.png" alt="MeowBack Mascot" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs animate-bounce">
                  ⚡
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 mb-1">Sẵn Sàng Khởi Tạo</h3>
                <p className="text-xs text-neutral-500 font-medium max-w-[240px] leading-relaxed">
                  Nhập link sản phẩm và bấm nút để nhận ngay Short Link chứa mã đối soát 100% tự động.
                </p>
              </div>

              <div className="w-full mt-4 p-3.5 rounded-2xl bg-white/80 border border-rose-100 text-left flex items-center gap-3 shadow-2xs">
                <Sparkles size={16} className="text-amber-500 shrink-0" />
                <span className="text-[11px] text-neutral-600 font-bold">
                  Mã tracking sẽ tự động lưu vào lịch sử giao dịch thành viên.
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 size={36} strokeWidth={2.2} />
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider mb-2">
                ✨ Khởi Tạo Thành Công!
              </div>

              <h4 className="text-lg font-black text-neutral-900 mb-5">Link Affiliate Của Bạn</h4>
              
              {/* Short Link Card */}
              <div className="w-full bg-white rounded-2xl p-5 border border-rose-200/80 shadow-md shadow-rose-500/5 mb-5 text-left relative group">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span>SHORT LINK TRACKING</span>
                  <span className="text-neutral-400 font-mono text-[9px]">1-CLICK COPY</span>
                </div>
                
                <div className="text-base font-black text-neutral-900 break-all pr-12 font-mono tracking-tight leading-snug">
                  {result.shortUrl}
                </div>

                <button 
                  type="button"
                  onClick={copyLink}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-500 text-white hover:bg-rose-600 active:scale-95"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Đã Copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Metadata Details */}
              <div className="w-full flex flex-col gap-2.5 text-left mb-4">
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-neutral-200/60 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-500">Tracking Code</span>
                  <span className="text-xs font-mono font-black text-rose-600">{result.trackingCode}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-neutral-200/60 shadow-2xs">
                  <span className="text-xs font-bold text-neutral-500">Short Code</span>
                  <span className="text-xs font-mono font-black text-neutral-800">{result.shortCode}</span>
                </div>
              </div>

              {/* Test link button */}
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-white border border-rose-200 text-neutral-800 font-bold text-xs hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Mở Thử Link Tracking</span>
                <ExternalLink size={13} className="text-rose-500" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
