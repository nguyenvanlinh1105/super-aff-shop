"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Wallet,
  ClipboardList,
  CreditCard,
  Copy,
  Check,
  X,
  Eye,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag,
  UserSearch,
  QrCode,
  Download,
  Loader2,
  Sparkles,
  Upload,
  FileImage,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { generateVietQrUrl } from "@/lib/vietqr";
import { CreatePaymentButton } from "@/components/admin/CreatePaymentButton";
import { CreatePaymentForCustomer } from "@/components/admin/CreatePaymentForCustomer";
import type { ComboboxOption } from "@/components/ui/SearchableSelect";
import { Pagination } from "@/components/ui/Pagination";

export type CustomerPending = {
  id: string;
  name: string;
  code: string;
  requestAmount: number;
  approvedAmount: number;
  approvedCount: number;
  hasWithdrawRequest?: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  requestedAt: string;
};

export type PaymentBatch = {
  id: string;
  paymentCode: string;
  customerName: string;
  customerCode?: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  totalAmount: number;
  status: string;
  createdAt?: string;
  paidAt: string | null;
  transferReference: string | null;
  billStorageKey: string | null;
  itemCount: number;
};

export type WaitingOrder = {
  id: string;
  orderExternalId: string;
  platformName: string;
  productTitle: string | null;
  productImage: string | null;
  productAffiliateStatus: string | null;
  customerRewardAmount: number;
  orderedAt: string | null;
};

export type CustomerWaiting = {
  id: string;
  name: string;
  code: string;
  amount: number;
  count: number;
  orders: WaitingOrder[];
};

