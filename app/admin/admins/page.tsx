import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, ShieldCheck, Users, Send, BellRing, UserX, Plus } from "lucide-react";
import { AdminListClient } from "@/components/admin/AdminListClient";

export const dynamic = "force-dynamic";

export default async function AdminAdminsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      telegramChatId: true,
      notifyOnNewCustomer: true,
      notifyOnImport: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const formattedAdmins = admins.map((a) => ({
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    phone: a.phone,
    role: a.role,
    status: a.status,
    telegramChatId: a.telegramChatId,
    notifyOnNewCustomer: a.notifyOnNewCustomer,
    notifyOnImport: a.notifyOnImport,
    mfaEnabled: a.mfaEnabled,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  const totalAdmins = formattedAdmins.length;
  const telegramNotifiedAdmins = formattedAdmins.filter(
    (a) => (a.notifyOnNewCustomer || a.notifyOnImport) && a.telegramChatId
  ).length;
  const mfaAdmins = formattedAdmins.filter((a) => a.mfaEnabled).length;

  return (
    <div className="flex flex-col gap-6 fade-in pb-12">
      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white flex items-center justify-center text-3xl shadow-md shadow-rose-500/20 shrink-0 border border-white/40">
              🛡️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Staff &amp; Admin Privileges
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Tài Khoản Quản Trị Viên
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-2xl leading-relaxed">
                Quản lý các tài khoản Admin, cấu hình nhận thông báo Telegram khi có khách hàng mới đăng ký,
                tự động gửi email cấp link web &amp; mật khẩu khởi tạo cho nhân sự mới.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng Quản Trị Viên */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-rose-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Users size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Tổng Quản Trị Viên
              </div>
              <div className="text-xl font-black text-neutral-900 tabular-nums leading-tight">
                {totalAdmins}
              </div>
            </div>
          </div>
        </div>

        {/* Nhận thông báo Telegram */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-sky-50/60 p-5 shadow-sm border border-sky-200/70 hover:border-sky-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <BellRing size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700/70">
                Báo Bot Khi Có User Mới
              </div>
              <div className="text-xl font-black text-sky-700 tabular-nums leading-tight">
                {telegramNotifiedAdmins} <span className="text-xs font-semibold text-sky-600/80">admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bảo mật 2MFA */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm border border-emerald-200/70 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">
                Xác Thực 2MFA
              </div>
              <div className="text-xl font-black text-emerald-700 tabular-nums leading-tight">
                {mfaAdmins} <span className="text-xs font-semibold text-emerald-600/80">đã kích hoạt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CLIENT COMPONENT ── */}
      <AdminListClient initialAdmins={formattedAdmins} currentAdminId={session.userId} />
    </div>
  );
}
