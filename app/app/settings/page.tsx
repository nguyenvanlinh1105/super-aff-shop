import { redirect } from "next/navigation";
import { ShieldCheck, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ProfileInfoForm } from "@/components/account/ProfileInfoForm";
import { ProfileSummaryCard } from "@/components/account/ProfileSummaryCard";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";

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
      user: { select: { email: true } }
    },
  });

  if (!customer) redirect("/login");

  return (
    <div className="flex flex-col gap-2xl max-w-[1200px] mx-auto w-full">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-lg sm:p-2xl flex items-center justify-between gap-md">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary-50 to-transparent opacity-80" />
        
        <div className="relative z-10">
          <h1 className="text-[24px] sm:text-[32px] font-black tracking-tight text-gray-900">
            Thông tin cá nhân
          </h1>
          <p className="mt-xs text-[15px] text-gray-500 font-medium">
            Cập nhật thông tin và quản lý bảo mật tài khoản của bạn
          </p>
        </div>

        {/* Mascot / Icon Placeholder */}
        <div className="relative z-10 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-cute p-1 shrink-0">
          <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="h-full w-full object-cover rounded-xl" />
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

          <PwaInstallSettingsCard />
        </div>
      </div>
    </div>
  );
}
