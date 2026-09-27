"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import { GoogleIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/Toast";
import { triggerSuccessFireworks } from "@/components/ui/BloomAndFireworkEffect";

function IconField({
  icon: Icon,
  rightSlot,
  hasError,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  rightSlot?: React.ReactNode;
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <Icon size={18} strokeWidth={2} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${hasError ? "text-rose-400" : "text-neutral-400"}`} />
      <input
        {...props}
        className={`h-14 w-full rounded-2xl border bg-white pl-[52px] ${rightSlot ? "pr-[52px]" : "pr-4"} text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
          hasError
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
        }`}
      />
      {rightSlot}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNextStep() {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên của bạn.";
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (bắt đầu bằng 0, gồm 10 số).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không đúng định dạng (VD: ten@gmail.com).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Vui lòng tạo mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp.";
    }

    if (!agreePolicy) {
      newErrors.agreePolicy = "Vui lòng tích chọn đồng ý với Điều khoản sử dụng & Chính sách bảo mật.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, password }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Vui lòng kiểm tra lại thông tin đăng ký.", "Đăng ký không thành công");
        return;
      }

      const data = await res.json();
      toast.success("Đăng ký tài khoản thành công! Đang chuyển hướng... 🌸", "Thành công");
      triggerSuccessFireworks();
      setTimeout(() => {
        router.push(data.redirectTo);
        router.refresh();
      }, 450);
    } catch {
      setLoading(false);
      toast.error("Không kết nối được tới máy chủ, vui lòng thử lại.", "Lỗi kết nối");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${
              step >= 1 ? "bg-primary-500 text-white shadow-sm" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            1
          </div>
          <span className={`text-[12px] font-extrabold transition-colors ${step >= 1 ? "text-neutral-900" : "text-neutral-400"}`}>
            Thông tin
          </span>
        </div>
        <div className={`h-[2px] flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary-400" : "bg-neutral-200"}`} />
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className={`text-[12px] font-extrabold transition-colors ${step >= 2 ? "text-neutral-900" : "text-neutral-400"}`}>
            Mật khẩu
          </span>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${
              step >= 2 ? "bg-primary-500 text-white shadow-sm" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Step 1: Personal info */}
      {step === 1 && (
        <div className="flex flex-col gap-5 fade-in">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Họ và tên</label>
            <IconField
              icon={User}
              required
              value={fullName}
              hasError={!!errors.fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
              }}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
            {errors.fullName && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.fullName}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Số điện thoại</label>
            <IconField
              icon={Phone}
              type="tel"
              required
              value={phone}
              hasError={!!errors.phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              placeholder="0901234567"
              autoComplete="tel"
            />
            {errors.phone && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.phone}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Email</label>
            <IconField
              icon={Mail}
              type="email"
              required
              value={email}
              hasError={!!errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="ban@email.com"
              autoComplete="email"
            />
            {errors.email && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.email}</span>}
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-extrabold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            Tiếp tục
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

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

          <p className="text-[11.5px] text-center text-neutral-500 mt-1 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <Link
              href="/dieu-khoan-su-dung"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-600 hover:underline"
            >
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link
              href="/chinh-sach-bao-mat"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-600 hover:underline"
            >
              Chính sách bảo mật
            </Link>{" "}
            của MeowBack 🐾
          </p>
        </div>
      )}

      {/* Step 2: Password */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 fade-in">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Mật khẩu</label>
            <IconField
              icon={Lock}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              hasError={!!errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                  aria-label="Ẩn hiện mật khẩu"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              }
            />
            {errors.password && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.password}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-neutral-900">Nhập lại mật khẩu</label>
            <IconField
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              hasError={!!errors.confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  tabIndex={-1}
                  aria-label="Ẩn hiện mật khẩu"
                >
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              }
            />
            {errors.confirmPassword && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.confirmPassword}</span>}
          </div>

          {/* Privacy Policy & Terms Agreement Checkbox Button */}
          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-gradient-to-r from-primary-50/60 to-pink-50/40 border border-primary-200/80 shadow-xs">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreePolicy}
                onChange={(e) => {
                  setAgreePolicy(e.target.checked);
                  if (errors.agreePolicy) setErrors((prev) => ({ ...prev, agreePolicy: "" }));
                }}
                className="mt-0.5 h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500/20 accent-primary-500 cursor-pointer shrink-0"
              />
              <span className="text-[12.5px] leading-relaxed text-neutral-700 font-medium">
                Tôi đồng ý với{" "}
                <Link
                  href="/chinh-sach-bao-mat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-2 hover:decoration-primary-500 transition-colors"
                >
                  Chính sách bảo mật
                </Link>{" "}
                và{" "}
                <Link
                  href="/dieu-khoan-su-dung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-2 hover:decoration-primary-500 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>{" "}
                của MeowBack 🐾
              </span>
            </label>
            {errors.agreePolicy && (
              <span className="text-[12px] font-semibold text-rose-500 px-1">
                {errors.agreePolicy}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
              className="flex h-14 items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-5 text-[14px] font-bold text-neutral-700 transition-all hover:bg-neutral-50"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-black text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Hoàn tất đăng ký 🎀
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
