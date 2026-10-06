import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CommissionRuleForm } from "@/components/admin/CommissionRuleForm";
import { CategoryRateForm } from "@/components/admin/CategoryRateForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { AdminMfaSetupCard } from "@/components/admin/AdminMfaSetupCard";
import { Settings, Code2, Info, Tags, ShieldCheck, Plug } from "lucide-react";
import { TikTokIntegrationPanel } from "@/components/admin/TikTokIntegrationPanel";
import { LazadaIntegrationPanel } from "@/components/admin/LazadaIntegrationPanel";
import { ReconciliationReminderCard } from "@/components/admin/ReconciliationReminderCard";
import { getRioHubConfigStatus } from "@/lib/riohubTikTok";
import { getLazadaConfigStatus } from "@/lib/lazadaApi";
import {
  getReconciliationReminderConfig,
  getAdminLinhTarget,
} from "@/lib/reconciliationReminder";
import { initReconciliationReminderScheduler } from "@/lib/reconciliationReminderScheduler";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Đảm bảo background scheduler chạy
  initReconciliationReminderScheduler();

  const [
    activeRule,
    categoryRates,
    tiktokPlatform,
    lazadaPlatform,
    reminderConfig,
    adminLinh,
    telegramAccount,
  ] = await Promise.all([
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.categoryCommissionRate.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.platform.findUnique({ where: { code: "TIKTOK" } }),
    prisma.platform.findUnique({ where: { code: "LAZADA" } }),
    getReconciliationReminderConfig(),
    getAdminLinhTarget(),
    prisma.telegramAccount.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center text-3xl shadow-md shadow-rose-500/20 shrink-0 border border-white/40">
              ⚙️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                System Commission Configuration
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Cấu Hình Tỷ Lệ Hoa Hồng & Hệ Thống
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium max-w-xl">
                Cấu hình tỷ lệ chia sẻ Cashback cho thành viên, phần trăm giữ lại admin, hoa hồng giới thiệu (referral bonus) và các cài đặt bảo mật tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tích hợp TikTok */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-black">
            <Plug size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Tích Hợp TikTok Shop RioHub</h2>
        </div>
        <TikTokIntegrationPanel platformStatus={tiktokPlatform?.status ?? "inactive"} config={getRioHubConfigStatus()} />
      </div>

      {/* Tích hợp Lazada */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-black">
            <Plug size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Tích Hợp Lazada Open API</h2>
        </div>
        <LazadaIntegrationPanel platformStatus={lazadaPlatform?.status ?? "inactive"} config={getLazadaConfigStatus()} />
      </div>

      {/* Nhắc nhở import file đối soát hàng ngày qua Telegram */}
      <ReconciliationReminderCard
        initialConfig={reminderConfig}
        adminLinh={adminLinh}
        botAccount={telegramAccount}
      />

      {/* Commission rule card */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
            <Settings size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Tỷ Lệ Chia Sẻ Hoa Hồng Cashback</h2>
        </div>
        <CommissionRuleForm
          taxRate={Number(activeRule?.taxRate ?? 10.98)}
          customerRate={Number(activeRule?.customerRate ?? 80)}
          systemRate={Number(activeRule?.systemRate ?? 20)}
          referralRate={Number(activeRule?.referralRate ?? 0.05) * 100}
          maxReferralOrders={activeRule?.maxReferralOrders ?? 5}
          referralValidityMonths={activeRule?.referralValidityMonths ?? 6}
        />
      </div>

      {/* Category commission rate table */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Tags size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Tỷ Lệ Tối Đa Ước Tính Theo Ngành Hàng</h2>
        </div>
        <CategoryRateForm
          initialRows={categoryRates.map((c) => ({
            name: c.name,
            keywords: c.keywords,
            rate: Number(c.rate),
            isDefault: c.isDefault,
          }))}
        />
      </div>

      {/* Tracking code format */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
            <Code2 size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Quy Tắc Tạo Mã Tracking Link (sub_id2)</h2>
        </div>
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-900 p-4 font-mono text-xs font-bold text-rose-400">
          {"{PLATFORM}_{CUSTOMER}_{CHANNEL}_{YYYYMMDD}_{SEQ}"}
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-sky-50/70 border border-sky-200/70 p-4">
          <Info size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-sky-700" />
          <div>
            <p className="text-xs text-neutral-700">
              <span className="font-extrabold text-neutral-900">Ví dụ mã tracking thực tế:</span>{" "}
              <code className="rounded-lg bg-white px-2 py-0.5 font-mono text-xs font-bold border border-sky-200 text-sky-800">
                SHOPEE_C0001_WEB_20260711_0001
              </code>
            </p>
            <p className="mt-1 text-[11px] text-neutral-500 font-medium">
              Mã sub_id2 này được đính kèm vào cuối URL chuyển hướng affiliate để hệ thống khớp nối tự động khi import báo cáo đối soát CSV.
            </p>
          </div>
        </div>
      </div>

      {/* Xác thực 2 bước Admin (2MFA) */}
      <AdminMfaSetupCard />

      {/* Bảo mật tài khoản */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Đổi Mật Khẩu & Bảo Mật Quản Trị Viên</h2>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

