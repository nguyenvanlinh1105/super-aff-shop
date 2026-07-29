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
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-all ${
                currentTab === tab.id
                  ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                  : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  currentTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-[280px]">
          <ServerSearchInput placeholder="Tìm theo tên, mã KH, số điện thoại..." />
        </div>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy khách hàng"
          description="Chưa có khách hàng nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Khách hàng</Th>
                  <Th>Mã KH</Th>
                  <Th>Liên hệ</Th>
                  <Th align="right">Tổng hoàn tiền</Th>
                  <Th align="right">Công nợ</Th>
                  <Th align="center">Link</Th>
                  <Th align="center">Trạng thái</Th>
                  <Th align="center">Thao tác</Th>
                </Tr>
              </Thead>
              <tbody>
                {customers.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-center gap-xs">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-bold text-gray-900 hover:text-[#e86a33] transition-colors"
                        >
                          {c.fullName}
                        </Link>
                        {c.isPartner && (
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                            title="Đối tác — hoa hồng giới thiệu vĩnh viễn, không giới hạn"
                          >
                            <Handshake size={12} strokeWidth={2.25} />
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-gray-500">{c.customerCode}</span>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-1 text-[12px]">
                        {c.phone && <span>📞 {c.phone}</span>}
                        {c.zaloUserId && <span className="text-blue-600">Zalo: {c.zaloUserId}</span>}
                        {c.telegramUsername && <span className="text-sky-500">Telegram: @{c.telegramUsername}</span>}
                      </div>
                    </Td>
                    <Td align="right">
                      <span className="font-bold text-gray-900">{formatCurrency(c.totalReward)}</span>
                    </Td>
                    <Td align="right">
                      <span className={`font-bold ${c.debt > 0 ? "text-red-500" : "text-gray-400"}`}>
                        {formatCurrency(c.debt)}
                      </span>
                    </Td>
                    <Td align="center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-50 px-2 font-mono text-[12px] font-bold text-gray-600">
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
                        <div className="flex items-center justify-center gap-xs">
                          <span className="text-[11px] font-bold text-red-600">Xoá vĩnh viễn?</span>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === c.id ? "..." : "Đồng ý"}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            disabled={deletingId === c.id}
                            className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-200"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(c.id)}
                          title="Xoá cứng tài khoản — không thể khôi phục"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} strokeWidth={2} />
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
