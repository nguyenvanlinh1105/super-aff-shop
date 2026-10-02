"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, X, CheckCircle2, Loader2 } from "lucide-react";
import { ZaloIcon } from "@/components/icons/PlatformIcons";

const PHONE_PATTERN = /^0\d{9}$/;

type PhoneNumberPromptProps = {
  initialPhone?: string | null;
};

export function PhoneNumberPrompt({ initialPhone }: PhoneNumberPromptProps = {}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("meow_phone_prompt_dismissed") === "true") {
        setDismissed(true);
      }
    } catch (_) {}
  }, []);

  // Nếu người dùng đã có số điện thoại rồi thì tuyệt đối không hiển thị nhắc nhở nữa
  if (initialPhone && initialPhone.trim().length > 0) return null;
  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("meow_phone_prompt_dismissed", "true");
    } catch (_) {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.startsWith("84")) {
      cleanPhone = "0" + cleanPhone.slice(2);
    }
    if (!PHONE_PATTERN.test(cleanPhone)) {
      setError("Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 0, VD: 0901234567)");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        let msg = data.error;
        if (!msg || msg === "Failed to update profile") {
          msg = "Không thể cập nhật số điện thoại. Vui lòng thử lại.";
        }
        if (res.status === 401) {
          setError(msg || "Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }
        setError(msg);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setDismissed(true);
        router.refresh();
      }, 1000);
    } catch {
      setLoading(false);
      setError("Lỗi kết nối máy chủ, vui lòng thử lại sau");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-50/95 via-rose-50/65 to-pink-100/40 p-4 sm:p-5 border border-primary-200/90 shadow-sm shadow-primary-500/5">
      {/* Decorative gentle glow */}
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-primary-400/10 blur-xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-pink-400/10 blur-xl pointer-events-none" />

      {/* Dismiss Button on Mobile (< lg) */}
      <button
        type="button"
        onClick={handleDismiss}
        className="lg:hidden absolute right-3 top-3 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white/90 hover:bg-white text-neutral-400 hover:text-neutral-700 shadow-2xs border border-primary-100/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
        aria-label="Đóng"
      >
        <X size={14} />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left: Icon + Content aligned harmoniously */}
        <div className="flex items-start gap-3 min-w-0 flex-1 pr-8 lg:pr-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-rose-500 to-pink-600 text-white shadow-sm shadow-primary-500/25 border-2 border-white mt-0.5">
            <Phone size={18} strokeWidth={2.4} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h4 className="text-[13.5px] sm:text-[15px] font-extrabold text-neutral-900 tracking-tight leading-snug">
                Cập nhật số điện thoại nhận hoàn tiền
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 border border-primary-200/80 shadow-2xs shrink-0 flex items-center gap-1">
                <ZaloIcon size={11} pure />
                <span>Nên có Zalo</span>
              </span>
            </div>

            <p className="text-[11.5px] sm:text-xs text-neutral-600 font-medium leading-relaxed mt-1">
              <strong className="text-neutral-900">Lưu ý quan trọng:</strong> Quý khách nên cập nhật số điện thoại <strong className="text-primary-700 underline decoration-primary-300 decoration-1 underline-offset-2">đã đăng ký Zalo</strong> để hệ thống tự động gửi tin nhắn báo khi tiền về ví và được hỗ trợ đối soát đơn hàng tức thì.
            </p>
          </div>
        </div>

        {/* Right: Form + Desktop dismiss button side-by-side */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto">
          <form onSubmit={submit} className="flex-1 lg:flex-none">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="group/input relative flex-1 min-w-0 sm:w-[210px] lg:w-[230px]">
                <Phone
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within/input:text-primary-600 transition-colors"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="Ví dụ: 0901234567"
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("84")) {
                      val = "0" + val.slice(2);
                    }
                    setPhone(val.slice(0, 10));
                    if (error) setError(null);
                  }}
                  className="h-10 sm:h-11 w-full rounded-xl sm:rounded-2xl border border-primary-200/90 bg-white pl-10 pr-8 text-xs sm:text-[13px] font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:border-primary-500 focus:outline-none focus:ring-3 focus:ring-primary-100 shadow-2xs transition-all hover:border-primary-300"
                />
                {phone.length > 0 && !loading && !success && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhone("");
                      if (error) setError(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Xóa số"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !phone.trim() || success}
                className={`h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-white text-xs sm:text-[13px] font-extrabold shadow-cute hover:shadow-cute-lg transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  success
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-gradient-to-r from-primary-500 via-rose-500 to-pink-600 hover:from-primary-600 hover:to-rose-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </span>
                ) : success ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} strokeWidth={2.4} />
                    <span>Đã lưu</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={15} strokeWidth={2.4} />
                    <span className="sm:hidden">Lưu</span>
                    <span className="hidden sm:inline">{initialPhone ? "Cập nhật" : "Lưu số"}</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            )}
          </form>

          {/* Dismiss Button on Desktop (PC) - vertically aligned with input & button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="hidden lg:flex h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-400 hover:text-neutral-700 shadow-2xs border border-primary-200/80 hover:border-primary-300 items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            aria-label="Đóng thông báo"
            title="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
