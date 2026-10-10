import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImportOrdersWizard } from "@/components/admin/ImportOrdersWizard";
import { ArrowLeft } from "lucide-react";

export default async function AdminOrdersImportPage() {
  const rawPlatforms = await prisma.platform.findMany();
  // Ưu tiên Shopee lên đầu danh sách vì Shopee sử dụng đối soát CSV
  const platforms = rawPlatforms.sort((a, b) => 
    a.code === "SHOPEE" ? -1 : b.code === "SHOPEE" ? 1 : a.name.localeCompare(b.name)
  );

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-import.png" alt="Import Đối Soát" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Trình Xử Lý Dữ Liệu Affiliate
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Import CSV Đối Soát Đơn Hàng
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Tải lên file báo cáo đối soát CSV từ Shopee/Lazada Affiliate — hệ thống tự động nhận diện mã theo dõi (sub_id2), phân bổ hoàn tiền và sinh hoa hồng giới thiệu.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs sm:text-[13px] font-bold shadow-xs hover:shadow transition-all shrink-0 active:scale-95"
          >
            <ArrowLeft size={15} /> Danh sách đơn hàng
          </Link>
        </div>
      </div>

      <ImportOrdersWizard platforms={platforms.map((p) => ({ id: p.id, label: p.name }))} />
    </div>
  );
}

