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
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Báo cáo & Phân tích"
        subtitle="Tổng hợp hoa hồng, hoàn tiền và hiệu suất đối soát theo tháng."
      />

      {/* Monthly breakdown */}
      <Card variant="soft">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <BarChart3 size={16} strokeWidth={1.75} />
          </span>
          Hoa hồng & Hoàn tiền theo tháng
        </h2>
        {monthRows.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" description="Dữ liệu sẽ xuất hiện sau khi import đối soát." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Tháng</Th>
                <Th align="right">Hoa hồng</Th>
                <Th align="right">Hoàn cho khách</Th>
                <Th align="right">Lợi nhuận hệ thống</Th>
              </Tr>
            </Thead>
            <tbody>
              {monthRows.map(([month, v]) => (
                <Tr key={month}>
                  <Td className="font-semibold">{month}</Td>
                  <Td numeric>{formatCurrency(v.commission)}</Td>
                  <Td numeric className="text-warning-deep">
                    {formatCurrency(v.reward)}
                  </Td>
                  <Td numeric className="font-semibold text-positive-deep">
                    {formatCurrency(v.profit)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Status breakdown */}
      <Card variant="soft">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <TrendingUp size={16} strokeWidth={1.75} />
          </span>
          Tỷ lệ trạng thái đơn hàng
        </h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Trạng thái</Th>
              <Th align="right">Số đơn</Th>
              <Th>Tỷ lệ</Th>
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
                  <Td numeric className="font-semibold">{g._count._all}</Td>
                  <Td>
                    <div className="flex items-center gap-md">
                      <div className="h-[8px] flex-1 overflow-hidden rounded-pill bg-gray-50">
                        <div
                          className="h-full rounded-pill bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-[44px] shrink-0 text-right text-[12px] tabular-nums text-gray-500">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {/* Top customers */}
      <Card variant="soft">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <Users size={16} strokeWidth={1.75} />
          </span>
          Top khách hàng nhận hoàn tiền
        </h2>
        {topCustomersRaw.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Xếp hạng</Th>
                <Th>Khách hàng</Th>
                <Th align="right">Số đơn</Th>
                <Th align="right">Tổng được hoàn</Th>
              </Tr>
            </Thead>
            <tbody>
              {topCustomersRaw.map((t, idx) => {
                const c = t.customerId ? topCustomerMap.get(t.customerId) : undefined;
                return (
                  <Tr key={t.customerId}>
                    <Td>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${
                          idx === 0
                            ? "bg-primary text-gray-900-deep"
                            : idx === 1
                            ? "bg-gray-50 text-body"
                            : idx === 2
                            ? "bg-accent-orange/20 text-warning-deep"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </Td>
                    <Td className="font-medium">{c?.fullName ?? "—"}</Td>
                    <Td numeric>{t._count._all}</Td>
                    <Td numeric className="font-semibold text-positive-deep">
                      {formatCurrency(t._sum.customerRewardAmount ?? 0)}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
