"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LazadaSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/admin/integrations/lazada/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Đồng bộ thất bại");
      return;
    }

    const r = data.result;
    setMessage(`✓ ${r.processed} đơn — mới ${r.created}, cập nhật ${r.updated}, chưa map ${r.unmapped}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="secondary" size="md" onClick={sync} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} strokeWidth={2} />}
        Đồng bộ Lazada
      </Button>
      {message && <span className="max-w-[220px] text-right text-[11px] font-medium text-neutral-500">{message}</span>}
    </div>
  );
}
