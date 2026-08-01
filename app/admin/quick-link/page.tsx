import { prisma } from "@/lib/prisma";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { Zap, Sparkles, ArrowLeft, History, Clock, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminQuickLinkPage() {
  const [customers, platforms, recentLinks] = await Promise.all([
    prisma.customer.findMany({ where: { status: "active" }, orderBy: { fullName: "asc" } }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true, platform: true },
    }),
  ]);

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
        customers={customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }))}
        platforms={platforms.map((p) => ({ id: p.id, label: p.name }))}
      />

      {/* ── RECENT CREATED LINKS PREVIEW ── */}
      {recentLinks.length > 0 && (
        <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-gradient-to-r from-neutral-50 via-white to-neutral-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <History size={16} className="text-rose-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">5 Link Vừa Tạo Gần Đây</h2>
                <p className="text-[11px] text-neutral-500 font-medium">Lịch sử realtime cập nhật tức thì</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Updates
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentLinks.map((link) => (
              <div key={link.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-rose-50/20 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 border border-rose-200/60 flex items-center justify-center shrink-0 overflow-hidden">
                    {link.productImage ? (
                      <img src={link.productImage} alt={link.productTitle || ""} className="w-full h-full object-cover" />
                    ) : link.customer.avatar ? (
                      <img src={link.customer.avatar} alt={link.customer.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <img src="/meow-back-quick-link.png" alt="" className="w-6 h-6 object-contain" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-neutral-900">{link.customer.fullName}</span>
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                        {link.customer.customerCode}
                      </span>
                    </div>
                    {link.productTitle && (
                      <div className="text-[11px] font-semibold text-neutral-700 truncate max-w-xs sm:max-w-md mt-0.5" title={link.productTitle}>
                        {link.productTitle}
                      </div>
                    )}
                    <div className="text-xs font-mono text-rose-600 font-bold truncate mt-0.5">
                      {link.shortUrl || link.shortCode}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                      {link.platform.name}
                    </span>
                    <div className="text-[10px] text-neutral-400 font-medium mt-1">
                      {new Date(link.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <a
                    href={link.shortUrl || link.affiliateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-rose-100 hover:text-rose-600 text-neutral-600 flex items-center justify-center transition-colors"
                    title="Mở link"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

