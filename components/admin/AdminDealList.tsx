"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Trash2, ExternalLink, MousePointerClick, Flame, Pencil, X, Save, ImageIcon, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/ui/ModalProvider";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
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

function EditDealModal({ deal, onSave, onClose }: {
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
      // Nếu có ảnh upload mới → dùng FormData
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
        // Gửi qua PATCH endpoint cần hỗ trợ FormData — ta dùng API khác
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
        const data = await res.json();
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
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-xl py-lg border-b border-gray-100 bg-white rounded-t-3xl">
          <div className="flex items-center gap-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e86a33]/10">
              <Pencil size={15} className="text-[#e86a33]" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900">Chỉnh sửa Deal</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-xl flex flex-col gap-lg">
          {/* Short URL */}
          {deal.shortUrl && (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-md py-sm flex items-center justify-between gap-sm">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Link deal (tên miền của bạn)</div>
                <div className="text-[13px] font-bold text-gray-900 font-mono truncate">{deal.shortUrl}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(deal.shortUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className={`shrink-0 flex items-center gap-xs rounded-lg px-sm py-xs text-[12px] font-bold transition-all ${copied ? "bg-green-500 text-white" : "bg-[#e86a33] text-white hover:bg-[#d4602e]"}`}
              >
                {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}

          {/* Image */}
          <div className="flex flex-col sm:flex-row gap-lg">
            <div className="shrink-0">
              <div className="text-[12px] font-bold text-gray-600 uppercase tracking-wide mb-sm">Ảnh sản phẩm</div>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-32 w-32 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#e86a33] transition-colors group"
              >
                {displayImage ? (
                  <>
                    <img src={displayImage} alt={title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-bold">
                      Đổi ảnh
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {imageFile && (
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="mt-xs text-[11px] text-red-500 hover:text-red-700 block w-full text-center">
                  Bỏ ảnh mới
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Tiêu đề *</label>
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-50" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl bg-gray-50 px-md py-sm text-[14px] ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Giá gốc</label>
              <TextInput type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="bg-gray-50" placeholder="500000" />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-[#e86a33] uppercase tracking-wide">Giá sale</label>
              <TextInput type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="bg-orange-50" placeholder="250000" />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">% Giảm</label>
              <TextInput type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="bg-gray-50" placeholder="50" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wide">Danh mục</label>
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

          {/* Affiliate link (read-only) */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-md py-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Link Shopee (affiliate của bạn)</div>
            <a href={deal.affiliateUrl} target="_blank" rel="noopener" className="text-[12px] text-sky-600 hover:underline break-all line-clamp-2">
              {deal.affiliateUrl}
            </a>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-md py-sm text-[13px] text-red-600 font-medium">{error}</div>
          )}

          <div className="flex items-center justify-end gap-sm border-t border-gray-100 pt-lg">
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

export function AdminDealList({ initialDeals, totalPages, currentPage }: { initialDeals: Deal[], totalPages: number, currentPage: number }) {
  const router = useRouter();
  const modal = useModal();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  async function toggleStatus(deal: Deal) {
    const newStatus = deal.status === "active" ? "hidden" : "active";
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, status: newStatus } : d));
  }

  async function deleteDeal(id: string) {
    const confirmed = await modal.confirm({
      title: "Xác nhận xoá deal",
      message: "Bạn có chắc chắn muốn xoá deal này vĩnh viễn không? Hành động này không thể hoàn tác.",
      iconType: "danger",
      confirmText: "Xoá deal",
      cancelText: "Hủy"
    });
    
    if (!confirmed) return;
    
    setDeletingId(id);
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setDeletingId(null);
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center py-3xl text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 mb-lg">
          <Flame size={36} className="text-[#e86a33]/40" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold text-gray-400">Chưa có deal nào</p>
        <p className="text-[13px] text-gray-300 mt-xs">Bấm "Thêm Deal Mới" để bắt đầu</p>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onSave={(updated) => {
            setDeals((prev) => prev.map((d) => d.id === updated.id ? updated : d));
            setEditingDeal(null);
          }}
          onClose={() => setEditingDeal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-md mb-lg">
        <ServerSearchInput placeholder="Tìm kiếm deal theo tiêu đề, mô tả, link..." className="w-full sm:w-[320px]" />
      </div>

      <div className="responsive-table overflow-x-auto rounded-2xl ring-1 ring-black/5">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">Sản phẩm</th>
              <th className="text-right px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">Giá</th>
              <th className="text-center px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">Lượt click</th>
              <th className="text-center px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">Trạng thái</th>
              <th className="text-right px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const image = deal.uploadedImageUrl || deal.shopeeImageUrl;
              return (
                <tr key={deal.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${deal.status === "hidden" ? "opacity-50" : ""}`}>
                  <td className="px-md py-sm" data-label="Sản phẩm">
                    <div className="flex items-center gap-md">
                      <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-100">
                        {image ? (
                          <img src={image} alt={deal.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <Flame size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate max-w-[280px]">{deal.title}</div>
                        <div className="flex items-center gap-xs mt-1 flex-wrap">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                            deal.linkType === "shop" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {deal.linkType === "shop" ? "🏬 Cả Shop" : "🎯 Sản phẩm"}
                          </span>
                          {deal.discountPercent && (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
                              -{deal.discountPercent}%
                            </span>
                          )}
                          {deal.category && (
                            <span className="inline-flex items-center rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-bold text-sky-600">
                              {deal.category}
                            </span>
                          )}
                          {deal.expiresAt && (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-600">
                              HH: {new Date(deal.expiresAt).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                          {deal.shortUrl && (
                            <span className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">{deal.shortUrl}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-sm text-right" data-label="Giá">
                    {deal.salePrice ? (
                      <div>
                        <div className="font-black text-[#e86a33] text-[15px]">{formatCurrency(deal.salePrice)}</div>
                        {deal.originalPrice && (
                          <div className="text-[11px] text-gray-400 line-through">{formatCurrency(deal.originalPrice)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-md py-sm text-center" data-label="Lượt click">
                    <span className="inline-flex items-center gap-1 text-gray-700 font-bold">
                      <MousePointerClick size={14} className="text-gray-400" />
                      {deal.clicks.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-md py-sm text-center" data-label="Trạng thái">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      deal.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {deal.status === "active" ? "Đang hiện" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-md py-sm" data-label="Thao tác">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={deal.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Mở link affiliate"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        onClick={() => setEditingDeal(deal)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#e86a33] hover:bg-orange-50 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => toggleStatus(deal)}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                          deal.status === "active"
                            ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title={deal.status === "active" ? "Ẩn deal" : "Hiện deal"}
                      >
                        {deal.status === "active" ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        disabled={deletingId === deal.id}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Xoá deal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </>
  );
}
