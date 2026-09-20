"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      newErrors.current = "Vui lòng nhập mật khẩu hiện tại.";
    }
    if (newPassword.length < 6) {
      newErrors.new = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirm = "Mật khẩu mới nhập lại không khớp.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.", "Đổi mật khẩu thất bại");
        return;
      }

      toast.success("Đổi mật khẩu tài khoản thành công! 🔐", "Thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setLoading(false);
      toast.error("Không kết nối được tới máy chủ, vui lòng thử lại sau.", "Lỗi kết nối");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 max-w-[440px] w-full">
      {/* Current Password */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-neutral-900">Mật khẩu hiện tại</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type={showCurrentPassword ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errors.current) setErrors((prev) => ({ ...prev, current: undefined }));
            }}
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
            className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-12 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
              errors.current
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
            tabIndex={-1}
            aria-label="Ẩn hiện mật khẩu"
          >
            {showCurrentPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
        {errors.current && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.current}</span>}
      </div>

      {/* New Password */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-neutral-900">Mật khẩu mới</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type={showNewPassword ? "text" : "password"}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.new) setErrors((prev) => ({ ...prev, new: undefined }));
            }}
            placeholder="Ít nhất 6 ký tự"
            autoComplete="new-password"
            className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-12 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
              errors.new
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
            tabIndex={-1}
            aria-label="Ẩn hiện mật khẩu"
          >
            {showNewPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
        {errors.new && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.new}</span>}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-neutral-900">Nhập lại mật khẩu mới</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-12 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
              errors.confirm
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
            tabIndex={-1}
            aria-label="Ẩn hiện mật khẩu"
          >
            {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
        {errors.confirm && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.confirm}</span>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full sm:w-fit px-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận đổi mật khẩu"}
        </button>
      </div>
    </form>
  );
}
