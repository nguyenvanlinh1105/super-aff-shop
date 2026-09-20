import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { ArrowLeft } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";
import { BloomAndFireworkEffect } from "@/components/ui/BloomAndFireworkEffect";
import { FloatingElement } from "@/components/ui/FloatingElement";

export const metadata: Metadata = {
  title: "Đăng Nhập — MeowBack Nơ Mèo Hoàn Tiền",
  description:
    "Đăng nhập vào MeowBack để quản lý ví hoàn tiền, đơn hàng và rút tiền dễ dàng.",
  alternates: { canonical: "/login" },
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

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      {/* ── HIỆU ỨNG HOA NỞ, CÁNH HOA BAY & PHÁO BÔNG NHẸ NHÀNG ── */}
      <BloomAndFireworkEffect />

      {/* Back button — static on mobile, fixed on desktop */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-[13px] font-bold text-neutral-700 border border-primary-100 shadow-cute transition-all hover:shadow-cute-lg hover:scale-105 hover:text-primary-600 md:fixed md:top-5 md:left-5 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Trang chủ
      </Link>

      {/* Floating scattered trust badges with animation — xl+ only */}
      {FLOATING_BADGES.map((badge) => (
        <span
          key={badge.text}
          style={{ animationDelay: badge.delay }}
          className={`absolute ${badge.pos} ${badge.rotate} hidden xl:inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-primary-100/70 text-[11px] font-bold text-neutral-500 shadow-cute select-none pointer-events-none float z-10`}
        >
          {badge.text}
        </span>
      ))}

      {/* Centered Container */}
      <div className="w-full max-w-[420px] mx-auto relative z-10">
        {/* Logo + Heading */}
        <div className="mb-7 text-center">
          <FloatingElement duration={4} yOffset={6}>
            <Link href="/" className="inline-block mb-3 transition-transform hover:scale-105">
              <LogoMeowBack />
            </Link>
          </FloatingElement>
          <h1 className="text-[26px] sm:text-[28px] font-black text-neutral-900 tracking-tight leading-snug">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mt-1">
            Bảo vệ ví tiền hoàn & nhận hoa hồng mua sắm cùng MeowBack 🌸
          </p>
        </div>

        {/* Login Card with cute pastel glow */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-primary-100/90 shadow-cute hover:shadow-cute-lg transition-all duration-300">
          <LoginForm next={searchParams.next} />
        </div>

        {/* Register Link */}
        <p className="mt-5 text-center text-[14px] text-neutral-500 font-medium">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-extrabold text-primary-600 hover:text-primary-700 hover:underline">
            Đăng ký miễn phí 🎀
          </Link>
        </p>
      </div>
    </main>
  );
}
