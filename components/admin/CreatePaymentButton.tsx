"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/ui/ModalProvider";
import { Send } from "lucide-react";

export function CreatePaymentButton({
  customerId,
  customerName,
  amount,
  hasPaymentInfo = true,
  onSuccess,
}: {
  customerId: string;
  customerName?: string;
  amount?: number;
  hasPaymentInfo?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const modal = useModal();
  const [loading, setLoading] = useState(false);

  async function create() {
    // Block ở UI trước khi gọi API
    if (!hasPaymentInfo) {
      await modal.alert({
        title: "Chưa có thông tin thanh toán",
        message: `Khách hàng "${customerName ?? ""}" chưa cập nhật số tài khoản ngân hàng. Vui lòng vào trang Khách hàng → cập nhật thông tin thanh toán trước khi tạo phiếu.`,
        iconType: "danger",
      });
      return;
    }
    const confirmed = await modal.confirm({
      title: "Tạo phiếu thanh toán?",
      message: customerName && amount
        ? `Xác nhận tạo phiếu cho khách hàng "${customerName}" với số tiền ${amount.toLocaleString("vi-VN")}đ. Các đơn đủ điều kiện sẽ chuyển sang trạng thái "Đang xử lý".`
        : 'Xác nhận tạo phiếu thanh toán cho khách hàng này? Các đơn đủ điều kiện sẽ chuyển sang trạng thái "Đang xử lý".',
      confirmText: "Tạo phiếu",
      cancelText: "Huỷ",
      iconType: "warning",
    });

    if (!confirmed) return;

    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        periodLabel: new Date().toLocaleDateString("vi-VN"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      await modal.alert({
        title: "Không thể tạo phiếu",
        message: data.error ?? "Đã có lỗi xảy ra, vui lòng thử lại.",
        iconType: "danger",
      });
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
    router.refresh();
  }

  return (
    <Button
      variant="primary"
      size="sm"
      disabled={loading}
      onClick={create}
      className={`w-full ${!hasPaymentInfo ? "opacity-60 !bg-gray-200 !text-gray-500 !shadow-none" : ""}`}
      title={!hasPaymentInfo ? "Khách chưa cập nhật thông tin chuyển khoản" : undefined}
    >
      <Send size={13} strokeWidth={1.75} />
      {loading ? "Đang tạo..." : !hasPaymentInfo ? "Chưa có TT thanh toán" : "Tạo phiếu"}
    </Button>
  );
}
