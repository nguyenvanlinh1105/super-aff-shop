"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-primary/20 bg-primary/[0.04] px-lg py-2xl text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 size={28} strokeWidth={2} />
        </div>
        <h3 className="text-[16px] font-bold text-ink">Đã gửi email!</h3>
        <p className="text-[13px] leading-relaxed text-mute">
          Nếu <span className="font-semibold text-ink">{email}</span> tồn tại trong hệ thống, bạn sẽ nhận được
          email hướng dẫn đặt lại mật khẩu trong ít phút. Nhớ kiểm tra cả mục Spam/Quảng cáo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Email</label>
        <div className="relative">
          <Mail size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@gmail.com"
            autoComplete="email"
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
            Gửi hướng dẫn
            <ArrowRight size={18} strokeWidth={2.5} />
          </>
        )}
      </button>
    </form>
  );
}
