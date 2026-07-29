"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => setTokenValid(!!data.valid))
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-2xl">
        <Loader2 size={24} className="animate-spin text-mute" />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-negative/20 bg-negative/[0.04] px-lg py-2xl text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-negative/15 text-negative">
          <XCircle size={28} strokeWidth={2} />
        </div>
        <h3 className="text-[16px] font-bold text-ink">Liên kết không hợp lệ</h3>
        <p className="text-[13px] leading-relaxed text-mute">
          Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email mới.
        </p>
        <a
          href="/forgot-password"
          className="mt-sm inline-flex items-center gap-sm rounded-2xl bg-gradient-to-r from-primary to-primary-active px-xl py-md text-[14px] font-black text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
        >
          Gửi lại email
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-primary/20 bg-primary/[0.04] px-lg py-2xl text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 size={28} strokeWidth={2} />
        </div>
        <h3 className="text-[16px] font-bold text-ink">Đặt lại mật khẩu thành công!</h3>
        <p className="text-[13px] leading-relaxed text-mute">Đang chuyển đến trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Mật khẩu mới</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
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

      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Nhập lại mật khẩu mới</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
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
            Đặt lại mật khẩu
            <ArrowRight size={18} strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