type Props = {
  pendingList: CustomerPending[];
  batches: PaymentBatch[];
  waitingList: CustomerWaiting[];
  customers: ComboboxOption[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const go = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  };
  return (
    <button
      onClick={go}
      type="button"
      title="Sao chép"
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
    >
      {ok ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {label && <span className={ok ? "text-emerald-600" : ""}>{ok ? "Đã copy" : label}</span>}
    </button>
  );
}

// ── POPUP THANH TOÁN CHI TIẾT (QR + ĐƠN HÀNG + UPLOAD BILL MINH CHỨNG) ─────────
function BatchPaymentModal({
  batchId,
  onClose,
  onPaidSuccess,
}: {
  batchId: string;
  onClose: () => void;
  onPaidSuccess?: (id: string) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form xác nhận thanh toán
  const [confirmRef, setConfirmRef] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/payments/${batchId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.batch);
        if (d.batch?.paymentCode) {
          setConfirmRef(d.batch.paymentCode);
          setConfirmNote(`Thanh toán ${d.batch.paymentCode}`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [batchId]);

  // Tạo URL preview ảnh bill khi chọn file
  useEffect(() => {
    if (!billFile) {
      setBillPreview(null);
      return;
    }
    const url = URL.createObjectURL(billFile);
    setBillPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [billFile]);

  const batch = data;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    setConfirming(true);
    setConfirmError(null);

    try {
      const formData = new FormData();
      const finalRef = confirmRef.trim() || batch.paymentCode;
      formData.append("transferReference", finalRef);
      formData.append("transferNote", confirmNote.trim() || batch.paymentCode);
      if (billFile) {
        formData.append("bill", billFile);
      }

      const res = await fetch(`/api/payments/${batchId}`, {
        method: "PATCH",
        body: formData,
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConfirmError(resData.error || "Không thể xác nhận thanh toán");
        setConfirming(false);
        return;
      }

      setData((prev: any) => ({
        ...prev,
        status: "paid",
        paidAt: new Date().toISOString(),
        transferReference: finalRef,
      }));

      toast.success(
        `Đã xác nhận thanh toán phiếu ${batch.paymentCode} thành công! 🎀`,
        "Thanh toán thành công"
      );
      onPaidSuccess?.(batchId);
      router.refresh();
      // Đóng modal sau 600ms để hiệu ứng mượt
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setConfirmError("Đã xảy ra lỗi kết nối, vui lòng thử lại.");
    } finally {
      setConfirming(false);
    }
  };

  const vietQrUrl =
    batch?.customer?.bankName && batch?.customer?.bankAccountNumber
      ? generateVietQrUrl({
          bankName: batch.customer.bankName,
          accountNumber: batch.customer.bankAccountNumber,
          accountName: batch.customer.bankAccountName || undefined,
          amount: Number(batch.totalAmount),
          memo: batch.paymentCode,
          template: "compact2",
        })
      : null;

  const billUrl = batch?.billStorageKey ? `/api/bills/${batch.billStorageKey}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" />
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-rose-100 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-amber-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-rose-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/meow-back-payments.png"
                alt="MeowBack"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-900">
                  {batch?.status === "paid" ? "Chi tiết phiếu đã thanh toán" : "Thanh toán chuyển khoản VietQR"}
                </h3>
                {batch && (
                  <span className="font-mono text-xs font-black text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                    {batch.paymentCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Khách hàng: <span className="font-bold text-neutral-800">{batch?.customer?.fullName}</span> ({batch?.customer?.customerCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 shadow-2xs border border-neutral-200/60 transition-all active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <img
                src="/meow-back-mascot.png"
                alt="MeowBack"
                className="h-16 w-16 object-contain animate-bounce"
              />
              <p className="text-xs text-neutral-500 font-bold">Đang nạp dữ liệu phiếu thanh toán...</p>
            </div>
          ) : !batch ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <AlertCircle size={32} className="text-rose-400" />
              <p className="text-sm font-bold text-rose-500">Không tìm thấy thông tin phiếu</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* TOP STATUS BAR & AMOUNT */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 sm:p-5 border shadow-xs ${
                  batch.status === "paid"
                    ? "bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200/80"
                    : "bg-gradient-to-r from-rose-50 via-pink-50/40 to-amber-50/30 border-rose-200/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black shadow-xs shrink-0 ${
                      batch.status === "paid" ? "bg-emerald-500" : "bg-gradient-to-br from-rose-500 to-pink-600"
                    }`}
                  >
                    {batch.status === "paid" ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <CreditCard size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          batch.status === "paid" ? "text-emerald-800" : "text-rose-900"
                        }`}
                      >
                        {batch.status === "paid" ? "Đã chi trả thành công" : "Chờ chuyển khoản cho khách"}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-600 border border-neutral-200/70 shadow-2xs">
                        {batch.items?.length ?? 0} đơn hàng
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      {batch.status === "paid" && batch.paidAt
                        ? `Hoàn tất ngày ${formatDate(new Date(batch.paidAt))}`
                        : "Quét VietQR chuyển tiền tự động rồi xác nhận hoàn tất bên dưới"}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200/50">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    SỐ TIỀN CẦN THANH TOÁN
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums leading-tight">
                    {formatCurrency(Number(batch.totalAmount))}
                  </div>
                </div>
              </div>

              {/* 2-COLUMN GRID: LEFT (VIETQR + PAYMENT FORM) | RIGHT (ORDERS IN BATCH) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── CỘT TRÁI (VIETQR & FORM THANH TOÁN) ── */}
                <div className="lg:col-span-6 flex flex-col gap-5">
                  {/* Khối VietQR & Thông tin ngân hàng */}
                  <div className="rounded-3xl bg-neutral-50/90 border border-neutral-200/80 p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500 text-white shadow-2xs">
                          <QrCode size={15} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                          MÃ VIETQR CHUYỂN KHOẢN
                        </span>
                      </div>
                      {vietQrUrl && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-extrabold text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200 shadow-2xs"
                          >
                            <Eye size={12} /> Phóng to
                          </button>
                          <a
                            href={vietQrUrl}
                            download={`${batch.paymentCode}-vietqr.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-extrabold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200 shadow-2xs"
                          >
                            <Download size={12} strokeWidth={2.2} /> Tải QR
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl border border-neutral-200/70 shadow-2xs">
                      {vietQrUrl ? (
                        <div
                          className="group relative cursor-pointer shrink-0 bg-white p-1 rounded-xl border border-neutral-200/80 hover:scale-105 transition-transform"
                          onClick={() => setShowQrModal(true)}
                          title="Nhấn để phóng to mã QR"
                        >
                          <img
                            src={vietQrUrl}
                            alt="VietQR"
                            className="w-32 h-32 object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-extrabold">
                            Phóng to
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center p-2 shrink-0">
                          <AlertCircle size={22} className="text-amber-500 mb-1" />
                          <span className="text-[10px] font-bold text-amber-700 leading-tight">
                            Thiếu tài khoản ngân hàng
                          </span>
                        </div>
                      )}

                      {/* Chi tiết tài khoản */}
                      <div className="flex-1 w-full flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-400 font-medium">Ngân hàng:</span>
                          <span className="font-extrabold text-neutral-800 text-right truncate max-w-[170px]">
                            {batch.customer.bankName || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-400 font-medium">Số tài khoản:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-rose-600 text-sm">
                              {batch.customer.bankAccountNumber || "—"}
                            </span>
                            {batch.customer.bankAccountNumber && (
                              <CopyBtn value={batch.customer.bankAccountNumber} />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-400 font-medium">Chủ tài khoản:</span>
                          <span className="font-extrabold text-neutral-900 uppercase text-[11px] truncate max-w-[170px]">
                            {batch.customer.bankAccountName || "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                          <span className="text-neutral-400 font-medium">Nội dung CK:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-neutral-900 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              {batch.paymentCode}
                            </span>
                            <CopyBtn value={batch.paymentCode} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-neutral-400 font-medium">Số tiền CK:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-emerald-600 text-sm">
                              {formatCurrency(Number(batch.totalAmount))}
                            </span>
                            <CopyBtn value={String(Number(batch.totalAmount))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM XÁC NHẬN THANH TOÁN THÀNH CÔNG VÀ UPLOAD BILL */}
                  {batch.status !== "paid" ? (
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 p-5 shadow-xs flex flex-col gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs shrink-0">
                          <CheckCircle2 size={19} strokeWidth={2.4} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-emerald-950">
                            Xác nhận đã thanh toán thành công
                          </p>
                          <p className="text-[11px] text-emerald-700 font-medium">
                            Tải ảnh bill ngân hàng và bấm xác nhận để hoàn tất lệnh chi trả.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleConfirmPayment} className="flex flex-col gap-3.5">
                        {confirmError && (
                          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{confirmError}</span>
                          </div>
                        )}

                        {/* Ô upload ảnh bill */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                            <span>Ảnh bill minh chứng chuyển tiền</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              Lưu trữ chứng từ
                            </span>
                          </label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />

                          {billFile ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-white p-3 shadow-2xs">
                              {billPreview ? (
                                <img
                                  src={billPreview}
                                  alt="Preview"
                                  className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <FileImage size={22} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-extrabold text-neutral-800 truncate">
                                  {billFile.name}
                                </p>
                                <p className="text-[10px] text-neutral-500 font-medium">
                                  {(billFile.size / 1024).toFixed(0)} KB • Đã chọn thành công
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setBillFile(null)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-400 transition-colors"
                                title="Gỡ ảnh"
                              >
                                <X size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-white/80 hover:bg-emerald-50/50 py-3.5 text-xs font-bold text-neutral-600 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                            >
                              <Upload size={16} className="text-emerald-600" />
                              <span>Nhấn để chọn ảnh bill chuyển khoản (PNG, JPG)</span>
                            </button>
                          )}
                        </div>

                        {/* Mã giao dịch ngân hàng */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600">
                              Mã giao dịch / Mã tham chiếu
                            </label>
                            <input
                              type="text"
                              value={confirmRef}
                              onChange={(e) => setConfirmRef(e.target.value)}
                              placeholder={batch.paymentCode}
                              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-mono font-bold text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-2xs"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600">
                              Ghi chú giao dịch
                            </label>
                            <input
                              type="text"
                              value={confirmNote}
                              onChange={(e) => setConfirmNote(e.target.value)}
                              placeholder="Ghi chú chuyển khoản..."
                              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-800 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={confirming}
                          className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                        >
                          {confirming ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Đang cập nhật & gửi thông báo...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={17} strokeWidth={2.5} />
                              Xác nhận đã thanh toán {formatCurrency(Number(batch.totalAmount))}
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Thông tin khi phiếu đã thanh toán */
                    <div className="rounded-3xl bg-emerald-50/70 border border-emerald-200/80 p-5 shadow-xs flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Chứng từ chuyển khoản đã lưu
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-100">
                        <span className="text-neutral-500 font-medium">Mã giao dịch:</span>
                        <span className="font-mono font-black text-neutral-900">{batch.transferReference || "—"}</span>
                      </div>
                      {batch.transferNote && (
                        <div className="flex items-center justify-between text-xs py-1 border-b border-emerald-100">
                          <span className="text-neutral-500 font-medium">Ghi chú:</span>
                          <span className="font-semibold text-neutral-800">{batch.transferNote}</span>
                        </div>
                      )}
                      {billUrl && (
                        <div className="flex flex-col gap-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                              <ImageIcon size={14} className="text-emerald-600" /> Ảnh bill ngân hàng:
                            </span>
                            <a
                              href={billUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={12} /> Mở tab mới
                            </a>
                          </div>
                          <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-white p-2 flex items-center justify-center max-h-56 shadow-2xs">
                            <img src={billUrl} alt="Bill" className="w-full object-contain max-h-52 rounded-xl" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── CỘT PHẢI (DANH SÁCH ĐƠN HÀNG CẦN THANH TOÁN) ── */}
                <div className="lg:col-span-6 flex flex-col h-full rounded-3xl bg-neutral-50/90 border border-neutral-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-neutral-200/70 pb-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-neutral-800">
                        ĐƠN HÀNG TRONG PHIẾU ({batch.items?.length ?? 0} ĐƠN)
                      </p>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Chi tiết các khoản hoa hồng hoàn cho khách
                      </p>
                    </div>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 tabular-nums">
                      {formatCurrency(Number(batch.totalAmount))}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                    {batch.items?.map((item: any) => {
                      const o = item.order;
                      const img = o?.trackingLink?.productImage;
                      const title = o?.trackingLink?.productTitle ?? o?.itemName ?? o?.orderExternalId;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-2xl bg-white border border-neutral-200/70 p-3 shadow-2xs hover:border-rose-200 transition-colors"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-11 w-11 rounded-xl object-cover border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                              <Receipt size={16} className="text-rose-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-neutral-800" title={title}>
                              {title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9.5px] font-black text-rose-600 uppercase bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                {o?.platform?.name || "Shopee"}
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span className="font-mono text-[10px] font-bold text-neutral-500">
                                {o?.orderExternalId}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 shrink-0 tabular-nums">
                            +{formatCurrency(Number(item.amount))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PHÓNG TO MÃ QR */}
      {showQrModal && vietQrUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-md fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            <div className="text-center pt-2">
              <h4 className="text-base font-extrabold text-neutral-900">Mã QR Thanh Toán VietQR</h4>
              <p className="text-xs text-rose-600 font-bold font-mono mt-0.5">{batch?.paymentCode}</p>
            </div>
            <img
              src={vietQrUrl}
              alt="VietQR Full"
              className="w-64 h-64 object-contain rounded-2xl border border-neutral-200/80 p-2 bg-white shadow-md"
            />
            <div className="text-center text-xs text-neutral-500 font-bold bg-neutral-50 rounded-xl p-2.5 w-full border border-neutral-100">
              📱 Dùng App Ngân Hàng quét trực tiếp để chuyển khoản tự động 100%
            </div>
            <a
              href={vietQrUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`${batch?.paymentCode}-vietqr.png`}
              className="w-full py-3 rounded-2xl bg-rose-500 text-white font-extrabold text-xs text-center shadow-md shadow-rose-200 hover:bg-rose-600 transition-all active:scale-98"
            >
              Tải mã QR về máy
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ADMIN PAYMENTS CLIENT ────────────────────────────────────────────────
export function AdminPaymentsClient({
  pendingList,
  batches,
  waitingList,
  customers,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"pending" | "waiting" | "history" | "manual">("pending");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBatch, setViewingBatch] = useState<string | null>(null);
  const [autoCreatingAll, setAutoCreatingAll] = useState(false);
  const itemsPerPage = 10;

  const paidBatches = batches.filter((b) => b.status === "paid");
  const pendingBatches = batches.filter((b) => b.status !== "paid");
  const todayTotal = pendingBatches.reduce((s, b) => s + Number(b.totalAmount), 0);

  const handleTabChange = (tab: "pending" | "waiting" | "history" | "manual") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Tự động tạo phiếu cho tất cả khách có số dư chưa tạo phiếu
  const handleAutoCreateAll = async () => {
    setAutoCreatingAll(true);
    try {
      const res = await fetch("/api/payments/auto-create-all", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Không thể tạo phiếu tự động", "Lỗi");
        return;
      }
      toast.success(data.message || `Đã tạo ${data.count} phiếu thanh toán thành công!`, "Thành công 🎀");
      router.refresh();
    } catch {
      toast.error("Lỗi kết nối máy chủ", "Lỗi");
    } finally {
      setAutoCreatingAll(false);
    }
  };

  // Filter pending batches
  const filteredPendingBatches = pendingBatches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.paymentCode.toLowerCase().includes(q) ||
      b.bankAccountNumber?.includes(q) ||
      b.customerCode?.toLowerCase().includes(q)
    );
  });

  // Filter customers with balance waiting for batch
  const filteredUnbatchedCustomers = pendingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.bankAccountNumber?.includes(q)
    );
  });

  // Filter history
  const filteredPaidBatches = paidBatches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.paymentCode.toLowerCase().includes(q) ||
      b.transferReference?.toLowerCase().includes(q) ||
      b.bankAccountNumber?.includes(q)
    );
  });

  // Filter waiting orders
  const filteredWaiting = waitingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  // Pagination calculations
  const totalPagesPending = Math.ceil(filteredPendingBatches.length / itemsPerPage) || 1;
  const paginatedPendingBatches = filteredPendingBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesHistory = Math.ceil(filteredPaidBatches.length / itemsPerPage) || 1;
  const paginatedPaidBatches = filteredPaidBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesWaiting = Math.ceil(filteredWaiting.length / itemsPerPage) || 1;
  const paginatedWaiting = filteredWaiting.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* Detail / Payment Popup Modal */}
      {viewingBatch && (
        <BatchPaymentModal
          batchId={viewingBatch}
          onClose={() => setViewingBatch(null)}
          onPaidSuccess={() => router.refresh()}
        />
      )}

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã phiếu (PB...), tên khách hàng, mã KH, số tài khoản ngân hàng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-xs font-semibold shadow-xs border border-neutral-200/80 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all placeholder:text-neutral-400"
        />
      </div>

      {/* Tabs bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {[
            {
              id: "pending" as const,
              label: "Phiếu chờ thanh toán",
              count: pendingBatches.length,
              icon: <Wallet size={15} />,
            },
            {
              id: "history" as const,
              label: "Lịch sử đã thanh toán",
              count: paidBatches.length,
              icon: <CheckCircle2 size={15} />,
            },
            {
              id: "waiting" as const,
              label: "Chờ Shopee duyệt",
              count: waitingList.length,
              icon: <Clock size={15} />,
            },
            {
              id: "manual" as const,
              label: "Tạo phiếu chủ động",
              count: null,
              icon: <UserSearch size={15} />,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-xs font-extrabold transition-all ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-sm scale-[1.02]"
                  : "bg-white text-neutral-600 border border-neutral-200/70 hover:bg-rose-50/60 hover:text-neutral-900"
              }`}
            >
              <span className={activeTab === t.id ? "text-white" : "text-neutral-400"}>
                {t.icon}
              </span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "pending" && pendingBatches.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-xs border border-neutral-200/80 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              💳
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                {pendingBatches.length} phiếu chờ chi trả
              </div>
              <div className="text-sm font-black text-rose-600 tabular-nums">
                {formatCurrency(todayTotal)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TAB 1: PHIẾU CHỜ THANH TOÁN (HIỂN THỊ DẠNG BẢNG - TABLE) ── */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-6">
          {/* BẢNG CHÍNH: DANH SÁCH CÁC PHIẾU CHỜ THANH TOÁN */}
          <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-black shadow-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                    Bảng Phiếu Thanh Toán Chờ Chuyển Khoản ({filteredPendingBatches.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Nhấn nút "Thanh toán" để mở popup quét VietQR tự động và tải bill minh chứng.
                  </p>
                </div>
              </div>
            </div>

            {filteredPendingBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <img
                  src="/meow-back-mascot.png"
                  alt="MeowBack"
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <p className="text-sm font-extrabold text-neutral-800">
                    Không có phiếu thanh toán nào đang chờ chuyển khoản 🎉
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Khi khách gửi yêu cầu rút tiền, hệ thống sẽ tự động tạo phiếu và đưa vào bảng này.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/80">
                      {[
                        "Mã phiếu",
                        "Khách hàng",
                        "Số tiền cần trả",
                        "Tài khoản thụ hưởng",
                        "Đơn hàng",
                        "Trạng thái",
                        "Thao tác",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {paginatedPendingBatches.map((b) => (
                      <tr
                        key={b.id}
                        className="transition-colors hover:bg-rose-50/30 group"
                      >
                        {/* Cột 1: Mã phiếu */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 inline-block w-fit">
                              {b.paymentCode}
                            </span>
                            {b.createdAt && (
                              <span className="text-[10px] text-neutral-400 font-medium mt-1">
                                {formatDate(new Date(b.createdAt))}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 2: Khách hàng */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white font-black text-xs shadow-2xs">
                              {b.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-neutral-900 truncate">
                                {b.customerName}
                              </p>
                              {b.customerCode && (
                                <p className="font-mono text-[10px] text-neutral-400 font-bold">
                                  {b.customerCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Số tiền */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-black text-rose-600 tabular-nums">
                            {formatCurrency(b.totalAmount)}
                          </span>
                        </td>

                        {/* Cột 4: Ngân hàng & STK */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-0.5 min-w-[190px]">
                            <span className="text-xs font-extrabold text-neutral-800 truncate">
                              {b.bankName || "Chưa cập nhật"}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs font-black text-neutral-900">
                                {b.bankAccountNumber || "—"}
                              </span>
                              {b.bankAccountNumber && <CopyBtn value={b.bankAccountNumber} />}
                            </div>
                            {b.bankAccountName && (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase truncate">
                                {b.bankAccountName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 5: Đơn hàng */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center h-6 px-2 rounded-lg bg-neutral-100 font-mono text-[11px] font-black text-neutral-700">
                            {b.itemCount} đơn
                          </span>
                        </td>

                        {/* Cột 6: Trạng thái */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Chờ chuyển tiền
                          </span>
                        </td>

                        {/* Cột 7: Thao tác */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingBatch(b.id)}
                              className="flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <CreditCard size={13} strokeWidth={2.4} />
                              Thanh toán
                            </button>
                            <button
                              onClick={() => setViewingBatch(b.id)}
                              className="flex h-8 items-center gap-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 text-xs font-bold transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredPendingBatches.length > itemsPerPage && (
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/40">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesPending}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </div>

          {/* PHẦN PHỤ: KHÁCH HÀNG CÓ SỐ DƯ CHƯA TẠO PHIẾU (NẾU CÓ) */}
          {filteredUnbatchedCustomers.length > 0 && (
            <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shadow-xs">
                    💰
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                      Khách Hàng Có Số Dư Khả Dụng Chưa Lập Phiếu ({filteredUnbatchedCustomers.length})
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Nhấn "Tạo phiếu ngay" để chuyển sang bảng thanh toán VietQR.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAutoCreateAll}
                  disabled={autoCreatingAll}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 text-xs font-extrabold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {autoCreatingAll ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang tạo phiếu...
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-400" /> Tạo phiếu cho tất cả
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/80">
                      {["Khách hàng", "Số tiền khả dụng", "Số đơn đã duyệt", "Tài khoản nhận tiền", "Thao tác"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUnbatchedCustomers.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-amber-50/20">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-neutral-900">{c.name}</p>
                              <p className="font-mono text-[10px] text-neutral-400 font-bold">{c.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-black text-emerald-600 tabular-nums">
                            {formatCurrency(c.approvedAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            {c.approvedCount} đơn đã duyệt
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {c.bankAccountNumber ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-neutral-800">{c.bankName}</span>
                              <span className="font-mono text-neutral-600 font-bold">{c.bankAccountNumber}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Chưa cập nhật TK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CreatePaymentButton
                            customerId={c.id}
                            customerName={c.name}
                            amount={c.approvedAmount}
                            hasPaymentInfo={!!c.bankAccountNumber}
                            onSuccess={(batchId) => {
                              if (batchId) setViewingBatch(batchId);
                              router.refresh();
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: LỊCH SỬ ĐÃ THANH TOÁN (TABLE) ── */}
      {activeTab === "history" && (
        <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 sm:px-6 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-xs">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                  Lịch Sử Phiếu Đã Thanh Toán ({filteredPaidBatches.length})
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium">
                  Danh sách toàn bộ các phiếu đã hoàn tiền thành công cho khách hàng.
                </p>
              </div>
            </div>
          </div>

          {filteredPaidBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <img
                src="/meow-back-payments.png"
                alt="MeowBack"
                className="h-16 w-16 object-contain opacity-70"
              />
              <p className="text-xs font-bold text-neutral-400">Chưa có phiếu thanh toán nào hoàn tất</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    {["Mã phiếu", "Khách hàng", "Số tiền", "Đơn", "Ngày chi trả", "Mã GD ngân hàng", "Minh chứng bill", "Thao tác"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedPaidBatches.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-neutral-50/60">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {b.paymentCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-extrabold text-neutral-900">
                        {b.customerName}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-black text-xs text-emerald-700 tabular-nums">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-md bg-neutral-100 font-mono text-[10px] font-bold text-neutral-700 px-1.5">
                          {b.itemCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-neutral-600 font-medium">
                        {b.paidAt ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {b.transferReference ? (
                          <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded">
                            {b.transferReference}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {b.billStorageKey ? (
                          <a
                            href={`/api/bills/${b.billStorageKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition-colors"
                          >
                            <ImageIcon size={12} /> Xem bill
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Không có bill</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setViewingBatch(b.id)}
                          className="flex h-7 items-center gap-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 text-[11px] font-bold transition-colors"
                        >
                          <Eye size={12} /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredPaidBatches.length > itemsPerPage && (
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/40">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPagesHistory}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CHỜ SHOPEE DUYỆT ── */}
      {activeTab === "waiting" && (
        <div className="flex flex-col gap-6">
          {filteredWaiting.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-16 shadow-sm border border-neutral-200/70">
              <img
                src="/meow-back-mascot.png"
                alt="MeowBack"
                className="h-16 w-16 object-contain"
              />
              <span className="text-xs font-bold text-neutral-400">
                Không có đơn nào đang chờ Shopee duyệt 🎉
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {paginatedWaiting.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 bg-neutral-50/70 border-b border-neutral-200/70">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-sm shadow-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-neutral-900 text-xs">{c.name}</div>
                        <div className="font-mono text-[10px] text-neutral-400 font-bold">{c.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        {c.count} đơn chưa đối soát
                      </div>
                      <div className="text-base font-black text-sky-600 tabular-nums">
                        {formatCurrency(c.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-neutral-100">
                    {c.orders.map((o) => (
                      <div key={o.id} className="flex items-center gap-3 p-3.5">
                        {o.productImage ? (
                          <img
                            src={o.productImage}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover border border-primary-100 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                            <ShoppingBag size={15} className="text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-neutral-800">
                            {o.productTitle ?? o.orderExternalId}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-black text-neutral-500 uppercase">
                              {o.platformName}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="font-mono text-[10px] text-neutral-400">{o.orderExternalId}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-neutral-900 tabular-nums">
                            {formatCurrency(o.customerRewardAmount)}
                          </div>
                          {o.productAffiliateStatus && (
                            <span className="text-[9px] font-black text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-200">
                              {o.productAffiliateStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredWaiting.length > itemsPerPage && (
                <div className="p-4 bg-white rounded-2xl shadow-xs border border-neutral-200/70">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPagesWaiting}
                    onPageChange={(p) => setCurrentPage(p)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: TẠO PHIẾU CHỦ ĐỘNG ── */}
      {activeTab === "manual" && (
        <div className="max-w-lg">
          <CreatePaymentForCustomer
            customers={customers}
            onCreated={(batchId) => {
              if (batchId) setViewingBatch(batchId);
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
