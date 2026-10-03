import { prisma } from "@/lib/prisma";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { QuickLinksHistoryClient } from "@/components/admin/QuickLinksHistoryClient";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminQuickLinkPage() {
  const [customers, platforms, recentLinks] = await Promise.all([
    prisma.customer.findMany({
      where: { status: "active" },
      orderBy: { fullName: "asc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        customer: { select: { id: true, fullName: true, customerCode: true } },
        platform: { select: { id: true, name: true, code: true } },
      },
    }),
  ]);

  const mappedLinks = recentLinks.map((l) => ({
    id: l.id,
    trackingCode: l.trackingCode,
    shortCode: l.shortCode,
    shortUrl: l.shortUrl,
    affiliateUrl: l.affiliateUrl,
    originalUrl: l.originalUrl,
    productTitle: l.productTitle,
    productImage: l.productImage,
    clicks: l.clicks,
    createdAt: l.createdAt.toISOString(),
    customer: {
      id: l.customer.id,
      fullName: l.customer.fullName,
      customerCode: l.customer.customerCode,
    },
    platform: {
      id: l.platform.id,
      name: l.platform.name,
      code: l.platform.code,
    },
  }));

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">

      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-xl shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-amber-100/50 to-rose-100/30 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0 border border-white/50 overflow-hidden p-1">
              <img src="/meow-back-quick-link.png" alt="MeowBack Quick Link" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200/80 text-[11px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-2">
                <Zap size={13} className="text-amber-500 fill-amber-500" />
                MeowBack Link Engine
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Tạo Link Affiliate Siêu Tốc ⚡
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Khởi tạo Short Link rút gọn có chứa mã tracking tự động cho khách hàng chỉ trong 3 giây.
              </p>
            </div>
          </div>

          <Link href="/admin/links">
            <button className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200/80 px-4 py-3 text-xs font-black text-neutral-800 shadow-xs hover:bg-neutral-50 hover:shadow-sm transition-all active:scale-95">
              <ArrowLeft size={16} className="text-rose-500" />
              <span>Tất Cả Link Affiliate ({customers.length} KH)</span>
            </button>
          </Link>
        </div>

        {/* Quick Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-rose-200/50">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-rose-100/80">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-[11px] font-black text-neutral-800">Tốc Độ Khởi Tạo</div>
              <div className="text-[10px] text-neutral-500 font-bold">Dưới 3 giây/link</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-rose-100/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
              🎯
            </div>
            <div>
              <div className="text-[11px] font-black text-neutral-800">Mã Đối Soát Tự Động</div>
              <div className="text-[10px] text-neutral-500 font-bold">Gán sub_id1, sub_id2 chuẩn</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-rose-100/80">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs shrink-0">
              🛍️
            </div>
            <div>
              <div className="text-[11px] font-black text-neutral-800">Nền Tảng Hỗ Trợ</div>
              <div className="text-[10px] text-neutral-500 font-bold">Shopee & Lazada & TikTok</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK LINK FORM CONTAINER ── */}
      <QuickLinkForm
        customers={customers.map((c) => ({
          id: c.id,
          label: c.fullName,
          code: c.customerCode,
          email: c.user?.email ?? null,
          phone: c.phone ?? null,
          subLabel: [c.customerCode, c.user?.email, c.phone].filter(Boolean).join(" • "),
        }))}
        platforms={platforms.map((p) => ({ id: p.id, label: p.name }))}
      />

      {/* ── LỊCH SỬ LINK AFFILIATE (TÌM KIẾM, LỌC SÀN, PHÂN TRANG) ── */}
      <QuickLinksHistoryClient initialLinks={mappedLinks} />
    </div>
  );
}

