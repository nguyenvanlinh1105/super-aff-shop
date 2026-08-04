"use client";

import { useState } from "react";
import { ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

interface Props {
  hasPin: boolean;
}

export function PaymentPinSettings({ hasPin: initialHasPin }: Props) {
  const modal = useModal();
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

  const resetForm = () => {
    setPin("");
    setConfirmPin("");
    setCurrentPin("");
    setOtp("");
    setNewPin("");
    setNewPinConfirm("");
    setMode("idle");
    setResetStep("request");
  };

  // ── Setup PIN ──
  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      modal.alert({ title: "Lỗi", message: "Mã PIN phải là 6 chữ số", iconType: "danger" });
      return;
    }
    if (pin !== confirmPin) {
      modal.alert({ title: "Lỗi", message: "Mã PIN nhập lại không khớp", iconType: "danger" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/customer/pin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, confirmPin }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      modal.alert({ title: "Lỗi", message: data.error ?? "Có lỗi xảy ra", iconType: "danger" });
      return;
    }

    modal.alert({ title: "Thành công 🎀", message: "Đã thiết lập mã PIN rút tiền!", iconType: "success" });
    setHasPin(true);
    resetForm();
  }

  // ── Change PIN ──
  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      modal.alert({ title: "Lỗi", message: "Mã PIN mới phải là 6 chữ số", iconType: "danger" });
      return;
    }
    if (pin !== confirmPin) {
      modal.alert({ title: "Lỗi", message: "Mã PIN mới nhập lại không khớp", iconType: "danger" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/customer/pin/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin, newPin: pin, confirmPin }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      modal.alert({ title: "Lỗi", message: data.error ?? "Có lỗi xảy ra", iconType: "danger" });
      return;
    }

    modal.alert({ title: "Thành công 🎀", message: "Đổi mã PIN thành công!", iconType: "success" });
    resetForm();
  }

  // ── Reset PIN: Request OTP ──
  async function handleResetRequest() {
    setLoading(true);
    const res = await fetch("/api/customer/pin/reset-request", { method: "POST" });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      modal.alert({ title: "Lỗi", message: data.error ?? "Không gửi được email", iconType: "danger" });
      return;
    }

    setMaskedEmail(data.email || "");
    setResetStep("confirm");
  }

  // ── Reset PIN: Confirm OTP + New PIN ──
  async function handleResetConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(newPin)) {
      modal.alert({ title: "Lỗi", message: "Mã PIN mới phải là 6 chữ số", iconType: "danger" });
      return;
    }
    if (newPin !== newPinConfirm) {
      modal.alert({ title: "Lỗi", message: "Mã PIN mới nhập lại không khớp", iconType: "danger" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/customer/pin/reset-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, newPin, confirmPin: newPinConfirm }),
    });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      modal.alert({ title: "Lỗi", message: data.error ?? "Có lỗi xảy ra", iconType: "danger" });
      return;
    }

    modal.alert({ title: "Thành công 🎀", message: "Đặt lại mã PIN thành công!", iconType: "success" });
    setHasPin(true);
    resetForm();
  }

  const inputClass =
    "h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[16px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15";

  return (
    <div className="flex flex-col gap-lg">
      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-4 border ${
        hasPin
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          hasPin ? "bg-emerald-100" : "bg-amber-100"
        }`}>
          <ShieldCheck size={20} strokeWidth={2} className={hasPin ? "text-emerald-600" : "text-amber-600"} />
        </div>
        <div>
          <div className={`text-[14px] font-bold ${hasPin ? "text-emerald-800" : "text-amber-800"}`}>
            {hasPin ? "Mã PIN đã được thiết lập ✅" : "Chưa có mã PIN rút tiền ⚠️"}
          </div>
          <div className={`text-[12px] font-medium mt-0.5 ${hasPin ? "text-emerald-700" : "text-amber-700"}`}>
            {hasPin
              ? "Mỗi lần rút tiền, bạn sẽ cần nhập mã PIN 6 số để xác nhận."
              : "Thiết lập mã PIN để bảo vệ ví tiền của bạn khi rút tiền."}
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
              Thiết lập mã PIN
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode("change")}
                className="flex h-11 items-center gap-2 rounded-full bg-primary-100 px-5 text-[14px] font-bold text-primary-600 transition-colors hover:bg-primary-200"
              >
                Đổi mã PIN
              </button>
              <button
                onClick={() => { setMode("reset"); setResetStep("request"); }}
                className="flex h-11 items-center gap-2 rounded-full bg-neutral-100 px-5 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200"
              >
                Quên mã PIN
              </button>
            </>
          )}
        </div>
      )}

      {/* Setup Form */}
      {mode === "setup" && (
        <form onSubmit={handleSetup} noValidate className="flex flex-col gap-lg max-w-[420px]">
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Nhập lại mã PIN</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200">Huỷ</button>
            <button type="submit" disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 text-[14px] font-bold text-white shadow-cute disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Tạo mã PIN 🎀"}
            </button>
          </div>
        </form>
      )}

      {/* Change Form */}
      {mode === "change" && (
        <form onSubmit={handleChange} noValidate className="flex flex-col gap-lg max-w-[420px]">
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã PIN hiện tại</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Nhập lại mã PIN mới</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200">Huỷ</button>
            <button type="submit" disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 text-[14px] font-bold text-white shadow-cute disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Đổi mã PIN"}
            </button>
          </div>
        </form>
      )}

      {/* Reset Flow */}
      {mode === "reset" && resetStep === "request" && (
        <div className="flex flex-col gap-lg max-w-[420px]">
          <div className="rounded-2xl bg-primary-50 p-4 border border-primary-100">
            <p className="text-[13px] font-medium text-neutral-700 leading-relaxed">
              Hệ thống sẽ gửi <strong>mã OTP 6 số</strong> về email đăng ký để xác nhận đặt lại mã PIN.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200">Huỷ</button>
            <button onClick={handleResetRequest} disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 text-[14px] font-bold text-white shadow-cute disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Gửi mã OTP 📩"}
            </button>
          </div>
        </div>
      )}

      {mode === "reset" && resetStep === "confirm" && (
        <form onSubmit={handleResetConfirm} noValidate className="flex flex-col gap-lg max-w-[420px]">
          <div className="rounded-2xl bg-[#E6F8EE] p-3 border border-emerald-200 text-[13px] font-medium text-emerald-800">
            📩 Mã OTP đã gửi đến <strong>{maskedEmail}</strong>. Có hiệu lực 5 phút.
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã OTP từ Email</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="text" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Mã PIN mới (6 số)</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label className="text-[13px] font-bold text-ink">Nhập lại mã PIN mới</label>
            <div className="relative">
              <KeyRound size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
              <input type="password" inputMode="numeric" maxLength={6} required value={newPinConfirm} onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="h-12 rounded-full bg-neutral-100 px-6 text-[14px] font-bold text-neutral-600 transition-colors hover:bg-neutral-200">Huỷ</button>
            <button type="submit" disabled={loading} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-6 text-[14px] font-bold text-white shadow-cute disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Đặt lại mã PIN 🔐"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
