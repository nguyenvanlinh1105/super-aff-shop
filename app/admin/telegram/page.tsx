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
    <div className="flex flex-col gap-2xl">
      <PageHeader
        icon="/meowback_lucky_cat_logo.png"
        title="Tích hợp Telegram Bot"
        subtitle="Nhận link, đổi sang short link hoàn tiền, tra số dư ví và thông báo real-time ngay trong Telegram."
      />

      <TelegramWebhookStatus />

      <Card variant="default" className="border border-gray-100">
        <h2 className="display-xs mb-lg">Cấu hình bot</h2>
        <TelegramAccountForm account={account} />
      </Card>

      <Card variant="soft">
        <h2 className="display-xs mb-sm">Lệnh khách hàng có thể dùng</h2>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          {[
            { cmd: "/wallet", desc: "Xem số dư hoàn tiền hiện tại" },
            { cmd: "/orders", desc: "Xem 5 đơn hàng gần nhất" },
            { cmd: "/links", desc: "Xem 5 link đã tạo gần nhất" },
            { cmd: "/help", desc: "Xem hướng dẫn sử dụng bot" },
          ].map((c) => (
            <div key={c.cmd} className="flex items-center gap-sm rounded-md bg-canvas px-md py-sm">
              <code className="rounded-sm bg-gray-50 px-sm py-xxs text-[13px] font-semibold text-gray-900-deep">
                {c.cmd}
              </code>
              <span className="text-[13px] text-body">{c.desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-lg text-[13px] text-gray-500">
          Real-time: khi admin duyệt đơn hoặc đánh dấu đã thanh toán, hệ thống tự động gửi thông báo Telegram cho
          khách hàng tương ứng (nếu khách đã từng nhắn tin cho bot).
        </p>
      </Card>

      <div>
        <h2 className="display-xs mb-lg">Log bot gần đây</h2>
        {logs.length === 0 ? (
          <EmptyState title="Chưa có tin nhắn nào" description="Log sẽ xuất hiện khi bot nhận được tin nhắn thật." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời gian</Th>
                <Th>Chiều</Th>
                <Th>Loại</Th>
                <Th>Nội dung</Th>
                <Th>Trạng thái</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((l) => (
                <Tr key={l.id}>
                  <Td>{formatDate(l.createdAt)}</Td>
                  <Td>
                    <Badge tone={l.direction === "in" ? "neutral" : "positive"} dot>
                      {l.direction}
                    </Badge>
                  </Td>
                  <Td>{l.messageType || "—"}</Td>
                  <Td className="max-w-[320px] truncate">{l.messageText || "—"}</Td>
                  <Td>{l.processingStatus}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
