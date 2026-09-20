"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function create() {
    // Block ở UI trước khi gọi API
    if (!hasPaymentInfo) {
      toast.warning(
        `Khách hàng "${customerName ?? ""}" chưa cập nhật số tài khoản ngân hàng. Vui lòng cập nhật thông tin thanh toán trước.`,
        "Chưa có thông tin thanh toán"
      );
      return;
    }
    const confirmed = await modal.confirm({
      title: "Tạo phiếu thanh toán?",
      message:
        customerName && amount
          ? `Xác nhận tạo phiếu cho khách hàng "${customerName}" với số tiền ${amount.toLocaleString("vi-VN")}đ. Các đơn đủ điều kiện sẽ chuyển sang trạng thái "Đang xử lý".`
          : 'Xác nhận tạo phiếu thanh toán cho khách hàng này? Các đơn đủ điều kiện sẽ chuyển sang trạng thái "Đang xử lý".',
      confirmText: "Tạo phiếu ngay",
      cancelText: "Huỷ bỏ",
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
      toast.error(data.error ?? "Đã có lỗi xảy ra, vui lòng thử lại.", "Không thể tạo phiếu");
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success(
      customerName
        ? `Đã tạo phiếu thanh toán thành công cho "${customerName}"! 🎀`
        : "Đã tạo phiếu thanh toán thành công!",
      "Thành công"
    );
    onSuccess?.();
    router.refresh();
  }

  return (
    <Button
      variant="primary"
      size="sm"
      disabled={loading}
      onClick={create}
      className={`w-full ${!hasPaymentInfo ? "opacity-60 !bg-neutral-100 !text-neutral-400 !border-neutral-200 !shadow-none" : ""}`}
      title={!hasPaymentInfo ? "Khách chưa cập nhật thông tin chuyển khoản" : undefined}
    >
      <Send size={13} strokeWidth={1.75} />
      {loading ? "Đang tạo..." : !hasPaymentInfo ? "Chưa có TT thanh toán" : "Tạo phiếu"}
    </Button>
  );
}
