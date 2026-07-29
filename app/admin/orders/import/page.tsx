import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImportOrdersWizard } from "@/components/admin/ImportOrdersWizard";

export default async function AdminOrdersImportPage() {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Import đối soát đơn hàng"
        subtitle="Upload file CSV tải từ dashboard affiliate — hệ thống tự map theo tracking code (sub_id2) và tính hoàn tiền."
      />
      <ImportOrdersWizard platforms={platforms.map((p) => ({ id: p.id, label: p.name }))} />
    </div>
  );
}
