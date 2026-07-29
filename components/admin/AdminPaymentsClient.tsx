"use client";

import { useState, useEffect } from "react";
import {
  Search, Wallet, ClipboardList, CreditCard,
  Copy, Check, X, Eye, Receipt, AlertCircle,
  CheckCircle2, Clock, Image as ImageIcon, ExternalLink,
  ChevronDown, ChevronUp, ShoppingBag, UserSearch,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { CreatePaymentButton } from "@/components/admin/CreatePaymentButton";
import { CreatePaymentForCustomer } from "@/components/admin/CreatePaymentForCustomer";
import { MarkPaidForm } from "@/components/admin/MarkPaidForm";
import type { ComboboxOption } from "@/components/ui/SearchableSelect";

type CustomerPending = {
  id: string; name: string; code: string; amount: number; count: number;
  bankName: string | null; bankAccountNumber: string | null; bankAccountName: string | null;
  requestedAt: string | null;
};

type PaymentBatch = {
  id: string; paymentCode: string; customerName: string;
  totalAmount: number; status: string; paidAt: string | null;
  transferReference: string | null; billStorageKey: string | null;
  itemCount: number;
};

type WaitingOrder = {
  id: string; orderExternalId: string; platformName: string;
  productTitle: string | null; productImage: string | null;
  productAffiliateStatus: string | null; customerRewardAmount: number;
  orderedAt: string | null;
};

type CustomerWaiting = {
  id: string; name: string; code: string; amount: number; count: number;
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
  const go = () => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1400); };
  return (
    <button onClick={go} title="Copy"
      className="flex items-center gap-[3px] rounded-md px-[6px] py-[3px] text-[11px] font-bold transition-colors hover:bg-white"
    >
      {ok ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="text-gray-400" />}
      {label && <span className={ok ? "text-emerald-500" : "text-gray-400"}>{ok ? "Đã copy" : label}</span>}
    </button>
  );
}

