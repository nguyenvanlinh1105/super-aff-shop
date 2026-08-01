import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { ArrowLeft } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

export const metadata: Metadata = {
  title: "Đăng Nhập — MeowBack Nơ Mèo Hoàn Tiền",
  description:
    "Đăng nhập vào MeowBack để quản lý ví hoàn tiền, đơn hàng và rút tiền dễ dàng.",
  alternates: { canonical: "/login" },
};



export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      {/* Back button — static on mobile, fixed on desktop */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-neutral-700 border border-neutral-200 shadow-sm transition-all hover:shadow-md hover:text-neutral-900 md:fixed md:top-5 md:left-5"
      >
        <ArrowLeft size={15} />
        Trang chủ
      </Link>



      {/* Centered Container */}
      <div className="w-full max-w-[400px] mx-auto relative z-10">
        {/* Logo + Heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <LogoMeowBack />
          </Link>
          <h1 className="text-[26px] font-extrabold text-neutral-900 tracking-tight">
            Đăng nhập tài khoản
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-sm">
          <LoginForm next={searchParams.next} />
        </div>

        {/* Register Link */}
        <p className="mt-5 text-center text-[14px] text-neutral-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-primary-600 hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </main>
  );
}






