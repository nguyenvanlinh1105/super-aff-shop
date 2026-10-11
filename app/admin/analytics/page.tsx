import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAnalyticsClient } from "@/components/admin/AdminAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  // Lấy dữ liệu 7 ngày gần nhất để tính mật độ và khung giờ
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalViews,
    memberViews,
    guestViews,
    topRouteGroups,
    recentRawLogs,
    logsForStats,
  ] = await Promise.all([
    // 1. Tổng lượt xem
    prisma.userActivityLog.count(),

    // 2. Lượt xem của thành viên
    prisma.userActivityLog.count({
      where: { userRole: { in: ["customer", "admin"] } },
    }),

    // 3. Lượt xem của khách
    prisma.userActivityLog.count({
      where: { userRole: "guest" },
    }),

    // 4. Top 15 Router được truy cập nhiều nhất
    prisma.userActivityLog.groupBy({
      by: ["path"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 15,
    }),

    // 5. 100 Nhật ký mới nhất
    prisma.userActivityLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    }),

    // 6. Dữ liệu 7 ngày gần nhất (tối đa 5000 records) để tính giờ cao điểm và thiết bị
    prisma.userActivityLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        path: true,
        userRole: true,
        visitorId: true,
        deviceType: true,
        browser: true,
        createdAt: true,
      },
      take: 5000,
    }),
  ]);

  // Đếm số khách độc nhất (unique visitors)
  const uniqueVisitorSet = new Set<string>();
  for (const item of logsForStats) {
    if (item.visitorId) uniqueVisitorSet.add(item.visitorId);
  }
  const uniqueVisitors = uniqueVisitorSet.size || Math.min(totalViews, 1);

  // Tính chi tiết cho Top 15 Router
  const topRoutes = topRouteGroups.map((g) => {
    const routeLogs = logsForStats.filter((l) => l.path === g.path);
    const uniqueV = new Set(routeLogs.map((l) => l.visitorId)).size;
    const members = routeLogs.filter((l) => l.userRole !== "guest").length;
    const guests = routeLogs.filter((l) => l.userRole === "guest").length;

    return {
      path: g.path,
      totalViews: g._count.id,
      uniqueVisitors: uniqueV || 1,
      memberViews: members,
      guestViews: guests,
    };
  });

  // Phân bổ 24 giờ trong ngày (0h -> 23h)
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    total: 0,
    members: 0,
    guests: 0,
  }));

  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
  const browserMap = new Map<string, number>();

  for (const log of logsForStats) {
    // 24 Giờ
    const hour = new Date(log.createdAt).getHours();
    hourlyDistribution[hour].total += 1;
    if (log.userRole === "guest") {
      hourlyDistribution[hour].guests += 1;
    } else {
      hourlyDistribution[hour].members += 1;
    }

    // Thiết bị
    if (log.deviceType === "mobile") deviceBreakdown.mobile += 1;
    else if (log.deviceType === "tablet") deviceBreakdown.tablet += 1;
    else deviceBreakdown.desktop += 1;

    // Trình duyệt
    const b = log.browser || "Khác";
    browserMap.set(b, (browserMap.get(b) || 0) + 1);
  }

  // Tìm khung giờ cao điểm nhất
  let peakHour = 12;
  let maxCount = -1;
  for (const h of hourlyDistribution) {
    if (h.total > maxCount) {
      maxCount = h.total;
      peakHour = h.hour;
    }
  }

  const browserBreakdown = Array.from(browserMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const formattedRecentLogs = recentRawLogs.map((l) => ({
    id: l.id,
    path: l.path,
    title: l.title,
    userId: l.userId,
    customerId: l.customerId,
    userRole: l.userRole,
    userDisplayName: l.userDisplayName,
    visitorId: l.visitorId,
    deviceType: l.deviceType,
    browser: l.browser,
    os: l.os,
    ipAddress: l.ipAddress,
    referer: l.referer,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminAnalyticsClient
      totalViews={totalViews}
      uniqueVisitors={uniqueVisitors}
      memberViews={memberViews}
      guestViews={guestViews}
      topRoutes={topRoutes}
      hourlyDistribution={hourlyDistribution}
      deviceBreakdown={deviceBreakdown}
      browserBreakdown={browserBreakdown}
      recentLogs={formattedRecentLogs}
      peakHour={peakHour}
    />
  );
}
