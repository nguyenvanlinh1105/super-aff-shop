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
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-community.png" alt="Cộng đồng" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Kênh Tương Tác Trực Tuyến
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Cộng Đồng & Phát Thông Báo
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Giám sát trò chuyện nhóm cộng đồng MeowBack, tương tác trực tiếp với thành viên và phát thông báo hệ thống hàng loạt.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 shadow-sm border border-neutral-200/70 rounded-3xl overflow-hidden bg-white">
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
        <div>
          <BroadcastForm />
        </div>
      </div>
    </div>
  );
}

