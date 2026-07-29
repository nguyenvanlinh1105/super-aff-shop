import { PartyPopper } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CustomerEventsPage() {
  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader title="Sự kiện" subtitle="Các chương trình khuyến mãi và sự kiện dành riêng cho bạn." />
      <EmptyState icon={PartyPopper} title="Chưa có sự kiện nào" description="Sự kiện mới sẽ được thông báo tại đây." />
    </div>
  );
}
