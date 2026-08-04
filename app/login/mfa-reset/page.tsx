"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldOff, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

function MfaResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !password) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: token, password }),
      });

      setLoading(false);

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không thể khôi phục 2MFA.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 py-16 md:p-8 relative overflow-hidden">
      <Link
        href="/login"
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-neutral-700 border border-neutral-200 shadow-sm transition-all hover:shadow-md md:fixed md:top-5 md:left-5"
      >
        <ArrowLeft size={15} />
        Quay lại Đăng nhập
      </Link>

      <div className="w-full max-w-[420px] mx-auto relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <LogoMeowBack />
          </Link>
          <h1 className="text-[24px] font-extrabold text-neutral-900 tracking-tight">
            Khôi phục Xác thực 2 bước (2MFA)
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-sm">
          {!token ? (
            <div className="text-center text-xs font-bold text-rose-600">
              Liên kết khôi phục 2MFA không hợp lệ hoặc thiếu token. Vui lòng gửi lại yêu cầu reset từ trang đăng nhập.
            </div>
          ) : success ? (
            <div className="flex flex-col items-center text-center gap-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-neutral-900">Đã tắt 2MFA thành công!</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tài khoản Admin của bạn đã được hủy kích hoạt 2MFA. Bạn có thể đăng nhập bằng Email & Mật khẩu ngay bây giờ.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleConfirmReset} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <ShieldOff size={24} className="text-rose-600 shrink-0" />
                <div className="text-xs text-rose-900 font-medium">
                  Nhập lại <strong>Mật khẩu Admin hiện tại</strong> để xác nhận hủy bật 2MFA trên thiết bị cũ.
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-neutral-800">Mật khẩu Admin hiện tại:</label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Xác nhận tắt 2MFA"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MfaResetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-medium text-neutral-500">Đang tải...</div>}>
      <MfaResetContent />
    </Suspense>
  );
}
