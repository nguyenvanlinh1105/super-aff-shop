import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerSettingsClient } from "@/components/account/CustomerSettingsClient";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { ShieldCheck, Sparkles, KeyRound } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";

export default async function CustomerSettingsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const defaultTab = searchParams?.tab || "profile";

  const [customer, activeRule] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { 
        id: true,
        fullName: true, 
        phone: true,
        address: true,
        createdAt: true,
        isPartner: true,
        paymentPin: true,
        bankName: true,
        bankAccountNumber: true,
        telegramUsername: true,
        telegramUserId: true,
        user: { select: { email: true } },
        partnerRatePeriods: { orderBy: { startsAt: "desc" } },
      },
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!customer) redirect("/login");

  const hasPin = !!customer.paymentPin;
  const hasBank = !!(customer.bankName && customer.bankAccountNumber);
  const hasTelegram = !!(customer.telegramUserId || customer.telegramUsername);

  // Tính toán tỷ lệ đối tác hiệu lực hiện tại
  const now = new Date();
  const activePartnerPeriod = customer.partnerRatePeriods.find(
    (p) => p.startsAt <= now && (!p.endsAt || p.endsAt >= now)
  );
  const fallbackPartnerRate = activeRule?.referralRate ? Math.round(Number(activeRule.referralRate) * 100) : 5;
  const partnerCurrentPercent = activePartnerPeriod
    ? Math.round(Number(activePartnerPeriod.rate) * 100)
    : fallbackPartnerRate;

  const partnerPeriodText = activePartnerPeriod
    ? activePartnerPeriod.endsAt
      ? `${new Date(activePartnerPeriod.startsAt).toLocaleDateString("vi-VN")} - ${new Date(activePartnerPeriod.endsAt).toLocaleDateString("vi-VN")}`
      : `Từ ${new Date(activePartnerPeriod.startsAt).toLocaleDateString("vi-VN")} (Vô thời hạn)`
    : "Vô thời hạn";

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-7">
      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER: Hồ sơ cá nhân & Cài đặt
         ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-primary-200/70 shadow-cute bg-gradient-to-br from-pink-50/90 via-white to-primary-50/40">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-200/20 blur-2xl pointer-events-none" />
        <div className="absolute top-3 right-8 opacity-10 text-primary-500 pointer-events-none">
          <IconBow className="w-24 h-24" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <FloatingElement duration={3.5}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-500 text-white flex items-center justify-center shadow-cute shrink-0 border-2 border-white overflow-hidden p-1">
                <img 
                  src="/meow-back-mascot.png" 
                  alt="MeowBack Lucky Cat" 
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
                />
              </div>
            </FloatingElement>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-100/70 text-primary-700 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles size={11} /> Tài khoản của bạn
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  hasPin 
                    ? "bg-emerald-100/80 text-emerald-700" 
                    : "bg-amber-100/80 text-amber-800"
                }`}>
                  {hasPin ? <ShieldCheck size={11} /> : <KeyRound size={11} />}
                  {hasPin ? "Mã PIN bật" : "Chưa cài PIN"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
                Thông tin cá nhân &amp; Bảo mật
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Cập nhật thông tin cá nhân, thiết lập mã PIN rút tiền và quản lý tiện ích tài khoản MeowBack
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BODY CONTENT: 2 Cột Cân Bằng Đồng Đều (50% - 50% Desktop)
          - Cột 1 (Trái): Thẻ thành viên VIP MeowBack + Chi tiết hồ sơ + Cài app
          - Cột 2 (Phải): Mã PIN rút tiền + Đổi mật khẩu + Nhận thông báo + Telegram Bot
         ═══════════════════════════════════════════════════════════ */}
      <CustomerSettingsClient 
        initialProfile={{
          fullName: customer.fullName || "",
          phone: customer.phone || "",
          address: customer.address || "",
          email: customer.user?.email || "",
        }}
        customer={{
          id: customer.id,
          fullName: customer.fullName || "",
          email: customer.user?.email || "",
          createdAt: customer.createdAt,
          isPartner: customer.isPartner,
          partnerRatePercent: partnerCurrentPercent,
          partnerPeriodText,
          partnerRatePeriods: customer.partnerRatePeriods.map((p) => ({
            id: p.id,
            rate: Math.round(Number(p.rate) * 100),
            startsAt: p.startsAt.toISOString(),
            endsAt: p.endsAt ? p.endsAt.toISOString() : null,
            note: p.note,
          })),
          hasPaymentPin: hasPin,
          hasBankInfo: hasBank,
          hasTelegram: hasTelegram,
          phone: customer.phone,
        }}
        hasPin={hasPin}
        defaultTab={defaultTab}
      />
    </div>
  );
}
