"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Key, ShieldCheck, MailWarning, ArrowLeft } from "lucide-react";
import { GoogleIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/Toast";
import { triggerSuccessFireworks } from "@/components/ui/BloomAndFireworkEffect";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Bạn đã hủy cấp quyền đăng nhập Google.",
  token_failed: "Không thể lấy thông tin xác thực từ Google.",
  no_email: "Tài khoản Google của bạn không công khai email.",
  server_error: "Lỗi máy chủ trong quá trình xác thực.",
};

export function LoginForm({ next, googleError }: { next?: string; googleError?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});

  useEffect(() => {
    if (googleError) {
      toast.error(GOOGLE_ERROR_MESSAGES[googleError] ?? "Đăng nhập Google thất bại.", "Lỗi Google");
    }
  }, [googleError, toast]);

  // 2MFA Step State
  const [require2FA, setRequire2FA] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không đúng định dạng (VD: ten@gmail.com).";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Email hoặc mật khẩu không chính xác.", "Đăng nhập thất bại");
        return;
      }

      const data = await res.json();

      // Nếu là Admin và đã bật 2MFA -> Chuyển sang Bước 2 nhập OTP
      if (data.require2FA) {
        setRequire2FA(true);
        setMfaToken(data.mfaToken);
        toast.info("Tài khoản yêu cầu xác thực 2 bước (2MFA).", "Bảo mật tài khoản");
        return;
      }

      toast.success("Đăng nhập thành công! Đang chuyển hướng... 🌸", "Thành công");
      triggerSuccessFireworks();
      setTimeout(() => {
        router.push(next || data.redirectTo);
        router.refresh();
      }, 150);
    } catch {
      setLoading(false);
      toast.error("Không thể kết nối tới máy chủ, vui lòng thử lại.", "Lỗi kết nối");
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrors({ otp: "Vui lòng nhập mã 6 số từ Google Authenticator." });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, code: otpCode.trim() }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ otp: data.error ?? "Mã 2MFA không chính xác hoặc đã hết hạn." });
        toast.error(data.error ?? "Mã 2MFA không chính xác.", "Xác thực thất bại");
        return;
      }

      const data = await res.json();
      toast.success("Xác thực 2 bước thành công! 🌸", "Thành công");
      triggerSuccessFireworks();
      setTimeout(() => {
        router.push(next || data.redirectTo);
        router.refresh();
      }, 150);
    } catch {
      setLoading(false);
      toast.error("Lỗi xác thực hệ thống, vui lòng thử lại.", "Lỗi kết nối");
    }
  }

  async function handleRequestResetMfa() {
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResetSent(true);
        toast.success("Đã gửi hướng dẫn khôi phục 2MFA về email của bạn!", "Đã gửi email");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Không thể gửi yêu cầu khôi phục.", "Lỗi khôi phục");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi gửi yêu cầu khôi phục.", "Lỗi hệ thống");
    }
    setResetLoading(false);
  }

  // ── Màn hình Bước 2: Nhập mã 2MFA ──────────────────────────────────────
  if (require2FA) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => {
            setRequire2FA(false);
            setOtpCode("");
            setErrors({});
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 w-fit"
        >
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 shadow-xs">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-[17px] font-extrabold text-neutral-900 tracking-tight">Xác Thực 2 Bước (2MFA)</h2>
            <p className="text-xs text-neutral-500 font-medium">Nhập mã 6 số từ Google Authenticator hoặc Mã dự phòng</p>
          </div>
        </div>

        <form onSubmit={handleVerify2FA} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Mã 2MFA hoặc Mã dự phòng:</label>
            <div className="relative">
              <Key size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                autoFocus
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                placeholder="000000 hoặc XXXX-XXXX"
                className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-4 text-[16px] font-mono font-bold tracking-widest text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
                  errors.otp
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
                }`}
              />
            </div>
            {errors.otp && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.otp}</span>}
          </div>

          {resetSent && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-[12px] font-semibold text-emerald-800 leading-relaxed">
              📩 Nếu email chính xác, liên kết reset 2MFA đã được gửi tới hòm thư <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !otpCode.trim()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-extrabold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Xác minh & Đăng nhập
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
            className="text-[12px] font-bold text-rose-600 hover:underline inline-flex items-center gap-1.5 disabled:opacity-50"
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
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-bold text-neutral-900">Email</label>
          <div className="relative">
            <Mail size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="meowback@gmail.com"
              autoComplete="email"
              className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-4 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
                errors.email
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
              }`}
            />
          </div>
          {errors.email && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-neutral-900">Mật khẩu</label>
            <a href="/forgot-password" className="text-[13px] font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-12 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
                errors.password
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
              tabIndex={-1}
              aria-label="Ẩn hiện mật khẩu"
            >
              {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.password}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-extrabold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Đăng nhập 🎀
              <ArrowRight size={18} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[12px] font-bold text-neutral-400">hoặc</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <a
        href="/api/auth/google"
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-primary-200/80 bg-white text-[15px] font-bold text-neutral-800 transition-all hover:bg-primary-50/60 shadow-xs"
      >
        <GoogleIcon size={20} />
        Tiếp tục với Google
      </a>
    </div>
  );
}
