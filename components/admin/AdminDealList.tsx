"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  MousePointerClick,
  Flame,
  Pencil,
  X,
  Save,
  ImageIcon,
  Copy,
  Check,
  Calendar,
  Clock,
  Filter,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";
import { formatCurrency, formatVND, formatNumberInput, parseNumberInput } from "@/lib/format";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";
import { DEAL_LINK_TYPES, type DealLinkType } from "@/lib/dealLinkTypes";
import { dealExpiryEndOfDay } from "@/lib/dealExpiry";

type Deal = {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  category: string | null;
  linkType: string;
  expiresAt: string | null;
  uploadedImageUrl: string | null;
  shopeeImageUrl: string | null;
  affiliateUrl: string;
  shortUrl: string | null;
  status: string;
  clicks: number;
  createdAt: string;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function getExpiryInfo(expiresAtIso: string | null) {
  if (!expiresAtIso) {
    return {
      isExpired: false,
      isToday: false,
      badgeClass: "bg-neutral-100 text-neutral-600 border border-neutral-200",
      label: "Không thời hạn",
      dateFormatted: "♾️ Vô hạn",
      daysLeftText: "Chạy liên tục",
    };
  }

  const exp = new Date(expiresAtIso);
  const now = new Date();

  const day = String(exp.getDate()).padStart(2, "0");
  const month = String(exp.getMonth() + 1).padStart(2, "0");
  const year = exp.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return {
      isExpired: true,
      isToday: false,
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200 shadow-xs",
      label: "⚠️ Đã hết hạn",
      dateFormatted,
      daysLeftText: "Quá hạn phát sóng",
    };
  }

  if (diffDays <= 1) {
    return {
      isExpired: false,
      isToday: true,
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-300 shadow-xs",
      label: "🔥 Hết hạn hôm nay",
      dateFormatted,
      daysLeftText: "Hết hạn trong 24h",
    };
  }

  return {
    isExpired: false,
    isToday: false,
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
    label: `⏳ Còn ${diffDays} ngày`,
    dateFormatted,
    daysLeftText: `Hạn: ${dateFormatted}`,
  };
}

