"use client";

import { useState, useTransition } from "react";
import {
  Link2,
  MousePointerClick,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowUpDown,
  X,
  History,
  LayoutList,
  Table as TableIcon,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatDate } from "@/lib/format";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export type LinkRow = {
  id: string;
  createdAt: string | Date;
  customerName: string;
  customerCode?: string | null;
  customerId?: string;
  platformName: string;
  platformCode?: string;
  trackingCode: string;
  shortCode: string | null;
  shortUrl: string | null;
  affiliateUrl: string;
  channelSource: string;
  clicks: number;
  status: string;
  productTitle: string | null;
  productImage: string | null;
};

interface AdminLinksClientProps {
  links: LinkRow[];
  totalPages: number;
  currentPage: number;
  totalItems?: number;
  pageSize?: number;
  counts: {
    all: number;
    active: number;
    stopped: number;
  };
  totalClicks: number;
  platformCounts?: {
    all: number;
    shopee: number;
    tiktok: number;
    lazada: number;
  };
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
        copied
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-white text-neutral-700 border border-neutral-200/80 hover:bg-neutral-50 hover:border-rose-200"
      }`}
      title="Sao chép link rút gọn"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-600 stroke-[2.5]" />
          <span className="text-[11px] font-black text-emerald-700">Đã chép!</span>
        </>
      ) : (
        <>
          <Copy size={12} className="text-neutral-500" />
          <span className="text-[11px]">{label || "Copy Link"}</span>
        </>
      )}
    </button>
  );
}

export function AdminLinksClient({
  links,
  totalPages,
  currentPage,
  counts,
  totalClicks,
  totalItems = 0,
  pageSize = 10,
  platformCounts,
}: AdminLinksClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const currentTab = searchParams.get("tab") || "all";
  const currentPlatform = (searchParams.get("platform") || "ALL").toUpperCase();
  const currentSort = searchParams.get("sort") || "newest";
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");

  const handleSearch = useDebouncedCallback((val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (val.trim()) {
      params.set("q", val.trim());
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, 350);

  const handleClearSearch = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handlePlatformChange = (code: string) => {
    const params = new URLSearchParams(searchParams);
    if (code === "ALL") {
      params.delete("platform");
    } else {
      params.set("platform", code);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageSizeChange = (size: string) => {
    const params = new URLSearchParams(searchParams);
    if (size === "10") {
      params.delete("limit");
    } else {
      params.set("limit", size);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const hasActiveFilters = Boolean(
    searchInput ||
    currentPlatform !== "ALL" ||
    currentTab !== "all" ||
    currentSort !== "newest"
  );

  const getPlatformBadge = (code?: string, name?: string) => {
    const c = (code || name || "").toUpperCase();
    if (c.includes("SHOPEE")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1ED] text-[#EE4D2D] border border-orange-200 text-[10.5px] font-black">
          <ShopeeIcon size={13} />
          Shopee
        </span>
      );
    }
    if (c.includes("TIKTOK")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[10.5px] font-black shadow-2xs">
          <TiktokIcon size={12} />
          TikTok Shop
        </span>
      );
    }
    if (c.includes("LAZADA")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-black">
          <LazadaIcon size={13} />
          Lazada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-black">
        {name || "Sàn TMĐT"}
      </span>
    );
  };

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
      {/* ── HEADER TOOLBAR (ĐỒNG BỘ VỚI TRANG TẠO LINK AFF NHANH) ── */}
      <div className="p-5 sm:p-6 border-b border-neutral-100 bg-gradient-to-r from-neutral-50/90 via-rose-50/20 to-neutral-50/60 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <History size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                  Lịch Sử Link Affiliate Đã Tạo
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Tổng cộng <span className="font-bold text-neutral-800">{counts.all}</span> link • Tích luỹ{" "}
                <span className="font-extrabold text-rose-600">{totalClicks.toLocaleString()}</span> lượt click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chuyển đổi hiển thị Thẻ / Bảng */}
            <div className="flex items-center p-0.5 rounded-xl bg-neutral-100 border border-neutral-200/80">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "card"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Giao diện thẻ (Card view)"
              >
                <LayoutList size={13} />
                <span>Thẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Giao diện bảng (Table view)"
              >
                <TableIcon size={13} />
                <span>Bảng</span>
              </button>
            </div>

            <span className="text-xs text-neutral-500 font-semibold hidden md:inline ml-1">Hiển thị:</span>
            <CustomSelect
              value={String(pageSize)}
              onChange={handlePageSizeChange}
              options={[
                { value: "5", label: "5 link/trang" },
                { value: "10", label: "10 link/trang" },
                { value: "20", label: "20 link/trang" },
                { value: "50", label: "50 link/trang" },
              ]}
              className="w-[125px]"
              buttonClassName="h-9 text-xs font-bold text-neutral-700"
              ariaLabel="Hiển thị mỗi trang"
            />
          </div>
        </div>

        {/* ── SEARCH & CONTROLS BAR ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Ô Tìm Kiếm */}
          <div className="md:col-span-6 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng, mã KH, sản phẩm, tracking code, short code..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleSearch(e.target.value);
              }}
              className="h-10 w-full rounded-2xl bg-white pl-10 pr-9 text-xs font-medium border border-neutral-200/90 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none transition-all shadow-2xs placeholder:text-neutral-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 h-5 w-5 rounded-full flex items-center justify-center bg-neutral-100 text-xs"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sắp xếp */}
          <div className="md:col-span-3">
            <CustomSelect
              value={currentSort}
              onChange={handleSortChange}
              icon={<ArrowUpDown size={13} className="text-neutral-400" />}
              options={[
                { value: "newest", label: "Mới nhất trước" },
                { value: "oldest", label: "Cũ nhất trước" },
                { value: "clicks", label: "Lượt click cao nhất" },
                { value: "name_asc", label: "Tên khách hàng (A-Z)" },
                { value: "product_asc", label: "Tên sản phẩm (A-Z)" },
              ]}
              className="w-full"
              buttonClassName="h-10 text-xs font-bold text-neutral-700"
              ariaLabel="Sắp xếp"
            />
          </div>

          {/* Lọc Trạng Thái */}
          <div className="md:col-span-3">
            <CustomSelect
              value={currentTab}
              onChange={handleTabChange}
              options={[
                { value: "all", label: `Tất cả trạng thái (${counts.all})` },
                { value: "active", label: `Đang hoạt động (${counts.active})` },
                { value: "stopped", label: `Đã dừng (${counts.stopped})` },
              ]}
              className="w-full"
              buttonClassName="h-10 text-xs font-bold text-neutral-700"
              ariaLabel="Lọc trạng thái"
            />
          </div>
        </div>

        {/* ── TABS SÀN TMĐT ── */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1">
          {[
            { id: "ALL", label: "Tất cả sàn", count: platformCounts?.all ?? counts.all },
            {
              id: "SHOPEE",
              label: "Shopee",
              count: platformCounts?.shopee ?? 0,
              icon: <ShopeeIcon size={14} />,
            },
            {
              id: "TIKTOK",
              label: "TikTok Shop",
              count: platformCounts?.tiktok ?? 0,
              icon: <TiktokIcon size={13} />,
            },
            {
              id: "LAZADA",
              label: "Lazada",
              count: platformCounts?.lazada ?? 0,
              icon: <LazadaIcon size={14} />,
            },
          ].map((tab) => {
            const isActive = currentPlatform === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePlatformChange(tab.id)}
                className={`flex h-8 items-center gap-1.5 px-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs scale-[1.02]"
                    : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 whitespace-nowrap shrink-0 hover:underline px-2 cursor-pointer"
            >
              <X size={13} /> Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── NỘI DUNG DANH SÁCH ── */}
      <div className={isPending ? "opacity-60 transition-opacity pointer-events-none" : "transition-opacity"}>
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <img
              src="/meow-back-mascot.png"
              alt="MeowBack"
              className="h-16 w-16 object-contain opacity-80"
            />
            <div>
              <p className="text-sm font-extrabold text-neutral-800">
                Không tìm thấy link nào phù hợp với bộ lọc
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Thử tìm kiếm với từ khóa khác hoặc bấm đặt lại bộ lọc.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 text-xs font-extrabold text-white bg-neutral-900 px-4 py-2 rounded-xl shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "card" ? (
          /* ── GIAO DIỆN THẺ (CARD VIEW - CHUẨN NHƯ TRANG TẠO LINK AFF NHANH) ── */
          <div className="divide-y divide-neutral-100">
            {links.map((link) => {
              const shortUrl = link.shortUrl || link.shortCode;
              const fullTargetUrl = link.shortUrl || link.affiliateUrl || "#";
              const isSystem =
                link.customerCode?.toUpperCase() === "SYSTEM" ||
                link.customerName.toLowerCase().includes("hệ thống") ||
                link.customerName.toLowerCase().includes("công khai");

              return (
                <div
                  key={link.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-rose-50/20 transition-colors group"
                >
                  {/* Khối Trái: Thumbnail & Tiêu đề & Khách hàng */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:border-rose-300 transition-colors">
                      {link.productImage ? (
                        <img
                          src={link.productImage}
                          alt={link.productTitle || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-rose-500">
                          <Link2 size={20} />
                        </div>
                      )}
                    </div>

                    {/* Thông tin chính */}
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      {/* Người sở hữu & Sàn & Trạng thái */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPlatformBadge(link.platformCode, link.platformName)}

                        <span className="text-xs font-black text-neutral-900">
                          {link.customerName}
                        </span>

                        {link.customerCode && (
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isSystem
                                ? "bg-amber-100 text-amber-900 font-black"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {link.customerCode}
                          </span>
                        )}

                        <span className="text-neutral-300 text-xs">•</span>
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {formatDate(link.createdAt)}
                        </span>

                        {/* Tag Trạng thái */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            link.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              link.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          {link.status === "active" ? "Hoạt động" : "Dừng"}
                        </span>
                      </div>

                      {/* Tiêu đề sản phẩm (nếu có) */}
                      {link.productTitle && (
                        <p
                          className="text-xs font-semibold text-neutral-700 truncate max-w-xl"
                          title={link.productTitle}
                        >
                          {link.productTitle}
                        </p>
                      )}

                      {/* Short URL & Tracking code & Kênh */}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {shortUrl && (
                          <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded-lg border border-rose-200/60 truncate max-w-sm">
                            {shortUrl}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-neutral-400 font-medium">
                          ({link.trackingCode})
                        </span>
                        {link.channelSource && (
                          <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                            {link.channelSource}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Khối Phải: Traffic Clicks & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    {/* Số lượt click */}
                    <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-xl border border-neutral-200/70">
                      <MousePointerClick size={13} className="text-neutral-500" />
                      <span className="text-xs font-black text-neutral-800 tabular-nums">
                        {link.clicks || 0}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400">clicks</span>
                    </div>

                    {/* Nút Copy */}
                    {shortUrl && <CopyBtn text={shortUrl} label="Copy Link" />}

                    {/* Nút mở link */}
                    <a
                      href={fullTargetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-600 transition-colors shadow-2xs cursor-pointer"
                      title="Mở link thử nghiệm"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── GIAO DIỆN BẢNG (TABLE VIEW CẢI TIẾN) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70">
                  <th className="px-5 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px]">Sản phẩm</th>
                  <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px]">Khách hàng</th>
                  <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px]">Short link & Tracking</th>
                  <th className="px-3 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px] text-center">Lượt click</th>
                  <th className="px-3 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px] text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-extrabold uppercase tracking-wider text-neutral-400 text-[10.5px] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {links.map((link) => {
                  const shortUrl = link.shortUrl || link.shortCode;
                  const fullTargetUrl = link.shortUrl || link.affiliateUrl || "#";
                  return (
                    <tr key={link.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 max-w-[280px]">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                            {link.productImage ? (
                              <img src={link.productImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Link2 size={16} className="text-rose-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-neutral-900 truncate text-xs" title={link.productTitle || ""}>
                              {link.productTitle || `Sản phẩm ${link.platformName}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getPlatformBadge(link.platformCode, link.platformName)}
                              <span className="text-[10px] text-neutral-400">{formatDate(link.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-neutral-900 text-xs">{link.customerName}</div>
                        {link.customerCode && (
                          <div className="font-mono text-[10px] text-neutral-400">{link.customerCode}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {shortUrl && (
                          <div className="font-mono text-xs font-bold text-rose-600 truncate max-w-[220px]">
                            {shortUrl}
                          </div>
                        )}
                        <div className="font-mono text-[10px] text-neutral-400 mt-0.5 truncate max-w-[220px]">
                          {link.trackingCode}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-200/80 font-black text-xs text-neutral-800">
                          <MousePointerClick size={11} className="text-neutral-400" />
                          {link.clicks || 0}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            link.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              link.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          {link.status === "active" ? "Hoạt động" : "Dừng"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {shortUrl && <CopyBtn text={shortUrl} label="Copy" />}
                          <a
                            href={fullTargetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-600 transition-colors"
                            title="Mở link"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FOOTER PHÂN TRANG (ĐỒNG BỘ VỚI TRANG TẠO LINK AFF NHANH) ── */}
      {totalItems > 0 && (
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 font-medium">
            Hiển thị <span className="font-bold text-neutral-800">{(currentPage - 1) * pageSize + 1}</span> -{" "}
            <span className="font-bold text-neutral-800">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            trong tổng số <span className="font-bold text-neutral-800">{totalItems}</span> link
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
