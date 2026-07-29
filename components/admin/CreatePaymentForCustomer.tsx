"use client";

import { useState, useEffect } from "react";
import { CreditCard, AlertCircle, UserSearch } from "lucide-react";
import { SearchableSelect, ComboboxOption } from "@/components/ui/SearchableSelect";
import { CreatePaymentButton } from "@/components/admin/CreatePaymentButton";
import { formatCurrency } from "@/lib/format";

type Preview = {
  customer: {
    id: string;
    fullName: string;
    customerCode: string;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
  };
  available: number;
  orderCount: number;
};

export function CreatePaymentForCustomer({ customers }: { customers: ComboboxOption[] }) {
  const [customerId, setCustomerId] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setPreview(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) {
          setError(d.error);
          setPreview(null);
        } else {
          setPreview(d);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được thông tin khách hàng");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  function reset() {
    setCustomerId("");
    setPreview(null);
  }

  return (
    <div className="rounded-3xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e86a33]/10 text-[#e86a33]">
          <UserSearch size={18} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-gray-900">Chủ động tạo phiếu rút hộ khách</h3>
          <p className="text-[11px] text-gray-400">Không cần chờ khách gửi yêu cầu — chọn khách bất kỳ đang có số dư</p>
        </div>
      </div>

      <SearchableSelect
        options={customers}
        value={customerId}
        onChange={setCustomerId}
        placeholder="Tìm tên hoặc mã khách hàng..."
        inputClassName="bg-gray-50 h-11"
      />

      {loading && <p className="text-[12px] text-gray-400">Đang tải số dư...</p>}

      {error && (
        <div className="flex items-center gap-sm rounded-xl bg-red-50 p-sm ring-1 ring-red-100">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="text-[12px] font-medium text-red-600">{error}</span>
        </div>
      )}

      {preview && !loading && (
        <div className="flex flex-col gap-sm rounded-2xl bg-gray-50 p-md ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-sm">
            <div className="min-w-0">
              <div className="font-bold text-gray-900 truncate">{preview.customer.fullName}</div>
              <div className="font-mono text-[11px] text-gray-400">{preview.customer.customerCode}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-gray-400">{preview.orderCount} đơn khả dụng</div>
              <div className="text-[20px] font-black text-[#e86a33] tabular-nums">{formatCurrency(preview.available)}</div>
            </div>
          </div>

          {preview.customer.bankAccountNumber ? (
            <div className="flex items-center gap-sm rounded-xl bg-white p-sm ring-1 ring-gray-100">
              <CreditCard size={13} className="text-[#e86a33] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-gray-800 truncate">{preview.customer.bankName}</div>
                <div className="font-mono text-[11px] text-gray-500">
                  {preview.customer.bankAccountNumber} — {preview.customer.bankAccountName}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-sm rounded-xl bg-amber-50 p-sm ring-1 ring-amber-100">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span className="text-[12px] font-medium text-amber-600">Chưa cập nhật thông tin thanh toán</span>
            </div>
          )}

          {preview.available <= 0 ? (
            <p className="py-sm text-center text-[12px] font-medium text-gray-400">
              Khách không có đơn nào chờ thanh toán.
            </p>
          ) : (
            <CreatePaymentButton
              customerId={preview.customer.id}
              customerName={preview.customer.fullName}
              amount={preview.available}
              hasPaymentInfo={!!preview.customer.bankAccountNumber}
              onSuccess={reset}
            />
          )}
        </div>
      )}
    </div>
  );
}
