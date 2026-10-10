import { Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TelegramAccountForm } from "@/components/admin/TelegramAccountForm";
import { TelegramWebhookStatus } from "@/components/admin/TelegramWebhookStatus";
import { TelegramCommandManager } from "@/components/admin/TelegramCommandManager";

import { TelegramIcon } from "@/components/icons/PlatformIcons";
import { Pagination } from "@/components/ui/Pagination";

function stripTelegramHtml(text: string | null | undefined): string {
  if (!text) return "—";
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function AdminTelegramPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [account, logs, totalLogs] = await Promise.all([
    prisma.telegramAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.telegramMessageLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.telegramMessageLog.count(),
  ]);

  const totalPages = Math.ceil(totalLogs / limit);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-sky-200/60 shadow-lg shadow-sky-500/5 bg-gradient-to-br from-white via-[#F0F4FF] to-[#E8EEFF]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-200/30 to-indigo-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white p-2 flex items-center justify-center shadow-lg shadow-sky-500/15 shrink-0 border border-sky-100 overflow-hidden">
              <TelegramIcon size={56} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-sky-200 text-[10px] font-black uppercase tracking-widest text-sky-700 shadow-xs mb-1.5">
                Telegram Bot Assistant & Webhook
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Tích Hợp Telegram Bot
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Tự động nhận link Shopee/Lazada từ tin nhắn Telegram của khách, quy đổi sang link affiliate hoàn tiền, tra cứu ví và gửi thông báo biến động số dư tức thì.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TelegramWebhookStatus />

      {/* Dynamic Telegram Bot Custom Commands Manager */}
      <TelegramCommandManager />

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-4 tracking-tight">Cấu Hình Telegram Bot Token</h2>
        <TelegramAccountForm account={account} />
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-2 tracking-tight">Danh Sách Lệnh Khách Hàng Tương Tác</h2>
        <p className="text-xs text-neutral-500 mb-4 font-medium">Thành viên có thể gõ trực tiếp các lệnh này trong chat với Telegram Bot để tra cứu thông tin nhanh:</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { cmd: "/wallet", desc: "Xem số dư tiền khả dụng và tiền chờ duyệt" },
            { cmd: "/orders", desc: "Tra cứu danh sách 5 đơn hàng gần nhất" },
            { cmd: "/links", desc: "Tra cứu 5 link affiliate đã tạo gần nhất" },
            { cmd: "/help", desc: "Xem chi tiết hướng dẫn sử dụng bot" },
          ].map((c) => (
            <div key={c.cmd} className="flex items-center gap-3 rounded-2xl bg-neutral-50/80 p-3.5 border border-neutral-200/70">
              <code className="rounded-xl bg-neutral-900 px-2.5 py-1 text-xs font-black text-rose-400 font-mono">
                {c.cmd}
              </code>
              <span className="text-xs font-extrabold text-neutral-700">{c.desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-xs font-medium text-rose-800">
          💡 <strong>Tính năng Thông báo Tự động:</strong> Khi admin thực hiện duyệt đơn hoặc chuyển khoản chi trả thành công, bot sẽ tự động nhắn tin thông báo kết quả cho khách hàng ngay lập tức.
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-4 tracking-tight">Nhật Ký Hoạt Động Telegram Bot (Logs)</h2>
        {logs.length === 0 ? (
          <EmptyState
            icon={Send}
            title="Chưa có nhật ký tin nhắn"
            description="Log sẽ xuất hiện tự động khi có tương tác thực tế từ người dùng với Telegram Bot."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 sm:hidden">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-2.5 shadow-2xs text-left"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge tone={l.direction === "in" ? "neutral" : "positive"} dot>
                        {l.direction === "in" ? "Tin đến 📥" : "Gửi đi 📤"}
                      </Badge>
                      {l.messageType && (
                        <span className="font-mono text-[11px] font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-lg border border-neutral-200/70">
                          {l.messageType}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-400 font-mono">
                      {formatDate(l.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-800 leading-relaxed bg-white p-3 rounded-xl border border-neutral-200/60 break-words text-left">
                    <strong className="text-neutral-900 font-extrabold">Nội dung: </strong>
                    <span>{stripTelegramHtml(l.messageText)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-200/60">
                    <span className="text-neutral-400 font-medium">Trạng thái xử lý:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {l.processingStatus || "sent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                    <th className="py-3.5 px-4 whitespace-nowrap">Thời Gian</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Chiều Tin Nhắn</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Phân Loại</th>
                    <th className="py-3.5 px-4">Nội Dung</th>
                    <th className="py-3.5 px-4 whitespace-nowrap text-right">Trạng Thái Xử Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {formatDate(l.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge tone={l.direction === "in" ? "neutral" : "positive"} dot>
                          {l.direction === "in" ? "Tin đến 📥" : "Gửi đi 📤"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                        {l.messageType || "—"}
                      </td>
                      <td className="py-3.5 px-4 max-w-[420px] font-medium text-neutral-800 break-words leading-relaxed">
                        <strong className="text-neutral-900 font-extrabold">Nội dung: </strong>
                        <span>{stripTelegramHtml(l.messageText)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {l.processingStatus || "sent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  );
}

