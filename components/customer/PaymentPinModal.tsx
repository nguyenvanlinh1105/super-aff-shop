"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, ShieldCheck, KeyRound, MailCheck, Lock, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type PinMode = "enter" | "setup" | "reset_request" | "reset_confirm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hasPin: boolean;
  /** Called after successful PIN entry or setup — proceed with withdrawal */
  onPinVerified: (pin: string) => void;
}

export function PaymentPinModal({ isOpen, onClose, hasPin, onPinVerified }: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<PinMode>(hasPin ? "enter" : "setup");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [step, setStep] = useState<"intro" | "pin" | "confirm">("intro"); // for setup mode
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(hasPin ? "enter" : "setup");
      setPin("");
      setConfirmPin("");
      setOtp("");
      setNewPin("");
      setNewPinConfirm("");
      setStep(hasPin ? "pin" : "intro");
      setLoading(false);
      setErrorMessage(null);
    }
  }, [isOpen, hasPin]);

  // Auto-focus first input when mode changes
  useEffect(() => {
    if (isOpen && step !== "intro") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, mode, step]);

  const handlePinChange = useCallback(
    (value: string, index: number, setter: (v: string) => void, currentValue: string) => {
      if (!/^\d*$/.test(value)) return;
      const chars = currentValue.split("");
      chars[index] = value;
      const newVal = chars.join("").slice(0, 6);
      setter(newVal);

      // Auto-advance to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, currentValue: string, setter: (v: string) => void) => {
      if (e.key === "Backspace" && !currentValue[index] && index > 0) {
        const chars = currentValue.split("");
        chars[index - 1] = "";
        setter(chars.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    },
    []
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent, setter: (v: string) => void) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      setter(pasted);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    },
    []
  );

  function renderPinInputs(value: string, setter: (v: string) => void, masked = true) {
    return (
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const isFilled = !!value[i];
          const isFocused = document.activeElement === inputRefs.current[i];
          return (
            <div key={i} className="relative">
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="off"
                value={value[i] || ""}
                onChange={(e) => handlePinChange(e.target.value, i, setter, value)}
                onKeyDown={(e) => handleKeyDown(e, i, value, setter)}
                onPaste={(e) => handlePaste(e, setter)}
                className="h-[52px] w-[46px] rounded-xl border-2 bg-white text-center text-[22px] font-black transition-all duration-200 outline-none caret-transparent"
                style={{
                  borderColor: isFilled ? "var(--color-primary-400)" : "var(--color-primary-200)",
                  color: masked ? "transparent" : "var(--color-neutral-900)",
                  boxShadow: isFilled ? "0 2px 8px rgba(var(--color-primary-500-rgb, 236 72 153), 0.15)" : "none",
                }}
              />
              {/* Dot indicator for filled digits */}
              {masked && isFilled && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary-500" />
                </div>
              )}
              {/* Cursor blink for active empty cell */}
              {!isFilled && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-[2px] rounded-full bg-primary-300 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── MODE: ENTER PIN (Nhập PIN để rút tiền) ──
  async function handleEnterPin() {
    if (pin.length !== 6) return;
    onPinVerified(pin);
  }

  // ── MODE: SETUP PIN (Tạo PIN lần đầu) ──
  async function handleSetupPin() {
    setErrorMessage(null);
    if (step === "pin") {
      if (pin.length !== 6) return;
      setStep("confirm");
      setConfirmPin("");
      return;
    }

    // step === "confirm"
    if (confirmPin.length !== 6) return;
    if (pin !== confirmPin) {
      setErrorMessage("Mã PIN nhập lại không khớp. Vui lòng thử lại.");
      setConfirmPin("");
      setStep("pin");
      setPin("");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/customer/pin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, confirmPin }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Có lỗi xảy ra khi tạo mã PIN.");
      return;
    }

    toast.success("Đã thiết lập mã PIN rút tiền thành công! 🎀", "Thành công");
    onPinVerified(pin);
  }

  // ── MODE: RESET REQUEST (Gửi OTP qua email) ──
  async function handleResetRequest() {
    setErrorMessage(null);
    setLoading(true);
    const res = await fetch("/api/customer/pin/reset-request", { method: "POST" });
    setLoading(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrorMessage(data.error ?? "Không gửi được email xác nhận.");
      return;
    }

    setMaskedEmail(data.email || "");
    setMode("reset_confirm");
  }

  // ── MODE: RESET CONFIRM (Nhập OTP + PIN mới) ──
  async function handleResetConfirm() {
    setErrorMessage(null);
    if (otp.length !== 6) {
      setErrorMessage("Vui lòng nhập mã OTP 6 số.");
      return;
    }
    if (newPin.length !== 6) {
      setErrorMessage("Mã PIN mới phải là 6 chữ số.");
      return;
    }
    if (newPin !== newPinConfirm) {
      setErrorMessage("Mã PIN mới nhập lại không khớp.");
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
      setErrorMessage(data.error ?? "Mã OTP không đúng hoặc có lỗi xảy ra.");
      return;
    }

    toast.success("Đã đặt lại mã PIN thành công! Bạn có thể rút tiền ngay. 🎀", "Thành công");
    // Return to enter mode with new PIN
    setMode("enter");
    setPin("");
    setErrorMessage(null);
  }

  if (!isOpen) return null;

  // Progress steps for setup mode
  const setupSteps = [
    { key: "intro", label: "Giới thiệu" },
    { key: "pin", label: "Tạo PIN" },
    { key: "confirm", label: "Xác nhận" },
  ];
  const currentStepIndex = setupSteps.findIndex((s) => s.key === step);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-[420px] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl fade-in border border-primary-100/50">
        {/* Header — glassmorphic gradient */}
        <div className="relative overflow-hidden">
          {/* Background gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-300 to-pink-200 opacity-90" />
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />

          <div className="relative flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-sm text-white shadow-lg shadow-primary-500/20">
                {mode === "reset_confirm" ? <MailCheck size={22} /> : mode === "reset_request" ? <KeyRound size={22} /> : <Lock size={22} />}
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-white drop-shadow-sm">
                  {mode === "enter" && "Nhập mã PIN"}
                  {mode === "setup" && step === "intro" && "Bảo vệ ví tiền"}
                  {mode === "setup" && step === "pin" && "Tạo mã PIN"}
                  {mode === "setup" && step === "confirm" && "Xác nhận mã PIN"}
                  {mode === "reset_request" && "Quên mã PIN"}
                  {mode === "reset_confirm" && "Đặt lại mã PIN"}
                </h3>
                <p className="text-[12px] font-medium text-white/80">
                  {mode === "enter" && "Nhập 6 số PIN để xác nhận rút tiền"}
                  {mode === "setup" && step === "intro" && "Thiết lập mã PIN để bảo vệ số dư"}
                  {mode === "setup" && step === "pin" && "Nhập 6 chữ số bạn muốn dùng làm PIN"}
                  {mode === "setup" && step === "confirm" && "Nhập lại mã PIN để xác nhận"}
                  {mode === "reset_request" && "Gửi mã OTP về email để đặt lại"}
                  {mode === "reset_confirm" && `Mã OTP đã gửi đến ${maskedEmail}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Step progress indicator for setup mode */}
          {mode === "setup" && (
            <div className="relative flex items-center justify-center gap-2 pb-4 px-5">
              {setupSteps.map((s, idx) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    idx <= currentStepIndex
                      ? "bg-white text-primary-600 shadow-sm"
                      : "bg-white/20 text-white/70"
                  }`}>
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${
                      idx < currentStepIndex
                        ? "bg-emerald-500 text-white"
                        : idx === currentStepIndex
                        ? "bg-primary-500 text-white"
                        : "bg-white/30 text-white/80"
                    }`}>
                      {idx < currentStepIndex ? "✓" : idx + 1}
                    </span>
                    {s.label}
                  </div>
                  {idx < setupSteps.length - 1 && (
                    <ChevronRight size={12} className="text-white/40" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {errorMessage && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-center text-[13px] font-bold text-rose-600 animate-in fade-in">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* ENTER MODE */}
          {mode === "enter" && (
            <>
              <div className="py-2">
                {renderPinInputs(pin, setPin)}
              </div>
              <button
                onClick={handleEnterPin}
                disabled={pin.length !== 6 || loading}
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận rút tiền 🎀"}
              </button>
              <button
                type="button"
                onClick={() => setMode("reset_request")}
                className="text-[13px] font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors"
              >
                Quên mã PIN?
              </button>
            </>
          )}

          {/* SETUP MODE */}
          {mode === "setup" && (
            <>
              {step === "intro" ? (
                <>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-5 border border-emerald-200/60">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <ShieldCheck size={16} />
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-emerald-800 leading-relaxed">
                        Bạn chưa có mã PIN rút tiền. Để đảm bảo an toàn cho tài khoản, hệ thống yêu cầu bạn <strong>thiết lập mã PIN 6 số</strong> trước khi tiến hành rút tiền lần đầu.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("pin")}
                    className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    Tạo mã PIN ngay 🛡️
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[13px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    Để sau
                  </button>
                </>
              ) : step === "pin" ? (
                <>
                  <div className="py-2">
                    {renderPinInputs(pin, setPin)}
                  </div>
                  <button
                    onClick={handleSetupPin}
                    disabled={pin.length !== 6}
                    className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    Tiếp tục
                  </button>
                </>
              ) : (
                <>
                  <div className="py-2">
                    {renderPinInputs(confirmPin, setConfirmPin)}
                  </div>
                  <button
                    onClick={handleSetupPin}
                    disabled={confirmPin.length !== 6 || loading}
                    className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Tạo mã PIN & Rút tiền 🎀"}
                  </button>
                </>
              )}
            </>
          )}

          {/* RESET REQUEST MODE */}
          {mode === "reset_request" && (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50 p-5 border border-primary-100/60">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
                      <MailCheck size={16} />
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-neutral-700 leading-relaxed">
                    Hệ thống sẽ gửi <strong>mã OTP 6 số</strong> về email đăng ký của bạn. Sử dụng mã này để đặt lại mã PIN rút tiền mới.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetRequest}
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Gửi mã OTP về Email 📩"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("enter"); setPin(""); }}
                className="text-[13px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                ← Quay lại nhập PIN
              </button>
            </>
          )}

          {/* RESET CONFIRM MODE */}
          {mode === "reset_confirm" && (
            <>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Mã OTP từ Email</label>
                {renderPinInputs(otp, setOtp, false)}
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Mã PIN mới (6 số)</label>
                {renderPinInputs(newPin, setNewPin)}
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">Xác nhận PIN mới</label>
                {renderPinInputs(newPinConfirm, setNewPinConfirm)}
              </div>
              <button
                onClick={handleResetConfirm}
                disabled={loading || otp.length !== 6 || newPin.length !== 6 || newPinConfirm.length !== 6}
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Đặt lại mã PIN 🔐"}
              </button>
              <button
                type="button"
                onClick={handleResetRequest}
                disabled={loading}
                className="text-[13px] font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors"
              >
                Gửi lại mã OTP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
