"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchableSelect, type ComboboxOption } from "@/components/ui/SearchableSelect";
import {
  CheckCircle,
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  XCircle,
  Pencil,
  X,
  AlertCircle,
  Clock,
  Wallet,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

const SETTLEMENT_DAYS = 15;
const MAX_EARLY_SETTLEMENT_REWARD = 5000; // Tối đa 5.000đ tiền hoàn cho phép duyệt sớm

const QUICK_REASONS = [
  "Khách quen xác nhận đã nhận hàng",
  "Shopee đã chốt đối soát sớm",
  "Đơn giá trị nhỏ an toàn",
  "Hỗ trợ duyệt nhanh cho khách",
];

export function OrderActions({
  orderId,
  orderExternalId,
  orderStatus,
  payoutStatus,
  hasCustomer,
  customers,
  customerName,
  customerRewardAmount,
  orderAmount,
  completedAt,
  earlyApprovalReason,
}: {
  orderId: string;
  orderExternalId?: string;
  orderStatus: string;
  payoutStatus: string;
  hasCustomer: boolean;
  customers: ComboboxOption[];
  customerName?: string | null;
  customerRewardAmount?: number;
  orderAmount?: number | null;
  completedAt?: string | null;
  earlyApprovalReason?: string | null;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClawbackConfirm, setShowClawbackConfirm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal lý do duyệt sớm
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  // Modal thông báo chưa đủ điều kiện duyệt sớm (> 5.000đ)
  const [ineligibleModalOpen, setIneligibleModalOpen] = useState(false);

  // Kiểm tra thời gian đối soát (15 ngày)
  const completedDate = completedAt ? new Date(completedAt) : null;
  const readyDate = completedDate
    ? new Date(completedDate.getTime() + SETTLEMENT_DAYS * 24 * 60 * 60 * 1000)
    : null;
  const isSettlementReady = readyDate ? Date.now() >= readyDate.getTime() : false;
  const daysLeft = readyDate
    ? Math.max(0, Math.ceil((readyDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  // Kiểm tra điều kiện tiền hoàn <= 5.000đ
  const reward = Number(customerRewardAmount ?? 0);
  const isRewardEligible = reward <= MAX_EARLY_SETTLEMENT_REWARD;

  // Đổi/bỏ gán khách chỉ an toàn khi đơn CHƯA duyệt
  const canChangeCustomer = hasCustomer && orderStatus !== "approved" && orderStatus !== "clawback";

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Có lỗi xảy ra");
    }
  }

  function handleApproveClick() {
    if (!hasCustomer) {
      setError("Cần gán khách hàng trước khi duyệt đối soát & chuyển tiền về ví.");
      return;
    }

    if (isSettlementReady) {
      // Đã đủ 15 ngày đối soát -> Duyệt ngay
      patch({ orderStatus: "approved" });
      return;
    }

    // Chưa đủ 15 ngày
    if (!isRewardEligible) {
      // Tiền hoàn > 5.000đ -> Không đủ điều kiện duyệt sớm
      setIneligibleModalOpen(true);
      return;
    }

    // Tiền hoàn <= 5.000đ -> Mở modal popup nhập lý do
    setReason("");
    setReasonError(null);
    setReasonModalOpen(true);
  }

  async function submitEarlyApproval(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!reason.trim()) {
      setReasonError("Vui lòng nhập lý do hoàn tất đối soát sớm.");
      return;
    }
    setReasonError(null);
    await patch({
      orderStatus: "approved",
      earlyApprovalReason: reason.trim(),
    });
    setReasonModalOpen(false);
    setReason("");
  }

  // Trạng thái cuối — không có thao tác
  if (orderStatus === "clawback") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <XCircle size={12} /> Đã clawback
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Gán khách hàng */}
      {!hasCustomer && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <SearchableSelect
            options={customers}
            value={customerId}
            onChange={setCustomerId}
            placeholder="Tìm tên, mã, email..."
            size="sm"
            className="w-full sm:w-[220px]"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!customerId || loading}
            onClick={() => patch({ customerId })}
            className={`h-10 transition-all duration-200 shrink-0 w-full sm:w-auto justify-center font-bold ${
              customerId
                ? "!bg-rose-500 !text-white !border-rose-500 shadow-md hover:!bg-rose-600 ring-2 ring-rose-200"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            <UserPlus size={14} strokeWidth={2.2} />
            <span>{loading ? "Đang gán..." : customerId ? "Xác nhận gán" : "Gán khách"}</span>
          </Button>
        </div>
      )}

      {/* Đổi/bỏ gán khách — chỉ khi đơn chưa duyệt (xem canChangeCustomer) */}
      {canChangeCustomer && !editingCustomer && (
        <button
          type="button"
          onClick={() => setEditingCustomer(true)}
          className="flex w-fit items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-primary-600 transition-colors"
        >
          <Pencil size={11} strokeWidth={2} />
          Đổi khách
        </button>
      )}

      {canChangeCustomer && editingCustomer && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <SearchableSelect
            options={customers}
            value={customerId}
            onChange={setCustomerId}
            placeholder="Chọn khách mới..."
            size="sm"
            className="w-full sm:w-[220px]"
          />
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              disabled={!customerId || loading}
              onClick={() => {
                patch({ customerId });
                setEditingCustomer(false);
              }}
              className={`h-10 flex-1 sm:flex-initial transition-all duration-200 shrink-0 justify-center font-bold ${
                customerId
                  ? "!bg-rose-500 !text-white !border-rose-500 shadow-md hover:!bg-rose-600 ring-2 ring-rose-200"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <UserPlus size={13} strokeWidth={2} />
              <span>{loading ? "Đang lưu..." : "Lưu"}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => {
                patch({ customerId: null });
                setEditingCustomer(false);
              }}
              title="Bỏ gán, chuyển đơn về Chưa map khách"
              className="h-10 flex-1 sm:flex-initial justify-center"
            >
              Bỏ gán
            </Button>
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(false);
                setCustomerId("");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {/* Duyệt thông thường (pending) */}
        {orderStatus === "pending" && (
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={handleApproveClick}
            className="h-9 font-bold"
          >
            <CheckCircle size={13} strokeWidth={2} />
            Duyệt & Về ví
          </Button>
        )}

        {/* "completed" là dữ liệu cũ — không còn nút bấm tay */}
        {orderStatus === "completed" && (
          <span className="text-[11px] font-medium text-gray-400 italic">Re-import CSV để cập nhật</span>
        )}

        {/* "processing" — Đang đối soát sàn */}
        {orderStatus === "processing" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
            {isSettlementReady ? (
              // Đã đủ 15 ngày
              <Button
                variant="primary"
                size="sm"
                disabled={loading}
                onClick={handleApproveClick}
                className="h-9 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 text-white font-bold shadow-sm"
              >
                <CheckCircle2 size={13} strokeWidth={2.2} />
                <span>Duyệt đối soát & về ví</span>
              </Button>
            ) : isRewardEligible ? (
              // Chưa đủ 15 ngày nhưng tiền hoàn <= 5.000đ: Cho phép duyệt sớm có popup lý do
              <div className="flex flex-col gap-1">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={loading}
                  onClick={handleApproveClick}
                  className="h-9 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 text-white font-bold shadow-sm transition-all hover:scale-[1.02]"
                  title="Đơn có tiền hoàn ≤ 5.000đ: Bấm để duyệt đối soát sớm và chuyển tiền về ví cho khách"
                >
                  <Wallet size={13} strokeWidth={2.2} />
                  <span>Duyệt đối soát & về ví</span>
                </Button>
                <span className="text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                  ⚡ Còn {daysLeft ?? 15} ngày • Hoàn {formatCurrency(reward)} (Được duyệt sớm)
                </span>
              </div>
            ) : (
              // Chưa đủ 15 ngày VÀ tiền hoàn > 5.000đ: Chặn duyệt sớm, hiển thị thông báo
              <div className="flex flex-col gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={handleApproveClick}
                  className="h-9 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 font-bold"
                  title="Tiền hoàn vượt mức 5.000đ, phải chờ đủ 15 ngày đối soát theo quy định"
                >
                  <Clock size={13} strokeWidth={2} />
                  <span>Chờ đủ 15 ngày</span>
                </Button>
                <span className="text-[10.5px] font-medium text-amber-700 italic">
                  Đang đối soát — còn {daysLeft ?? 15} ngày (Hoàn {formatCurrency(reward)} &gt; 5.000đ)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Clawback (approved → clawback) — chỉ khi chưa trả tiền khách */}
        {orderStatus === "approved" && payoutStatus !== "paid" && !showClawbackConfirm && (
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setShowClawbackConfirm(true)}
            title="Shopee/TikTok đòi lại hoa hồng — đơn này bị clawback"
          >
            <AlertTriangle size={13} strokeWidth={1.75} />
            Clawback
          </Button>
        )}

        {/* Đơn đã duyệt và đã hoàn tất chi trả cho khách */}
        {orderStatus === "approved" && payoutStatus === "paid" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle size={12} strokeWidth={2.2} /> Đã hoàn tất
          </span>
        )}

        {/* Xác nhận clawback */}
        {orderStatus === "approved" && payoutStatus !== "paid" && showClawbackConfirm && (
          <div className="flex items-center gap-xs">
            <span className="text-[11px] text-red-600 font-bold">Xác nhận?</span>
            <Button
              variant="primary"
              size="sm"
              disabled={loading}
              onClick={() => {
                setShowClawbackConfirm(false);
                patch({ orderStatus: "clawback" });
              }}
            >
              Đồng ý
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => setShowClawbackConfirm(false)}
            >
              Huỷ
            </Button>
          </div>
        )}

        {/* Cancelled */}
        {orderStatus === "cancelled" && (
          <span className="text-[11px] font-bold text-gray-400">Đã huỷ</span>
        )}

        {/* Rejected */}
        {orderStatus === "rejected" && (
          <span className="text-[11px] font-bold text-rose-500">Từ chối</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 mt-1 max-w-[280px]">
          <AlertCircle size={14} className="shrink-0 text-rose-500" />
          <span className="flex-1 leading-tight">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-700 font-bold ml-1 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MODAL 1: NHẬP LÝ DO HOÀN THÀNH ĐỐI SOÁT SỚM (tiền hoàn <= 5.000đ) ── */}
      {reasonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!loading) {
              setReasonModalOpen(false);
              setReasonError(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100 flex flex-col"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-emerald-100/80"
              style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200 shadow-sm text-emerald-700">
                  <Wallet size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    Duyệt đối soát & Chuyển tiền về ví
                  </h3>
                  <p className="text-[11.5px] font-semibold text-emerald-700">
                    Trường hợp hoàn thành đối soát sớm khi chưa đủ 15 ngày
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setReasonModalOpen(false);
                  setReasonError(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors shadow-2xs"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={submitEarlyApproval} className="flex flex-col gap-4 p-6">
              {/* Thông tin đơn hàng tóm tắt */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs">
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Mã đơn hàng:</span>
                  <span className="font-bold text-neutral-900 font-mono">{orderExternalId ?? orderId}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Khách hàng:</span>
                  <span className="font-bold text-neutral-900 truncate block">{customerName ?? "Chưa rõ"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Tiền hoàn vào ví:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {formatCurrency(reward)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Thời gian đối soát:</span>
                  <span className="font-semibold text-amber-700">
                    {daysLeft !== null ? `Còn ${daysLeft} ngày nữa` : "Chưa đủ 15 ngày"}
                  </span>
                </div>
              </div>

              {/* Thông báo điều kiện hợp lệ */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Đơn hàng có số tiền hoàn là <strong>{formatCurrency(reward)} ≤ 5.000đ</strong>, đủ điều kiện để hoàn thành đối soát sớm và cộng tiền vào ví khả dụng cho khách hàng ngay.
                </div>
              </div>

              {/* Nhập lý do */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Lý do hoàn thành đối soát sớm <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                    Bắt buộc ghi rõ
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (reasonError) setReasonError(null);
                  }}
                  placeholder="Ghi lý do duyệt sớm (ví dụ: Khách quen đã nhận hàng không đổi trả, sàn đã đối soát xong...)"
                  className="w-full rounded-2xl border border-neutral-300 p-3 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  autoFocus
                />
                {reasonError && (
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} /> {reasonError}
                  </span>
                )}
              </div>

              {/* Gợi ý lý do nhanh */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-neutral-500">Gợi ý lý do nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REASONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setReason(q);
                        if (reasonError) setReasonError(null);
                      }}
                      className="text-[11px] font-medium bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-neutral-200 px-2.5 py-1 rounded-xl transition-colors text-neutral-700 text-left"
                    >
                      + {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 mt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    setReasonModalOpen(false);
                    setReasonError(null);
                  }}
                  className="h-10 px-4 font-bold"
                >
                  Huỷ bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading || !reason.trim()}
                  className="h-10 px-5 !bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 text-white font-extrabold shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 size={15} strokeWidth={2.2} />
                  <span>{loading ? "Đang xử lý..." : "Xác nhận & Chuyển tiền về ví"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÔNG BÁO KHÔNG ĐỦ ĐIỀU KIỆN DUYỆT SỚM (tiền hoàn > 5.000đ) ── */}
      {ineligibleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIneligibleModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-200 flex flex-col p-6 gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 shadow-sm">
                <ShieldAlert size={24} strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Chưa đủ điều kiện duyệt sớm
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Đơn hàng này chưa đủ 15 ngày đối soát theo quy định và có số tiền hoàn là{" "}
                  <strong className="text-amber-700 font-extrabold">{formatCurrency(reward)}</strong>{" "}
                  (vượt mức trần tối đa cho phép duyệt trước là <strong>5.000đ</strong>).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-800 mb-1">Quy định an toàn đối soát sàn:</p>
              Đối với các đơn có tiền hoàn trên 5.000đ, hệ thống bắt buộc phải chờ đủ 15 ngày kể từ ngày đơn hoàn thành (còn {daysLeft ?? 15} ngày nữa) nhằm phòng ngừa rủi ro người mua yêu cầu đổi/trả hàng hoặc sàn TMĐT clawback hoa hồng.
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIneligibleModalOpen(false)}
                className="h-10 px-5 font-bold"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
