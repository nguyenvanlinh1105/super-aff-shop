"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Key, ArrowLeft, MailWarning } from "lucide-react";
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

  // 2MFA Step State
  const [require2FA, setRequire2FA] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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

    // Nếu là Admin và đã bật 2MFA -> Chuyển sang Bước 2 nhập OTP
    if (data.require2FA) {
      setRequire2FA(true);
      setMfaToken(data.mfaToken);
      return;
    }

    router.push(next || data.redirectTo);
    router.refresh();
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otpCode.trim()) return;

    setLoading(true);

    const res = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mfaToken, code: otpCode }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Mã 2MFA không chính xác");
      return;
    }

    const data = await res.json();
    router.push(next || data.redirectTo);
    router.refresh();
  }

  async function handleRequestResetMfa() {
    setResetLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResetSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không thể gửi yêu cầu khôi phục");
      }
    } catch (e: any) {
      setError(e.message);
    }
    setResetLoading(false);
  }

  // ── Màn hình Bước 2: Nhập mã 2MFA ──────────────────────────────────────
  if (require2FA) {
    return (
      <div className="flex flex-col gap-lg animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => {
            setRequire2FA(false);
            setOtpCode("");
            setError(null);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 w-fit"
        >
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">Xác Thực 2 Bước (2MFA)</h2>
            <p className="text-xs text-neutral-500 font-medium">Nhập mã 6 số từ ứng dụng Google Authenticator hoặc Mã dự phòng</p>
          </div>
        </div>

        <form onSubmit={handleVerify2FA} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã 2MFA (6 số) hoặc Mã dự phòng:</label>
            <div className="relative">
              <Key size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input
                type="text"
                required
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="000000 hoặc XXXX-XXXX"
                className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[16px] font-mono font-bold tracking-widest text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-negative/10 border border-negative/20 px-lg py-md text-[13px] font-semibold text-negative-darkest leading-relaxed">
              {error}
            </div>
          )}

          {resetSent && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-lg py-md text-[12px] font-semibold text-emerald-800 leading-relaxed">
              📩 Nếu email chính xác, liên kết reset 2MFA đã được gửi tới hòm thư <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (hoặc console server dev).
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !otpCode.trim()}
            className="flex h-14 w-full items-center justify-center gap-sm rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-[15px] font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Xác minh & Vào Admin
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 text-center">
          <button
            type="button"
            onClick={handleRequestResetMfa}
            disabled={resetLoading}
            className="text-[12px] font-bold text-rose-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
          >
            <MailWarning size={14} />
            <span>{resetLoading ? "Đang gửi email..." : "Quên mã 2MFA? Reset qua Email"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Màn hình Bước 1: Đăng nhập Email & Mật khẩu ───────────────────────
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
