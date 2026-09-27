import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsPageClient } from "@/components/customer/NotificationsPageClient";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: { page?: string; tab?: string; category?: string; unread?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const limit = 5; // Giới hạn 5 thông báo trên 1 trang theo yêu cầu
  const skip = (page - 1) * limit;
  const category = searchParams?.category || "all";
  const onlyUnread = searchParams?.unread === "true";

  const where: any = { userId: session.userId };
  if (category !== "all") {
    where.type = category;
  }
  if (onlyUnread) {
    where.isRead = false;
  }

  const [
    notifications,
    unreadCount,
    totalCount,
    filteredCount,
    cashbackCount,
    categoryGroup,
    totalChatCount,
    chatMessages,
  ] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    prisma.notification.count({ where: { userId: session.userId } }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: session.userId,
        type: { in: ["order_approved", "payment_paid", "referral_bonus"] },
      },
    }),
    prisma.notification.groupBy({
      by: ["type"],
      where: { userId: session.userId, ...(onlyUnread ? { isRead: false } : {}) },
      _count: { id: true },
    }),
    prisma.chatMessage.count(),
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { fullName: true, role: true } } },
    }),
  ]);

  const totalPages = Math.ceil(filteredCount / limit);
  const categoryCounts: Record<string, number> = {
    all: onlyUnread ? unreadCount : totalCount,
  };
  categoryGroup.forEach((g) => {
    categoryCounts[g.type] = g._count.id;
  });

  return (
    <NotificationsPageClient
      initialNotifications={notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))}
      initialUnreadCount={unreadCount}
      currentPage={page}
      totalPages={totalPages}
      initialTotalCount={totalCount}
      cashbackCount={cashbackCount}
      categoryCounts={categoryCounts}
      currentCategory={category}
      currentOnlyUnread={onlyUnread}
      totalChatCount={totalChatCount}
      initialChatMessages={chatMessages
        .slice()
        .reverse()
        .map((m) => ({
          id: m.id,
          userId: m.userId,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
          user: { fullName: m.user.fullName, role: m.user.role },
        }))}
      currentUserId={session.userId}
      isAdmin={session.role === "admin"}
    />
  );
}
