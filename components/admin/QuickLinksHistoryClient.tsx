"use client";

import { useState, useMemo } from "react";
import {
  History,
  Search,
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Sparkles,
  Link2,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatDate } from "@/lib/format";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";

export type TrackingLinkItem = {
  id: string;
  trackingCode: string;
  shortCode: string | null;
  shortUrl: string | null;
  affiliateUrl: string;
  originalUrl: string;
  productTitle: string | null;
  productImage: string | null;
  clicks: number;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    customerCode: string;
  };
  platform: {
    id: string;
    name: string;
    code: string;
  };
};

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
          <span className="text-[11px]">{label || "Copy"}</span>
        </>
      )}
    </button>
  );
}

export function QuickLinksHistoryClient({
  initialLinks,
}: {
  initialLinks: TrackingLinkItem[];
}) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "CUSTOMER" | "SYSTEM">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "clicks" | "name_asc" | "product_asc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Thống kê đếm theo sàn
  const countsByPlatform = useMemo(() => {
    const map: Record<string, number> = { ALL: initialLinks.length };
    for (const l of initialLinks) {
      const code = l.platform.code.toUpperCase();
      map[code] = (map[code] || 0) + 1;
    }
    return map;
  }, [initialLinks]);

  const totalClicksAll = useMemo(() => {
    return initialLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
  }, [initialLinks]);

  // Lọc và Sắp xếp
  const filteredAndSortedLinks = useMemo(() => {
    let result = [...initialLinks];

    // Tìm kiếm
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((l) => {
        return (
          l.customer.fullName.toLowerCase().includes(q) ||
          l.customer.customerCode.toLowerCase().includes(q) ||
          (l.productTitle && l.productTitle.toLowerCase().includes(q)) ||
          (l.shortCode && l.shortCode.toLowerCase().includes(q)) ||
          (l.shortUrl && l.shortUrl.toLowerCase().includes(q)) ||
          l.trackingCode.toLowerCase().includes(q)
        );
      });
    }

    // Lọc theo sàn
    if (platformFilter !== "ALL") {
      result = result.filter((l) => l.platform.code.toUpperCase() === platformFilter);
    }

    // Lọc theo người sở hữu
    if (ownerFilter === "SYSTEM") {
      result = result.filter(
        (l) => l.customer.customerCode.toUpperCase() === "SYSTEM" || l.customer.fullName.toLowerCase().includes("hệ thống") || l.customer.fullName.toLowerCase().includes("công khai")
      );
    } else if (ownerFilter === "CUSTOMER") {
      result = result.filter(
        (l) => l.customer.customerCode.toUpperCase() !== "SYSTEM" && !l.customer.fullName.toLowerCase().includes("hệ thống") && !l.customer.fullName.toLowerCase().includes("công khai")
      );
    }

    // Sắp xếp
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "clicks":
          return (b.clicks || 0) - (a.clicks || 0);
        case "name_asc":
          return a.customer.fullName.localeCompare(b.customer.fullName);
        case "product_asc":
          return (a.productTitle || "").localeCompare(b.productTitle || "");
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [initialLinks, search, platformFilter, ownerFilter, sortBy]);

  // Phân trang
  const totalPages = Math.ceil(filteredAndSortedLinks.length / pageSize) || 1;
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedLinks.slice(start, start + pageSize);
  }, [filteredAndSortedLinks, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearch("");
    setPlatformFilter("ALL");
    setOwnerFilter("ALL");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const getPlatformBadge = (code: string, name: string) => {
    const c = code.toUpperCase();
    if (c === "SHOPEE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF1ED] text-[#EE4D2D] border border-orange-200 text-[10.5px] font-black">
          <ShopeeIcon size={13} />
          Shopee
        </span>
      );
    }
    if (c === "TIKTOK") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[10.5px] font-black shadow-2xs">
          <TiktokIcon size={12} />
          TikTok Shop
        </span>
      );
    }
    if (c === "LAZADA") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-black">
          <LazadaIcon size={13} />
          Lazada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-black">
        {name}
      </span>
    );
  };

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
      {/* ── HEADER TOOLBAR ── */}
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
                Tổng cộng <span className="font-bold text-neutral-800">{initialLinks.length}</span> link • Tích luỹ{" "}
                <span className="font-extrabold text-rose-600">{totalClicksAll.toLocaleString()}</span> lượt click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-semibold hidden md:inline">Hiển thị:</span>
            <CustomSelect
              value={String(pageSize)}
              onChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: "5", label: "5 link/trang" },
                { value: "10", label: "10 link/trang" },
                { value: "20", label: "20 link/trang" },
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
              placeholder="Tìm theo tên khách hàng, mã KH, sản phẩm, mã short..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-2xl bg-white pl-10 pr-9 text-xs font-medium border border-neutral-200/90 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:outline-none transition-all shadow-2xs placeholder:text-neutral-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 h-5 w-5 rounded-full flex items-center justify-center bg-neutral-100 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sắp xếp */}
          <div className="md:col-span-3">
            <CustomSelect
              value={sortBy}
              onChange={(val) => {
                setSortBy(val as any);
                setCurrentPage(1);
              }}
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

          {/* Lọc Người Sở Hữu */}
          <div className="md:col-span-3">
            <CustomSelect
              value={ownerFilter}
              onChange={(val) => {
                setOwnerFilter(val as any);
                setCurrentPage(1);
              }}
              options={[
                { value: "ALL", label: "Tất cả người tạo" },
                { value: "CUSTOMER", label: "Chỉ khách hàng cá nhân" },
                { value: "SYSTEM", label: "Chỉ link chia sẻ công khai" },
              ]}
              className="w-full"
              buttonClassName="h-10 text-xs font-bold text-neutral-700"
              ariaLabel="Lọc người sở hữu"
            />
          </div>
        </div>

        {/* ── TABS SÀN TMĐT ── */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1">
          {[
            { id: "ALL", label: "Tất cả sàn", count: countsByPlatform["ALL"] || 0 },
            { id: "SHOPEE", label: "Shopee", count: countsByPlatform["SHOPEE"] || 0, icon: <ShopeeIcon size={14} /> },
            { id: "TIKTOK", label: "TikTok Shop", count: countsByPlatform["TIKTOK"] || 0, icon: <TiktokIcon size={13} /> },
            { id: "LAZADA", label: "Lazada", count: countsByPlatform["LAZADA"] || 0, icon: <LazadaIcon size={14} /> },
          ].map((tab) => {
            const isActive = platformFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPlatformFilter(tab.id);
                  setCurrentPage(1);
                }}
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

          {(search || platformFilter !== "ALL" || ownerFilter !== "ALL" || sortBy !== "newest") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 whitespace-nowrap shrink-0 hover:underline px-2"
            >
              <X size={13} /> Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── BẢNG DANH SÁCH LINK CHI TIẾT ── */}
      {filteredAndSortedLinks.length === 0 ? (
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
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 text-xs font-extrabold text-white bg-neutral-900 px-4 py-2 rounded-xl shadow-xs hover:bg-neutral-800 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {paginatedLinks.map((link) => {
            const shortUrl = link.shortUrl || link.shortCode;
            const fullTargetUrl = link.shortUrl || link.affiliateUrl;
            const isSystem =
              link.customer.customerCode.toUpperCase() === "SYSTEM" ||
              link.customer.fullName.toLowerCase().includes("hệ thống") ||
              link.customer.fullName.toLowerCase().includes("công khai");

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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-rose-500">
                        <Link2 size={20} />
                      </div>
                    )}
                  </div>

                  {/* Thông tin chính */}
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    {/* Người sở hữu & Sàn */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPlatformBadge(link.platform.code, link.platform.name)}

                      <span className="text-xs font-black text-neutral-900">
                        {link.customer.fullName}
                      </span>

                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSystem
                            ? "bg-amber-100 text-amber-900 font-black"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {link.customer.customerCode}
                      </span>

                      <span className="text-neutral-300 text-xs">•</span>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {formatDate(new Date(link.createdAt))}
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

                    {/* Short URL & Tracking code */}
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50/80 px-2 py-0.5 rounded-lg border border-rose-200/60 truncate max-w-sm">
                        {shortUrl}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400 font-medium">
                        ({link.trackingCode})
                      </span>
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
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-600 transition-colors shadow-2xs"
                    title="Mở link thử nghiệm"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FOOTER PHÂN TRANG ── */}
      {filteredAndSortedLinks.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 font-medium">
            Hiển thị <span className="font-bold text-neutral-800">{(currentPage - 1) * pageSize + 1}</span> -{" "}
            <span className="font-bold text-neutral-800">
              {Math.min(currentPage * pageSize, filteredAndSortedLinks.length)}
            </span>{" "}
            trong tổng số <span className="font-bold text-neutral-800">{filteredAndSortedLinks.length}</span> link
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
}
