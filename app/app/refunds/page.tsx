import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { RefundHistoryClient } from "@/components/customer/RefundHistoryClient";
import { versionedAsset } from "@/lib/versionedAsset";
import { FloatingElement } from "@/components/ui/FloatingElement";

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
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/deals-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <FloatingElement duration={4}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="w-full h-full object-contain rounded-2xl" />
              </div>
            </FloatingElement>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Tạo link hoàn tiền
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Chọn sàn và dán link sản phẩm để lấy hoàn tiền
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM: CHỌN NỀN TẢNG & TẠO LINK */}
      <CustomerLinkForm platforms={platforms.map((p) => ({ id: p.id, code: p.code, label: p.name }))} />

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
