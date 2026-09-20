import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";
import { ArrowLeft } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";
import { BloomAndFireworkEffect } from "@/components/ui/BloomAndFireworkEffect";
import { FloatingElement } from "@/components/ui/FloatingElement";

export const metadata: Metadata = {
  title: "Đăng Ký Tài Khoản — MeowBack Nơ Mèo Hoàn Tiền",
  description:
    "Tạo tài khoản MeowBack miễn phí để bắt đầu nhận hoàn tiền tự động khi mua sắm trên Shopee, TikTok Shop.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: "Đăng Ký Tài Khoản — MeowBack",
    description:
      "Tạo tài khoản MeowBack miễn phí để bắt đầu nhận hoàn tiền tự động khi mua sắm trên Shopee, TikTok Shop.",
    type: "website",
    locale: "vi_VN",
    url: "/register",
    siteName: "MeowBack",
  },
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/app");
  }
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      {/* ── HIỆU ỨNG HOA NỞ & PHÁO BÔNG NHẸ NHÀNG ── */}
      <BloomAndFireworkEffect />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-[13px] font-bold text-neutral-700 border border-primary-100 shadow-cute transition-all hover:shadow-cute-lg hover:scale-105 hover:text-primary-600 md:fixed md:top-5 md:left-5 cursor-pointer"
      >
        <ArrowLeft size={15} />
        Trang chủ
      </Link>

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
            Tạo tài khoản mới
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mt-1">
            Gia nhập cộng đồng săn deal & hoàn tiền MeowBack ngay hôm nay 🌸
          </p>
        </div>

        {/* Clean Register Card with cute pastel glow */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-primary-100/90 shadow-cute hover:shadow-cute-lg transition-all duration-300">
          <RegisterForm />
        </div>

        {/* Login Link */}
        <p className="mt-5 text-center text-[14px] text-neutral-500 font-medium">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-extrabold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Đăng nhập ngay 🎀
          </Link>
        </p>
      </div>
    </main>
  );
}
