import { redirect } from "next/navigation";
import { MessageSquare, Users, Megaphone, Zap, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommunityChat } from "@/components/customer/CommunityChat";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminCommunityPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [chatMessages, totalMessages, activeTodayUsers, totalBroadcasts, totalCustomers] = await Promise.all([
    prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { user: { select: { fullName: true, role: true } } },
    }),
    prisma.chatMessage.count(),
    prisma.chatMessage.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.notification.count(),
    prisma.customer.count(),
  ]);

  const activeTodayCount = activeTodayUsers.length;

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
                <Sparkles size={12} /> MeowBack Community Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Cộng Đồng & Phát Thông Báo
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Giám sát trò chuyện nhóm cộng đồng MeowBack, tương tác trực tiếp với thành viên và phát thông báo hệ thống hàng loạt.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-200/70 shadow-xs shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Live Chat Active</span>
          </div>
        </div>
      </div>

      {/* 4 COMMUNITY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 flex flex-col justify-between hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-black border border-rose-100">
              <MessageSquare size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Tin nhắn</span>
          </div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tổng Tin Nhắn</div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">{totalMessages.toLocaleString()}</div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 flex flex-col justify-between hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-black border border-sky-100">
              <Users size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">Hôm nay</span>
          </div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Chat Hôm Nay</div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">{activeTodayCount.toLocaleString()} <span className="text-xs font-medium text-neutral-400">thành viên</span></div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 flex flex-col justify-between hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-black border border-amber-100">
              <Megaphone size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Broadcast</span>
          </div>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Thông Báo Đã Phát</div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">{totalBroadcasts.toLocaleString()}</div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white via-[#F4FBF7] to-[#E6F8EE] p-5 shadow-sm border border-emerald-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black">
              <Zap size={18} />
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">Reach</span>
          </div>
          <div className="text-xs font-bold text-emerald-800/60 uppercase tracking-wider">Tiếp Cận Khách Hàng</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 tabular-nums">{totalCustomers.toLocaleString()} <span className="text-xs font-medium text-emerald-700">user</span></div>
        </div>
      </div>

      {/* Broadcast Form (Full-width top section) */}
      <BroadcastForm />

      {/* Live Community Chat Room (Full-width bottom section) */}
      <div className="shadow-sm border border-neutral-200/70 rounded-3xl overflow-hidden bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shadow-xs border border-rose-100 text-rose-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Khung Chat Cộng Đồng Trực Tuyến</h2>
              <p className="text-xs text-neutral-500 font-medium">Tương tác trực tiếp và phản hồi bình luận của người dùng</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Live Stream
          </span>
        </div>

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
    </div>
  );
}