function CopyInfoBtn({ c }: { c: CustomerPending }) {
  const [ok, setOk] = useState(false);
  const go = () => {
    const lines = [`${c.name} (${c.code})`];
    if (c.bankAccountNumber) lines.push(`${c.bankName} — ${c.bankAccountNumber} — ${c.bankAccountName}`);
    lines.push(`Số tiền: ${formatCurrency(c.amount)}`);
    navigator.clipboard.writeText(lines.join("\n"));
    setOk(true); setTimeout(() => setOk(false), 1400);
  };
  return (
    <button onClick={go}
      className="flex h-9 items-center gap-xs rounded-xl bg-gray-100 px-md text-[12px] font-bold text-gray-600 transition-colors hover:bg-gray-200"
    >
      {ok ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
      {ok ? "Đã copy" : "Copy info"}
    </button>
  );
}

// ── Batch Detail Modal ────────────────────────────────────────────────────────
function BatchDetailModal({ batchId, onClose }: { batchId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBill, setShowBill] = useState(false);

  useEffect(() => {
    fetch(`/api/payments/${batchId}`)
      .then((r) => r.json())
      .then((d) => { setData(d.batch); setLoading(false); });
  }, [batchId]);

  const batch = data;
  const billUrl = batch?.billStorageKey ? `/api/bills/${batch.billStorageKey}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-xl py-lg border-b border-gray-100 bg-white rounded-t-3xl"
          style={{ background: "linear-gradient(135deg,#fff3ee,#fde8d8)" }}>
          <div className="flex items-center gap-sm">
            <img src="/heovitien.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <h3 className="text-[16px] font-black text-gray-900">Chi tiết phiếu thanh toán</h3>
              {batch && <p className="text-[12px] font-mono text-gray-500">{batch.paymentCode}</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-500 hover:bg-white hover:text-gray-900 transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-xl flex flex-col gap-lg">
          {loading ? (
            <div className="flex flex-col items-center py-2xl gap-md">
              <img src="/heochodoi.png" alt="" className="h-16 w-16 object-contain animate-bounce" />
              <p className="text-[13px] text-gray-400 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : !batch ? (
            <div className="flex flex-col items-center py-2xl gap-sm">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-[13px] font-bold text-red-500">Không tìm thấy phiếu</p>
            </div>
          ) : (
            <>
              {/* Status bar */}
              <div className={`flex items-center gap-sm rounded-2xl p-md ${
                batch.status === "paid" ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"
              }`}>
                {batch.status === "paid"
                  ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  : <Clock size={20} className="text-amber-500 shrink-0" />}
                <div>
                  <p className={`text-[13px] font-black ${batch.status === "paid" ? "text-emerald-700" : "text-amber-700"}`}>
                    {batch.status === "paid" ? "Đã thanh toán thành công" : "Đang chờ xử lý"}
                  </p>
                  {batch.paidAt && (
                    <p className="text-[11px] text-emerald-500">{formatDate(new Date(batch.paidAt))}</p>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] text-gray-400">Tổng tiền</p>
                  <p className="text-[18px] font-black text-[#e86a33]">{formatCurrency(Number(batch.totalAmount))}</p>
                </div>
              </div>

              {/* Customer info */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-lg">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-md">Thông tin khách hàng</p>
                <div className="flex items-center gap-md mb-md">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e86a33] to-[#d65d2a] text-white font-black text-[15px]">
                    {batch.customer.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{batch.customer.fullName}</p>
                    <p className="font-mono text-[11px] text-gray-400">{batch.customer.customerCode}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {batch.customer.bankAccountNumber && (
                    <div className="flex items-center gap-sm rounded-xl bg-white p-sm ring-1 ring-gray-100">
                      <CreditCard size={14} className="text-[#e86a33] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-800">{batch.customer.bankName}</p>
                        <p className="font-mono text-[11px] text-gray-500">{batch.customer.bankAccountNumber} — {batch.customer.bankAccountName}</p>
                      </div>
                      <CopyBtn value={batch.customer.bankAccountNumber} />
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer info */}
              {(batch.transferReference || batch.transferNote) && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-lg">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-sm">Thông tin chuyển khoản</p>
                  {batch.transferReference && (
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="text-[12px] text-gray-500 w-24 shrink-0">Mã giao dịch:</span>
                      <span className="font-mono font-bold text-[13px] text-gray-900 flex-1">{batch.transferReference}</span>
                      <CopyBtn value={batch.transferReference} />
                    </div>
                  )}
                  {batch.transferNote && (
                    <div className="flex items-start gap-sm">
                      <span className="text-[12px] text-gray-500 w-24 shrink-0">Ghi chú:</span>
                      <span className="text-[13px] text-gray-700">{batch.transferNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bill image */}
              {billUrl && (
                <div className="rounded-2xl bg-sky-50 border border-sky-100 p-lg">
                  <div className="flex items-center justify-between mb-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-xs">
                      <ImageIcon size={12} /> Ảnh bill chuyển khoản
                    </p>
                    <div className="flex gap-sm">
                      <button onClick={() => setShowBill(!showBill)}
                        className="flex items-center gap-xs rounded-lg bg-white px-sm py-[4px] text-[12px] font-bold text-sky-600 hover:bg-sky-100 transition-colors">
                        <Eye size={12} strokeWidth={2.5} />
                        {showBill ? "Ẩn" : "Xem bill"}
                      </button>
                      <a href={billUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-xs rounded-lg bg-white px-sm py-[4px] text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        <ExternalLink size={12} strokeWidth={2.5} />
                        Mở tab mới
                      </a>
                    </div>
                  </div>
                  {showBill && (
                    <div className="mt-sm rounded-xl overflow-hidden ring-1 ring-sky-200">
                      <img src={billUrl} alt="Bill thanh toán" className="w-full object-contain max-h-[400px]" />
                    </div>
                  )}
                </div>
              )}

              {/* Order items */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-md">
                  Đơn hàng trong phiếu ({batch.items?.length ?? 0} đơn)
                </p>
                <div className="flex flex-col gap-sm">
                  {batch.items?.map((item: any) => {
                    const o = item.order;
                    const img = o?.trackingLink?.productImage;
                    const title = o?.trackingLink?.productTitle ?? o?.itemName ?? o?.orderExternalId;
                    return (
                      <div key={item.id} className="flex items-center gap-md rounded-xl bg-gray-50 border border-gray-100 p-sm">
                        {img ? (
                          <img src={img} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/5 shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                            <Receipt size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[12px] font-semibold text-gray-800">{title}</p>
                          <div className="flex items-center gap-xs mt-[2px]">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{o?.platform?.name}</span>
                            <span className="text-gray-200">•</span>
                            <span className="font-mono text-[10px] text-gray-400">{o?.orderExternalId}</span>
                          </div>
                        </div>
                        <span className="text-[13px] font-black text-emerald-600 shrink-0">
                          +{formatCurrency(Number(item.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminPaymentsClient({ pendingList, batches, waitingList, customers }: Props) {
  const [activeTab, setActiveTab] = useState<"pending" | "waiting" | "history" | "manual">("pending");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBatch, setViewingBatch] = useState<string | null>(null);
  const [expandedWaiting, setExpandedWaiting] = useState<string | null>(null);
  const itemsPerPage = 9;

  const todayTotal = pendingList.reduce((s, c) => s + c.amount, 0);
  const paidBatches = batches.filter((b) => b.status === "paid");
  const pendingBatches = batches.filter((b) => b.status !== "paid");

  const handleTabChange = (tab: "pending" | "waiting" | "history" | "manual") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredPending = pendingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      || c.bankAccountNumber?.includes(q);
  });

  const filteredWaiting = waitingList.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const filteredBatches = batches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.customerName.toLowerCase().includes(q) || b.paymentCode.toLowerCase().includes(q);
  });

  const activeList = activeTab === "pending" ? filteredPending : activeTab === "waiting" ? filteredWaiting : filteredBatches;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const paginatedPending = filteredPending.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedWaiting = filteredWaiting.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedBatches = filteredBatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-lg fade-in pb-2xl">
      {/* Detail modal */}
      {viewingBatch && (
        <BatchDetailModal batchId={viewingBatch} onClose={() => setViewingBatch(null)} />
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="text" placeholder="Tìm tên khách, mã KH, mã phiếu, số tài khoản..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium shadow-sm ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#e86a33]/40 transition-all"
        />
      </div>

      {/* Tabs + summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div className="flex items-center gap-sm overflow-x-auto">
          {[
            { id: "pending" as const, label: "Yêu cầu rút tiền", count: pendingList.length, icon: <Wallet size={14} /> },
            { id: "waiting" as const, label: "Chờ Shopee duyệt", count: waitingList.length, icon: <Clock size={14} /> },
            { id: "history" as const, label: "Lịch sử phiếu", count: batches.length, icon: <ClipboardList size={14} /> },
            { id: "manual" as const, label: "Tạo phiếu chủ động", count: null, icon: <UserSearch size={14} /> },
          ].map((t) => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              className={`flex h-10 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-lg text-[13px] font-bold transition-all ${
                activeTab === t.id
                  ? "bg-[#e86a33] text-white shadow-md shadow-[#e86a33]/25"
                  : "bg-white text-gray-500 ring-1 ring-black/[0.08] hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <span className={activeTab === t.id ? "text-white/80" : "text-gray-400"}>{t.icon}</span>
              {t.label}
              {t.count !== null && (
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
                  activeTab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        {activeTab === "pending" && pendingList.length > 0 && (
          <div className="flex items-center gap-md rounded-2xl bg-white px-lg py-sm shadow-sm ring-1 ring-black/[0.06] shrink-0">
            <img src="/heovitien.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{pendingList.length} khách chờ thanh toán</div>
              <div className="text-[16px] font-black text-[#e86a33]">{formatCurrency(todayTotal)}</div>
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div className="flex items-center gap-md rounded-2xl bg-white px-lg py-sm shadow-sm ring-1 ring-black/[0.06] shrink-0">
            <img src="/heongansach.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đã thanh toán</div>
              <div className="text-[16px] font-black text-emerald-600">{paidBatches.length} phiếu</div>
            </div>
          </div>
        )}
      </div>

      {/* ── PENDING TAB ── */}
      {activeTab === "pending" && (
        filteredPending.length === 0 ? (
          <div className="flex flex-col items-center gap-sm rounded-3xl bg-white py-3xl shadow-sm ring-1 ring-black/[0.06]">
            <img src="/heochodoi.png" alt="" className="h-16 w-16 object-contain opacity-70" />
            <span className="text-[14px] font-bold text-gray-400">Chưa có khách nào yêu cầu rút tiền 🎉</span>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {paginatedPending.map((c) => (
                <div key={c.id} className="rounded-3xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] flex flex-col gap-md hover:shadow-md transition-shadow">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e86a33] to-[#d65d2a] text-white font-black text-[16px] shadow-md shadow-[#e86a33]/20">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate">{c.name}</div>
                      <div className="font-mono text-[11px] text-gray-400">{c.code}</div>
                    </div>
                    {c.requestedAt && (
                      <span className="shrink-0 rounded-full bg-amber-50 px-sm py-[3px] text-[10px] font-bold text-amber-600 ring-1 ring-amber-100">
                        🔔 {formatDate(c.requestedAt)}
                      </span>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-[2px]">{c.count} đơn cần thanh toán</div>
                    <div className="text-[28px] font-black text-[#e86a33] leading-none tabular-nums">{formatCurrency(c.amount)}</div>
                  </div>

                  {/* Payment info */}
                  {c.bankAccountNumber ? (
                    <div className="flex flex-col gap-[6px]">
                      <div className="flex items-center gap-sm rounded-xl bg-gray-50 p-sm ring-1 ring-gray-100">
                        <CreditCard size={13} className="text-[#e86a33] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-gray-800 truncate">{c.bankName}</div>
                          <div className="font-mono text-[11px] text-gray-500">{c.bankAccountNumber}</div>
                          <div className="text-[10px] text-gray-400 uppercase truncate">{c.bankAccountName}</div>
                        </div>
                        <CopyBtn value={c.bankAccountNumber} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-sm rounded-xl bg-amber-50 p-sm ring-1 ring-amber-100">
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                      <span className="text-[12px] font-medium text-amber-600">Chưa cập nhật thông tin TT</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-sm pt-sm border-t border-gray-50">
                    <CopyInfoBtn c={c} />
                    <div className="flex-1">
                      <CreatePaymentButton
                        customerId={c.id}
                        customerName={c.name}
                        amount={c.amount}
                        hasPaymentInfo={!!c.bankAccountNumber}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PagerFooter currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
              totalItems={filteredPending.length} unitLabel="khách"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
          </div>
        )
      )}

      {/* ── WAITING TAB ── */}
      {activeTab === "waiting" && (
        filteredWaiting.length === 0 ? (
          <div className="flex flex-col items-center gap-sm rounded-3xl bg-white py-3xl shadow-sm ring-1 ring-black/[0.06]">
            <img src="/heochaomung.png" alt="" className="h-16 w-16 object-contain opacity-70" />
            <span className="text-[14px] font-bold text-gray-400">Không có đơn nào đang chờ Shopee duyệt 🎉</span>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            {/* Info box */}
            <div className="flex items-start gap-sm rounded-2xl bg-blue-50 border border-blue-200 px-lg py-md">
              <img src="/heochodoi.png" alt="" className="h-7 w-7 object-contain shrink-0 mt-[1px]" />
              <p className="text-[13px] text-blue-700 font-medium leading-relaxed">
                Các đơn bên dưới có <strong>tiếp thị liên kết chưa hoàn thành</strong> (Shopee chưa xác nhận hoa hồng).
                Khi nào import lại CSV mới và Shopee đã duyệt, đơn sẽ tự chuyển sang <strong>"Sẵn sàng thanh toán"</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-md">
              {paginatedWaiting.map((c) => (
                <div key={c.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
                  {/* Customer header */}
                  <div className="flex items-center justify-between p-lg border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center gap-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-black text-[15px]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{c.name}</div>
                        <div className="font-mono text-[11px] text-gray-400">{c.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-gray-400">{c.count} đơn đang chờ</div>
                      <div className="text-[16px] font-black text-blue-600">{formatCurrency(c.amount)}</div>
                    </div>
                  </div>

                  {/* Orders list */}
                  <div className="flex flex-col divide-y divide-gray-50">
                    {c.orders.map((o) => (
                      <div key={o.id} className="flex items-center gap-md p-md">
                        {o.productImage ? (
                          <img src={o.productImage} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/5 shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <ShoppingBag size={14} className="text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-semibold text-gray-800">
                            {o.productTitle ?? o.orderExternalId}
                          </p>
                          <div className="flex items-center gap-xs mt-[2px]">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{o.platformName}</span>
                            <span className="text-gray-200">•</span>
                            <span className="font-mono text-[10px] text-gray-400">{o.orderExternalId}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[13px] font-black text-gray-700">{formatCurrency(o.customerRewardAmount)}</div>
                          {o.productAffiliateStatus && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 rounded-full px-sm py-[2px]">
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
            <PagerFooter currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
              totalItems={filteredWaiting.length} unitLabel="khách"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
          </div>
        )
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        filteredBatches.length === 0 ? (
          <div className="flex flex-col items-center gap-sm rounded-3xl bg-white py-3xl shadow-sm ring-1 ring-black/[0.06]">
            <img src="/10_empty.png" alt="" className="h-16 w-16 object-contain opacity-60" />
            <span className="text-[14px] font-bold text-gray-400">Không có phiếu nào</span>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      {["Mã phiếu", "Khách hàng", "Số tiền", "Đơn", "Trạng thái", "Ngày trả", "Thao tác"].map((h) => (
                        <th key={h} className="px-md py-sm text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBatches.map((b) => (
                      <tr key={b.id}
                        className={`border-b border-gray-50 transition-colors hover:bg-orange-50/20 ${b.status === "paid" ? "" : "bg-amber-50/30"}`}>
                        <td className="px-md py-md">
                          <span className="font-mono font-bold text-[13px] text-gray-900">{b.paymentCode}</span>
                          {b.billStorageKey && (
                            <span className="ml-xs inline-flex items-center gap-[2px] rounded-md bg-sky-100 px-[5px] py-[2px] text-[10px] font-bold text-sky-600">
                              <ImageIcon size={9} /> Bill
                            </span>
                          )}
                        </td>
                        <td className="px-md py-md font-semibold text-gray-800">{b.customerName}</td>
                        <td className="px-md py-md font-black text-[14px] text-[#e86a33]">{formatCurrency(b.totalAmount)}</td>
                        <td className="px-md py-md text-center">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-md bg-gray-100 font-mono text-[12px] font-bold text-gray-600 px-sm">
                            {b.itemCount}
                          </span>
                        </td>
                        <td className="px-md py-md">
                          <Badge tone={b.status === "paid" ? "positive" : "warning"} dot>
                            {b.status === "paid" ? "Đã thanh toán" : "Chờ xử lý"}
                          </Badge>
                        </td>
                        <td className="px-md py-md text-[12px] text-gray-500">{b.paidAt ?? "—"}</td>
                        <td className="px-md py-md">
                          <div className="flex items-center gap-sm">
                            {/* Xem chi tiết — quan trọng nhất */}
                            <button onClick={() => setViewingBatch(b.id)}
                              className="flex h-8 items-center gap-xs rounded-xl bg-[#e86a33]/10 px-sm text-[12px] font-bold text-[#e86a33] hover:bg-[#e86a33]/20 transition-colors">
                              <Eye size={13} strokeWidth={2} /> Xem
                            </button>
                            {/* Mark paid nếu chưa xong */}
                            {b.status !== "paid" && <MarkPaidForm batchId={b.id} />}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <PagerFooter currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
              totalItems={filteredBatches.length} unitLabel="phiếu"
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
          </div>
        )
      )}

      {/* ── MANUAL TAB ── */}
      {activeTab === "manual" && (
        <div className="max-w-lg">
          <CreatePaymentForCustomer customers={customers} />
        </div>
      )}
    </div>
  );
}

function PagerFooter({ currentPage, totalPages, itemsPerPage, totalItems, unitLabel, onPrev, onNext }:
  { currentPage: number; totalPages: number; itemsPerPage: number; totalItems: number; unitLabel: string; onPrev: () => void; onNext: () => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white ring-1 ring-black/[0.06] px-md py-sm shadow-sm">
      <span className="text-[13px] text-gray-500">
        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems} {unitLabel}
      </span>
      <div className="flex items-center gap-sm">
        <button onClick={onPrev} disabled={currentPage === 1}
          className="rounded-xl border border-gray-200 bg-white px-md py-[6px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          ← Trước
        </button>
        <span className="text-[12px] font-bold text-gray-700 px-xs">{currentPage}/{totalPages}</span>
        <button onClick={onNext} disabled={currentPage === totalPages}
          className="rounded-xl border border-gray-200 bg-white px-md py-[6px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          Sau →
        </button>
      </div>
    </div>
  );
}
