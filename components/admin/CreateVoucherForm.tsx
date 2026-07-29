"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

type Option = { id: string; label: string };

export function CreateVoucherForm({ platforms }: { platforms: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [benefitText, setBenefitText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platformId, title, voucherCode, benefitText }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Có lỗi xảy ra");
      return;
    }

    setTitle("");
    setVoucherCode("");
    setBenefitText("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} className="gap-sm">
        <Plus size={18} strokeWidth={1.75} />
        Thêm voucher
      </Button>
    );
  }

  return (
    <Card variant="default" className="border border-gray-100">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-lg sm:grid-cols-2">
        <Select value={platformId} onChange={(e) => setPlatformId(e.target.value)}>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        <TextInput placeholder="Tên chương trình" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextInput placeholder="Mã voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
        <TextInput
          placeholder="Nội dung ưu đãi"
          value={benefitText}
          onChange={(e) => setBenefitText(e.target.value)}
        />
        {error && <div className="sm:col-span-2 text-[14px] text-red-500">{error}</div>}
        <div className="flex gap-sm sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu voucher"}
          </Button>
          <Button type="button" variant="tertiary" onClick={() => setOpen(false)}>
            Hủy
          </Button>
        </div>
      </form>
    </Card>
  );
}
