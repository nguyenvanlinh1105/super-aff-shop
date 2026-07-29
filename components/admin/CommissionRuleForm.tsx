"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function CommissionRuleForm({
  taxRate = 10.98,
  customerRate,
  systemRate,
  referralRate = 5,
  maxReferralOrders = 5,
  referralValidityMonths = 6
}: {
  taxRate?: number;
  customerRate: number;
  systemRate: number;
  referralRate?: number;
  maxReferralOrders?: number;
  referralValidityMonths?: number;
}) {
  const router = useRouter();
  const [tax, setTax] = useState(taxRate);
  const [customer, setCustomer] = useState(customerRate);
  const [system, setSystem] = useState(systemRate);
  const [referral, setReferral] = useState(referralRate);
  const [maxOrders, setMaxOrders] = useState(maxReferralOrders);
  const [validMonths, setValidMonths] = useState(referralValidityMonths);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/settings/commission-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxRate: Number(tax),
        customerRate: Number(customer),
        systemRate: Number(system),
        referralRate: Number(referral) / 100,
        maxReferralOrders: Number(maxOrders),
        referralValidityMonths: Number(validMonths),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không lưu được");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-lg">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-md">
        <label className="text-[14px] font-semibold text-amber-900">Thuế thu nhập khấu trừ (%)</label>
        <TextInput
          type="number"
          value={tax}
          onChange={(e) => setTax(Number(e.target.value))}
          className="mt-sm max-w-[200px]"
          step="0.01"
        />
        <p className="mt-sm text-[12px] text-amber-800">
          Đây là thuế TNCN hệ thống tự khấu trừ hộ khách trên hoa hồng nhận từ Shopee/TikTok trước khi chia — không phải khoản Shopee/TikTok tự trừ. Số tiền trả khách được tính trên phần hoa hồng đã trừ thuế này, không phải trên hoa hồng ghi nhận ban đầu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-lg">
        <div>
          <label className="text-[14px] font-semibold">Tỷ lệ khách hàng nhận (%)</label>
          <TextInput
            type="number"
            value={customer}
            onChange={(e) => setCustomer(Number(e.target.value))}
            className="mt-sm"
          />
        </div>
        <div>
          <label className="text-[14px] font-semibold">Tỷ lệ hệ thống giữ (%)</label>
          <TextInput
            type="number"
            value={system}
            onChange={(e) => setSystem(Number(e.target.value))}
            className="mt-sm"
          />
        </div>
      </div>

      <div className="mt-md border-t border-gray-100 pt-md">
        <h3 className="text-[14px] font-semibold mb-sm">Cấu hình Hoa hồng giới thiệu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
          <div>
            <label className="text-[13px] text-gray-600">Tỷ lệ chia (%)</label>
            <TextInput
              type="number"
              value={referral}
              onChange={(e) => setReferral(Number(e.target.value))}
              className="mt-xs text-[14px]"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray-600">Giới hạn số đơn (Max)</label>
            <TextInput
              type="number"
              value={maxOrders}
              onChange={(e) => setMaxOrders(Number(e.target.value))}
              className="mt-xs text-[14px]"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray-600">Thời hạn áp dụng (Tháng)</label>
            <TextInput
              type="number"
              value={validMonths}
              onChange={(e) => setValidMonths(Number(e.target.value))}
              className="mt-xs text-[14px]"
            />
          </div>
        </div>
        <p className="mt-sm text-[12px] text-gray-500">
          Người giới thiệu (A) nhận {referral}% hoa hồng — <strong>trích từ phần hệ thống giữ lại</strong>, không đụng vào phần khách hàng (B) đã nhận — cho tối đa {maxOrders} đơn hàng đầu tiên <strong>của mỗi người bạn</strong> (tính riêng cho từng người A mời, không dồn chung) được duyệt trong vòng {validMonths} tháng kể từ khi người bạn đó (F1) đăng ký.
        </p>
        <p className="mt-xs text-[12px] font-medium text-amber-700">
          Ví dụ: hệ thống giữ {system}% → sau khi trích {referral}% cho người giới thiệu, hệ thống thực giữ {(system - referral).toFixed(2).replace(/\.00$/, "")}%. Khách hàng B vẫn nhận đủ {customer}% như bình thường.
          {referral > system && " ⚠️ Tỷ lệ chia đang lớn hơn tỷ lệ hệ thống giữ — hệ thống sẽ bù lỗ phần chênh lệch cho mỗi đơn có giới thiệu."}
        </p>
        <p className="mt-xs text-[12px] text-gray-500">
          🤝 <strong>Đối tác</strong> (bật ở trang chi tiết từng khách hàng) <strong>không áp dụng</strong> giới hạn {maxOrders} đơn hay {validMonths} tháng ở trên — luôn nhận {referral}% vĩnh viễn trên mọi đơn của khách được gán, dù cấu hình này thay đổi.
        </p>
      </div>
      
      {error && <div className="text-[14px] text-red-500">{error}</div>}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </form>
  );
}
