"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { CheckCircle, UserPlus, AlertTriangle, XCircle, Pencil, X } from "lucide-react";

type Option = { id: string; label: string };

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
  customers: Option[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClawbackConfirm, setShowClawbackConfirm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);

  // Đổi/bỏ gán khách chỉ an toàn khi đơn CHƯA duyệt — sau khi approved, tiền
  // và hoa hồng giới thiệu (nếu có) đã tính theo đúng khách, đổi lúc này sẽ
  // để lại dữ liệu sai lệch. Khớp đúng luật chặn ở API.
  const canChangeCustomer = hasCustomer && orderStatus !== "approved" && orderStatus !== "clawback";

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
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
      alert(data.error || "Có lỗi xảy ra");
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
    <div className="flex flex-col gap-xs">
      {/* Gán khách hàng */}
      {!hasCustomer && (
        <div className="flex items-center gap-xs">
          <SearchableSelect
            options={customers}
            value={customerId}
            onChange={setCustomerId}
            placeholder="Gán khách (tên/mã)..."
            size="sm"
            className="w-[180px]"
            inputClassName="bg-canvas text-gray-900"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!customerId || loading}
            onClick={() => patch({ customerId })}
          >
            <UserPlus size={13} strokeWidth={1.75} />
            Gán
          </Button>
        </div>
      )}

      {/* Đổi/bỏ gán khách — chỉ khi đơn chưa duyệt (xem canChangeCustomer) */}
      {canChangeCustomer && !editingCustomer && (
        <button
          type="button"
          onClick={() => setEditingCustomer(true)}
          className="flex w-fit items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#e86a33] transition-colors"
        >
          <Pencil size={11} strokeWidth={2} />
          Đổi khách
        </button>
      )}

      {canChangeCustomer && editingCustomer && (
        <div className="flex items-center gap-xs flex-wrap">
          <SearchableSelect
            options={customers}
            value={customerId}
            onChange={setCustomerId}
            placeholder="Chọn khách mới..."
            size="sm"
            className="w-[180px]"
            inputClassName="bg-canvas text-gray-900"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!customerId || loading}
            onClick={() => { patch({ customerId }); setEditingCustomer(false); }}
          >
            <UserPlus size={13} strokeWidth={1.75} />
            Lưu
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => { patch({ customerId: null }); setEditingCustomer(false); }}
            title="Bỏ gán, chuyển đơn về Chưa map khách"
          >
            Bỏ gán
          </Button>
          <button
            type="button"
            onClick={() => { setEditingCustomer(false); setCustomerId(""); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={14} />
          </button>
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
        {orderStatus === "approved" && !showClawbackConfirm && (
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setShowClawbackConfirm(true)}
            title="Shopee đòi lại hoa hồng — đơn này bị clawback"
          >
            <AlertTriangle size={13} strokeWidth={1.75} />
            Clawback
          </Button>
        )}

        {/* Xác nhận clawback */}
        {orderStatus === "approved" && showClawbackConfirm && (
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
      </div>
    </div>
  );
}
