import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, TrendingUp, Users } from "lucide-react";

const orderStatusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  approved: "Đã duyệt",
  cancelled: "Đã huỷ",
  rejected: "Từ chối",
};

const statusTone: Record<string, "positive" | "warning" | "negative" | "neutral"> = {
  approved: "positive",
  pending: "warning",
  cancelled: "negative",
  rejected: "negative",
};

export default async function AdminReportsPage() {
  const [orders, statusGroups, topCustomersRaw] = await Promise.all([
    prisma.order.findMany({
      select: { commissionAmount: true, customerRewardAmount: true, systemProfitAmount: true, createdAt: true },
    }),
    prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
    prisma.order.groupBy({
      by: ["customerId"],
      _sum: { customerRewardAmount: true },
      _count: { _all: true },
      orderBy: { _sum: { customerRewardAmount: "desc" } },
      take: 10,
      where: { customerId: { not: null } },
    }),
  ]);

  const byMonth = new Map<string, { commission: number; reward: number; profit: number }>();
  for (const o of orders) {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const cur = byMonth.get(key) ?? { commission: 0, reward: 0, profit: 0 };
    cur.commission += Number(o.commissionAmount);
    cur.reward += Number(o.customerRewardAmount);
    cur.profit += Number(o.systemProfitAmount);
    byMonth.set(key, cur);
  }
  const monthRows = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  const totalOrders = orders.length;

  const topCustomerIds = topCustomersRaw.map((t) => t.customerId).filter(Boolean) as string[];
  const topCustomers = await prisma.customer.findMany({ where: { id: { in: topCustomerIds } } });
  const topCustomerMap = new Map(topCustomers.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-reports.png" alt="Báo Cáo Tài Chính" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Financial Analytics & Insights
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Báo Cáo & Phân Tích Tài Chính
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Tổng hợp báo cáo tổng hoa hồng Shopee/Lazada, tỷ lệ hoàn tiền cho khách, lợi nhuận thực tế hệ thống và top thành viên thân thiết.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-neutral-50/50">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <BarChart3 size={18} strokeWidth={2} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">Hoa Hồng & Lợi Nhuận Theo Tháng</h2>
        </div>
        <div className="p-6">
          {monthRows.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu báo cáo" description="Dữ liệu tài chính sẽ tự động tổng hợp sau khi thực hiện import CSV đối soát." />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Tháng Báo Cáo</Th>
                  <Th align="right">Tổng Hoa Hồng Sàn</Th>
                  <Th align="right">Tổng Hoàn Cho Khách</Th>
                  <Th align="right">Lợi Nhuận Thực Giữ</Th>
                </Tr>
              </Thead>
              <tbody>
                {monthRows.map(([month, v]) => (
                  <Tr key={month}>
                    <Td className="font-mono text-xs font-bold text-neutral-900">{month}</Td>
                    <Td numeric className="font-extrabold text-neutral-900">{formatCurrency(v.commission)}</Td>
                    <Td numeric className="text-amber-600 font-extrabold">
                      {formatCurrency(v.reward)}
                    </Td>
                    <Td numeric className="font-black text-emerald-700">
                      {formatCurrency(v.profit)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-neutral-50/50">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <TrendingUp size={18} strokeWidth={2} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">Phân Bổ Tỷ Lệ Trạng Thái Đơn Hàng</h2>
        </div>
        <div className="p-6">
          <Table>
            <Thead>
              <Tr>
                <Th>Trạng Thái Phân Loại</Th>
                <Th align="right">Số Lượng Đơn</Th>
                <Th>Tỷ Lệ Chiếm %</Th>
              </Tr>
            </Thead>
            <tbody>
              {statusGroups.map((g) => {
                const pct = totalOrders ? (g._count._all / totalOrders) * 100 : 0;
                return (
                  <Tr key={g.orderStatus}>
                    <Td>
                      <Badge tone={statusTone[g.orderStatus] ?? "neutral"} dot>
                        {orderStatusLabel[g.orderStatus] ?? g.orderStatus}
                      </Badge>
                    </Td>
                    <Td numeric className="font-extrabold text-neutral-900">{g._count._all.toLocaleString()}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-black tabular-nums text-neutral-600">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Top customers */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-neutral-50/50">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <Users size={18} strokeWidth={2} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">Top Khách Hàng Nhận Hoàn Tiền Cao Nhất</h2>
        </div>
        <div className="p-6">
          {topCustomersRaw.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu thành viên" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Hạng</Th>
                  <Th>Khách Hàng</Th>
                  <Th align="right">Tổng Số Đơn</Th>
                  <Th align="right">Tổng Tiền Hoàn Đã Nhận</Th>
                </Tr>
              </Thead>
              <tbody>
                {topCustomersRaw.map((t, idx) => {
                  const c = t.customerId ? topCustomerMap.get(t.customerId) : undefined;
                  return (
                    <Tr key={t.customerId}>
                      <Td>
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                            idx === 0
                              ? "bg-amber-400 text-amber-950 shadow-xs"
                              : idx === 1
                              ? "bg-slate-200 text-slate-800"
                              : idx === 2
                              ? "bg-amber-700/20 text-amber-900"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </Td>
                      <Td className="font-extrabold text-neutral-900">{c?.fullName ?? "—"}</Td>
                      <Td numeric className="font-mono text-xs">{t._count._all}</Td>
                      <Td numeric className="font-black text-emerald-700">
                        {formatCurrency(t._sum.customerRewardAmount ?? 0)}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

