"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Trash2, Handshake, RotateCcw, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Customer = {
  id: string;
  fullName: string;
  customerCode: string;
  phone: string | null;
  zaloUserId: string | null;
  telegramUsername: string | null;
  telegramUserId: string | null;
  status: string;
  isPartner: boolean;
  linkCount: number;
  totalReward: number;
  debt: number;
};

interface AdminCustomersClientProps {
  customers: Customer[];
  totalPages: number;
  currentPage: number;
  totalItems?: number;
  pageSize?: number;
  counts: {
    all: number;
    active: number;
    locked: number;
    debt: number;
    partner: number;
  };
}

export function AdminCustomersClient({
  customers,
  totalPages,
  currentPage,
  counts,
  totalItems,
  pageSize = 10,
}: AdminCustomersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";
  const [confirmingAction, setConfirmingAction] = useState<{ id: string; type: "soft_delete" | "force_delete" } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleStatus(id: string, newStatus: string) {
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoadingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không thể cập nhật trạng thái");
    }
  }

  async function handleSoftDelete(id: string) {
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setLoadingId(null);
    setConfirmingAction(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không xoá mềm được khách hàng");
    }
  }

  async function handleForceDelete(id: string) {
    setLoadingId(id);
    setError(null);
    const res = await fetch(`/api/customers/${id}?force=true`, { method: "DELETE" });
    setLoadingId(null);
    setConfirmingAction(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Không xoá vĩnh viễn được khách hàng");
    }
  }

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page"); // reset page
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { id: "all", label: "Tất cả", count: counts.all },
    { id: "active", label: "Đang hoạt động", count: counts.active },
    { id: "debt", label: "Có công nợ", count: counts.debt },
    { id: "partner", label: "🤝 Đối tác", count: counts.partner },
    { id: "locked", label: "Bị khoá / Đã xoá", count: counts.locked },
  ];

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700 font-extrabold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700 font-black text-sm">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                currentTab === tab.id
                  ? "bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-md shadow-neutral-900/10 scale-[1.02]"
                  : "bg-white text-neutral-600 hover:bg-rose-50/60 hover:text-neutral-900 border border-neutral-200/70"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  currentTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-[300px]">
          <ServerSearchInput placeholder="Tìm theo tên, mã KH, sđt..." />
        </div>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy khách hàng"
          description="Chưa có khách hàng nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="rounded-3xl border border-neutral-200/70 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Khách hàng</Th>
                  <Th>Mã KH</Th>
                  <Th>Kênh Liên Hệ</Th>
                  <Th align="right">Tổng Hoàn Tiền</Th>
                  <Th align="right">Công Nợ</Th>
                  <Th align="center">Link</Th>
                  <Th align="center">Trạng Thái</Th>
                  <Th align="center">Thao Tác</Th>
                </Tr>
              </Thead>
              <tbody>
                {customers.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-extrabold text-neutral-900 hover:text-rose-600 transition-colors"
                        >
                          {c.fullName}
                        </Link>
                        {c.isPartner && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black"
                            title="Đối tác — hoa hồng giới thiệu vĩnh viễn"
                          >
                            <Handshake size={11} strokeWidth={2.5} />
                            Đối tác
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg">
                        {c.customerCode}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-0.5 text-xs font-medium">
                        {c.phone && <span className="text-neutral-700">📞 {c.phone}</span>}
                        {c.zaloUserId && <span className="text-blue-600">Zalo: {c.zaloUserId}</span>}
                        {c.telegramUsername && <span className="text-sky-500">Telegram: @{c.telegramUsername}</span>}
                      </div>
                    </Td>
                    <Td align="right">
                      <span className="font-extrabold text-neutral-900 tabular-nums">{formatCurrency(c.totalReward)}</span>
                    </Td>
                    <Td align="right">
                      <span className={`font-extrabold tabular-nums ${c.debt > 0 ? "text-rose-600" : "text-neutral-400"}`}>
                        {formatCurrency(c.debt)}
                      </span>
                    </Td>
                    <Td align="center">
                      <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-neutral-100 px-2 font-mono text-xs font-bold text-neutral-700">
                        {c.linkCount}
                      </span>
                    </Td>
                    <Td align="center">
                      <Badge tone={c.status === "active" ? "positive" : "negative"}>
                        {c.status === "active" ? "Hoạt động" : "Bị khoá / Đã xoá"}
                      </Badge>
                    </Td>
                    <Td align="center">
                      {c.status === "active" ? (
                        confirmingAction?.id === c.id && confirmingAction.type === "soft_delete" ? (
                          <div className="flex items-center justify-center gap-1 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                            <span className="text-[10px] font-black text-amber-800 px-1">Xoá mềm?</span>
                            <button
                              onClick={() => handleSoftDelete(c.id)}
                              disabled={loadingId === c.id}
                              className="rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-black text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
                            >
                              {loadingId === c.id ? "..." : "Khoá TK"}
                            </button>
                            <button
                              onClick={() => setConfirmingAction(null)}
                              disabled={loadingId === c.id}
                              className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingAction({ id: c.id, type: "soft_delete" })}
                            title="Xoá mềm (chuyển trạng thái bị khoá, có thể kích hoạt lại)"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        )
                      ) : (
                        confirmingAction?.id === c.id && confirmingAction.type === "force_delete" ? (
                          <div className="flex items-center justify-center gap-1 bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                            <span className="text-[10px] font-black text-rose-700 px-1">Xoá vĩnh viễn DB?</span>
                            <button
                              onClick={() => handleForceDelete(c.id)}
                              disabled={loadingId === c.id}
                              className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
                            >
                              {loadingId === c.id ? "..." : "Xoá hẳn"}
                            </button>
                            <button
                              onClick={() => setConfirmingAction(null)}
                              disabled={loadingId === c.id}
                              className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(c.id, "active")}
                              disabled={loadingId === c.id}
                              title="Kích hoạt lại tài khoản khách hàng này"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-xs font-black transition-all active:scale-95 shadow-xs"
                            >
                              <RotateCcw size={13} className={loadingId === c.id ? "animate-spin" : ""} />
                              <span>Kích hoạt lại</span>
                            </button>
                            <button
                              onClick={() => setConfirmingAction({ id: c.id, type: "force_delete" })}
                              title="Xoá vĩnh viễn khỏi CSDL"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        )
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}

