"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  CreditCard,
  Trash2,
  Handshake,
  RotateCcw,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Filter,
  Mail,
  Globe,
  UserPlus,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/CustomSelect";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Customer = {
  id: string;
  fullName: string;
  customerCode: string;
  email?: string | null;
  phone: string | null;
  zaloUserId: string | null;
  telegramUsername: string | null;
  telegramUserId: string | null;
  status: string;
  isPartner: boolean;
  linkCount: number;
  totalReward: number;
  debt: number;
  createdAt: string;
  registeredAt?: string;
  referredBy?: {
    id: string;
    fullName: string;
    customerCode: string;
  } | null;
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
  const currentSort = searchParams.get("sort") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";

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

  const handleSortChange = (field: string, dir: string) => {
    const params = new URLSearchParams(searchParams);
    if (field === "createdAt" && dir === "desc") {
      params.delete("sort");
      params.delete("order");
    } else {
      params.set("sort", field);
      params.set("order", dir);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleColumnSort = (field: string) => {
    if (currentSort === field) {
      handleSortChange(field, currentOrder === "asc" ? "desc" : "asc");
    } else {
      handleSortChange(field, field === "fullName" ? "asc" : "desc");
    }
  };

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

      {/* ── TOOLBAR: CUSTOMER SELECTION + SORT SELECTION + SEARCH ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Customer Selection Dropdown & Sort Selection Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Customer Selection Custom Dropdown */}
          <CustomSelect
            options={[
              {
                value: "all",
                label: "Tất cả khách hàng",
                count: counts.all,
                icon: <Users size={14} className="text-rose-500" />,
              },
              {
                value: "active",
                label: "Đang hoạt động",
                count: counts.active,
                icon: <UserCheck size={14} className="text-emerald-500" />,
              },
              {
                value: "debt",
                label: "Có công nợ",
                count: counts.debt,
                icon: <CreditCard size={14} className="text-rose-500" />,
              },
              {
                value: "partner",
                label: "Đối tác affiliate",
                count: counts.partner,
                icon: <Handshake size={14} className="text-indigo-500" />,
              },
              {
                value: "locked",
                label: "Bị khoá / Đã xoá",
                count: counts.locked,
                icon: <ShieldAlert size={14} className="text-neutral-400" />,
              },
            ]}
            value={currentTab}
            onChange={(val) => handleTabChange(val)}
            icon={<Users size={15} className="text-rose-500" />}
            className="min-w-[210px] sm:min-w-[220px]"
            menuClassName="min-w-[240px]"
            ariaLabel="Phân loại khách hàng"
          />

          {/* Sort Selection Custom Dropdown */}
          <CustomSelect
            options={[
              { value: "createdAt_desc", label: "Mới nhất (Mặc định)" },
              { value: "createdAt_asc", label: "Cũ nhất" },
              { value: "reward_desc", label: "Tổng hoàn tiền: Cao → Thấp" },
              { value: "reward_asc", label: "Tổng hoàn tiền: Thấp → Cao" },
              { value: "debt_desc", label: "Công nợ: Cao → Thấp" },
              { value: "debt_asc", label: "Công nợ: Thấp → Cao" },
              { value: "link_desc", label: "Số lượng link: Nhiều → Ít" },
              { value: "link_asc", label: "Số lượng link: Ít → Nhiều" },
              { value: "fullName_asc", label: "Tên khách hàng: A → Z" },
              { value: "fullName_desc", label: "Tên khách hàng: Z → A" },
            ]}
            value={`${currentSort}_${currentOrder}`}
            onChange={(val) => {
              const idx = val.lastIndexOf("_");
              const field = val.substring(0, idx);
              const dir = val.substring(idx + 1);
              handleSortChange(field, dir);
            }}
            icon={<ArrowUpDown size={15} className="text-amber-500" />}
            className="min-w-[210px] sm:min-w-[230px]"
            menuClassName="min-w-[250px]"
            ariaLabel="Sắp xếp khách hàng"
          />
        </div>

        {/* Right: Server Search Input */}
        <div className="w-full lg:w-[320px] xl:w-[360px]">
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
                  <Th>
                    <button
                      onClick={() => toggleColumnSort("fullName")}
                      className={`group inline-flex items-center gap-1.5 font-extrabold transition-colors ${
                        currentSort === "fullName" ? "text-rose-600" : "text-neutral-800 hover:text-rose-600"
                      }`}
                      title="Click để đổi chiều sắp xếp theo tên"
                    >
                      <span>Khách hàng &amp; Email</span>
                      {currentSort === "fullName" ? (
                        currentOrder === "asc" ? (
                          <ArrowUp size={13} className="text-rose-600 shrink-0" />
                        ) : (
                          <ArrowDown size={13} className="text-rose-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-neutral-400 group-hover:text-neutral-600 shrink-0 opacity-60" />
                      )}
                    </button>
                  </Th>
                  <Th>Mã KH</Th>
                  <Th>Nguồn Đăng Ký</Th>
                  <Th>Ngày Đăng Ký</Th>
                  <Th>Kênh Liên Hệ</Th>
                  <Th align="right">
                    <button
                      onClick={() => toggleColumnSort("reward")}
                      className={`group inline-flex items-center gap-1.5 font-extrabold transition-colors ml-auto ${
                        currentSort === "reward" ? "text-rose-600" : "text-neutral-800 hover:text-rose-600"
                      }`}
                      title="Click để đổi chiều sắp xếp theo tổng tiền hoàn"
                    >
                      <span>Tổng Hoàn Tiền</span>
                      {currentSort === "reward" ? (
                        currentOrder === "asc" ? (
                          <ArrowUp size={13} className="text-rose-600 shrink-0" />
                        ) : (
                          <ArrowDown size={13} className="text-rose-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-neutral-400 group-hover:text-neutral-600 shrink-0 opacity-60" />
                      )}
                    </button>
                  </Th>
                  <Th align="right">
                    <button
                      onClick={() => toggleColumnSort("debt")}
                      className={`group inline-flex items-center gap-1.5 font-extrabold transition-colors ml-auto ${
                        currentSort === "debt" ? "text-rose-600" : "text-neutral-800 hover:text-rose-600"
                      }`}
                      title="Click để đổi chiều sắp xếp theo công nợ"
                    >
                      <span>Công Nợ</span>
                      {currentSort === "debt" ? (
                        currentOrder === "asc" ? (
                          <ArrowUp size={13} className="text-rose-600 shrink-0" />
                        ) : (
                          <ArrowDown size={13} className="text-rose-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-neutral-400 group-hover:text-neutral-600 shrink-0 opacity-60" />
                      )}
                    </button>
                  </Th>
                  <Th align="center">
                    <button
                      onClick={() => toggleColumnSort("link")}
                      className={`group inline-flex items-center gap-1.5 font-extrabold transition-colors mx-auto ${
                        currentSort === "link" ? "text-rose-600" : "text-neutral-800 hover:text-rose-600"
                      }`}
                      title="Click để đổi chiều sắp xếp theo số lượng link"
                    >
                      <span>Link</span>
                      {currentSort === "link" ? (
                        currentOrder === "asc" ? (
                          <ArrowUp size={13} className="text-rose-600 shrink-0" />
                        ) : (
                          <ArrowDown size={13} className="text-rose-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-neutral-400 group-hover:text-neutral-600 shrink-0 opacity-60" />
                      )}
                    </button>
                  </Th>
                  <Th align="center">Trạng Thái</Th>
                  <Th align="center">Thao Tác</Th>
                </Tr>
              </Thead>
              <tbody>
                {customers.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 overflow-hidden">
                          <img src="/icon-512.png" alt="MeowBack" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/admin/customers/${c.id}`}
                              className="font-extrabold text-neutral-900 hover:text-rose-600 transition-colors text-sm"
                            >
                              {c.fullName}
                            </Link>
                            {c.isPartner && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-black"
                                title="Đối tác — hoa hồng giới thiệu vĩnh viễn"
                              >
                                <Handshake size={10} strokeWidth={2.5} />
                                Đối tác
                              </span>
                            )}
                          </div>
                          {c.email ? (
                            <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium truncate max-w-[200px]" title={c.email}>
                              <Mail size={11} className="text-neutral-400 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic">Chưa có email</span>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg border border-neutral-200/60">
                        {c.customerCode}
                      </span>
                    </Td>
                    <Td>
                      {c.referredBy ? (
                        <Link
                          href={`/admin/customers/${c.referredBy.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 text-[11px] font-black transition-colors"
                          title={`Người mời: ${c.referredBy.fullName} (${c.referredBy.customerCode})`}
                        >
                          <UserPlus size={11} className="text-purple-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{c.referredBy.fullName}</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-100 text-neutral-600 border border-neutral-200/70 text-[11px] font-bold">
                          <Globe size={11} className="text-neutral-400 shrink-0" />
                          Trực tiếp
                        </span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-700 whitespace-nowrap">
                        <Calendar size={12} className="text-neutral-400 shrink-0" />
                        <span className="font-semibold">{formatDate(c.registeredAt || c.createdAt)}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-0.5 text-xs font-medium">
                        {c.phone && <span className="text-neutral-700 font-semibold">📞 {c.phone}</span>}
                        {c.zaloUserId && <span className="text-blue-600">Zalo: {c.zaloUserId}</span>}
                        {c.telegramUsername && <span className="text-sky-500">Telegram: @{c.telegramUsername}</span>}
                        {!c.phone && !c.zaloUserId && !c.telegramUsername && <span className="text-neutral-400">—</span>}
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

