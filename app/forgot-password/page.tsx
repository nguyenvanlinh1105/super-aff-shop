import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

export const metadata: Metadata = {
  title: "Quên mật khẩu | MeowBack",
  description: "Đặt lại mật khẩu tài khoản MeowBack của bạn.",
  robots: { index: false, follow: false },
};

const FLOATING_BADGES = [
  { text: "🔒 Bảo mật SSL", pos: "top-[18%] left-[27%]", rotate: "-rotate-6", delay: "0s" },
  { text: "⚡ Hoàn tiền tự động", pos: "top-[14%] right-[27%]", rotate: "rotate-3", delay: "0.8s" },
  { text: "💸 Rút từ 10.000đ", pos: "top-[42%] left-[22%]", rotate: "-rotate-3", delay: "1.6s" },
  { text: "🎁 Hoa hồng 5%", pos: "top-[38%] right-[25%]", rotate: "rotate-5", delay: "2.4s" },
  { text: "🛡️ Shopee & TikTok", pos: "bottom-[38%] left-[25%]", rotate: "rotate-2", delay: "0.4s" },
  { text: "🐱 2.450+ thành viên", pos: "bottom-[34%] right-[25%]", rotate: "-rotate-4", delay: "1.2s" },
  { text: "💳 ATM & Momo 0đ phí", pos: "bottom-[20%] left-[20%]", rotate: "rotate-3", delay: "2s" },
  { text: "✨ Ghi nhận 1 giây", pos: "bottom-[16%] right-[25%]", rotate: "-rotate-2", delay: "2.8s" },
];

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      {/* Back button */}
      <Link
        href="/login"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-neutral-700 border border-neutral-200 shadow-sm transition-all hover:shadow-md hover:text-neutral-900 md:fixed md:top-5 md:left-5"
      >
        <ArrowLeft size={15} />
        Đăng nhập
      </Link>

      {/* Floating scattered trust badges with animation — xl+ only */}
      {FLOATING_BADGES.map((badge) => (
        <span
          key={badge.text}
          style={{ animationDelay: badge.delay }}
          className={`absolute ${badge.pos} ${badge.rotate} hidden xl:inline-flex items-center px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-primary-100/50 text-[11px] font-semibold text-neutral-400 shadow-sm select-none pointer-events-none float`}
        >
          {badge.text}
        </span>
      ))}

      {/* Centered Container */}
      <div className="w-full max-w-[400px] mx-auto relative z-10">
        {/* Logo + Heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <LogoMeowBack />
          </Link>
          <h1 className="text-[26px] font-extrabold text-neutral-900 tracking-tight">
            Quên mật khẩu?
          </h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu về email của bạn
          </p>
        </div>

        {/* Clean Forgot Password Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-sm">
          <ForgotPasswordForm />
        </div>

        {/* Bottom Navigation */}
        <p className="mt-5 text-center text-[14px] text-neutral-500">
          Nhớ ra mật khẩu rồi?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}

