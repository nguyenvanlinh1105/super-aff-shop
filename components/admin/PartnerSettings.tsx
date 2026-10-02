"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Handshake, Users, UserPlus, Check, Sparkles, AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
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
      setError(data.error || "Có lỗi xảy ra khi lưu thiết lập");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-extrabold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700 font-black p-1">✕</button>
        </div>
      )}

      {/* Card 1: Toggle Chế độ Đối tác (Partner) */}
      <div className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
        isPartner 
          ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 shadow-sm"
          : "bg-white border-neutral-200/80 shadow-xs"
      }`}>
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-xl shadow-xs transition-colors ${
              isPartner ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-neutral-100 text-neutral-500 border border-neutral-200/60"
            }`}>
              <Handshake size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Quyền Đối Tác (Partner)</h3>
                {isPartner && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={11} /> Đang Kích Hoạt
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500 font-medium leading-relaxed max-w-2xl">
                Khi kích hoạt, mọi khách hàng có <strong>&quot;Người giới thiệu&quot;</strong> trỏ về người này sẽ luôn được tính hoa hồng giới thiệu 5% <strong>vĩnh viễn</strong> trên mọi đơn hàng — không bị giới hạn 5 đơn/người hay 6 tháng như chế độ tự do.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPartner}
            onClick={() => patch({ isPartner: !isPartner })}
            disabled={loading}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              isPartner ? "bg-emerald-500" : "bg-neutral-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isPartner ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card 2: Người giới thiệu của khách này */}
      <div className="rounded-3xl bg-white border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
            <UserPlus size={16} className="text-rose-500" />
            <span>Người Giới Thiệu Khách Này:</span>
          </div>
          {referredBy && (
            <span className="text-xs text-neutral-500 font-medium">
              Hiện tại: <strong className="text-rose-600 font-black">{referredBy.fullName}</strong> ({referredBy.customerCode})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[220px]">
            <select
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-xs font-extrabold text-neutral-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer"
              value={referrerSelect}
              onChange={(e) => setReferrerSelect(e.target.value)}
            >
              <option value="">— Đăng ký trực tiếp (Không có người giới thiệu) —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={loading || referrerSelect === (referredBy?.id ?? "")}
            onClick={() => patch({ referredById: referrerSelect || null })}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-900 px-5 py-3 text-xs font-black text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>{loading ? "Đang lưu..." : "Cập Nhật"}</span>
          </button>
        </div>
      </div>

      {/* Card 3: Danh sách khách đã được gán cho đối tác này (nếu là đối tác) */}
      {isPartner && (
        <div className="rounded-3xl bg-white border border-emerald-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
              <Users size={16} className="text-emerald-600" />
              <span>Khách Hàng Được Gán Cho Đối Tác Này</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              {referredUsers.length} khách hàng
            </span>
          </div>

          {referredUsers.length === 0 ? (
            <p className="text-xs text-neutral-400 font-medium py-2 italic">Chưa có khách hàng nào được gán cho đối tác này.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {referredUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/customers/${u.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50/70 border border-neutral-200/70 hover:border-emerald-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0">
                      {u.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-xs text-neutral-800 group-hover:text-emerald-700 transition-colors truncate">
                      {u.fullName}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-neutral-400 group-hover:text-neutral-600 shrink-0 ml-2">
                    {u.customerCode}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