function EditDealModal({
  deal,
  onSave,
  onClose,
}: {
  deal: Deal;
  onSave: (updated: Deal) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(deal.title);
  const [description, setDescription] = useState(deal.description || "");
  const [originalPrice, setOriginalPrice] = useState(deal.originalPrice?.toString() || "");
  const [salePrice, setSalePrice] = useState(deal.salePrice?.toString() || "");
  const [discountPercent, setDiscountPercent] = useState(deal.discountPercent?.toString() || "");
  const [category, setCategory] = useState(deal.category || "");
  const [linkType, setLinkType] = useState<DealLinkType>((deal.linkType as DealLinkType) || "product");
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(deal.expiresAt));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayImage = imagePreview || deal.uploadedImageUrl || deal.shopeeImageUrl;

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const expiresAtIso = expiresAt ? dealExpiryEndOfDay(expiresAt).toISOString() : null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("description", description);
        fd.append("originalPrice", originalPrice);
        fd.append("salePrice", salePrice);
        fd.append("discountPercent", discountPercent);
        fd.append("category", category);
        fd.append("linkType", linkType);
        if (expiresAtIso) fd.append("expiresAt", expiresAtIso);
        fd.append("image", imageFile);
        const res = await fetch(`/api/deals/${deal.id}/edit`, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Lỗi cập nhật");
        const data = await res.json();
        onSave({ ...deal, ...data.deal });
      } else {
        const res = await fetch(`/api/deals/${deal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: description || null,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            salePrice: salePrice ? parseFloat(salePrice) : null,
            discountPercent: discountPercent ? parseInt(discountPercent) : null,
            category: category || null,
            linkType,
            expiresAt: expiresAtIso,
          }),
        });
        if (!res.ok) throw new Error("Lỗi cập nhật");
        onSave({
          ...deal,
          title,
          description: description || null,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          discountPercent: discountPercent ? parseInt(discountPercent) : null,
          category: category || null,
          linkType,
          expiresAt: expiresAtIso,
        });
      }
      onClose();
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-xl py-lg border-b border-neutral-100 bg-white rounded-t-3xl">
          <div className="flex items-center gap-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Pencil size={15} />
            </div>
            <h3 className="text-[15px] font-bold text-neutral-900">Chỉnh sửa Deal</h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-xl flex flex-col gap-lg">
          {deal.shortUrl && (
            <div className="rounded-2xl bg-neutral-50 border border-neutral-200/70 px-md py-sm flex items-center justify-between gap-sm">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                  Link deal rút gọn
                </div>
                <div className="text-[13px] font-bold text-neutral-900 font-mono truncate">{deal.shortUrl}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(deal.shortUrl!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`shrink-0 flex items-center gap-xs rounded-xl px-sm py-xs text-[12px] font-bold transition-all ${
                  copied ? "bg-emerald-500 text-white" : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-lg">
            <div className="shrink-0">
              <div className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide mb-sm">Ảnh sản phẩm</div>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-32 w-32 rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer border-2 border-dashed border-amber-200 hover:border-amber-400 transition-colors group"
              >
                {displayImage ? (
                  <>
                    <img src={displayImage} alt={title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-bold">
                      Đổi ảnh
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-300">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="mt-xs text-[11px] text-rose-500 hover:text-rose-700 block w-full text-center"
                >
                  Bỏ ảnh mới
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Tiêu đề *</label>
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} className="bg-neutral-50" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl bg-neutral-50 px-md py-sm text-[14px] border border-neutral-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide flex items-center justify-between">
                <span>Giá gốc</span>
                {originalPrice && (
                  <span className="text-[11px] font-black text-neutral-500 lowercase">
                    {formatVND(originalPrice)}
                  </span>
                )}
              </label>
              <TextInput
                type="text"
                inputMode="numeric"
                value={formatNumberInput(originalPrice)}
                onChange={(e) => handleOriginalPriceChange(parseNumberInput(e.target.value))}
                className="bg-neutral-50 font-semibold"
                placeholder="500.000"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-amber-700 uppercase tracking-wide flex items-center justify-between">
                <span>Giá sale</span>
                {salePrice && (
                  <span className="text-[11px] font-black text-amber-700 lowercase">
                    {formatVND(salePrice)}
                  </span>
                )}
              </label>
              <TextInput
                type="text"
                inputMode="numeric"
                value={formatNumberInput(salePrice)}
                onChange={(e) => handleSalePriceChange(parseNumberInput(e.target.value))}
                className="bg-amber-50/50 border-amber-200 font-semibold text-amber-800"
                placeholder="250.000"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">% Giảm</label>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                  Tự tính
                </span>
              </div>
              <TextInput
                type="number"
                value={discountPercent}
                onChange={(e) => handleDiscountPercentChange(e.target.value)}
                className="bg-neutral-50 font-bold text-amber-700"
                placeholder="VD: 50"
              />
            </div>
          </div>

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
                      ? "border-amber-500 bg-amber-50/50"
                      : "border-neutral-100 bg-neutral-50 hover:border-neutral-200"
                  }`}
                >
                  <div className={`text-[13px] font-bold ${linkType === t.value ? "text-amber-700" : "text-neutral-700"}`}>
                    {t.value === "product" ? "🎯" : "🏬"} {t.label}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Danh mục</label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={[
                  { value: "", label: "— Không chọn —" },
                  ...DEAL_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
                placeholder="— Không chọn —"
                className="w-full"
                buttonClassName="h-11 bg-neutral-50 text-[14px] border-neutral-200"
                ariaLabel="Danh mục"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">Ngày hết hạn</label>
                {expiresAt && (
                  <button
                    type="button"
                    onClick={() => setExpiresAt("")}
                    className="text-[11px] font-bold text-amber-600 hover:underline"
                  >
                    Xoá — không hết hạn
                  </button>
                )}
              </div>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-11 w-full rounded-2xl bg-neutral-50 px-md text-[14px] font-medium text-neutral-900 border border-neutral-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all"
              />
              {!expiresAt && (
                <p className="text-[11px] text-neutral-400">Để trống = deal không bao giờ hết hạn.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 px-md py-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
              Link Shopee Affiliate
            </div>
            <a
              href={deal.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-sky-600 hover:underline break-all line-clamp-2"
            >
              {deal.affiliateUrl}
            </a>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-md py-sm text-[13px] text-rose-600 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-sm border-t border-neutral-100 pt-lg">
            <Button variant="tertiary" onClick={onClose}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !title} className="min-w-[120px]">
              {saving ? "Đang lưu..." : <><Save size={15} className="mr-1" />Lưu thay đổi</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDealList({
  initialDeals,
  totalPages,
  currentPage,
  totalItems = 0,
  pageSize = 10,
  tabCounts = { active: 0, history: 0, all: 0 },
  currentTab = "active",
  currentStatus = "all",
  currentPeriod = "all",
  currentDateField = "expiresAt",
  currentStartDate = "",
  currentEndDate = "",
  currentCategory = "",
  currentQuery = "",
}: {
  initialDeals: Deal[];
  totalPages: number;
  currentPage: number;
  totalItems?: number;
  pageSize?: number;
  tabCounts?: { active: number; history: number; all: number };
  currentTab?: "active" | "history" | "all";
  currentStatus?: string;
  currentPeriod?: string;
  currentDateField?: string;
  currentStartDate?: string;
  currentEndDate?: string;
  currentCategory?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modal = useModal();
  const { toast } = useToast();

  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [searchVal, setSearchVal] = useState(currentQuery);
  const [startDateVal, setStartDateVal] = useState(currentStartDate);
  const [endDateVal, setEndDateVal] = useState(currentEndDate);

  const [isPending, startTransition] = useTransition();

  // ĐỒNG BỘ STATE KHI PROPS SERVER COMPONENT THAY ĐỔI
  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  useEffect(() => {
    setSearchVal(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setStartDateVal(currentStartDate);
  }, [currentStartDate]);

  useEffect(() => {
    setEndDateVal(currentEndDate);
  }, [currentEndDate]);

  // Helper để cập nhật Query params mà KHÔNG nhảy trang / KHÔNG cuộn lên đỉnh
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else if (key === "tab") {
        // Tab luôn luôn được set cụ thể: 'active' | 'history' | 'all'
        params.set("tab", val);
      } else if (val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset về trang 1 khi lọc mới, trừ khi cập nhật chính trang (page)
    if (!("page" in updates)) {
      params.set("page", "1");
    }

    startTransition(() => {
      // scroll: false giúp trang KHÔNG bị giật nhảy lên đỉnh đầu
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const hasActiveFilters =
    currentStatus !== "all" ||
    currentPeriod !== "all" ||
    currentCategory !== "" ||
    currentQuery !== "" ||
    currentStartDate !== "" ||
    currentEndDate !== "";

  const handleResetFilters = () => {
    setSearchVal("");
    setStartDateVal("");
    setEndDateVal("");
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("tab", currentTab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  async function toggleStatus(deal: Deal) {
    const newStatus = deal.status === "active" ? "hidden" : "active";
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? { ...d, status: newStatus } : d)));
    toast.info(newStatus === "active" ? "Đã hiện deal" : "Đã ẩn deal");
    router.refresh();
  }

  async function deleteDeal(id: string) {
    const confirmed = await modal.confirm({
      title: "Xác nhận xoá deal",
      message: "Bạn có chắc chắn muốn xoá deal này vĩnh viễn không? Hành động này không thể hoàn tác.",
      iconType: "danger",
      confirmText: "Xoá deal",
      cancelText: "Hủy",
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
        toast.success("Đã xoá deal thành công");
        router.refresh();
      } else {
        toast.error("Không thể xoá deal, vui lòng thử lại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xoá deal");
    } finally {
      setDeletingId(null);
    }
  }

  // Tính số lượng bản ghi hiển thị (from - to)
  const fromRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div id="admin-deal-section" className="flex flex-col gap-5">
      {/* Edit Modal */}
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onSave={(updated) => {
            setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setEditingDeal(null);
            router.refresh();
          }}
          onClose={() => setEditingDeal(null)}
        />
      )}

      {/* ── 1. TABS CHUYỂN TRẠNG THÁI (Đang phát sóng / Lịch sử hết hạn / Tất cả) ── */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 pb-3 flex-wrap">
        <div className="inline-flex p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/60 shadow-xs">
          {/* Tab 1: Đang phát sóng */}
          <button
            type="button"
            onClick={() => updateQuery({ tab: "active" })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              currentTab === "active"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200/80 scale-[1.02]"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>📡 Đang phát sóng</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                currentTab === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-neutral-200/70 text-neutral-600"
              }`}
            >
              {tabCounts.active}
            </span>
          </button>

          {/* Tab 2: Lịch sử / Hết hạn */}
          <button
            type="button"
            onClick={() => updateQuery({ tab: "history" })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              currentTab === "history"
                ? "bg-white text-rose-700 shadow-sm border border-rose-200/80 scale-[1.02]"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            <Clock size={13} className={currentTab === "history" ? "text-rose-500" : "text-neutral-400"} />
            <span>⌛ Lịch sử / Đã hết hạn</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                currentTab === "history"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-neutral-200/70 text-neutral-600"
              }`}
            >
              {tabCounts.history}
            </span>
          </button>

          {/* Tab 3: Tất cả */}
          <button
            type="button"
            onClick={() => updateQuery({ tab: "all" })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              currentTab === "all"
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-300 scale-[1.02]"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
            }`}
          >
            <Layers size={13} className={currentTab === "all" ? "text-neutral-700" : "text-neutral-400"} />
            <span>📋 Tất cả</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                currentTab === "all"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-200/70 text-neutral-600"
              }`}
            >
              {tabCounts.all}
            </span>
          </button>
        </div>

        {/* Thông tin hiển thị */}
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
          <span>Hiển thị:</span>
          <span className="text-neutral-900 tabular-nums">
            {fromRecord} - {toRecord}
          </span>
          <span>trên</span>
          <span className="font-black text-amber-700 tabular-nums">{totalItems} deal</span>
        </div>
      </div>

      {/* ── 2. BỘ LỌC ĐẦY ĐỦ: TÌM KIẾM, HÔM NAY, HÔM QUA, KHOẢNG NGÀY, TRẠNG THÁI ── */}
      <div className="flex flex-col gap-3 rounded-2xl bg-neutral-50/90 p-4 border border-neutral-200/70">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Ô Tìm Kiếm */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm kiếm deal theo tiêu đề, mô tả, link..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateQuery({ q: searchVal.trim() });
              }}
              className="w-full h-10 pl-9 pr-8 text-xs font-medium bg-white rounded-xl border border-neutral-200/80 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 transition-all shadow-xs"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchVal("");
                  updateQuery({ q: null });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lọc Trạng Thái */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
              Trạng thái:
            </span>
            <CustomSelect
              value={currentStatus}
              onChange={(val) => updateQuery({ status: val })}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "🟢 Đang hiển thị" },
                { value: "hidden", label: "⚪ Đã ẩn" },
                { value: "expired", label: "🔴 Đã hết hạn" },
                { value: "expiring_soon", label: "🟡 Sắp hết hạn (trong 24h)" },
              ]}
              className="w-[170px] shrink-0"
              buttonClassName="h-10 text-xs font-bold"
              ariaLabel="Lọc trạng thái"
            />
          </div>

          {/* Lọc Danh Mục */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
              Danh mục:
            </span>
            <CustomSelect
              value={currentCategory}
              onChange={(val) => updateQuery({ category: val })}
              options={[
                { value: "", label: "Tất cả danh mục" },
                ...DEAL_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
              className="w-[160px] shrink-0"
              buttonClassName="h-10 text-xs font-bold"
              ariaLabel="Lọc danh mục"
            />
          </div>

          {/* Số deal / trang */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
              Xem:
            </span>
            <CustomSelect
              value={String(pageSize)}
              onChange={(val) => updateQuery({ limit: val, page: "1" })}
              options={[
                { value: "10", label: "10 / trang" },
                { value: "25", label: "25 / trang" },
                { value: "50", label: "50 / trang" },
                { value: "100", label: "100 / trang" },
              ]}
              className="w-[115px] shrink-0"
              buttonClassName="h-10 text-xs font-bold"
              ariaLabel="Số deal mỗi trang"
            />
          </div>
        </div>

        {/* Hàng chọn thời gian: Hôm nay / Hôm qua / 7 ngày / Khoảng ngày */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-neutral-200/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
              <Calendar size={13} className="text-amber-600" />
              <span>Thời gian:</span>
            </div>

            {/* Chọn trường ngày: Ngày hết hạn hoặc Ngày tạo deal */}
            <CustomSelect
              value={currentDateField}
              onChange={(val) => updateQuery({ dateField: val })}
              options={[
                { value: "expiresAt", label: "Theo: Ngày hết hạn" },
                { value: "createdAt", label: "Theo: Ngày tạo deal" },
              ]}
              className="w-[165px] shrink-0 mr-1"
              buttonClassName="h-8 text-[11px] font-black"
              ariaLabel="Trường ngày"
            />

            {/* Các nút mốc thời gian nhanh */}
            {[
              { id: "all", label: "Tất cả" },
              { id: "today", label: "Hôm nay" },
              { id: "yesterday", label: "Hôm qua" },
              { id: "last_7_days", label: "7 ngày qua" },
              { id: "last_30_days", label: "30 ngày qua" },
              { id: "custom_range", label: "Khoảng ngày..." },
            ].map((p) => {
              const isActive = currentPeriod === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (p.id === "custom_range") {
                      updateQuery({ period: "custom_range" });
                    } else {
                      updateQuery({
                        period: p.id,
                        startDate: null,
                        endDate: null,
                      });
                    }
                  }}
                  className={`h-8 px-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-amber-600 text-white shadow-xs scale-102"
                      : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Nút Đặt lại bộ lọc */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-8 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              <RotateCcw size={12} />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Date Pickers nếu chọn Khoảng ngày (custom_range) */}
        {currentPeriod === "custom_range" && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/40 flex-wrap bg-white/70 p-3 rounded-xl border border-neutral-200">
            <span className="text-xs font-bold text-neutral-600">Từ ngày:</span>
            <input
              type="date"
              value={startDateVal}
              onChange={(e) => setStartDateVal(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-800 bg-white shadow-xs focus:outline-none focus:border-amber-400"
            />
            <span className="text-xs font-bold text-neutral-600">Đến ngày:</span>
            <input
              type="date"
              value={endDateVal}
              onChange={(e) => setEndDateVal(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-800 bg-white shadow-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                updateQuery({
                  period: "custom_range",
                  startDate: startDateVal || null,
                  endDate: endDateVal || null,
                });
              }}
              className="h-8 px-3.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
            >
              Áp dụng ngày
            </button>
            {(startDateVal || endDateVal) && (
              <button
                type="button"
                onClick={() => {
                  setStartDateVal("");
                  setEndDateVal("");
                  updateQuery({ startDate: null, endDate: null });
                }}
                className="text-xs font-bold text-neutral-500 hover:text-rose-600 underline ml-1"
              >
                Xoá ngày
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. BẢNG DỮ LIỆU DEALS VỚI CỘT NGÀY HẾT HẠN RÕ RÀNG ── */}
      <div
        className={`responsive-table overflow-x-auto rounded-3xl border border-neutral-200/80 shadow-sm bg-white transition-opacity duration-200 ${
          isPending ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200/80">
              <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Sản phẩm
              </th>
              <th className="text-right px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Giá Deal
              </th>
              <th className="text-center px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Click
              </th>
              <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Hạn Deal / Hết Hạn
              </th>
              <th className="text-center px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Trạng thái
              </th>
              <th className="text-right px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 mb-3">
                      <Flame size={28} />
                    </div>
                    <p className="text-sm font-bold text-neutral-700">Không tìm thấy deal nào phù hợp</p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-md">
                      {hasActiveFilters
                        ? "Thử xoá bộ lọc hoặc đổi sang tab khác."
                        : currentTab === "active" && tabCounts.history > 0
                        ? `Hiện chưa có deal nào đang phát sóng, nhưng có ${tabCounts.history} deal trong tab Lịch sử (đã hết hạn / đã ẩn).`
                        : "Bấm nút 'Thêm Deal Mới' ở góc trên để tạo deal đầu tiên."}
                    </p>
                    {currentTab === "active" && tabCounts.history > 0 && !hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => updateQuery({ tab: "history" })}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shadow-xs"
                      >
                        <Clock size={13} />
                        Xem {tabCounts.history} deal trong tab Lịch sử / Hết hạn
                      </button>
                    )}
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shadow-xs"
                      >
                        <RotateCcw size={12} />
                        Xoá tất cả bộ lọc
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              deals.map((deal) => {
                const image = deal.uploadedImageUrl || deal.shopeeImageUrl;
                const expiry = getExpiryInfo(deal.expiresAt);

                return (
                  <tr
                    key={deal.id}
                    className={`border-b border-neutral-100 hover:bg-amber-50/20 transition-colors ${
                      deal.status === "hidden" ? "opacity-60 bg-neutral-50/40" : ""
                    }`}
                  >
                    {/* Sản phẩm */}
                    <td className="px-4 py-3.5" data-label="Sản phẩm">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 ring-1 ring-neutral-200/80 shadow-xs relative">
                          {image ? (
                            <img src={image} alt={deal.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-300">
                              <Flame size={20} />
                            </div>
                          )}
                          {deal.discountPercent && (
                            <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[9px] font-black text-center py-0.2">
                              -{deal.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[300px]">
                          <div className="font-extrabold text-neutral-900 truncate leading-snug" title={deal.title}>
                            {deal.title}
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span
                              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                                deal.linkType === "shop"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {deal.linkType === "shop" ? "🏬 Shop" : "🎯 Deal"}
                            </span>
                            {deal.category && (
                              <span className="inline-flex items-center rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-extrabold text-sky-700 border border-sky-200">
                                {deal.category}
                              </span>
                            )}
                            {deal.shortUrl && (
                              <span
                                className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px] hover:text-neutral-700 cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(deal.shortUrl!);
                                  toast.success("Đã copy short link!");
                                }}
                                title="Click để copy link rút gọn"
                              >
                                {deal.shortUrl}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="px-4 py-3.5 text-right" data-label="Giá">
                      {deal.salePrice ? (
                        <div>
                          <div className="font-black text-amber-700 text-[14px] tabular-nums">
                            {formatVND(deal.salePrice)}
                          </div>
                          {deal.originalPrice && (
                            <div className="text-[10px] text-neutral-400 line-through tabular-nums">
                              {formatVND(deal.originalPrice)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Lượt click */}
                    <td className="px-4 py-3.5 text-center" data-label="Lượt click">
                      <span className="inline-flex items-center gap-1 text-neutral-700 font-extrabold tabular-nums bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200/60 text-xs">
                        <MousePointerClick size={12} className="text-neutral-400" />
                        {deal.clicks.toLocaleString()}
                      </span>
                    </td>

                    {/* NGÀY HẾT HẠN & TRẠNG THÁI HẠN */}
                    <td className="px-4 py-3.5" data-label="Hạn Deal">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black w-fit ${expiry.badgeClass}`}
                        >
                          {expiry.label}
                        </span>
                        <div className="text-[10px] font-semibold text-neutral-500 pl-1">
                          {expiry.daysLeftText}
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái (Hiện / Ẩn) */}
                    <td className="px-4 py-3.5 text-center" data-label="Trạng thái">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            deal.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {deal.status === "active" ? "Đang hiện" : "Đã ẩn"}
                        </span>
                        {expiry.isExpired && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Trong Tab Lịch Sử
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3.5 text-right" data-label="Thao tác">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={deal.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Mở link Shopee"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditingDeal(deal)}
                          className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Chỉnh sửa deal"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(deal)}
                          className={`h-8 w-8 flex items-center justify-center rounded-xl transition-colors ${
                            deal.status === "active"
                              ? "text-neutral-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={deal.status === "active" ? "Ẩn deal" : "Hiện deal"}
                        >
                          {deal.status === "active" ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDeal(deal.id)}
                          disabled={deletingId === deal.id}
                          className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Xoá deal"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. PHÂN TRANG MƯỢT MÀ KHÔNG GIẬT LÊN ĐẦU TRANG ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs font-bold text-neutral-500">
          Hiển thị <span className="text-neutral-900 font-extrabold">{fromRecord}</span> -{" "}
          <span className="text-neutral-900 font-extrabold">{toRecord}</span> trên tổng số{" "}
          <span className="text-amber-700 font-black">{totalItems}</span> deal
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          itemName="deal"
          showSinglePage={true}
          scrollTargetId="admin-deal-section"
        />
      </div>
    </div>
  );
}
