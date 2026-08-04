"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, ShieldCheck, KeyRound, MailCheck } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

type PinMode = "enter" | "setup" | "reset_request" | "reset_confirm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hasPin: boolean;
  /** Called after successful PIN entry or setup — proceed with withdrawal */
  onPinVerified: (pin: string) => void;
}

export function PaymentPinModal({ isOpen, onClose, hasPin, onPinVerified }: Props) {
  const modal = useModal();
  const [mode, setMode] = useState<PinMode>(hasPin ? "enter" : "setup");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [step, setStep] = useState<"intro" | "pin" | "confirm">("intro"); // for setup mode

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

  function renderPinInputs(value: string, setter: (v: string) => void, autoSubmitLength?: number) {
    return (
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handlePinChange(e.target.value, i, setter, value)}
            onKeyDown={(e) => handleKeyDown(e, i, value, setter)}
            onPaste={(e) => handlePaste(e, setter)}
            className="h-14 w-11 sm:w-12 rounded-2xl border-2 border-primary-200 bg-white text-center text-[20px] font-black text-neutral-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:scale-105"
          />
        ))}
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
    if (step === "pin") {
      if (pin.length !== 6) return;
      setStep("confirm");
      setConfirmPin("");
      return;
    }

    // step === "confirm"
    if (confirmPin.length !== 6) return;
    if (pin !== confirmPin) {
      modal.alert({ title: "Lỗi", message: "Mã PIN nhập lại không khớp. Vui lòng thử lại.", iconType: "danger" });
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
      modal.alert({ title: "Lỗi", message: data.error ?? "Có lỗi xảy ra", iconType: "danger" });
      return;
    }

    modal.alert({ title: "Thành công 🎀", message: "Đã thiết lập mã PIN rút tiền!", iconType: "success" });
    onPinVerified(pin);
  }

  // ── MODE: RESET REQUEST (Gửi OTP qua email) ──
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
    setMode("reset_confirm");
  }

  // ── MODE: RESET CONFIRM (Nhập OTP + PIN mới) ──
  async function handleResetConfirm() {
    if (otp.length !== 6) {
      modal.alert({ title: "Lỗi", message: "Vui lòng nhập mã OTP 6 số", iconType: "danger" });
      return;
    }
    if (newPin.length !== 6) {
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

    modal.alert({ title: "Thành công 🎀", message: "Đã đặt lại mã PIN! Bạn có thể rút tiền ngay.", iconType: "success" });
    // Return to enter mode with new PIN
    setMode("enter");
    setPin("");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-[400px] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl fade-in border border-primary-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary-100 p-5 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              {mode === "reset_confirm" ? <MailCheck size={20} /> : mode === "reset_request" ? <KeyRound size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-neutral-900">
                {mode === "enter" && "Nhập mã PIN 🔐"}
                {mode === "setup" && step === "intro" && "Bảo vệ ví tiền của bạn 🛡️"}
                {mode === "setup" && step === "pin" && "Tạo mã PIN rút tiền 🔐"}
                {mode === "setup" && step === "confirm" && "Xác nhận mã PIN"}
                {mode === "reset_request" && "Quên mã PIN"}
                {mode === "reset_confirm" && "Đặt lại mã PIN"}
              </h3>
              <p className="text-[12px] font-medium text-neutral-500">
                {mode === "enter" && "Nhập 6 số PIN để xác nhận rút tiền"}
                {mode === "setup" && step === "intro" && "Thiết lập mã PIN để bảo vệ số dư"}
                {mode === "setup" && step === "pin" && "Tạo mã PIN 6 số để bảo vệ ví tiền"}
                {mode === "setup" && step === "confirm" && "Nhập lại mã PIN để xác nhận"}
                {mode === "reset_request" && "Gửi mã OTP về email để đặt lại"}
                {mode === "reset_confirm" && `Mã OTP đã gửi đến ${maskedEmail}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* ENTER MODE */}
          {mode === "enter" && (
            <>
              {renderPinInputs(pin, setPin)}
              <button
                onClick={handleEnterPin}
                disabled={pin.length !== 6 || loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận rút tiền 🎀"}
              </button>
              <button
                type="button"
                onClick={() => setMode("reset_request")}
                className="text-[13px] font-bold text-primary-500 hover:text-primary-600 hover:underline"
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
                  <div className="rounded-2xl bg-[#E6F8EE] p-4 border border-emerald-200 text-center">
                    <p className="text-[13px] font-medium text-emerald-800 leading-relaxed">
                      Bạn chưa có mã PIN rút tiền. Để đảm bảo an toàn cho tài khoản, hệ thống yêu cầu bạn <strong>thiết lập mã PIN 6 số</strong> trước khi tiến hành rút tiền lần đầu.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("pin")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98]"
                  >
                    Tạo mã PIN ngay 🛡️
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[13px] font-bold text-neutral-500 hover:text-neutral-900 hover:underline"
                  >
                    Để sau
                  </button>
                </>
              ) : step === "pin" ? (
                <>
                  {renderPinInputs(pin, setPin)}
                  <button
                    onClick={handleSetupPin}
                    disabled={pin.length !== 6}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục
                  </button>
                </>
              ) : (
                <>
                  {renderPinInputs(confirmPin, setConfirmPin)}
                  <button
                    onClick={handleSetupPin}
                    disabled={confirmPin.length !== 6 || loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="rounded-2xl bg-primary-50 p-4 border border-primary-100">
                <p className="text-[13px] font-medium text-neutral-700 leading-relaxed">
                  Hệ thống sẽ gửi <strong>mã OTP 6 số</strong> về email đăng ký của bạn. Sử dụng mã này để đặt lại mã PIN rút tiền mới.
                </p>
              </div>
              <button
                onClick={handleResetRequest}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Gửi mã OTP về Email 📩"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("enter"); setPin(""); }}
                className="text-[13px] font-bold text-neutral-500 hover:text-neutral-900 hover:underline"
              >
                ← Quay lại nhập PIN
              </button>
            </>
          )}

          {/* RESET CONFIRM MODE */}
          {mode === "reset_confirm" && (
            <>
              <div>
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wider mb-2 block">Mã OTP từ Email</label>
                {renderPinInputs(otp, setOtp)}
              </div>
              <div>
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wider mb-2 block">Mã PIN mới (6 số)</label>
                {renderPinInputs(newPin, setNewPin)}
              </div>
              <div>
                <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wider mb-2 block">Xác nhận PIN mới</label>
                {renderPinInputs(newPinConfirm, setNewPinConfirm)}
              </div>
              <button
                onClick={handleResetConfirm}
                disabled={loading || otp.length !== 6 || newPin.length !== 6 || newPinConfirm.length !== 6}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[15px] font-bold text-white shadow-cute transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Đặt lại mã PIN 🔐"}
              </button>
              <button
                type="button"
                onClick={handleResetRequest}
                disabled={loading}
                className="text-[13px] font-bold text-primary-500 hover:text-primary-600 hover:underline"
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
