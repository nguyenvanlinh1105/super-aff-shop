import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | MeowBack",
  description: "Tạo mật khẩu mới cho tài khoản MeowBack.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-lg relative">
      <Link
        href="/login"
        className="absolute left-lg top-lg z-20 flex items-center gap-xs rounded-full bg-white/50 px-md py-sm text-[13px] font-bold text-ink backdrop-blur-md transition-all hover:bg-white hover:shadow-sm"
      >
        <ArrowLeft size={16} />
        Đăng nhập
      </Link>

      <div className="w-full max-w-[420px] fade-in">
        <div className="mb-xl text-center">
          <h2 className="text-[28px] font-black text-ink tracking-tight">Đặt lại mật khẩu</h2>
          <p className="mt-xs text-[15px] text-mute">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <ResetPasswordForm token={searchParams.token} />
      </div>
    </main>
  );
}
