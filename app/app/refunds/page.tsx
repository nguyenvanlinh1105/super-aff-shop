import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { RefundHistoryClient } from "@/components/customer/RefundHistoryClient";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { Sparkles, ChevronRight, Lightbulb } from "lucide-react";

export default async function CustomerRefundsPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string; period?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";
  const period = searchParams.period || "all";

  const where: any = { customerId: session.customerId };
  if (q) {
    where.OR = [
      { shortCode: { contains: q } },
      { productTitle: { contains: q } }
    ];
  }
  if (tab === "favorite") {
    where.isFavorite = true;
  }
  if (period !== "all") {
    const now = new Date();
    if (period === "today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfToday };
    } else if (period === "last_7_days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (period === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: firstDay };
    } else if (period === "last_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      where.createdAt = { gte: firstDay, lte: lastDay };
    }
  }

  const [platforms, links, totalCount, allCount, favoriteCount] = await Promise.all([
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { platform: true },
      skip,
      take: limit,
    }),
    prisma.trackingLink.count({ where }),
    prisma.trackingLink.count({ where: { customerId: session.customerId } }),
    prisma.trackingLink.count({ where: { customerId: session.customerId, isFavorite: true } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Đảm bảo Shopee luôn đứng đầu
  const sortedPlatforms = [...platforms].sort((a, b) => {
    if (a.code === "SHOPEE") return -1;
    if (b.code === "SHOPEE") return 1;
    return a.name.localeCompare(b.name);
  });

  const formattedLinks = links.map(l => ({
    id: l.id,
    createdAt: formatDate(l.createdAt),
    shortCode: l.shortCode || "",
    shortUrl: l.shortUrl,
    productTitle: l.productTitle,
    productImage: l.productImage,
    isFavorite: l.isFavorite,
    platform: { code: l.platform.code, name: l.platform.name },
  }));

  return (
    <div className="flex w-full flex-col gap-xl fade-in pb-2xl">
      {/* ── HEADER CARD (Thiết kế thanh lịch, gọn gàng, chuẩn responsive mobile) ── */}
      <div className="relative rounded-3xl border border-rose-100/80 bg-white p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Khối tiêu đề + Icon */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-sm shadow-rose-500/20 shrink-0">
              <Sparkles size={22} className="text-white fill-white/30" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                Tạo link hoàn tiền
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 font-medium">
                Kích hoạt hoàn tiền tự động khi mua sắm
              </p>
            </div>
          </div>

          {/* Nút lưu ý nhỏ gọn trên desktop */}
          <Link
            href="/app/guide#luu-y"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 text-xs font-bold transition-all shadow-2xs shrink-0 group"
          >
            <Lightbulb size={14} className="text-amber-600" />
            <span>6 Lưu ý quan trọng</span>
            <ChevronRight size={13} className="text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Smart Tip Bar: Đẹp, thanh lịch, chuẩn mobile, không bao giờ bị gãy dòng */}
        <Link
          href="/app/guide#luu-y"
          className="group flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border border-amber-200/70 hover:border-amber-300 shadow-2xs transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-700">
              <Lightbulb size={12} className="stroke-[2.5]" />
            </span>
            <p className="text-[11.5px] sm:text-xs text-neutral-700 font-medium truncate">
              <strong className="font-bold text-amber-950">Mẹo:</strong> 6 lưu ý để không bị huỷ hoàn tiền
            </p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-bold text-amber-900 shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>Đọc ngay</span>
            <ChevronRight size={12} strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      {/* FORM: CHỌN NỀN TẢNG & TẠO LINK */}
      <CustomerLinkForm platforms={sortedPlatforms.map((p) => ({ id: p.id, code: p.code, label: p.name }))} />

      {/* HISTORY CARD */}
      <RefundHistoryClient
        links={formattedLinks}
        totalPages={totalPages}
        currentPage={page}
        totalCount={totalCount}
        counts={{ all: allCount, favorite: favoriteCount }}
      />
    </div>
  );
}
