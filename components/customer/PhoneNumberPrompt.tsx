"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-lg sm:p-xl border border-emerald-200/60 shadow-cute fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-lg top-lg text-neutral-400 hover:text-neutral-700 transition-colors"
        aria-label="Đóng"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-md pr-xl">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Phone size={20} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-neutral-900">Thêm số điện thoại Zalo</h3>
          <p className="mt-[2px] text-[13px] text-neutral-500 leading-relaxed">
            Để chúng tôi liên hệ hỗ trợ và xác nhận hoàn tiền nhanh hơn qua Zalo.
          </p>
          <form onSubmit={submit} className="mt-md flex flex-col gap-sm sm:flex-row sm:items-start">
            <div className="flex-1 sm:max-w-[220px]">
              <TextInput
                type="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 bg-white rounded-2xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !phone}
              className="h-11 w-fit rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              {loading ? "Đang lưu..." : "Lưu số điện thoại"}
            </Button>
          </form>
          {error && <p className="mt-xs text-[12px] font-medium text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
