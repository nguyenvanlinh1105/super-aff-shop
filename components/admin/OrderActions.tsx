"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchableSelect, type ComboboxOption } from "@/components/ui/SearchableSelect";
import { CheckCircle, UserPlus, AlertTriangle, XCircle, Pencil, X, AlertCircle } from "lucide-react";

export function OrderActions({
  orderId,
  orderStatus,
  payoutStatus,
  hasCustomer,
  customers,
}: {
  orderId: string;
  orderStatus: string;
  payoutStatus: string;
  hasCustomer: boolean;
  customers: ComboboxOption[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClawbackConfirm, setShowClawbackConfirm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Đổi/bỏ gán khách chỉ an toàn khi đơn CHƯA duyệt — sau khi approved, tiền
  // và hoa hồng giới thiệu (nếu có) đã tính theo đúng khách, đổi lúc này sẽ
  // để lại dữ liệu sai lệch. Khớp đúng luật chặn ở API.
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
              onClick={() => { patch({ customerId }); setEditingCustomer(false); }}
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
              onClick={() => { patch({ customerId: null }); setEditingCustomer(false); }}
              title="Bỏ gán, chuyển đơn về Chưa map khách"
              className="h-10 flex-1 sm:flex-initial justify-center"
            >
              Bỏ gán
            </Button>
            <button
              type="button"
              onClick={() => { setEditingCustomer(false); setCustomerId(""); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-xs flex-wrap">
        {/* Duyệt thông thường (pending → approved) */}
        {orderStatus === "pending" && (
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={() => patch({ orderStatus: "approved" })}
            className="h-10"
          >
            <CheckCircle size={13} strokeWidth={1.75} />
            Duyệt
          </Button>
        )}

        {/* "completed" là dữ liệu cũ (trước khi sửa logic đọc CSV) — không còn nút bấm tay,
            vì phân loại đúng (approved/cancelled) chỉ có được khi re-import lại đúng file CSV gốc. */}
        {orderStatus === "completed" && (
          <span className="text-[11px] font-medium text-gray-400 italic">Re-import CSV để cập nhật</span>
        )}

        {/* "processing" — Shopee đã báo hoàn thành nhưng chưa đủ 15 ngày đối soát,
            tự chuyển "approved" ở lần re-import kế tiếp sau khi đủ ngày, không có thao tác tay. */}
        {orderStatus === "processing" && (
          <span className="text-[11px] font-medium text-amber-600 italic">Đang đối soát — chờ đủ 15 ngày</span>
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
    </div>
  );
}
