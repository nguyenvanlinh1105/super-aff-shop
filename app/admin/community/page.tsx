import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommunityChat } from "@/components/customer/CommunityChat";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminCommunityPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const chatMessages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { fullName: true, role: true } } },
  });

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Cộng đồng & Thông báo"
        subtitle="Trò chuyện trực tiếp với khách hàng và gửi thông báo hệ thống."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <CommunityChat
            initialMessages={chatMessages
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
            isAdmin
          />
        </div>
        <BroadcastForm />
      </div>
    </div>
  );
}
