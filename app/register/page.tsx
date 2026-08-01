import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { ArrowLeft } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

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



export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      {/* Back button */}
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
            Tạo tài khoản mới
          </h1>
        </div>

        {/* Clean Register Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-sm">
          <RegisterForm />
        </div>

        {/* Login Link */}
        <p className="mt-5 text-center text-[14px] text-neutral-500">
          Đã có tài khoản?{" "}
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





