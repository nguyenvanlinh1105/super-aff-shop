"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

export function ChangePasswordForm() {
  const modal = useModal();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      modal.alert({ title: "Lỗi", message: "Mật khẩu mới phải có ít nhất 6 ký tự.", iconType: "danger" });
      return;
    }
    if (newPassword !== confirmPassword) {
      modal.alert({ title: "Lỗi", message: "Mật khẩu mới nhập lại không khớp.", iconType: "danger" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      modal.alert({ title: "Lỗi đổi mật khẩu", message: data.error ?? "Có lỗi xảy ra, vui lòng thử lại.", iconType: "danger" });
      return;
    }

    modal.alert({ title: "Thành công", message: "Đổi mật khẩu thành công!", iconType: "success" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-lg max-w-[420px]">
      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Mật khẩu hiện tại</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Mật khẩu mới</label>
        <div className="relative">
          <Lock size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

      {/* messages were here */}

      <button
        type="submit"
        disabled={loading}
        className="mt-sm flex h-12 w-fit items-center justify-center gap-sm rounded-2xl bg-gradient-to-r from-primary to-primary-active px-xl text-[14px] font-black text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
