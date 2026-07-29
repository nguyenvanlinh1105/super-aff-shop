"use client";

import { useState } from "react";
import { Search, Tag, Copy, Check, CalendarOff, TicketPercent, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { VoucherStatusToggle } from "@/components/admin/VoucherStatusToggle";
import { RenameVoucherButton } from "@/components/admin/RenameVoucherButton";
import { formatDate } from "@/lib/format";

type VoucherRow = {
  id: string;
  title: string;
  voucherCode: string | null;
  benefitText: string | null;
  status: string;
  endsAt: Date | null;
  platformName: string;
  productImage: string | null;
  shortUrl: string | null;
};

export function AdminVouchersClient({ vouchers }: { vouchers: VoucherRow[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleTabChange = (tab: "all" | "active" | "paused") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  function copyShortUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
  }

  const counts = {
    all: vouchers.length,
    active: vouchers.filter((v) => v.status === "active").length,
    paused: vouchers.filter((v) => v.status !== "active").length,
  };

  const filtered = vouchers.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        v.title.toLowerCase().includes(q) ||
        (v.voucherCode?.toLowerCase().includes(q) ?? false) ||
        v.platformName.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (activeTab === "active") return v.status === "active";
    if (activeTab === "paused") return v.status !== "active";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên voucher, mã voucher hoặc nền tảng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-md text-[14px] font-medium text-gray-900 shadow-sm ring-1 ring-black/5 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={activeTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} />
        <TabButton active={activeTab === "active"} onClick={() => handleTabChange("active")} label="Đang chạy" count={counts.active} />
        <TabButton active={activeTab === "paused"} onClick={() => handleTabChange("paused")} label="Tạm dừng" count={counts.paused} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Không tìm thấy voucher nào"
          description="Thử đổi từ khoá tìm kiếm hoặc bộ lọc khác."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {paginated.map((v) => (
            <Card
              key={v.id}
              className="flex flex-col p-0 overflow-hidden border border-gray-100 hover:border-[#e86a33]/30 hover:shadow-md transition-all group relative"
            >
              <div className="p-lg bg-gradient-to-br from-[#fff0e6]/50 to-white border-b border-dashed border-gray-200 relative">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <span className="inline-block rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider mb-sm">
                      {v.platformName}
                    </span>
                    <h3 className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-2">{v.title}</h3>
                  </div>
                  {v.productImage ? (
                    <img
                      src={v.productImage}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e86a33]/10 text-[#e86a33]">
                      <TicketPercent size={20} strokeWidth={2} />
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-gray-50 border-t border-r border-gray-200" />
                <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-gray-50 border-t border-l border-gray-200" />
              </div>

              <div className="p-lg flex flex-col flex-1 bg-white">
                <p className="text-[14px] text-gray-600 mb-xl line-clamp-2 min-h-[40px]">
                  {v.benefitText || "Không có thông tin thêm"}
                </p>

                <div className="mt-auto flex flex-col gap-md">
                  {v.shortUrl && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 p-sm pl-md">
                      <div className="flex items-center gap-xs min-w-0">
                        <Link2 size={14} className="text-[#e86a33] shrink-0" />
                        <span className="truncate font-mono text-[12px] font-semibold text-gray-700">
                          {v.shortUrl}
                        </span>
                      </div>
                      <button
                        onClick={() => copyShortUrl(v.id, v.shortUrl!)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-[#e86a33] transition-colors"
                        title="Copy link"
                      >
                        {copiedId === v.id ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  )}
                  {v.voucherCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 p-sm pl-md group-hover:bg-[#fff0e6]/30 transition-colors">
                      <span className="font-mono text-[16px] font-bold tracking-wider text-gray-900">
                        {v.voucherCode}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-[#e86a33] transition-colors"
                        title="Copy mã"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 border-dashed p-sm text-[13px] text-gray-400 font-medium h-12">
                      Không cần mã
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CalendarOff size={14} />
                      <span className="text-[12px] font-medium">
                        {v.endsAt ? formatDate(v.endsAt) : "Vô thời hạn"}
                      </span>
                    </div>
                    <Badge tone={v.status === "active" ? "positive" : "neutral"} dot>
                      {v.status === "active" ? "Đang chạy" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-md">
                <RenameVoucherButton id={v.id} currentTitle={v.title} />
                <VoucherStatusToggle id={v.id} status={v.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-md pt-lg pb-sm">
          <span className="text-[13px] text-gray-500 font-medium">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} trong số {filtered.length} voucher
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-[13px] font-bold text-gray-900 px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
        active
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm"
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      <span
        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
          active ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
