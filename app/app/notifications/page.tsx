import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsPageClient } from "@/components/customer/NotificationsPageClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const limit = 20;
  const [
    notifications,
    unreadCount,
    totalCount,
    cashbackCount,
    totalChatCount,
    chatMessages,
  ] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    prisma.notification.count({ where: { userId: session.userId } }),
    prisma.notification.count({
      where: {
        userId: session.userId,
        type: { in: ["order_approved", "payment_paid", "referral_bonus"] },
      },
    }),
    prisma.chatMessage.count(),
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { fullName: true, role: true } } },
    }),
  ]);

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
      initialTotalPages={Math.ceil(totalCount / limit)}
      initialTotalCount={totalCount}
      cashbackCount={cashbackCount}
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
