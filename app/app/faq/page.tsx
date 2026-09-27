import { PageHeader } from "@/components/ui/PageHeader";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/faqData";

export default function CustomerFaqPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-2xl">
      <PageHeader title="Câu hỏi thường gặp" subtitle="Giải đáp thắc mắc về cách hoạt động, tiền hoàn, và mời bạn bè." />

      <div className="rounded-2xl sm:rounded-[32px] border border-primary/10 bg-white p-3 sm:p-2xl shadow-lg shadow-primary/5">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
