import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";

export default async function CustomerSettingsPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader title="Cài đặt tài khoản" subtitle="Quản lý bảo mật tài khoản của bạn." />

      <PwaInstallSettingsCard />

      <Card variant="default" className="border border-gray-100">
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-ink-deep">
            <ShieldCheck size={16} strokeWidth={1.75} />
          </span>
          Đổi mật khẩu
        </h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
