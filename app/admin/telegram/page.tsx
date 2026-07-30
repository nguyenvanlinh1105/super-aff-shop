import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TelegramAccountForm } from "@/components/admin/TelegramAccountForm";
import { TelegramWebhookStatus } from "@/components/admin/TelegramWebhookStatus";

export default async function AdminTelegramPage() {
  const [account, logs] = await Promise.all([
    prisma.telegramAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.telegramMessageLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-sky-200/60 shadow-lg shadow-sky-500/5 bg-gradient-to-br from-white via-[#F0F4FF] to-[#E8EEFF]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-200/30 to-indigo-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-500 to-sky-600 text-white flex items-center justify-center text-3xl shadow-md shadow-sky-500/20 shrink-0 border border-white/40">
              ✈️
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
          <EmptyState title="Chưa có nhật ký tin nhắn" description="Log sẽ xuất hiện tự động khi có tương tác thực tế từ người dùng với bot." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời Gian</Th>
                <Th>Chiều Tin Nhắn</Th>
                <Th>Phân Loại</Th>
                <Th>Nội Dung Message</Th>
                <Th>Trạng Thái Xử Lý</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((l) => (
                <Tr key={l.id}>
                  <Td className="font-mono text-xs text-neutral-500">{formatDate(l.createdAt)}</Td>
                  <Td>
                    <Badge tone={l.direction === "in" ? "neutral" : "positive"} dot>
                      {l.direction === "in" ? "Tin đến 📥" : "Gửi đi 📤"}
                    </Badge>
                  </Td>
                  <Td className="font-bold text-xs">{l.messageType || "—"}</Td>
                  <Td className="max-w-[320px] truncate font-medium text-neutral-800 text-xs">{l.messageText || "—"}</Td>
                  <Td className="font-mono text-xs font-extrabold text-emerald-700">{l.processingStatus}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}

