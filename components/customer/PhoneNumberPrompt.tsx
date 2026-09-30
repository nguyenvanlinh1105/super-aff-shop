"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, X, CheckCircle2 } from "lucide-react";
import { ZaloIcon } from "@/components/icons/PlatformIcons";

const PHONE_PATTERN = /^0\d{9}$/;

export function PhoneNumberPrompt() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_PATTERN.test(phone)) {
      setError("Số điện thoại không hợp lệ (VD: 0901234567)");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Không lưu được, vui lòng thử lại");
      return;
    }

    router.refresh();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/70 to-pink-100/50 p-4 sm:p-5 border-2 border-primary-200/90 shadow-cute">
      {/* Decorative gentle glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-400/15 blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-pink-400/15 blur-xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-neutral-400 hover:text-neutral-700 shadow-2xs flex items-center justify-center transition-colors cursor-pointer z-10"
        aria-label="Đóng"
      >
        <X size={15} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start gap-3.5 pr-6 sm:pr-8">
        {/* Left: Avatar Icon */}
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-rose-500 to-pink-600 text-white shadow-md shadow-primary-500/25 border-2 border-white">
          <Phone size={22} strokeWidth={2.4} />
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] sm:text-[16px] font-black text-neutral-900 tracking-tight">
              Cập nhật số điện thoại nhận hoàn tiền
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 border border-primary-200 shadow-2xs shrink-0 flex items-center gap-1">
              <ZaloIcon size={12} pure />
              <span>Nên dùng số có Zalo</span>
            </span>
          </div>

          <p className="text-xs sm:text-[12.5px] text-neutral-600 font-medium leading-relaxed mt-1.5">
            <strong className="text-neutral-900">Lưu ý quan trọng:</strong> Quý khách nên cập nhật số điện thoại <strong className="text-primary-700 underline decoration-primary-300 decoration-2 underline-offset-2">đã đăng ký Zalo</strong> để hệ thống tự động gửi tin nhắn báo khi tiền về ví và được hỗ trợ đối soát đơn hàng tức thì.
          </p>

          {/* Form */}
          <form onSubmit={submit} className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:max-w-[280px]">
              <Phone
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="tel"
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                className="h-10 sm:h-11 w-full rounded-2xl border border-primary-200/90 bg-white pl-9 pr-3.5 text-[13px] font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 shadow-2xs transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="h-10 sm:h-11 px-5 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-600 hover:from-primary-600 hover:to-rose-700 text-white text-[13px] font-extrabold shadow-cute hover:shadow-cute-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.4} />
                  <span>Cập nhật số điện thoại</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-2 text-[11.5px] font-bold text-rose-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
