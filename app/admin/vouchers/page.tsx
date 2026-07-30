import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateVoucherForm } from "@/components/admin/CreateVoucherForm";
import { QuickVoucherForm } from "@/components/admin/QuickVoucherForm";
import { AdminVouchersClient } from "@/components/admin/AdminVouchersClient";

export default async function AdminVouchersPage() {
  const [platforms, vouchers] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: "asc" } }),
    prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        platform: true,
        linkMatches: { include: { trackingLink: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
  ]);

  const platformOptions = platforms.map((p) => ({ id: p.id, label: p.name }));

  const rows = vouchers.map((v) => ({
    id: v.id,
    title: v.title,
    voucherCode: v.voucherCode,
    benefitText: v.benefitText,
    status: v.status,
    endsAt: v.endsAt,
    platformName: v.platform.name,
    productImage: v.productImage,
    shortUrl: v.linkMatches[0]?.trackingLink.shortUrl ?? null,
  }));

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center text-3xl shadow-md shadow-rose-500/20 shrink-0 border border-white/40">
              🎟️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Shopee / Lazada Voucher Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Kho Mã Giảm Giá & Voucher
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Quản lý <span className="font-bold text-rose-600">{vouchers.length}</span> chương trình ưu đãi, mã giảm giá hot và đính kèm link affiliate tự động.
              </p>
            </div>
          </div>
          <CreateVoucherForm platforms={platformOptions} />
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-4 tracking-tight">Thêm Voucher Nhanh Từ Link</h2>
        <QuickVoucherForm platforms={platformOptions} />
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-4 tracking-tight">Danh Sách Voucher Hiện Có ({vouchers.length})</h2>
        <AdminVouchersClient vouchers={rows} />
      </div>
    </div>
  );
}

