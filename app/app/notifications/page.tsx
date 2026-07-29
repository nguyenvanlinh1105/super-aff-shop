import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationsPageClient } from "@/components/customer/NotificationsPageClient";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const limit = 20;
  const [notifications, unreadCount, totalCount, chatMessages] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    prisma.notification.count({ where: { userId: session.userId } }),
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { fullName: true, role: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Thông báo & Cộng đồng"
        subtitle="Theo dõi hoạt động tài khoản và trò chuyện cùng cộng đồng MeowBack."
      />
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
    </div>
  );
}
