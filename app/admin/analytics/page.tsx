import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAnalyticsClient, ActivityLogStatItem } from "@/components/admin/AdminAnalyticsClient";
import { getVietnamHour, getVietnamDateParts } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  // ── CHỈ LẤY DỮ LIỆU CỦA USER THỰC TẾ (CUSTOMER & GUEST), LOẠI BỎ HOÀN TOÀN ADMIN & TRANG /ADMIN ──
  const userOnlyFilter = {
    userRole: { in: ["customer", "guest"] },
    NOT: {
      path: { startsWith: "/admin" },
    },
  };

  const [
    totalViews,
    memberViews,
    guestViews,
    topRouteGroups,
    recentRawLogs,
    logsForStats,
  ] = await Promise.all([
    // 1. Tổng lượt xem của người dùng thực tế
    prisma.userActivityLog.count({
      where: userOnlyFilter,
    }),

    // 2. Lượt xem của thành viên (chỉ customer)
    prisma.userActivityLog.count({
      where: {
        ...userOnlyFilter,
        userRole: "customer",
      },
    }),

    // 3. Lượt xem của khách vãng lai (guest)
    prisma.userActivityLog.count({
      where: {
        ...userOnlyFilter,
        userRole: "guest",
      },
    }),

    // 4. Top Router được truy cập nhiều nhất bởi người dùng (lên đến 50 routes)
    prisma.userActivityLog.groupBy({
      where: userOnlyFilter,
      by: ["path"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 50,
    }),

    // 5. 200 Nhật ký mới nhất của người dùng
    prisma.userActivityLog.findMany({
      where: userOnlyFilter,
      take: 200,
      orderBy: { createdAt: "desc" },
    }),

    // 6. Dữ liệu hoạt động người dùng (lấy tối đa 10,000 records mới nhất) để vẽ biểu đồ và phân tích
    prisma.userActivityLog.findMany({
      where: userOnlyFilter,
      select: {
        path: true,
        userRole: true,
        visitorId: true,
        deviceType: true,
        browser: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
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

  // Xác định ngày mới nhất theo giờ Việt Nam (GMT+7)
  const todayParts = getVietnamDateParts(new Date());
  let latestDateKey = todayParts.dateKey;

  if (logsForStats.length > 0) {
    const hasLogToday = logsForStats.some(
      (l) => getVietnamDateParts(l.createdAt).dateKey === todayParts.dateKey
    );
    if (!hasLogToday) {
      // Nếu hôm nay chưa có lượt truy cập, mặc định lấy ngày gần nhất có dữ liệu
      latestDateKey = getVietnamDateParts(logsForStats[0].createdAt).dateKey;
    }
  }

  // Phân bổ 24 giờ trong ngày (0h -> 23h) cho ngày mới nhất được chọn
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    total: 0,
    members: 0,
    guests: 0,
  }));

  const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
  const browserMap = new Map<string, number>();

  for (const log of logsForStats) {
    const parts = getVietnamDateParts(log.createdAt);

    // Tính phân bổ 24h cho ngày mới nhất theo giờ Việt Nam
    if (parts.dateKey === latestDateKey) {
      const hour = parts.hour;
      if (hourlyDistribution[hour]) {
        hourlyDistribution[hour].total += 1;
        if (log.userRole === "guest") {
          hourlyDistribution[hour].guests += 1;
        } else {
          hourlyDistribution[hour].members += 1;
        }
      }
    }

    // Thiết bị
    if (log.deviceType === "mobile") deviceBreakdown.mobile += 1;
    else if (log.deviceType === "tablet") deviceBreakdown.tablet += 1;
    else deviceBreakdown.desktop += 1;

    // Trình duyệt
    const b = log.browser || "Khác";
    browserMap.set(b, (browserMap.get(b) || 0) + 1);
  }

  // Tìm khung giờ cao điểm nhất của ngày
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

  // Toàn bộ dữ liệu log đã serialize để client lọc động theo Ngày, Tuần, Tháng, Quý, Năm
  const activityLogs: ActivityLogStatItem[] = logsForStats.map((l) => ({
    path: l.path,
    userRole: l.userRole,
    visitorId: l.visitorId,
    deviceType: l.deviceType,
    browser: l.browser,
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
      activityLogs={activityLogs}
      initialDateKey={latestDateKey}
    />
  );
}
