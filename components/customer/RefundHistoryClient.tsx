"use client";

import { useState } from "react";
import { Store, ShoppingBag, Music2, Copy, ExternalLink, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { useModal } from "@/components/ui/ModalProvider";

const PLATFORM_STYLE: Record<string, { icon: typeof ShoppingBag; color: string }> = {
  SHOPEE: { icon: ShoppingBag, color: "#ee4d2d" },
  TIKTOK: { icon: Music2, color: "#000000" },
  LAZADA: { icon: Store, color: "#0f146d" },
  TIKI: { icon: Store, color: "#1a73e8" },
};

type LinkItem = {
  id: string;
  createdAt: string;
  shortCode: string;
  shortUrl: string | null;
  productTitle: string | null;
  productImage: string | null;
  isFavorite: boolean;
  platform: { code: string; name: string };
};

function ProductThumb({ image, color, Icon }: { image: string | null; color: string; Icon: typeof ShoppingBag }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <img
        src={image}
        alt=""
        onError={() => setBroken(true)}
        className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      style={{ color, backgroundColor: `${color}15` }}
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}

function FavoriteButton({ linkId, isFavorite }: { linkId: string; isFavorite: boolean }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    const next = !favorite;
    setFavorite(next); // optimistic
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setFavorite(!next); // rollback nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={favorite ? "Bỏ yêu thích" : "Đánh dấu yêu thích"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
        favorite ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
      }`}
    >
      <Star size={16} strokeWidth={2.25} fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}

export function RefundHistoryClient({
  links,
  totalPages,
  currentPage,
  totalCount,
  counts,
}: {
  links: LinkItem[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  counts: { all: number; favorite: number };
}) {
  const modal = useModal();
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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    modal.alert({
      title: "Thành công",
      message: "Đã copy link: " + url,
      iconType: "success"
    });
  };

  return (
    <div className="rounded-2xl bg-white p-xl shadow-sm ring-1 ring-black/5">
      <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
        <h2 className="text-[16px] font-bold text-gray-900">Lịch sử tạo link</h2>
        <span className="text-[13px] font-medium text-gray-400">{totalCount} link</span>
      </div>

      <div className="mb-md flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`flex h-8 items-center gap-xs rounded-full px-md text-[12px] font-bold transition-colors ${
              currentTab === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Tất cả
            <span className={`rounded-full px-[6px] text-[11px] ${currentTab === "all" ? "bg-white/20" : "bg-white text-gray-400"}`}>
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("favorite")}
            className={`flex h-8 items-center gap-xs rounded-full px-md text-[12px] font-bold transition-colors ${
              currentTab === "favorite" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
            }`}
          >
            <Star size={12} strokeWidth={2.5} fill="currentColor" />
            Yêu thích
            <span className={`rounded-full px-[6px] text-[11px] ${currentTab === "favorite" ? "bg-white/20" : "bg-white text-amber-500"}`}>
              {counts.favorite}
            </span>
          </button>
        </div>
        <ServerSearchInput placeholder="Tìm kiếm theo mã link (shortCode)..." className="sm:max-w-[240px]" />
      </div>

      {currentTab === "favorite" && counts.favorite === 0 && links.length === 0 && (
        <div className="mb-md rounded-xl bg-amber-50 border border-amber-100 px-lg py-md text-[13px] text-amber-700">
          Bấm biểu tượng <Star size={12} className="inline -mt-[2px]" fill="currentColor" /> trên mỗi link để lưu lại — tiện cho các link chưa có ảnh sản phẩm, tránh bị lẫn khi danh sách dài ra.
        </div>
      )}

      {links.length === 0 ? (
        <div className="flex flex-col items-center py-xl text-center">
          <span className="text-[40px] opacity-50 mb-sm">🛒</span>
          <div className="text-[14px] font-semibold text-gray-700">
            {currentTab === "favorite" ? "Chưa có link yêu thích nào" : "Không tìm thấy link nào"}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {links.map((l) => {
            const pStyle = PLATFORM_STYLE[l.platform.code.toUpperCase()] ?? { icon: Store, color: "#454745" };
            const Icon = pStyle.icon;

            return (
              <div key={l.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-2xl border border-gray-100 p-md transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                <div className="flex flex-1 items-center gap-md min-w-0">
                  <ProductThumb image={l.productImage} color={pStyle.color} Icon={Icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider" style={{ color: pStyle.color }}>
                      {l.platform.name}
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400 font-medium normal-case tracking-normal">{l.createdAt}</span>
                    </div>
                    <p className="mt-[2px] truncate text-[14px] font-bold text-gray-900">
                      {l.productTitle ?? `Sản phẩm từ ${l.platform.name} (${l.shortCode})`}
                    </p>
                    <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer" className="mt-[2px] block truncate text-[12px] font-medium text-gray-400 transition-colors hover:text-[#e86a33]">
                      {l.shortUrl}
                    </a>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-sm mt-sm sm:mt-0">
                  <FavoriteButton linkId={l.id} isFavorite={l.isFavorite} />
                  <button
                    onClick={() => handleCopy(l.shortUrl ?? "")}
                    className="flex h-9 items-center gap-xs rounded-lg bg-gray-100 px-sm text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  >
                    <Copy size={14} strokeWidth={2.5} />
                    <span className="inline">Copy</span>
                  </button>
                  <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer">
                    <button className="flex h-9 items-center gap-xs rounded-lg bg-[#2bc48a] px-sm text-[13px] font-bold text-white transition-colors hover:bg-[#25ad7a] hover:shadow-md hover:shadow-[#2bc48a]/20">
                      <ExternalLink size={14} strokeWidth={2.5} />
                      <span className="inline">Mở</span>
                    </button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-md border-t border-gray-100 pt-md">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
