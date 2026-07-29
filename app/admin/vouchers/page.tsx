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
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Kho Voucher"
        subtitle={`${vouchers.length} chương trình ưu đãi đang có trong hệ thống.`}
        action={<CreateVoucherForm platforms={platformOptions} />}
      />

      <QuickVoucherForm platforms={platformOptions} />

      <AdminVouchersClient vouchers={rows} />
    </div>
  );
}
