"use client";

import { useState } from "react";
import { Link2, MousePointerClick } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LinkRow = {
  id: string;
  createdAt: Date;
  customerName: string;
  platformName: string;
  trackingCode: string;
  shortCode: string | null;
  channelSource: string;
  clicks: number;
  status: string;
  productTitle: string | null;
  productImage: string | null;
};

function ProductThumb({ image }: { image: string | null }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <img
        src={image}
        alt=""
        onError={() => setBroken(true)}
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-ink/10"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-pale text-primary">
      <Link2 size={16} strokeWidth={2} />
    </div>
  );
}

interface AdminLinksClientProps {
  links: LinkRow[];
  totalPages: number;
  currentPage: number;
  counts: {
    all: number;
    active: number;
    stopped: number;
  };
  totalClicks: number;
}

export function AdminLinksClient({ links, totalPages, currentPage, counts, totalClicks }: AdminLinksClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-lg fade-in pb-2xl">
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ServerSearchInput placeholder="Tìm tên khách, tracking code hoặc short code..." />
        </div>
      </div>

      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} />
        <TabButton active={currentTab === "active"} onClick={() => handleTabChange("active")} label="Hoạt động" count={counts.active} />
        <TabButton active={currentTab === "stopped"} onClick={() => handleTabChange("stopped")} label="Dừng" count={counts.stopped} />
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Không tìm thấy link nào"
          description="Thử đổi từ khoá tìm kiếm hoặc bộ lọc khác."
        />
      ) : (
        <div className="rounded-3xl bg-canvas p-0 shadow-sm ring-1 ring-ink/5 overflow-hidden flex flex-col gap-0 w-full max-w-[100vw]">
          {/* Summary Header */}
          <div className="bg-gradient-to-r from-canvas-soft to-canvas-soft/50 border-b border-ink/5 p-lg grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-mute uppercase tracking-wider mb-1">Tổng link</span>
              <span className="text-[20px] font-bold text-ink leading-none">{counts.all}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">Đang hoạt động</span>
              <span className="text-[20px] font-bold text-primary leading-none">{counts.active}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-mute uppercase tracking-wider mb-1 flex items-center gap-1">
                <MousePointerClick size={12} /> Tổng lượt click
              </span>
              <span className="text-[20px] font-bold text-ink leading-none">{totalClicks}</span>
            </div>
          </div>

          <div className="responsive-table overflow-x-auto">
            <table className="w-full text-left text-[13px] min-w-[800px]">
              <thead>
                <tr className="border-b border-ink/5 bg-canvas-soft/60">
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Sản phẩm</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Thời gian</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Khách hàng</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Tracking / Short code</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Kênh</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-primary text-[11px] text-right">Lượt click</th>
                  <th className="px-md py-sm font-bold uppercase tracking-wider text-mute text-[11px]">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id} className="border-b border-ink/5 hover:bg-primary/5 transition-colors">
                    <td className="px-md py-sm" data-label="Sản phẩm">
                      <div className="flex items-center gap-sm min-w-[220px]">
                        <ProductThumb image={l.productImage} />
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[13px] font-bold text-ink">
                            {l.productTitle ?? `Sản phẩm ${l.platformName}`}
                          </p>
                          <span className="rounded-md bg-canvas-soft px-sm py-[1px] text-[11px] font-medium text-body">
                            {l.platformName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-sm text-mute text-[13px]" data-label="Thời gian">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-md py-sm font-bold text-ink" data-label="Khách hàng">
                      {l.customerName}
                    </td>
                    <td className="px-md py-sm" data-label="Tracking / Short code">
                      <div className="font-mono text-[12px] text-ink">{l.trackingCode}</div>
                      <div className="font-mono text-[11px] text-mute mt-[2px]">{l.shortCode ?? "—"}</div>
                    </td>
                    <td className="px-md py-sm text-mute" data-label="Kênh">
                      {l.channelSource}
                    </td>
                    <td className="px-md py-sm text-right font-bold text-primary" data-label="Lượt click">
                      {l.clicks}
                    </td>
                    <td className="px-md py-sm" data-label="Trạng thái">
                      <Badge tone={l.status === "active" ? "positive" : "neutral"} dot>
                        {l.status === "active" ? "Hoạt động" : "Dừng"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
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
          ? "border-2 border-ink bg-canvas text-ink shadow-sm"
          : "border-2 border-transparent bg-canvas text-mute shadow-sm ring-1 ring-ink/5 hover:bg-canvas-soft hover:text-ink"
      }`}
    >
      {label}
      <span
        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
          active ? "bg-canvas-soft text-ink" : "bg-canvas-soft text-mute"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
