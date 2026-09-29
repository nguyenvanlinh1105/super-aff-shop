"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCcw,
} from "lucide-react";
import { triggerSuccessFireworks } from "@/components/ui/BloomAndFireworkEffect";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Kiểm tra tính hợp lệ của token
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => setTokenValid(!!data.valid))
      .catch(() => setTokenValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  // Tính toán độ mạnh mật khẩu theo thời gian thực (0 -> 4)
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Yếu", color: "bg-rose-500", text: "text-rose-500" };
      case 2:
        return { score: 2, label: "Trung bình", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { score: 3, label: "Khá", color: "bg-sky-500", text: "text-sky-500" };
      case 4:
        return { score: 4, label: "Rất mạnh", color: "bg-emerald-500", text: "text-emerald-500" };
      default:
        return { score: 0, label: "", color: "", text: "" };
    }
  }, [password]);

  const isMatching = confirmPassword.length > 0 && password === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length >= 6 && isMatching && !loading;

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
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      triggerSuccessFireworks();
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Không thể kết nối đến máy chủ, vui lòng kiểm tra mạng.");
      setLoading(false);
    }
  }

  // 1. Trạng thái kiểm tra token
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
          <KeyRound size={18} className="absolute text-primary-500 animate-pulse" />
        </div>
        <p className="text-[13px] font-medium text-neutral-500">Đang xác thực liên kết bảo mật...</p>
      </div>
    );
  }

  // 2. Trạng thái Token không hợp lệ hoặc hết hạn
  if (!token || !tokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center py-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 shadow-sm mb-4">
          <AlertCircle size={28} strokeWidth={2} />
        </div>
        <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight">
          Liên kết không hợp lệ hoặc đã hết hạn
        </h3>
        <p className="text-[13px] text-neutral-500 font-medium leading-relaxed mt-2 max-w-[340px]">
          Vì lý do bảo mật, mỗi liên kết đặt lại mật khẩu chỉ có hiệu lực trong vòng 60 phút và chỉ sử dụng được một lần.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full">
          <Link
            href="/forgot-password"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-[14px] py-3.5 px-4 shadow-cute transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw size={16} />
            Gửi lại yêu cầu mới
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-bold text-[14px] py-3.5 px-5 transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      </motion.div>
    );
  }

  // 3. Trạng thái Đặt lại thành công (với pháo hoa và đếm ngược chuyển trang)
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center py-4"
      >
        <div className="relative mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-cute">
            <CheckCircle2 size={36} strokeWidth={2.2} />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>

        <h3 className="text-[19px] font-black text-neutral-900 tracking-tight">
          Đặt lại mật khẩu thành công!
        </h3>
        <p className="text-[13px] text-neutral-500 font-medium leading-relaxed mt-2 max-w-[320px]">
          Mật khẩu của bạn đã được cập nhật an toàn. Bạn có thể sử dụng mật khẩu mới này để đăng nhập.
        </p>

        {/* Progress bar đếm ngược tự chuyển trang */}
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-5 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "linear" }}
            className="h-full bg-gradient-to-r from-primary-400 to-emerald-500"
          />
        </div>
        <p className="text-[11px] text-neutral-400 font-medium mt-2">
          Đang tự động chuyển hướng đến trang Đăng nhập...
        </p>

        <Link
          href="/login"
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-[14px] py-3.5 shadow-cute transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Đăng nhập ngay
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    );
  }

  // 4. Form nhập mật khẩu mới
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Trường 1: Mật khẩu mới */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-neutral-700 flex items-center justify-between">
          <span>Mật khẩu mới</span>
          {strength.score > 0 && (
            <span className={`text-[11px] font-bold ${strength.text} transition-colors`}>
              {strength.label}
            </span>
          )}
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors">
            <KeyRound size={17} strokeWidth={2} />
          </div>

          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
            className="h-12 w-full rounded-2xl border border-neutral-200/90 bg-neutral-50/60 pl-11 pr-11 text-[14px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/60"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </div>

        {/* Thanh đo độ mạnh mật khẩu (4 vạch) */}
        {password.length > 0 && (
          <div className="pt-1 flex flex-col gap-1.5">
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    strength.score >= step ? strength.color : "bg-neutral-200/70"
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500 font-medium">
              <span className={`flex items-center gap-1 ${password.length >= 6 ? "text-emerald-600 font-bold" : ""}`}>
                <Check size={11} strokeWidth={2.5} className={password.length >= 6 ? "text-emerald-500" : "text-neutral-300"} />
                Tối thiểu 6 ký tự
              </span>
              <span className={`flex items-center gap-1 ${/\d/.test(password) ? "text-emerald-600 font-bold" : ""}`}>
                <Check size={11} strokeWidth={2.5} className={/\d/.test(password) ? "text-emerald-500" : "text-neutral-300"} />
                Có chữ số
              </span>
              <span
                className={`flex items-center gap-1 ${
                  /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password) ? "text-emerald-600 font-bold" : ""
                }`}
              >
                <Check
                  size={11}
                  strokeWidth={2.5}
                  className={
                    /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)
                      ? "text-emerald-500"
                      : "text-neutral-300"
                  }
                />
                Chữ hoa / ký hiệu
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trường 2: Nhập lại mật khẩu mới */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-neutral-700 flex items-center justify-between">
          <span>Nhập lại mật khẩu mới</span>
          {isMatching && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <Check size={12} strokeWidth={2.5} />
              Khớp mật khẩu
            </span>
          )}
          {isMismatch && (
            <span className="text-[11px] font-bold text-rose-500">
              Mật khẩu chưa khớp
            </span>
          )}
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors">
            <Lock size={17} strokeWidth={2} />
          </div>

          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại chính xác mật khẩu trên"
            autoComplete="new-password"
            className={`h-12 w-full rounded-2xl border bg-neutral-50/60 pl-11 pr-11 text-[14px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
              isMismatch
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                : isMatching
                ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                : "border-neutral-200/90 focus:border-primary-400 focus:ring-primary-100/60"
            }`}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showConfirmPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Thông báo lỗi */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200/80 px-3.5 py-2.5 text-[12.5px] font-bold text-rose-600"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative overflow-hidden mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 via-[#FF558F] to-primary-600 text-[14px] font-black text-white shadow-cute transition-all duration-200 hover:shadow-cute-lg hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            <span>Đang cập nhật mật khẩu...</span>
          </>
        ) : (
          <>
            <span>Đặt lại mật khẩu</span>
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
