"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Trash2, Handshake } from "lucide-react";
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
  counts: {
    all: number;
    active: number;
    locked: number;
    debt: number;
    partner: number;
  };
}

export function AdminCustomersClient({ customers, totalPages, currentPage, counts }: AdminCustomersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Không xoá được khách hàng");
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
    { id: "locked", label: "Bị khoá", count: counts.locked },
  ];

  return (
    <div className="flex flex-col gap-6">
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
                        {c.status === "active" ? "Hoạt động" : "Bị khoá"}
                      </Badge>
                    </Td>
                    <Td align="center">
                      {confirmingId === c.id ? (
                        <div className="flex items-center justify-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                          <span className="text-[10px] font-black text-rose-700 px-1">Xoá hẳn?</span>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-black text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {deletingId === c.id ? "..." : "Xác nhận"}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            disabled={deletingId === c.id}
                            className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(c.id)}
                          title="Xoá cứng tài khoản — không thể khôi phục"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </div>
  );
}

