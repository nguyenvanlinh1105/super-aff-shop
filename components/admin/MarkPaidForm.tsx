"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, Upload, FileImage, Loader2 } from "lucide-react";

export function MarkPaidForm({ batchId, paymentCode }: { batchId: string; paymentCode?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [transferNote, setTransferNote] = useState(paymentCode || "");
  const [bill, setBill] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    if (paymentCode && !transferNote) {
      setTransferNote(paymentCode);
    }
    setOpen(true);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!transferReference.trim()) {
      setError("Vui lòng nhập Mã giao dịch chuyển khoản");
      return;
    }
    if (!bill) {
      setError("Vui lòng tải lên Ảnh bill chuyển khoản");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("transferReference", transferReference.trim());
    formData.append("transferNote", transferNote.trim());
    formData.append("bill", bill);

    const res = await fetch(`/api/payments/${batchId}`, { method: "PATCH", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không thể xác nhận thanh toán");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  function handleClose() {
    if (loading) return;
    setError(null);
    setOpen(false);
  }

  const isFormValid = transferReference.trim().length > 0 && bill !== null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex h-8 items-center gap-xs rounded-xl bg-emerald-500 px-sm text-[12px] font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
      >
        <CheckCircle2 size={13} strokeWidth={2.5} />
        Đã chuyển khoản
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-md"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal card */}
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl fade-in border border-emerald-100"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-emerald-100/80"
              style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200">
                  <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Xác nhận đã chuyển khoản</h3>
                  <p className="text-[11px] font-bold text-emerald-700">Mã giao dịch & Ảnh bill là bắt buộc</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors shadow-2xs"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-6">
              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-extrabold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Mã giao dịch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>MÃ GIAO DỊCH <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-normal bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">Bắt buộc</span>
                </label>
                <input
                  type="text"
                  required
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="VD: FT2507150001..."
                  className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-xs font-semibold text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>

              {/* Upload bill */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>ẢNH BILL CHUYỂN KHOẢN <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-normal bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">Bắt buộc</span>
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setBill(e.target.files?.[0] ?? null)}
                />
                {bill ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <FileImage size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-800 truncate">{bill.name}</p>
                      <p className="text-[11px] font-medium text-emerald-600">{(bill.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBill(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-4 text-xs font-bold text-gray-500 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all"
                  >
                    <Upload size={16} strokeWidth={2} />
                    <span>Tải ảnh bill lên (Bắt buộc)</span>
                  </button>
                )}
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>GHI CHÚ</span>
                  <span className="text-[10px] font-medium text-gray-400 normal-case tracking-normal">(không bắt buộc)</span>
                </label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Thêm ghi chú nếu cần..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs font-semibold text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                    <span>Xác nhận thanh toán</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
