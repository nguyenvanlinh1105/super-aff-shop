"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Upload, X, CheckCircle2, AlertCircle, Loader2,
  Tag, DollarSign, ImageIcon, ExternalLink, Flame, Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";
import { DEAL_LINK_TYPES, type DealLinkType } from "@/lib/dealLinkTypes";
import { dealExpiryEndOfDay } from "@/lib/dealExpiry";

type ResolveResult = {
  rawInputLink: string;
  cleanLink: string;
  affiliateUrl: string;
  shortCode: string;
  shortUrl: string;
  productTitle: string | null;
  shopeeImageUrl: string | null;
};

export function CreateDealForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 3 = success
  const [createdShortUrl, setCreatedShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Step 1
  const [inputUrl, setInputUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [shortUrlCopied, setShortUrlCopied] = useState(false);

  // Step 2
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [category, setCategory] = useState("");
  const [linkType, setLinkType] = useState<DealLinkType>("product");
  const [expiresAt, setExpiresAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleResolve() {
    if (!inputUrl.trim()) return;
    setResolving(true);
    setResolveError(null);
    try {
      const res = await fetch("/api/deals/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      if (!res.ok) throw new Error("Không phân tích được link");
      const data = await res.json();
      setResolved(data);
      setTitle(data.productTitle || "");
      setStep(2);
    } catch (e: any) {
      setResolveError(e.message || "Lỗi phân tích link");
    } finally {
      setResolving(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolved || !title) return;
    setSubmitting(true);
    setSubmitError(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("originalPrice", originalPrice);
    fd.append("salePrice", salePrice);
    fd.append("discountPercent", discountPercent);
    fd.append("rawInputLink", resolved.rawInputLink);
    fd.append("cleanLink", resolved.cleanLink);
    fd.append("affiliateUrl", resolved.affiliateUrl);
    fd.append("shortCode", resolved.shortCode); // dùng shortCode đã pre-generate
    fd.append("shortUrl", resolved.shortUrl);
    fd.append("shopeeImageUrl", resolved.shopeeImageUrl || "");
    fd.append("platformCode", "SHOPEE");
    fd.append("linkType", linkType);
    if (category) fd.append("category", category);
    if (expiresAt) fd.append("expiresAt", dealExpiryEndOfDay(expiresAt).toISOString());
    if (imageFile) fd.append("image", imageFile);

    const res = await fetch("/api/deals", { method: "POST", body: fd });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSubmitError(d.error || "Có lỗi xảy ra");
      return;
    }
    const data = await res.json();
    setCreatedShortUrl(data.deal?.shortUrl || null);
    setStep(3);
    router.refresh();
  }

  function resetForm() {
    setOpen(false);
    setStep(1);
    setInputUrl("");
    setResolved(null);
    setTitle("");
    setDescription("");
    setOriginalPrice("");
    setSalePrice("");
    setDiscountPercent("");
    setCategory("");
    setLinkType("product");
    setExpiresAt("");
    setImageFile(null);
    setImagePreview(null);
    setCreatedShortUrl(null);
    setCopied(false);
    setShortUrlCopied(false);
    setResolveError(null);
    setSubmitError(null);
  }

  const displayImage = imagePreview || resolved?.shopeeImageUrl;

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} className="shadow-sm shadow-[#e86a33]/20">
        <Plus size={18} strokeWidth={2} className="mr-1" />
        Thêm Deal Mới
      </Button>
    );
  }

  return (
    <div className="rounded-3xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden mb-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-xl py-lg border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e86a33]/10 text-[#e86a33]">
            <Flame size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Thêm Deal Mới</h3>
            <p className="text-[12px] text-gray-400">
              {step === 1 ? "Bước 1: Dán link deal vào đây" : step === 2 ? "Bước 2: Điền thông tin và đăng" : "✅ Đăng deal thành công!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mr-md">
            {step < 3 && [1, 2].map((s) => (
              <div key={s} className={`h-2 w-8 rounded-full transition-colors ${step >= s ? "bg-[#e86a33]" : "bg-gray-200"}`} />
            ))}
            {step === 3 && <div className="h-2 w-16 rounded-full bg-green-500" />}
          </div>
          <button onClick={resetForm} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-xl">
        {/* ═══ STEP 3: SUCCESS ═══ */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-lg py-lg text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-gray-900">Deal đã được đăng!</h3>
              <p className="text-[13px] text-gray-400 mt-xs">Link dưới đây dùng tên miền của bạn, đích đến vẫn là Shopee.</p>
            </div>

            {createdShortUrl && (
              <div className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-lg flex flex-col sm:flex-row items-center gap-sm">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Link deal (tên miền của bạn)</div>
                  <div className="text-[14px] font-bold text-gray-900 break-all">{createdShortUrl}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdShortUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`shrink-0 flex items-center gap-xs rounded-xl px-md py-sm text-[13px] font-bold transition-all ${
                    copied ? "bg-green-500 text-white" : "bg-[#e86a33] text-white hover:bg-[#d4602e]"
                  }`}
                >
                  {copied ? "✓ Đã copy!" : "Copy link"}
                </button>
              </div>
            )}

            <div className="flex items-center gap-sm">
              <Button variant="tertiary" onClick={resetForm}>Đóng</Button>
              <Button onClick={() => { setStep(1); setResolved(null); setInputUrl(""); setTitle(""); setOriginalPrice(""); setSalePrice(""); setDiscountPercent(""); setImageFile(null); setImagePreview(null); setCreatedShortUrl(null); setCopied(false); }}>
                + Thêm deal khác
              </Button>
            </div>
          </div>
        )}
        {/* ═══ STEP 1: Dán link ═══ */}
        {step === 1 && (
          <div className="flex flex-col gap-lg">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-md flex gap-sm">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-700 leading-relaxed">
                Dán link deal từ group Shopee vào đây. Hệ thống sẽ tự động tẩy mã affiliate của đối thủ và thay bằng của bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-sm">
              <div className="relative flex-1">
                <ExternalLink size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://s.shopee.vn/... hoặc link dài đang dính aff đối thủ"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                  className="h-12 w-full rounded-2xl bg-gray-50 pl-10 pr-md text-[14px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all"
                />
              </div>
              <Button
                onClick={handleResolve}
                disabled={resolving || !inputUrl.trim()}
                className="h-12 px-xl shrink-0"
              >
                {resolving ? (
                  <span className="flex items-center gap-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Đang phân tích...
                  </span>
                ) : (
                  <span className="flex items-center gap-sm">
                    <Search size={16} />
                    Phân tích Link
                  </span>
                )}
              </Button>
            </div>

            {resolveError && (
              <div className="flex items-center gap-sm rounded-xl bg-red-50 border border-red-100 px-md py-sm text-[13px] text-red-600 font-medium">
                <AlertCircle size={15} />
                {resolveError}
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: Điền thông tin ═══ */}
        {step === 2 && resolved && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
            <div className="flex flex-col lg:flex-row gap-xl">
              {/* Left: Image */}
              <div className="flex flex-col gap-sm lg:w-[280px] shrink-0">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">
                  Ảnh sản phẩm
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#e86a33] transition-colors group"
                >
                  {displayImage ? (
                    <>
                      <img src={displayImage} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col items-center gap-sm text-white">
                          <Upload size={24} />
                          <span className="text-[13px] font-bold">Đổi ảnh</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-sm text-gray-400">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-[13px] font-medium">Click để upload ảnh</span>
                      <span className="text-[11px] text-gray-400">Hoặc dùng ảnh Shopee tự động</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute top-2 right-2">
                      <span className="rounded-full bg-[#e86a33] px-2 py-1 text-[10px] font-bold text-white">Ảnh của bạn</span>
                    </div>
                  )}
                  {!imagePreview && resolved.shopeeImageUrl && (
                    <div className="absolute top-2 right-2">
                      <span className="rounded-full bg-sky-500 px-2 py-1 text-[10px] font-bold text-white">Ảnh Shopee</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-[12px] text-red-500 hover:text-red-700 text-center"
                  >
                    Xoá ảnh upload → dùng ảnh Shopee
                  </button>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex-1 flex flex-col gap-lg">
                {/* Link status + Short URL */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {/* Row 1: Link đã làm sạch */}
                  <div className="bg-green-50 border-b border-green-100 px-md py-sm flex items-center gap-sm">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    <p className="text-[12px] font-bold text-green-700">Link đã xoá affiliate đối thủ thành công!</p>
                  </div>
                  {/* Row 2: Short URL của mình */}
                  <div className="bg-white px-md py-sm flex items-center justify-between gap-sm">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Link deal (tên miền của bạn)</div>
                      <div className="text-[13px] font-bold text-gray-900 font-mono">{resolved.shortUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resolved.shortUrl);
                        setShortUrlCopied(true);
                        setTimeout(() => setShortUrlCopied(false), 2000);
                      }}
                      className={`shrink-0 flex items-center gap-xs rounded-lg px-sm py-xs text-[12px] font-bold transition-all ${
                        shortUrlCopied ? "bg-green-500 text-white" : "bg-[#e86a33] text-white hover:bg-[#d4602e]"
                      }`}
                    >
                      {shortUrlCopied ? "✓ Đã copy!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Tiêu đề sản phẩm *</label>
                  <TextInput
                    placeholder="VD: USB Âm Nhạc Ô Tô 1000 Bài..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Mô tả ngắn (tuỳ chọn)</label>
                  <textarea
                    placeholder="Mô tả thêm về deal này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl bg-gray-50 px-md py-sm text-[14px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all resize-none"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <DollarSign size={11} /> Giá gốc
                    </label>
                    <TextInput
                      type="number"
                      placeholder="500000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-[#e86a33] uppercase tracking-wide flex items-center gap-1">
                      <DollarSign size={11} /> Giá sale
                    </label>
                    <TextInput
                      type="number"
                      placeholder="250000"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="bg-orange-50 ring-[#e86a33]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <Tag size={11} /> % Giảm
                    </label>
                    <TextInput
                      type="number"
                      placeholder="50"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Loại deal */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Loại deal</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {DEAL_LINK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setLinkType(t.value)}
                        className={`rounded-2xl border-2 p-md text-left transition-all ${
                          linkType === t.value
                            ? "border-[#e86a33] bg-orange-50"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className={`text-[13px] font-bold ${linkType === t.value ? "text-[#e86a33]" : "text-gray-700"}`}>
                          {t.value === "product" ? "🎯" : "🏬"} {t.label}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category + Expiry */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Danh mục (tuỳ chọn)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-11 w-full rounded-2xl bg-gray-50 px-md text-[14px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all"
                    >
                      <option value="">— Không chọn —</option>
                      {DEAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Ngày hết hạn (tuỳ chọn)</label>
                      {expiresAt && (
                        <button
                          type="button"
                          onClick={() => setExpiresAt("")}
                          className="text-[11px] font-bold text-[#e86a33] hover:underline"
                        >
                          Xoá — không hết hạn
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="h-11 w-full rounded-2xl bg-gray-50 px-md text-[14px] font-medium text-gray-900 ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 transition-all"
                    />
                    {!expiresAt && (
                      <p className="text-[11px] text-gray-400">Để trống = deal không bao giờ hết hạn.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-sm rounded-xl bg-red-50 border border-red-100 px-md py-sm text-[13px] text-red-600 font-medium">
                <AlertCircle size={15} />
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-lg">
              <button
                type="button"
                onClick={() => { setStep(1); setResolved(null); }}
                className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Quay lại nhập link
              </button>
              <div className="flex items-center gap-sm">
                <Button type="button" variant="tertiary" onClick={resetForm}>Huỷ</Button>
                <Button type="submit" disabled={submitting || !title} className="min-w-[140px]">
                  {submitting ? (
                    <span className="flex items-center gap-sm">
                      <Loader2 size={16} className="animate-spin" /> Đang đăng...
                    </span>
                  ) : (
                    <span className="flex items-center gap-sm">
                      <Flame size={16} /> Đăng Deal
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
