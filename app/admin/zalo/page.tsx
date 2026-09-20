import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ZaloAccountForm } from "@/components/admin/ZaloAccountForm";
import { Pagination } from "@/components/ui/Pagination";

export default async function AdminZaloPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [account, logs, totalLogs] = await Promise.all([
    prisma.zaloAccount.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.zaloMessageLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.zaloMessageLog.count(),
  ]);

  const totalPages = Math.ceil(totalLogs / limit);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-blue-200/60 shadow-lg shadow-blue-500/5 bg-gradient-to-br from-white via-[#F0F6FF] to-[#E6F0FF]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-blue-200/30 to-sky-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-sky-600 to-blue-700 text-white flex items-center justify-center text-3xl shadow-md shadow-blue-500/20 shrink-0 border border-white/40">
              💬
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-700 shadow-xs mb-1.5">
                Zalo Official Account Webhook Integration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Tích Hợp Zalo OA Assistant
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Tự động tiếp nhận tin nhắn từ Zalo Official Account, đổi link
                Shopee/Lazada sang link affiliate hoàn tiền và gửi phản hồi tin
                nhắn tự động cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
            Thông Tin Webhook Endpoint
          </h2>
          <div className="p-4 rounded-2xl bg-neutral-900 text-rose-400 font-mono text-xs font-bold border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400 font-sans font-medium">
              URL Webhook Receiver:
            </span>
            <span>/api/zalo/webhook</span>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Lưu ý: Để phát tin nhắn tự động chiều gửi đi (Outbound), hãy khai
            báo biến môi trường{" "}
            <code className="bg-neutral-100 font-mono px-1.5 py-0.5 rounded font-bold text-neutral-800">
              ZALO_OA_ACCESS_TOKEN
            </code>{" "}
            và{" "}
            <code className="bg-neutral-100 font-mono px-1.5 py-0.5 rounded font-bold text-neutral-800">
              ZALO_OA_MESSAGE_ENDPOINT
            </code>
            .
          </p>
        </div>

        <ZaloAccountForm account={account} />
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <h2 className="text-base font-extrabold text-neutral-900 mb-4 tracking-tight">
          Nhật Ký Tin Nhắn Zalo OA (Logs)
        </h2>
        {logs.length === 0 ? (
          <EmptyState
            title="Chưa có tin nhắn nào"
            description="Nhật ký sẽ xuất hiện tự động khi webhook nhận sự kiện tin nhắn từ Zalo."
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Thời Gian</Th>
                <Th>Chiều Tin Nhắn</Th>
                <Th>Phân Loại</Th>
                <Th>Nội Dung</Th>
                <Th>Trạng Thái Xử Lý</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((l) => (
                <Tr key={l.id}>
                  <Td className="font-mono text-xs text-neutral-500">
                    {formatDate(l.createdAt)}
                  </Td>
                  <Td>
                    <Badge
                      tone={l.direction === "in" ? "neutral" : "positive"}
                      dot
                    >
                      {l.direction === "in" ? "Tin đến 📥" : "Gửi đi 📤"}
                    </Badge>
                  </Td>
                  <Td className="font-bold text-xs">{l.messageType || "—"}</Td>
                  <Td className="max-w-[300px] truncate font-medium text-neutral-800 text-xs">
                    {l.messageText || "—"}
                  </Td>
                  <Td className="font-mono text-xs font-extrabold text-blue-700">
                    {l.processingStatus}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  );
}
