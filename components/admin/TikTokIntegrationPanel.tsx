"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Power, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/TextInput";

type Props = {
  platformStatus: string;
  config: {
    baseUrl: string;
    hasApiKey: boolean;
    creatorUsername: string | null;
    hasCreatorUsername: boolean;
    hasSigningSecret: boolean;
    readyForLinks: boolean;
    readyForWebhook: boolean;
  };
};

export function TikTokIntegrationPanel({ platformStatus, config }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [updateTimeStart, setUpdateTimeStart] = useState("");
  const [updateTimeEnd, setUpdateTimeEnd] = useState("");
  const [orderId, setOrderId] = useState("");
  const active = platformStatus === "active";

  async function togglePlatform() {
    setLoading("toggle");
    setMessage(null);
    const res = await fetch("/api/admin/platforms/TIKTOK", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: active ? "inactive" : "active" }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? (active ? "Đã tạm tắt TikTok Shop." : "Đã bật TikTok Shop.") : data.error ?? "Không cập nhật được nền tảng");
    if (res.ok) router.refresh();
  }

  async function testConnection() {
    setLoading("test");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/tiktok/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    setMessage(res.ok ? `Kết nối RioHub OK. Creator ${data.creatorUsername}, ${data.total ?? 0} link.` : data.error ?? "Test thất bại");
  }

  async function syncOrders() {
    setLoading("sync");
    setMessage(null);
    const res = await fetch("/api/admin/integrations/tiktok/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeStart: timeStart || null,
        timeEnd: timeEnd || null,
        updateTimeStart: updateTimeStart || null,
        updateTimeEnd: updateTimeEnd || null,
        orderId: orderId || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      setMessage(data.error ?? "Đồng bộ thất bại");
      return;
    }
    const r = data.result;
    setMessage(`Đồng bộ xong: ${r.processed} đơn, tạo mới ${r.created}, cập nhật ${r.updated}, approved ${r.approved}, chưa map ${r.unmapped}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Power size={16} className="text-neutral-500" />
              <div className="text-[14px] font-bold text-neutral-900">Nền tảng TikTok Shop</div>
            </div>
            <Badge tone={active ? "positive" : "warning"} dot>
              {active ? "Đang bật" : "Tạm tắt"}
            </Badge>
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
            Khi tạm tắt, TikTok sẽ ẩn khỏi màn tạo link và API sẽ từ chối tạo link TikTok mới.
          </p>
          <Button type="button" variant={active ? "danger" : "primary"} onClick={togglePlatform} disabled={loading === "toggle"}>
            <Power size={16} />
            {active ? "Tạm tắt TikTok" : "Bật TikTok"}
          </Button>
        </div>

        <div className="rounded-2xl border border-neutral-100 p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-neutral-500" />
            <div className="text-[14px] font-bold text-neutral-900">Cấu hình RioHub</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <Status label="API key" ok={config.hasApiKey} />
            <Status label="Creator" ok={config.hasCreatorUsername} />
            <Status label="Webhook secret" ok={config.hasSigningSecret} />
            <Status label="Tạo link" ok={config.readyForLinks} />
          </div>
          <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-[12px] text-neutral-500">
            <div>Base URL: <span className="font-mono">{config.baseUrl}</span></div>
            <div>Creator: <span className="font-mono">{config.creatorUsername ?? "chưa cấu hình"}</span></div>
          </div>
          <Button type="button" variant="secondary" className="mt-4" onClick={testConnection} disabled={loading === "test"}>
            <Activity size={16} />
            Kiểm tra kết nối
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-100 p-6">
        <div className="mb-4 flex items-center gap-2">
          <RefreshCw size={16} className="text-neutral-500" />
          <div className="text-[14px] font-bold text-neutral-900">Đồng bộ đơn TikTok</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <TextInput placeholder="time_start" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
          <TextInput placeholder="time_end" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
          <TextInput placeholder="update_time_start" value={updateTimeStart} onChange={(e) => setUpdateTimeStart(e.target.value)} />
          <TextInput placeholder="update_time_end" value={updateTimeEnd} onChange={(e) => setUpdateTimeEnd(e.target.value)} />
        </div>
        <div className="mt-4">
          <TextInput
            placeholder="order_id TikTok, ngăn cách dấu phẩy nếu nhiều đơn"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Button type="button" onClick={syncOrders} disabled={loading === "sync"}>
            <RefreshCw size={16} />
            Đồng bộ ngay
          </Button>
          <p className="text-[12px] text-neutral-500">
            File TikTok dashboard không có tracking/sub2, chỉ dùng để copy ID đơn hàng. Hệ thống sẽ kéo qua RioHub để map khách.
          </p>
        </div>
      </div>

      {message && <div className="rounded-xl bg-neutral-50 p-4 text-[13px] font-medium text-neutral-700">{message}</div>}
    </div>
  );
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-1.5">
      <span className="text-neutral-500">{label}</span>
      <span className={ok ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>{ok ? "OK" : "Thiếu"}</span>
    </div>
  );
}
