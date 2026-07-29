"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/PlatformIcons";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_state_mismatch: "Phiên đăng nhập Google đã hết hạn, vui lòng thử lại.",
  google_not_configured: "Đăng nhập Google chưa được cấu hình trên hệ thống.",
  google_token_exchange_failed: "Không thể xác thực với Google, vui lòng thử lại.",
  google_userinfo_failed: "Không lấy được thông tin tài khoản Google.",
  google_email_not_verified: "Email Google của bạn chưa được xác minh.",
  account_inactive: "Tài khoản của bạn đã bị khoá.",
};

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    googleError ? GOOGLE_ERROR_MESSAGES[googleError] ?? "Đăng nhập Google thất bại." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đăng nhập thất bại");
      return;
    }

    const data = await res.json();
    router.push(next || data.redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Email</label>
        <div className="relative">
          <Mail size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="meowback@gmail.com"
            autoComplete="email"
            className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-ink">Mật khẩu</label>
          <a href="/forgot-password" className="text-[13px] font-bold text-primary hover:text-primary-active hover:underline transition-colors">
            Quên mật khẩu?
          </a>
        </div>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-[52px] text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-lg top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-negative/10 border border-negative/20 px-lg py-md text-[13px] font-semibold text-negative-darkest">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-sm flex h-14 w-full items-center justify-center gap-sm rounded-2xl bg-gradient-to-r from-primary to-primary-active text-[15px] font-black text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Đăng nhập
            <ArrowRight size={18} strokeWidth={2.5} />
          </>
        )}
      </button>
      </form>

      <div className="flex items-center gap-md">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-[12px] font-medium text-mute">hoặc</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <a
        href="/api/auth/google"
        className="flex h-14 w-full items-center justify-center gap-sm rounded-2xl border border-ink/10 bg-canvas text-[15px] font-bold text-ink transition-all hover:border-ink/20 hover:bg-canvas-soft"
      >
        <GoogleIcon size={20} />
        Tiếp tục với Google
      </a>
    </div>
  );
}
