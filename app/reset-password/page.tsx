import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, KeyRound, Sparkles } from "lucide-react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";
import { BloomAndFireworkEffect } from "@/components/ui/BloomAndFireworkEffect";
import { FloatingElement } from "@/components/ui/FloatingElement";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu — MeowBack",
  description: "Tạo mật khẩu mới an toàn cho tài khoản MeowBack của bạn.",
  robots: { index: false, follow: false },
};

const FLOATING_BADGES = [
  { icon: ShieldCheck, text: "Bảo mật SSL 256-bit", pos: "top-[18%] left-[16%]", rotate: "-rotate-6", delay: "0s" },
  { icon: Lock, text: "Mã hóa một chiều an toàn", pos: "top-[15%] right-[16%]", rotate: "rotate-3", delay: "0.8s" },
  { icon: KeyRound, text: "Đổi mật khẩu tức thì", pos: "bottom-[24%] left-[18%]", rotate: "rotate-2", delay: "1.4s" },
  { icon: Sparkles, text: "Bảo vệ tài khoản an toàn", pos: "bottom-[20%] right-[18%]", rotate: "-rotate-3", delay: "2.2s" },
];

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-12 md:p-8 relative overflow-hidden">
      {/* Hiệu ứng cánh hoa bay và pháo hoa */}
      <BloomAndFireworkEffect />

      {/* Nút quay lại trang Đăng nhập */}
      <Link
        href="/login"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-[13px] font-bold text-neutral-700 border border-primary-100 shadow-cute transition-all hover:shadow-cute-lg hover:scale-105 hover:text-primary-600 md:fixed md:top-5 md:left-5 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Đăng nhập
      </Link>

      {/* Floating scattered trust badges */}
      {FLOATING_BADGES.map((badge) => {
        const IconComponent = badge.icon;
        return (
          <span
            key={badge.text}
            style={{ animationDelay: badge.delay }}
            className={`absolute ${badge.pos} ${badge.rotate} hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-primary-100/70 text-[11px] font-bold text-neutral-600 shadow-cute select-none pointer-events-none float z-10`}
          >
            <IconComponent size={13} className="text-primary-500" />
            <span>{badge.text}</span>
          </span>
        );
      })}

      {/* Ambient glowing gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-pink-200/40 via-rose-100/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[460px] w-[460px] rounded-full bg-gradient-to-bl from-rose-200/40 via-pink-100/30 to-transparent blur-3xl" />

      {/* Centered Card Container */}
      <div className="w-full max-w-[460px] mx-auto relative z-10">
        {/* Logo & Header */}
        <div className="mb-6 text-center">
          <FloatingElement duration={4} yOffset={6}>
            <Link href="/" className="inline-block mb-3 transition-transform hover:scale-105 active:scale-95">
              <LogoMeowBack />
            </Link>
          </FloatingElement>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200/60 text-primary-600 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Thiết lập bảo mật
          </div>

          <h1 className="text-[26px] sm:text-[28px] font-black text-neutral-900 tracking-tight leading-snug">
            Đặt lại mật khẩu
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mt-1 max-w-[340px] mx-auto">
            Nhập mật khẩu mới an toàn để tiếp tục bảo vệ tài khoản và điểm tích lũy của bạn
          </p>
        </div>

        {/* Card chứa Form với hiệu ứng bóng mềm cao cấp */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-primary-100/80 shadow-cute-xl p-6 sm:p-8 relative">
          <ResetPasswordForm token={searchParams.token} />
        </div>

        {/* Bottom Help Note */}
        <p className="mt-5 text-center text-[13px] text-neutral-500 font-medium">
          Đã nhớ lại mật khẩu?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
