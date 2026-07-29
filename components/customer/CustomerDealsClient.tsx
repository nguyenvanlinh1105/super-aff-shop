"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, CalendarOff, TicketPercent } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

type Deal = {
  id: string;
  title: string;
  benefitText: string | null;
  productImage: string | null;
  platformName: string;
  endsAt: Date | null;
  link: string | null;
};

export function CustomerDealsClient({ deals }: { deals: Deal[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLink(id: string, link: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
  }

  if (deals.length === 0) {
    return (
      <EmptyState
        icon={TicketPercent}
        title="Chưa có ưu đãi nào"
        description="Quay lại sau, hệ thống liên tục cập nhật deal mới."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex h-40 items-center justify-center bg-gray-50">
            {deal.productImage ? (
              <img src={deal.productImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <TicketPercent size={40} className="text-gray-300" />
            )}
          </div>

          <div className="flex flex-1 flex-col p-lg">
            <span className="mb-sm inline-block w-fit rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              {deal.platformName}
            </span>
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-2">{deal.title}</h3>
            {deal.benefitText && (
              <p className="mt-xs text-[13px] text-gray-500 line-clamp-2">{deal.benefitText}</p>
            )}

            <div className="mt-md flex items-center gap-xs text-gray-400">
              <CalendarOff size={13} />
              <span className="text-[11px] font-medium">
                {deal.endsAt ? formatDate(deal.endsAt) : "Số lượng có hạn"}
              </span>
            </div>

            <div className="mt-lg flex gap-sm">
              {deal.link ? (
                <>
                  <a
                    href={deal.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 flex-1 items-center justify-center gap-xs rounded-xl bg-[#e86a33] text-[13px] font-bold text-white hover:bg-[#d65d2a] transition-colors"
                  >
                    <ExternalLink size={14} />
                    Mua ngay
                  </a>
                  <button
                    onClick={() => copyLink(deal.id, deal.link!)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    title="Copy link"
                  >
                    {copiedId === deal.id ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </>
              ) : (
                <span className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-100 text-[13px] font-medium text-gray-400">
                  Link chưa sẵn sàng
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
