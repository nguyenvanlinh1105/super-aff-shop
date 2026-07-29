"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Handshake, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Option = { id: string; label: string };
type LinkedCustomer = { id: string; fullName: string; customerCode: string };

export function PartnerSettings({
  customerId,
  isPartner,
  referredBy,
  referredUsers,
  customers,
}: {
  customerId: string;
  isPartner: boolean;
  referredBy: LinkedCustomer | null;
  referredUsers: LinkedCustomer[];
  customers: Option[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [referrerSelect, setReferrerSelect] = useState(referredBy?.id ?? "");

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(`/api/customers/${customerId}`, {
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

  return (
    <div className="flex flex-col gap-lg">
      {/* Toggle Đối tác */}
      <div className="rounded-2xl border border-gray-100 p-lg">
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Handshake size={18} strokeWidth={2} />
            </div>
            <div className="text-[14px] font-bold text-gray-900">Đối tác</div>
          </div>
          <button
            onClick={() => patch({ isPartner: !isPartner })}
            disabled={loading}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${isPartner ? "bg-emerald-500" : "bg-gray-200"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isPartner ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="mt-sm text-[12px] text-gray-500 leading-relaxed">
          Khi bật, mọi khách hàng có <strong>"Người giới thiệu"</strong> trỏ về người này sẽ luôn tính hoa hồng giới
          thiệu 5% <strong>vĩnh viễn</strong> trên mọi đơn — không giới hạn 5 đơn/người hay hạn 6 tháng như giới thiệu
          tự do thông thường.
        </p>
      </div>

      {/* Người giới thiệu của khách này */}
      <div className="rounded-2xl border border-gray-100 p-lg">
        <div className="text-[14px] font-bold text-gray-900 mb-sm">Người giới thiệu khách này</div>
        <div className="flex items-center gap-sm">
          <select
            className="flex-1 rounded-lg border border-gray-200 bg-canvas px-sm py-[8px] text-[13px] text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={referrerSelect}
            onChange={(e) => setReferrerSelect(e.target.value)}
          >
            <option value="">— Không có —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            disabled={loading || referrerSelect === (referredBy?.id ?? "")}
            onClick={() => patch({ referredById: referrerSelect || null })}
          >
            Lưu
          </Button>
        </div>
        {referredBy && (
          <p className="mt-sm text-[12px] text-gray-500">
            Hiện tại: <strong className="text-gray-700">{referredBy.fullName}</strong> ({referredBy.customerCode})
          </p>
        )}
      </div>

      {/* Danh sách khách được gán (nếu là đối tác) */}
      {isPartner && (
        <div className="rounded-2xl border border-gray-100 p-lg">
          <div className="mb-sm flex items-center gap-xs text-[14px] font-bold text-gray-900">
            <Users size={16} strokeWidth={2} />
            Khách được gán ({referredUsers.length})
          </div>
          {referredUsers.length === 0 ? (
            <p className="text-[12px] text-gray-400">Chưa có khách nào được gán cho đối tác này.</p>
          ) : (
            <div className="flex flex-col gap-xs">
              {referredUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/customers/${u.id}`}
                  className="flex items-center justify-between rounded-lg px-sm py-[6px] text-[13px] hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{u.fullName}</span>
                  <span className="font-mono text-[11px] text-gray-400">{u.customerCode}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
