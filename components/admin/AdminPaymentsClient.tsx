"use client";

import { useState, useEffect } from "react";

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
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  UserSearch,
  QrCode,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { generateVietQrUrl } from "@/lib/vietqr";
import { CreatePaymentButton } from "@/components/admin/CreatePaymentButton";
import { CreatePaymentForCustomer } from "@/components/admin/CreatePaymentForCustomer";
import { MarkPaidForm } from "@/components/admin/MarkPaidForm";
import type { ComboboxOption } from "@/components/ui/SearchableSelect";

type CustomerPending = {
  id: string;
  name: string;
  code: string;
  requestAmount: number;
  approvedAmount: number;
  approvedCount: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  requestedAt: string;
};

type PaymentBatch = {
  id: string;
  paymentCode: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paidAt: string | null;
  transferReference: string | null;
  billStorageKey: string | null;
  itemCount: number;
};

type WaitingOrder = {
  id: string;
  orderExternalId: string;
  platformName: string;
  productTitle: string | null;
  productImage: string | null;
  productAffiliateStatus: string | null;
  customerRewardAmount: number;
  orderedAt: string | null;
};

type CustomerWaiting = {
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

// ── tiny helpers ──────────────────────────────────────────────────────────────
function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const go = () => {
    navigator.clipboard.writeText(value);
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  };
  return (
    <button
      onClick={go}
      title="Copy"
      className="flex items-center gap-[3px] rounded-md px-[6px] py-[3px] text-[11px] font-bold transition-colors hover:bg-white"
    >
      {ok ? (
        <Check size={11} className="text-emerald-500" />
      ) : (
        <Copy size={11} className="text-gray-400" />
      )}
      {label && (
        <span className={ok ? "text-emerald-500" : "text-gray-400"}>
          {ok ? "Đã copy" : label}
        </span>
      )}
    </button>
  );
}

