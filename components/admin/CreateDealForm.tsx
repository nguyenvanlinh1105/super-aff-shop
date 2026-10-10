"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Upload, X, CheckCircle2, AlertCircle, Loader2,
  Tag, DollarSign, ImageIcon, ExternalLink, Flame, Plus, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";
import { DEAL_LINK_TYPES, type DealLinkType } from "@/lib/dealLinkTypes";
import { dealExpiryEndOfDay } from "@/lib/dealExpiry";
import { formatVND, formatNumberInput, parseNumberInput } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [successModal, setSuccessModal] = useState<{
    title: string;
    shortUrl: string;
  } | null>(null);
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

  function calculateDiscount(origVal: string, saleVal: string): string {
    const orig = parseFloat(origVal);
    const sale = parseFloat(saleVal);
    if (!isNaN(orig) && orig > 0 && !isNaN(sale) && sale > 0) {
      if (orig > sale) {
        const pct = Math.round(((orig - sale) / orig) * 100);
        return Math.min(100, Math.max(0, pct)).toString();
      }
      return "0";
    }
    return "";
  }

  function handleOriginalPriceChange(val: string) {
    setOriginalPrice(val);
    if (!val.trim()) {
      setDiscountPercent("");
      return;
    }
    if (salePrice.trim()) {
      const pct = calculateDiscount(val, salePrice);
      if (pct !== "") setDiscountPercent(pct);
    }
  }

  function handleSalePriceChange(val: string) {
    setSalePrice(val);
    if (!val.trim()) {
      setDiscountPercent("");
      return;
    }
    if (originalPrice.trim()) {
      const pct = calculateDiscount(originalPrice, val);
      if (pct !== "") setDiscountPercent(pct);
    }
  }

  function handleDiscountPercentChange(val: string) {
    setDiscountPercent(val);
    const pct = parseFloat(val);
    const orig = parseFloat(originalPrice);
    if (!isNaN(orig) && orig > 0 && !isNaN(pct) && pct >= 0 && pct <= 100) {
      if (!salePrice.trim()) {
        const calcSale = Math.round(orig * (1 - pct / 100));
        setSalePrice(calcSale.toString());
      }
    }
  }

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
      if (data.price) {
        setSalePrice(String(data.price));
      }
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
      const errMsg = d.error || "Có lỗi xảy ra khi tạo deal";
      setSubmitError(errMsg);
      toast.error(errMsg, "Lỗi đăng deal");
      return;
    }
    const data = await res.json();
    const shortUrl = data.deal?.shortUrl || resolved.shortUrl;
    const dealTitle = data.deal?.title || title;

    // Giữ form mở nhưng reset toàn bộ về ô nhập ban đầu (Bước 1)
    setOpen(true);
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
    setCopied(false);
    setShortUrlCopied(false);
    setResolveError(null);
    setSubmitError(null);

    // Mở popup thông báo thành công
    setSuccessModal({
      title: dealTitle,
      shortUrl: shortUrl || "",
    });
    toast.success("Deal đã được đăng thành công! 🐾", "Đăng deal thành công");
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
    setCopied(false);
    setShortUrlCopied(false);
    setResolveError(null);
    setSubmitError(null);
  }

  const displayImage = imagePreview || resolved?.shopeeImageUrl;

  return (
    <>
      {!open ? (
        <Button variant="primary" onClick={() => setOpen(true)} className="shadow-cute">
          <Plus size={18} strokeWidth={2} className="mr-1" />
          Thêm Deal Mới
        </Button>
      ) : (
        <div className="rounded-3xl bg-white shadow-cute border border-primary-100/80 mb-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-xl py-lg border-b border-primary-100/80 bg-gradient-to-r from-primary-50/80 via-primary-50 to-pink-50 rounded-t-3xl">
            <div className="flex items-center gap-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Flame size={18} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-neutral-900">Thêm Deal Mới</h3>
                <p className="text-[12px] text-neutral-500">
                  {step === 1 ? "Bước 1: Dán link deal vào đây" : "Bước 2: Điền thông tin và đăng"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              {/* Step indicator */}
              <div className="flex items-center gap-1 mr-md">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 w-8 rounded-full transition-colors ${step >= s ? "bg-primary-500" : "bg-neutral-200"}`} />
                ))}
              </div>
              <button onClick={resetForm} className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-xl">
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
                <ExternalLink size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="url"
                  placeholder="https://s.shopee.vn/... hoặc link dài đang dính aff đối thủ"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                  className="h-12 w-full rounded-2xl bg-neutral-50 pl-10 pr-md text-[14px] font-medium text-neutral-900 border border-primary-100/80 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all placeholder:text-neutral-400"
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
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">
                  Ảnh sản phẩm
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer border-2 border-dashed border-primary-200 hover:border-primary-400 transition-colors group"
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
                    <div className="flex flex-col items-center justify-center h-full gap-sm text-neutral-400">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-[13px] font-medium">Click để upload ảnh</span>
                      <span className="text-[11px] text-neutral-400">Hoặc dùng ảnh Shopee tự động</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute top-2 right-2">
                      <span className="rounded-full bg-primary-500 px-2 py-1 text-[10px] font-bold text-white">Ảnh của bạn</span>
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
                    className="text-[12px] text-rose-500 hover:text-rose-700 text-center"
                  >
                    Xoá ảnh upload → dùng ảnh Shopee
                  </button>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex-1 flex flex-col gap-lg">
                {/* Link status + Short URL */}
                <div className="rounded-2xl border border-primary-100/80 overflow-hidden">
                  {/* Row 1: Link đã làm sạch */}
                  <div className="bg-emerald-50 border-b border-emerald-100 px-md py-sm flex items-center gap-sm">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <p className="text-[12px] font-bold text-emerald-700">Link đã xoá affiliate đối thủ thành công!</p>
                  </div>
                  {/* Row 2: Short URL của mình */}
                  <div className="bg-white px-md py-sm flex items-center justify-between gap-sm">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Link deal (tên miền của bạn)</div>
                      <div className="text-[13px] font-bold text-neutral-900 font-mono">{resolved.shortUrl}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resolved.shortUrl);
                        setShortUrlCopied(true);
                        setTimeout(() => setShortUrlCopied(false), 2000);
                      }}
                      className={`shrink-0 flex items-center gap-xs rounded-xl px-sm py-xs text-[12px] font-bold transition-all ${
                        shortUrlCopied ? "bg-emerald-500 text-white" : "bg-primary-500 text-white hover:bg-primary-600"
                      }`}
                    >
                      {shortUrlCopied ? "✓ Đã copy!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Tiêu đề sản phẩm *</label>
                  <TextInput
                    placeholder="VD: USB Âm Nhạc Ô Tô 1000 Bài..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-neutral-50"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Mô tả ngắn (tuỳ chọn)</label>
                  <textarea
                    placeholder="Mô tả thêm về deal này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl bg-neutral-50 px-md py-sm text-[14px] font-medium text-neutral-900 border border-primary-100/80 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all resize-none"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1"><DollarSign size={11} /> Giá gốc</span>
                      {originalPrice && (
                        <span className="text-[11px] font-black text-neutral-500 lowercase">
                          {formatVND(originalPrice)}
                        </span>
                      )}
                    </label>
                    <TextInput
                      type="text"
                      inputMode="numeric"
                      placeholder="500.000"
                      value={formatNumberInput(originalPrice)}
                      onChange={(e) => handleOriginalPriceChange(parseNumberInput(e.target.value))}
                      className="bg-neutral-50 font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-primary-600 uppercase tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1"><DollarSign size={11} /> Giá sale</span>
                      {salePrice && (
                        <span className="text-[11px] font-black text-primary-600 lowercase">
                          {formatVND(salePrice)}
                        </span>
                      )}
                    </label>
                    <TextInput
                      type="text"
                      inputMode="numeric"
                      placeholder="250.000"
                      value={formatNumberInput(salePrice)}
                      onChange={(e) => handleSalePriceChange(parseNumberInput(e.target.value))}
                      className="bg-primary-50/50 border-primary-200 font-semibold text-primary-700"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide flex items-center gap-1">
                        <Tag size={11} /> % Giảm
                      </label>
                      <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded-full border border-primary-100">
                        Tự tính
                      </span>
                    </div>
                    <TextInput
                      type="number"
                      placeholder="VD: 50"
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="bg-neutral-50 font-bold text-primary-600"
                    />
                  </div>
                </div>

                {/* Loại deal */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Loại deal</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {DEAL_LINK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setLinkType(t.value)}
                        className={`rounded-2xl border-2 p-md text-left transition-all ${
                          linkType === t.value
                            ? "border-primary-500 bg-primary-50/50"
                            : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
                        }`}
                      >
                        <div className={`text-[13px] font-bold ${linkType === t.value ? "text-primary-600" : "text-neutral-700"}`}>
                          {t.value === "product" ? "🎯" : "🏬"} {t.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category + Expiry */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Danh mục (tuỳ chọn)</label>
                    <CustomSelect
                      value={category}
                      onChange={setCategory}
                      options={[
                        { value: "", label: "— Không chọn —" },
                        ...DEAL_CATEGORIES.map((c) => ({ value: c, label: c })),
                      ]}
                      placeholder="— Không chọn —"
                      className="w-full"
                      direction="up"
                      buttonClassName="h-11 bg-neutral-50 text-[13.5px] border-primary-100/80"
                      ariaLabel="Danh mục"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Ngày hết hạn (tuỳ chọn)</label>
                      {expiresAt && (
                        <button
                          type="button"
                          onClick={() => setExpiresAt("")}
                          className="text-[11px] font-bold text-primary-500 hover:underline"
                        >
                          Xoá — không hết hạn
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="h-11 w-full rounded-2xl bg-neutral-50 px-md text-[14px] font-medium text-neutral-900 border border-primary-100/80 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all"
                    />
                    {!expiresAt && (
                      <p className="text-[11px] text-neutral-400">Để trống = deal không bao giờ hết hạn.</p>
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
  )}

      {/* ═══ POPUP MODAL THÀNH CÔNG ═══ */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-primary-100/80 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-primary-50/30 border-b border-emerald-100/60 flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => setSuccessModal(null)}
                  className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-white/80 hover:text-neutral-700 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-3">
                  <CheckCircle2 size={34} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-neutral-900">
                  Đăng Deal Thành Công! 🎉
                </h3>
                <p className="text-[13px] text-neutral-500 mt-1 max-w-sm">
                  Deal đã được lưu và hệ thống đã làm mới ô nhập để bạn tiếp tục đăng deal tiếp theo!
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-4">
                {/* Tiêu đề deal */}
                <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Flame size={12} className="text-amber-500" /> Tiêu đề deal vừa đăng
                  </div>
                  <div className="text-[13px] font-bold text-neutral-800 line-clamp-2">
                    {successModal.title}
                  </div>
                </div>

                {/* Short link affiliate */}
                {successModal.shortUrl && (
                  <div className="rounded-2xl bg-gradient-to-br from-primary-50/70 to-pink-50/40 p-4 border border-primary-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                        Link deal (Tên miền của bạn)
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400">
                        Shopee Affiliate
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={successModal.shortUrl}
                        className="flex-1 bg-white border border-primary-200/80 rounded-xl px-3 py-2 text-[13px] font-bold text-neutral-900 select-all focus:outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(successModal.shortUrl);
                          setCopied(true);
                          toast.success("Đã copy link rút gọn vào clipboard! 📋");
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-xs shrink-0 ${
                          copied
                            ? "bg-emerald-500 text-white"
                            : "bg-primary-500 hover:bg-primary-600 text-white active:scale-95"
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 size={15} /> Đã copy!
                          </>
                        ) : (
                          <>
                            <Copy size={15} /> Copy link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  {successModal.shortUrl && (
                    <a
                      href={successModal.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-[13px] font-bold transition-colors"
                    >
                      <ExternalLink size={14} /> Mở xem thử
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSuccessModal(null)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white font-bold text-[13px] shadow-sm hover:shadow transition-all active:scale-95"
                  >
                    + Tiếp tục đăng deal khác 🐾
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
