"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type WebhookInfo = {
  bot: { id: number; username: string; first_name: string };
  webhook: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
  } | null;
};

export function TelegramWebhookStatus() {
  const [info, setInfo] = useState<WebhookInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadInfo() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/telegram/webhook-info");
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Không lấy được trạng thái bot");
      return;
    }

    setInfo(await res.json());
  }

  useEffect(() => {
    loadInfo();
  }, []);

  async function registerWebhook() {
    setRegistering(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/telegram/register-webhook", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setRegistering(false);

    if (!res.ok) {
      setError(data.error ?? "Đăng ký webhook thất bại");
      return;
    }

    setMessage(`Đã đăng ký webhook: ${data.webhookUrl}`);
    loadInfo();
  }

  const isConnected = info?.webhook?.url && info.webhook.url.length > 0;

  return (
    <Card variant="soft">
      <div className="mb-lg flex items-center justify-between">
        <h2 className="display-xs">Trạng thái kết nối bot</h2>
        <Button variant="tertiary" onClick={loadInfo} disabled={loading} className="gap-sm px-md py-xs text-[13px]">
          <RefreshCw size={14} strokeWidth={1.75} className={loading ? "animate-spin" : ""} />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-sm text-[14px] text-gray-500">
          <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />
          Đang kiểm tra...
        </div>
      ) : error ? (
        <div className="flex items-center gap-sm text-[14px] text-red-500">
          <XCircle size={16} strokeWidth={1.75} />
          {error}
        </div>
      ) : info ? (
        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap items-center gap-md text-[14px]">
            <span className="text-gray-500">Bot:</span>
            <span className="font-medium text-gray-900">@{info.bot.username}</span>
            {isConnected ? (
              <Badge tone="positive" dot>
                Đã kết nối webhook
              </Badge>
            ) : (
              <Badge tone="negative" dot>
                Chưa đăng ký webhook
              </Badge>
            )}
          </div>
          {info.webhook?.url && (
            <div className="break-all text-[12px] text-gray-500">Webhook URL: {info.webhook.url}</div>
          )}
          {typeof info.webhook?.pending_update_count === "number" && (
            <div className="text-[12px] text-gray-500">
              Tin nhắn đang chờ xử lý: {info.webhook.pending_update_count}
            </div>
          )}
          {info.webhook?.last_error_message && (
            <div className="flex items-start gap-sm rounded-md bg-negative-bg p-md text-[12px] text-white">
              <XCircle size={14} strokeWidth={1.75} className="mt-[2px] shrink-0" />
              Lỗi gần nhất: {info.webhook.last_error_message}
            </div>
          )}
        </div>
      ) : null}

      {message && (
        <div className="mt-md flex items-center gap-sm text-[13px] text-positive-deep">
          <CheckCircle2 size={16} strokeWidth={1.75} />
          {message}
        </div>
      )}

      <Button onClick={registerWebhook} disabled={registering} className="mt-lg w-fit">
        {registering ? "Đang đăng ký..." : "Đăng ký / làm mới webhook"}
      </Button>
    </Card>
  );
}
