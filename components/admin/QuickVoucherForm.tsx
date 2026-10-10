"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

type Option = { id: string; label: string };

export function QuickVoucherForm({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [voucherUrl, setVoucherUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId, voucherUrl }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data.error ?? "Không đăng được ưu đãi";
        setError(err);
        toast.error(err);
        return;
      }

      setVoucherUrl("");
      toast.success("Đã đăng ưu đãi thành công!");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Có lỗi xảy ra khi đăng ưu đãi");
      toast.error("Có lỗi xảy ra khi đăng ưu đãi");
    }
  }

  return (
    <div className="rounded-3xl bg-primary-50/50 border border-primary-100/80 p-lg shadow-cute">
      <div className="mb-md flex items-center gap-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-cute">
          <Zap size={16} strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-[15px] font-bold text-neutral-900">Đăng ưu đãi nhanh</h3>
          <p className="text-[12px] font-medium text-neutral-500">
            Chỉ cần dán link deal — hệ thống tự lấy tên và ảnh sản phẩm.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-sm sm:flex-row">
        <CustomSelect
          value={platformId}
          onChange={setPlatformId}
          options={platforms.map((p) => ({ value: p.id, label: p.label }))}
          className="w-full sm:w-[170px] shrink-0"
          buttonClassName="h-11 border-primary-100/80 bg-white text-[13.5px] font-extrabold text-neutral-800"
          ariaLabel="Chọn sàn"
        />
        <input
          type="text"
          placeholder="Dán link deal Shopee/TikTok vào đây..."
          required
          value={voucherUrl}
          onChange={(e) => setVoucherUrl(e.target.value)}
          className="h-11 flex-1 rounded-2xl border border-primary-100/80 bg-white px-md text-[14px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !platformId}
          className="h-11 shrink-0 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 px-xl text-[14px] font-bold text-white shadow-cute hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Đang đăng..." : "Đăng ngay"}
        </button>
      </form>
      {error && <div className="mt-sm text-[13px] font-medium text-rose-500">{error}</div>}
    </div>
  );
}
