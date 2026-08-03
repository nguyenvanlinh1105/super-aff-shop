import { redirect } from "next/navigation";
import { ShieldCheck, User, Send } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ProfileInfoForm } from "@/components/account/ProfileInfoForm";
import { ProfileSummaryCard } from "@/components/account/ProfileSummaryCard";
import { PaymentPinSettings } from "@/components/account/PaymentPinSettings";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";
import { TelegramLinkCard } from "@/components/customer/TelegramLinkCard";
import { FloatingElement } from "@/components/ui/FloatingElement";

export default async function CustomerSettingsPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { 
      fullName: true, 
      phone: true,
      address: true,
      createdAt: true,
      isPartner: true,
      paymentPin: true,
      user: { select: { email: true } }
    },
  });

  if (!customer) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-2xl">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <FloatingElement duration={4}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
                <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="w-full h-full object-contain rounded-2xl" />
              </div>
            </FloatingElement>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Thông tin cá nhân
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Cập nhật thông tin và quản lý bảo mật tài khoản của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-4">
          <ProfileSummaryCard 
            customer={{
              fullName: customer.fullName || "",
              email: customer.user?.email || "",
              createdAt: customer.createdAt,
              isPartner: customer.isPartner,
            }}
          />
        </div>

        {/* Right Side: Forms */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card variant="default" className="border border-gray-100 p-6 md:p-8">
            <h2 className="display-xs mb-lg flex items-center gap-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-ink-deep">
                <User size={16} strokeWidth={2} />
              </span>
              Chi tiết hồ sơ
            </h2>
            <ProfileInfoForm 
              initialData={{
                fullName: customer.fullName || "",
                phone: customer.phone || "",
                address: customer.address || "",
                email: customer.user?.email || "",
              }}
            />
          </Card>

          <Card variant="default" className="border border-gray-100 p-6 md:p-8">
            <h2 className="display-xs mb-lg flex items-center gap-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-ink-deep">
                <ShieldCheck size={16} strokeWidth={1.75} />
              </span>
              Đổi mật khẩu
            </h2>
            <ChangePasswordForm />
          </Card>

          <Card variant="default" className="border border-gray-100 p-6 md:p-8">
            <h2 className="display-xs mb-lg flex items-center gap-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F8EE] text-[#2D8A56]">
                <ShieldCheck size={16} strokeWidth={1.75} />
              </span>
              Bảo mật rút tiền (Mã PIN)
            </h2>
            <PaymentPinSettings hasPin={!!customer.paymentPin} />
          </Card>

          <Card variant="default" className="border border-gray-100 p-6 md:p-8">
            <h2 className="display-xs mb-lg flex items-center gap-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF5FF] text-[#1E70BF]">
                <Send size={16} strokeWidth={1.75} />
              </span>
              Liên kết Telegram
            </h2>
            <TelegramLinkCard />
          </Card>

          <PwaInstallSettingsCard />
        </div>
      </div>
    </div>
  );
}
