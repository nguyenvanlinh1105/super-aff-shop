import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ZaloAccountForm } from "@/components/admin/ZaloAccountForm";

export default async function AdminZaloPage() {
  const [account, logs] = await Promise.all([
    prisma.zaloAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.zaloMessageLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex items-center gap-md">
        <img src="/meowback_lucky_cat_logo.png" alt="" className="h-12 w-12 shrink-0 object-contain" />
        <div>
        <h1 className="display-sm">Tích hợp Zalo OA</h1>
        <p className="mt-xs text-body">
          Endpoint webhook: <code className="rounded-sm bg-gray-50 px-sm py-xxs">/api/zalo/webhook</code>.
          Khi OA đang bật, webhook sẽ nhận link, tự tạo affiliate link, lưu log vào/ra, và phản hồi lại cho người dùng.
        </p>
        <p className="mt-xs text-body">
          Để gửi tin thật ra OA, cần cấu hình thêm <code className="rounded-sm bg-gray-50 px-sm py-xxs">ZALO_OA_ACCESS_TOKEN</code> và{" "}
          <code className="rounded-sm bg-gray-50 px-sm py-xxs">ZALO_OA_MESSAGE_ENDPOINT</code> trong file môi trường.
        </p>
        </div>
      </div>

      <Card variant="default" className="border border-gray-100">
        <ZaloAccountForm account={account} />
      </Card>

      <div>
        <h2 className="display-xs mb-lg">Log tin nhắn gần đây</h2>
        {logs.length === 0 ? (
          <EmptyState title="Chưa có tin nhắn nào" description="Log sẽ xuất hiện khi webhook nhận được sự kiện." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời gian</Th>
                <Th>Chiều</Th>
                <Th>Loại</Th>
                <Th>Nội dung</Th>
                <Th>Trạng thái xử lý</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((l) => (
                <Tr key={l.id}>
                  <Td>{formatDate(l.createdAt)}</Td>
                  <Td>
                    <Badge tone={l.direction === "in" ? "neutral" : "positive"} dot>{l.direction}</Badge>
                  </Td>
                  <Td>{l.messageType || "—"}</Td>
                  <Td className="max-w-[300px] truncate">{l.messageText || "—"}</Td>
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
