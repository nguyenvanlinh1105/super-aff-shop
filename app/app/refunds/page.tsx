import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { CustomerLinkForm } from "@/components/customer/CustomerLinkForm";
import { RefundHistoryClient } from "@/components/customer/RefundHistoryClient";
import { versionedAsset } from "@/lib/versionedAsset";

export default async function CustomerRefundsPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const where: any = { customerId: session.customerId };
  if (q) {
    where.shortCode = { contains: q };
  }
  if (tab === "favorite") {
    where.isFavorite = true;
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
    <div className="mx-auto flex max-w-4xl flex-col gap-xl fade-in pb-2xl">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-lg sm:p-2xl flex items-center justify-between gap-md">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#fff0e6] to-transparent opacity-60" />
        
        <div className="relative z-10">
          <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-900">
            Tạo link hoàn tiền
          </h1>
          <p className="mt-xs text-[15px] text-gray-500 font-medium">
            Chọn sàn và dán link sản phẩm để lấy hoàn tiền
          </p>
        </div>

        {/* Mascot / Icon Placeholder */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-cute p-1 shrink-0">
          <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="h-full w-full object-cover rounded-xl" />
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
