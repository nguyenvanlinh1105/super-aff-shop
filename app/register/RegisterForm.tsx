"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import { GoogleIcon } from "@/components/icons/PlatformIcons";

function IconField({
  icon: Icon,
  rightSlot,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
      <input
        {...props}
        className={`h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] ${rightSlot ? "pr-[52px]" : "pr-lg"} text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15`}
      />
      {rightSlot}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNextStep() {
    setError(null);
    if (!fullName.trim()) { setError("Vui lòng nhập họ và tên."); return; }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) { setError("Số điện thoại không hợp lệ (bắt đầu bằng 0, 10 chữ số)."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Email không đúng định dạng."); return; }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng nhập lại mật khẩu.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đăng ký thất bại");
      return;
    }

    const data = await res.json();
    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${step >= 1 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"}`}>1</div>
          <span className={`text-[12px] font-bold transition-colors ${step >= 1 ? "text-neutral-900" : "text-neutral-400"}`}>Thông tin</span>
        </div>
        <div className={`h-px flex-1 transition-colors ${step >= 2 ? "bg-primary" : "bg-neutral-200"}`} />
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className={`text-[12px] font-bold transition-colors ${step >= 2 ? "text-neutral-900" : "text-neutral-400"}`}>Mật khẩu</span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${step >= 2 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500"}`}>2</div>
        </div>
      </div>

      {/* Step 1: Personal info */}
      {step === 1 && (
        <div className="flex flex-col gap-lg fade-in">
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Họ và tên</label>
            <IconField
              icon={User}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Số điện thoại</label>
            <IconField
              icon={Phone}
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              autoComplete="tel"
            />
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Email</label>
            <IconField
              icon={Mail}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-negative/10 border border-negative/20 px-lg py-md text-[13px] font-semibold text-negative-darkest">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className="mt-sm flex h-14 w-full items-center justify-center gap-sm rounded-2xl bg-gradient-to-r from-primary to-primary-active text-[15px] font-black text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
          >
            Tiếp tục
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

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
      )}

      {/* Step 2: Password */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-lg fade-in">
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mật khẩu</label>
            <IconField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-lg top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              }
            />
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Nhập lại mật khẩu</label>
            <IconField
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-lg top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              }
            />
          </div>

          {error && (
            <div className="rounded-xl bg-negative/10 border border-negative/20 px-lg py-md text-[13px] font-semibold text-negative-darkest">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-sm">
            <button
              type="button"
              onClick={() => { setStep(1); setError(null); }}
              className="flex h-14 items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-5 text-[14px] font-bold text-neutral-700 transition-all hover:bg-neutral-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 flex-1 items-center justify-center gap-sm rounded-2xl bg-gradient-to-r from-primary to-primary-active text-[15px] font-black text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Đăng ký
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

