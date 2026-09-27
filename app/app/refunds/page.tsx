import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { RefundHistoryClient } from "@/components/customer/RefundHistoryClient";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { AlertTriangle } from "lucide-react";

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
      {/* ── HEADER CARD (Đơn giản, không background rườm rà, nút Lưu ý màu hồng nổi bật) ── */}
      <div className="relative rounded-3xl border border-primary-100/90 shadow-sm sm:shadow-md bg-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <FloatingElement duration={4}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0 border border-white/60 overflow-hidden p-1">
                <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="w-full h-full object-contain rounded-xl" />
              </div>
            </FloatingElement>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight whitespace-nowrap">
                Tạo link hoàn tiền
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
                Chọn sàn và dán link sản phẩm để lấy hoàn tiền
              </p>
            </div>
          </div>

          {/* Nút 6 Lưu ý quan trọng - Màu hồng nổi bật thu hút sự chú ý */}
          <Link
            href="/app/guide#luu-y"
            className="group relative flex items-center justify-center gap-2.5 shrink-0 rounded-2xl bg-gradient-to-r from-primary-500 via-pink-500 to-primary-500 hover:from-primary-600 hover:to-pink-600 px-5 py-3 text-[13px] sm:text-sm font-extrabold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/35 active:scale-[0.98]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs">
              <AlertTriangle size={14} strokeWidth={2.6} />
            </span>
            <span>6 Lưu ý quan trọng</span>
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              Đọc ngay ⚡
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </Link>
        </div>
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