function CopyInfoBtn({ c }: { c: CustomerPending }) {
  const [ok, setOk] = useState(false);
  const go = () => {
    const lines = [`${c.name} (${c.code})`];
    if (c.bankAccountNumber)
      lines.push(
        `${c.bankName} — ${c.bankAccountNumber} — ${c.bankAccountName}`,
      );
    lines.push(`Yêu cầu rút: ${formatCurrency(c.requestAmount)}`);
    lines.push(`Sẵn sàng trả: ${formatCurrency(c.approvedAmount)}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  };
  return (
    <button
      onClick={go}
      className="flex h-9 items-center gap-xs rounded-xl bg-gray-100 px-md text-[12px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
    >
      {ok ? (
        <Check size={13} className="text-emerald-500" />
      ) : (
        <Copy size={13} />
      )}
      {ok ? "Đã copy" : "Copy info"}
    </button>
  );
}

// ── Batch Detail Modal ────────────────────────────────────────────────────────
function BatchDetailModal({
  batchId,
  onClose,
}: {
  batchId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBill, setShowBill] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetch(`/api/payments/${batchId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.batch);
        setLoading(false);
      });
  }, [batchId]);

  const batch = data;
  const billUrl = batch?.billStorageKey
    ? `/api/bills/${batch.billStorageKey}`
    : null;
  const vietQrUrl =
    batch?.customer?.bankName && batch?.customer?.bankAccountNumber
      ? generateVietQrUrl({
          bankName: batch.customer.bankName,
          accountNumber: batch.customer.bankAccountNumber,
          accountName: batch.customer.bankAccountName,
          amount: Number(batch.totalAmount),
          memo: batch.paymentCode,
          template: "compact2",
        })
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl fade-in custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/90 via-pink-50/80 to-amber-50/60 rounded-t-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-rose-200/80 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/meow-back-payments.png"
                alt="MeowBack"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                Chi tiết phiếu thanh toán
              </h3>
              {batch && (
                <p className="text-xs font-mono font-bold text-rose-600">
                  {batch.paymentCode}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-500 hover:bg-white hover:text-neutral-900 shadow-xs transition-all active:scale-95 border border-neutral-200/60"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <img
                src="/meow-back-mascot.png"
                alt="MeowBack Mascot"
                className="h-16 w-16 object-contain animate-bounce"
              />
              <p className="text-xs text-neutral-500 font-bold">
                Đang tải dữ liệu phiếu thanh toán...
              </p>
            </div>
          ) : !batch ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <AlertCircle size={32} className="text-rose-400" />
              <p className="text-xs font-bold text-rose-500">
                Không tìm thấy phiếu thanh toán
              </p>
            </div>
          ) : (
            <>
              {/* Full Width Top Status Bar */}
              <div
                className={`flex items-center gap-3 rounded-2xl p-4 border ${
                  batch.status === "paid"
                    ? "bg-emerald-50/80 border-emerald-200/80"
                    : "bg-amber-50/80 border-amber-200/80"
                }`}
              >
                {batch.status === "paid" ? (
                  <CheckCircle2
                    size={22}
                    className="text-emerald-500 shrink-0"
                  />
                ) : (
                  <Clock size={22} className="text-amber-500 shrink-0" />
                )}
                <div>
                  <p
                    className={`text-xs font-black ${batch.status === "paid" ? "text-emerald-800" : "text-amber-800"}`}
                  >
                    {batch.status === "paid"
                      ? "Đã thanh toán thành công"
                      : "Đang chờ xử lý"}
                  </p>
                  {batch.paidAt && (
                    <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                      {formatDate(new Date(batch.paidAt))}
                    </p>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Tổng tiền
                  </p>
                  <p className="text-lg font-black text-rose-600 tabular-nums">
                    {formatCurrency(Number(batch.totalAmount))}
                  </p>
                </div>
              </div>

              {/* 2-COLUMN GRID LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── CỘT TRÁI: Khách hàng + Chuyển khoản + Bill ── */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  {/* Thông tin khách hàng */}
                  <div className="rounded-2xl bg-neutral-50/80 border border-neutral-200/70 p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-3">
                      THÔNG TIN KHÁCH HÀNG
                    </p>
                    <div className="flex items-center gap-3.5 mb-3">
                      {batch.customer.avatar ? (
                        <img
                          src={batch.customer.avatar}
                          alt={batch.customer.fullName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black text-base shadow-sm">
                          {batch.customer.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-neutral-900 text-sm">
                          {batch.customer.fullName}
                        </p>
                        <span className="inline-block font-mono text-[10px] font-bold text-neutral-500 bg-neutral-200/60 px-2 py-0.5 rounded-md mt-0.5">
                          {batch.customer.customerCode}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {batch.customer.bankAccountNumber && (
                        <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-neutral-200/70 shadow-xs">
                          <CreditCard
                            size={16}
                            className="text-rose-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-neutral-800">
                              {batch.customer.bankName}
                            </p>
                            <p className="font-mono text-xs font-semibold text-neutral-600 mt-0.5">
                              {batch.customer.bankAccountNumber} —{" "}
                              {batch.customer.bankAccountName}
                            </p>
                          </div>
                          <CopyBtn value={batch.customer.bankAccountNumber} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mã VietQR chuyển khoản */}
                  {vietQrUrl && (
                    <div className="rounded-2xl bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-amber-50/60 border border-rose-200/80 p-4 flex flex-col gap-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-2xs">
                            <QrCode size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-rose-900 uppercase tracking-wider">
                              MÃ QR CHUYỂN KHOẢN VIETQR
                            </p>
                            <p className="text-[10px] font-semibold text-rose-600">
                              Quét bằng App Ngân Hàng để tự điền 100% dữ liệu
                            </p>
                          </div>
                        </div>
                        <a
                          href={vietQrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`${batch.paymentCode}-vietqr.png`}
                          className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-extrabold text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200 shadow-2xs"
                        >
                          <Download size={12} strokeWidth={2.5} />
                          Tải QR
                        </a>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
                        <div
                          className="relative group cursor-pointer shrink-0"
                          onClick={() => setShowQrModal(true)}
                        >
                          <img
                            src={vietQrUrl}
                            alt="VietQR Chuyển khoản"
                            className="w-36 h-36 object-contain rounded-xl border border-neutral-200/80 p-1 bg-white shadow-2xs transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-extrabold gap-1">
                            <Eye size={12} /> Phóng to
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-1.5 w-full text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-400 font-medium">
                              Ngân hàng:
                            </span>
                            <span className="font-extrabold text-neutral-800">
                              {batch.customer.bankName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-400 font-medium">
                              Số tài khoản:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-black text-rose-600">
                                {batch.customer.bankAccountNumber}
                              </span>
                              <CopyBtn
                                value={batch.customer.bankAccountNumber}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-400 font-medium">
                              Chủ tài khoản:
                            </span>
                            <span className="font-extrabold text-neutral-900 uppercase text-[11px]">
                              {batch.customer.bankAccountName ?? "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                            <span className="text-neutral-400 font-medium">
                              Nội dung CK:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-black text-rose-600">
                                {batch.paymentCode}
                              </span>
                              <CopyBtn value={batch.paymentCode} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-neutral-400 font-medium">
                              Số tiền:
                            </span>
                            <span className="font-mono font-black text-emerald-600 text-sm">
                              {formatCurrency(Number(batch.totalAmount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thông tin chuyển khoản */}
                  {(batch.transferReference || batch.transferNote) && (
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/70 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-2.5">
                        THÔNG TIN CHUYỂN KHOẢN
                      </p>
                      {batch.transferReference && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-medium text-neutral-500 w-24 shrink-0">
                            Mã giao dịch:
                          </span>
                          <span className="font-mono font-extrabold text-xs text-neutral-900 flex-1">
                            {batch.transferReference}
                          </span>
                          <CopyBtn value={batch.transferReference} />
                        </div>
                      )}
                      {batch.transferNote && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-neutral-500 w-24 shrink-0">
                            Ghi chú:
                          </span>
                          <span className="text-xs font-semibold text-neutral-700">
                            {batch.transferNote}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ảnh bill chuyển khoản */}
                  {billUrl && (
                    <div className="rounded-2xl bg-sky-50/70 border border-sky-200/70 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                          <ImageIcon size={14} /> Ảnh bill chuyển khoản
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowBill(!showBill)}
                            className="flex items-center gap-1 rounded-xl bg-white px-3 py-1 text-xs font-extrabold text-sky-600 hover:bg-sky-100 transition-colors shadow-2xs"
                          >
                            <Eye size={13} strokeWidth={2.5} />
                            {showBill ? "Ẩn" : "Xem bill"}
                          </button>
                          <a
                            href={billUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-white px-3 py-1 text-xs font-extrabold text-neutral-600 hover:bg-neutral-100 transition-colors shadow-2xs"
                          >
                            <ExternalLink size={13} strokeWidth={2.5} />
                            Mở tab mới
                          </a>
                        </div>
                      </div>
                      {showBill && (
                        <div className="mt-2 rounded-2xl overflow-hidden border border-sky-200 shadow-sm bg-white p-2 flex items-center justify-center">
                          <img
                            src={billUrl}
                            alt="Bill thanh toán"
                            className="w-full object-contain max-h-[360px] rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── CỘT PHẢI: Đơn hàng trong phiếu ── */}
                <div className="lg:col-span-6 flex flex-col h-full rounded-2xl bg-neutral-50/80 border border-neutral-200/70 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      ĐƠN HÀNG TRONG PHIẾU ({batch.items?.length ?? 0} ĐƠN)
                    </p>
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {formatCurrency(Number(batch.totalAmount))}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                    {batch.items?.map((item: any) => {
                      const o = item.order;
                      const img = o?.trackingLink?.productImage;
                      const title =
                        o?.trackingLink?.productTitle ??
                        o?.itemName ??
                        o?.orderExternalId;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-2xl bg-white border border-neutral-200/70 p-3 shadow-2xs hover:border-rose-200 transition-colors"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-11 w-11 rounded-xl object-cover border border-primary-100 shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                              <Receipt size={16} className="text-rose-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className="truncate text-xs font-bold text-neutral-800"
                              title={title}
                            >
                              {title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-black text-rose-600 uppercase bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                {o?.platform?.name}
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
            </>
          )}
        </div>
      </div>

      {/* Modal Phóng To Mã QR */}
      {showQrModal && vietQrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md fade-in"
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
              <h4 className="text-base font-extrabold text-neutral-900">
                Mã QR Thanh Toán VietQR
              </h4>
              <p className="text-xs text-rose-600 font-bold font-mono mt-0.5">
                {batch?.paymentCode}
              </p>
            </div>
            <img
              src={vietQrUrl}
              alt="VietQR Full"
              className="w-64 h-64 object-contain rounded-2xl border border-neutral-200/80 p-2 bg-white shadow-md"
            />
            <div className="text-center text-xs text-neutral-500 font-bold bg-neutral-50 rounded-xl p-2.5 w-full border border-neutral-100">
              📱 Dùng App Ngân Hàng trên điện thoại quét trực tiếp màn hình để
              chuyển khoản tự động
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

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminPaymentsClient({
  pendingList,
  batches,
  waitingList,
  customers,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "pending" | "waiting" | "history" | "manual"
  >("pending");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBatch, setViewingBatch] = useState<string | null>(null);
  const [expandedWaiting, setExpandedWaiting] = useState<string | null>(null);
  const itemsPerPage = 9;

  const todayTotal = pendingList.reduce((s, c) => s + c.approvedAmount, 0);
  const paidBatches = batches.filter((b) => b.status === "paid");
  const pendingBatches = batches.filter((b) => b.status !== "paid");

  const handleTabChange = (
    tab: "pending" | "waiting" | "history" | "manual",
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredPending = pendingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.bankAccountNumber?.includes(q)
    );
  });

  const filteredWaiting = waitingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const filteredBatches = batches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.paymentCode.toLowerCase().includes(q)
    );
  });

  const activeList =
    activeTab === "pending"
      ? filteredPending
      : activeTab === "waiting"
        ? filteredWaiting
        : filteredBatches;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const paginatedPending = filteredPending.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const paginatedWaiting = filteredWaiting.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* Detail modal */}
      {viewingBatch && (
        <BatchDetailModal
          batchId={viewingBatch}
          onClose={() => setViewingBatch(null)}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Tìm tên khách hàng, mã KH, mã phiếu, số tài khoản ngân hàng..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="h-11 w-full rounded-2xl bg-white pl-10 pr-4 text-xs font-semibold shadow-sm border border-neutral-200/70 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all"
        />
      </div>

      {/* Tabs + summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            {
              id: "pending" as const,
              label: "Yêu cầu rút tiền",
              count: pendingList.length,
              icon: <Wallet size={14} />,
            },
            {
              id: "waiting" as const,
              label: "Chờ Shopee duyệt",
              count: waitingList.length,
              icon: <Clock size={14} />,
            },
            {
              id: "history" as const,
              label: "Lịch sử phiếu",
              count: batches.length,
              icon: <ClipboardList size={14} />,
            },
            {
              id: "manual" as const,
              label: "Tạo phiếu chủ động",
              count: null,
              icon: <UserSearch size={14} />,
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
              <span
                className={
                  activeTab === t.id ? "text-white" : "text-neutral-400"
                }
              >
                {t.icon}
              </span>
              <span>{t.label}</span>
              {t.count !== null && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    activeTab === t.id
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {activeTab === "pending" && pendingList.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm border border-neutral-200/70 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              💳
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                {pendingList.length} khách chờ rút
              </div>
              <div className="text-sm font-black text-rose-600 tabular-nums">
                {formatCurrency(todayTotal)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PENDING TAB ── */}
      {activeTab === "pending" &&
        (filteredPending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-16 shadow-sm border border-neutral-200/70">
            <img
              src="/meow-back-mascot.png"
              alt="MeowBack Mascot"
              className="h-16 w-16 object-contain"
            />
            <span className="text-xs font-bold text-neutral-400">
              Chưa có khách nào yêu cầu rút tiền 🎉
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedPending.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/70 flex flex-col gap-4 hover:border-rose-200 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 text-white font-black text-base shadow-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-neutral-900 truncate">
                        {c.name}
                      </div>
                      <div className="font-mono text-[10px] font-bold text-neutral-400">
                        {c.code}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 border border-amber-200/70">
                      🔔 {formatDate(c.requestedAt)}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-0.5">
                      SỐ TIỀN YÊU CẦU RÚT
                    </div>
                    <div className="text-xl font-black text-rose-600 tabular-nums leading-none">
                      {formatCurrency(c.requestAmount)}
                    </div>
                  </div>

                  {/* Approved amount */}
                  <div
                    className={`flex items-center gap-2.5 rounded-2xl p-3 border ${c.approvedCount > 0 ? "bg-emerald-50/80 border-emerald-200" : "bg-amber-50/80 border-amber-200"}`}
                  >
                    {c.approvedCount > 0 ? (
                      <>
                        <CheckCircle2
                          size={16}
                          className="text-emerald-600 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-emerald-800">
                            Sẵn sàng trả: {formatCurrency(c.approvedAmount)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            {c.approvedCount} đơn đã duyệt thành công
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle
                          size={16}
                          className="text-amber-600 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-amber-800">
                            Chưa có đơn khả dụng
                          </div>
                          <div className="text-[10px] text-amber-600 font-medium">
                            Cần đối soát CSV trước khi tạo phiếu chi
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment info */}
                  {c.bankAccountNumber ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 border border-neutral-200/70">
                        <CreditCard
                          size={15}
                          className="text-rose-500 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-neutral-900 truncate">
                            {c.bankName}
                          </div>
                          <div className="font-mono text-xs font-bold text-neutral-700">
                            {c.bankAccountNumber}
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 uppercase truncate">
                            {c.bankAccountName}
                          </div>
                        </div>
                        <CopyBtn value={c.bankAccountNumber} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 border border-amber-200 text-amber-800 text-xs font-bold">
                      <AlertCircle
                        size={15}
                        className="shrink-0 text-amber-600"
                      />
                      <span>Khách chưa cập nhật TK ngân hàng</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <CopyInfoBtn c={c} />
                    <div className="flex-1">
                      <CreatePaymentButton
                        customerId={c.id}
                        customerName={c.name}
                        amount={c.approvedAmount}
                        hasPaymentInfo={!!c.bankAccountNumber}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PagerFooter
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPending.length}
              unitLabel="khách"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        ))}

      {/* ── WAITING TAB ── */}
      {activeTab === "waiting" &&
        (filteredWaiting.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-16 shadow-sm border border-neutral-200/70">
            <img
              src="/meow-back-mascot.png"
              alt="MeowBack Mascot"
              className="h-16 w-16 object-contain"
            />
            <span className="text-xs font-bold text-neutral-400">
              Không có đơn nào đang chờ Shopee duyệt 🎉
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {paginatedWaiting.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden"
                >
                  {/* Customer header */}
                  <div className="flex items-center justify-between p-4 bg-neutral-50/70 border-b border-neutral-200/70">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-sm shadow-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-neutral-900 text-xs">
                          {c.name}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-400 font-bold">
                          {c.code}
                        </div>
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

                  {/* Orders list */}
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
                            <ShoppingBag
                              size={15}
                              className="text-neutral-400"
                            />
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
                            <span className="font-mono text-[10px] text-neutral-400">
                              {o.orderExternalId}
                            </span>
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
            </div>
            <PagerFooter
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredWaiting.length}
              unitLabel="khách"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        ))}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" &&
        (filteredBatches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-16 shadow-sm border border-neutral-200/70">
            <img
              src="/meow-back-payments.png"
              alt="MeowBack Payments"
              className="h-16 w-16 object-contain opacity-80"
            />
            <span className="text-xs font-bold text-neutral-400">
              Không có phiếu nào
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/80">
                      {[
                        "Mã phiếu",
                        "Khách hàng",
                        "Số tiền",
                        "Đơn",
                        "Trạng thái",
                        "Ngày trả",
                        "Thao tác",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBatches.map((b) => (
                      <tr
                        key={b.id}
                        className={`border-b border-neutral-100 transition-colors hover:bg-rose-50/20 ${b.status === "paid" ? "" : "bg-amber-50/30"}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-xs text-neutral-900">
                            {b.paymentCode}
                          </span>
                          {b.billStorageKey && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-black text-sky-700">
                              <ImageIcon size={10} /> Bill
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-neutral-900">
                          {b.customerName}
                        </td>
                        <td className="px-4 py-3 font-black text-xs text-rose-600 tabular-nums">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-md bg-neutral-100 font-mono text-[10px] font-bold text-neutral-700 px-1.5">
                            {b.itemCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={b.status === "paid" ? "positive" : "warning"}
                            dot
                          >
                            {b.status === "paid"
                              ? "Đã thanh toán"
                              : "Chờ xử lý"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-500 font-medium">
                          {b.paidAt ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingBatch(b.id)}
                              className="flex h-7 items-center gap-1 rounded-xl bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Eye size={13} strokeWidth={2} /> Xem
                            </button>
                            {b.status !== "paid" && (
                              <MarkPaidForm batchId={b.id} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <PagerFooter
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredBatches.length}
              unitLabel="phiếu"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        ))}

      {/* ── MANUAL TAB ── */}
      {activeTab === "manual" && (
        <div className="max-w-lg">
          <CreatePaymentForCustomer customers={customers} />
        </div>
      )}
    </div>
  );
}

function PagerFooter({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  unitLabel,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  unitLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white border border-primary-100/80 px-md py-sm shadow-cute">
      <span className="text-[13px] text-gray-500">
        {(currentPage - 1) * itemsPerPage + 1}–
        {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}{" "}
        {unitLabel}
      </span>
      <div className="flex items-center gap-sm">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-xl border border-gray-200 bg-white px-md py-[6px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>
        <span className="text-[12px] font-bold text-gray-700 px-xs">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-gray-200 bg-white px-md py-[6px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
