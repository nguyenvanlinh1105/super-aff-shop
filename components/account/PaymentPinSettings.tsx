"use client";

import { useState } from "react";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  hasPin: boolean;
}

export function PaymentPinSettings({ hasPin: initialHasPin }: Props) {
  const { toast } = useToast();
  const [hasPin, setHasPin] = useState(initialHasPin);
  const [mode, setMode] = useState<"idle" | "setup" | "change" | "reset">("idle");
  const [loading, setLoading] = useState(false);

  // Setup / Change form states
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");

  // Reset flow
  const [resetStep, setResetStep] = useState<"request" | "confirm">("request");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // Inline errors
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setPin("");
    setConfirmPin("");
    setCurrentPin("");
    setOtp("");
    setNewPin("");
    setNewPinConfirm("");
    setMode("idle");
    setResetStep("request");
    setFormError(null);
  };

  // ── Setup PIN ──
  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setFormError("Mã PIN phải là 6 chữ số.");
      return;
    }
    if (pin !== confirmPin) {
      setFormError("Mã PIN nhập lại không khớp.");
      return;
    }

    setFormError(null);
    setLoading(true);
    const res = await fetch("/api/customer/pin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, confirmPin }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Có lỗi xảy ra khi tạo mã PIN.", "Thiết lập thất bại");
      return;
    }

    toast.success("Đã thiết lập mã PIN rút tiền thành công! 🎀", "Thành công");
    setHasPin(true);
    resetForm();
  }

  // ── Change PIN ──
  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(currentPin)) {
      setFormError("Mã PIN hiện tại phải là 6 chữ số.");
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setFormError("Mã PIN mới phải là 6 chữ số.");
      return;
    }
    if (pin !== confirmPin) {
      setFormError("Mã PIN mới nhập lại không khớp.");
      return;
    }

    setFormError(null);
    setLoading(true);
    const res = await fetch("/api/customer/pin/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin, newPin: pin, confirmPin }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Mã PIN hiện tại không đúng hoặc có lỗi xảy ra.", "Đổi PIN thất bại");
      return;
    }

    toast.success("Đổi mã PIN rút tiền thành công! 🎀", "Thành công");
    resetForm();
  }

  // ── Reset PIN: Request OTP ──
  async function handleResetRequest() {
    setFormError(null);
    setLoading(true);
    const res = await fetch("/api/customer/pin/reset-request", { method: "POST" });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Không gửi được email xác thực OTP.", "Lỗi gửi OTP");
      return;
    }

    setMaskedEmail(data.email || "");
    setResetStep("confirm");
    toast.info(`Mã OTP đã được gửi về email ${data.email || ""}.`, "Đã gửi OTP");
  }

  // ── Reset PIN: Confirm OTP + New PIN ──
  async function handleResetConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setFormError("Vui lòng nhập mã OTP gồm 6 chữ số.");
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setFormError("Mã PIN mới phải là 6 chữ số.");
      return;
    }
    if (newPin !== newPinConfirm) {
      setFormError("Mã PIN mới nhập lại không khớp.");
      return;
    }

    setFormError(null);
    setLoading(true);
    const res = await fetch("/api/customer/pin/reset-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, newPin, confirmPin: newPinConfirm }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Mã OTP không chính xác hoặc đã hết hạn.", "Đặt lại PIN thất bại");
      return;
    }

    toast.success("Đặt lại mã PIN rút tiền thành công! Bạn có thể rút tiền ngay.", "Thành công");
    setHasPin(true);
    resetForm();
  }

  const inputClass =
    "h-14 w-full rounded-2xl border border-primary-100/90 bg-white pl-[52px] pr-4 text-[16px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15";

  return (
    <div className="flex flex-col gap-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3.5 rounded-2xl px-5 py-4 border ${
          hasPin
            ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
            : "bg-amber-50/80 border-amber-200/80 text-amber-900"
        }`}
      >
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            hasPin ? "bg-emerald-100/80 border-emerald-200 text-emerald-600" : "bg-amber-100/80 border-amber-200 text-amber-600"
          }`}
        >
          <ShieldCheck size={22} strokeWidth={2.2} />
        </div>
        <div>
          <div className={`text-[14px] font-extrabold ${hasPin ? "text-emerald-900" : "text-amber-900"}`}>
            {hasPin ? "Mã PIN đã được thiết lập bảo vệ ✅" : "Chưa có mã PIN rút tiền ⚠️"}
          </div>
          <div className={`text-[12px] font-medium mt-0.5 ${hasPin ? "text-emerald-700" : "text-amber-700"}`}>
            {hasPin
              ? "Mỗi lần yêu cầu rút tiền về tài khoản, bạn sẽ cần nhập mã PIN 6 số này."
              : "Vui lòng tạo mã PIN để bảo vệ ví tiền của bạn khi thực hiện rút tiền."}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-3">
          {!hasPin ? (
            <button
              onClick={() => setMode("setup")}
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg active:scale-[0.98]"
            >
              <KeyRound size={16} />
              Thiết lập mã PIN ngay 🎀
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode("change")}
                className="flex h-11 items-center gap-2 rounded-full bg-primary-50 border border-primary-200/80 px-5 text-[14px] font-bold text-primary-600 transition-colors hover:bg-primary-100"
              >
                Đổi mã PIN
              </button>
              <button
                onClick={() => {
                  setMode("reset");
                  setResetStep("request");
                }}
                className="flex h-11 items-center gap-2 rounded-full bg-neutral-100 px-5 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Quên mã PIN
              </button>
            </>
          )}
        </div>
      )}

      {/* Error alert banner if any */}
      {formError && (
        <div className="max-w-[440px] rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] font-bold text-rose-600">
          ⚠️ {formError}
        </div>
      )}

      {/* Setup Form */}
      {mode === "setup" && (
        <form onSubmit={handleSetup} noValidate className="flex flex-col gap-5 max-w-[440px]">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Nhập lại mã PIN</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-7 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Tạo mã PIN 🎀"}
            </button>
          </div>
        </form>
      )}

      {/* Change Form */}
      {mode === "change" && (
        <form onSubmit={handleChange} noValidate className="flex flex-col gap-5 max-w-[440px]">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Mã PIN hiện tại</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={currentPin}
                onChange={(e) => {
                  setCurrentPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Nhập lại mã PIN mới</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-7 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Đổi mã PIN 🎀"}
            </button>
          </div>
        </form>
      )}

      {/* Reset Flow: Step 1 Request */}
      {mode === "reset" && resetStep === "request" && (
        <div className="flex flex-col gap-5 max-w-[440px]">
          <div className="rounded-2xl bg-primary-50 p-4 border border-primary-100">
            <p className="text-[13px] font-medium text-neutral-700 leading-relaxed">
              Hệ thống sẽ gửi <strong>mã OTP 6 số</strong> về địa chỉ email của bạn để xác thực đặt lại mã PIN.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Huỷ
            </button>
            <button
              onClick={handleResetRequest}
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-7 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Gửi mã OTP qua email 📩"}
            </button>
          </div>
        </div>
      )}

      {/* Reset Flow: Step 2 Confirm */}
      {mode === "reset" && resetStep === "confirm" && (
        <form onSubmit={handleResetConfirm} noValidate className="flex flex-col gap-5 max-w-[440px]">
          <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-[13px] font-medium text-emerald-800">
            📩 Mã OTP đã được gửi đến <strong>{maskedEmail}</strong>. Mã có hiệu lực trong 5 phút.
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Mã OTP từ Email</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="000000"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-neutral-900">Nhập lại mã PIN mới</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                value={newPinConfirm}
                onChange={(e) => {
                  setNewPinConfirm(e.target.value.replace(/\D/g, ""));
                  setFormError(null);
                }}
                placeholder="••••••"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-7 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Đặt lại mã PIN 🔐"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
