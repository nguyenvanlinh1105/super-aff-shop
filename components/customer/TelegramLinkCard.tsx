"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Send, CheckCircle2, ExternalLink, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type LinkStatus = { linked: boolean; telegramUsername: string | null };
type LinkCodeResult = { code: string; expiresInMinutes: number; deepLink: string };

export function TelegramLinkCard() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [linkResult, setLinkResult] = useState<LinkCodeResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      const res = await fetch("/api/telegram/link-code");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusError(data.error ?? "Không tải được trạng thái liên kết Telegram");
        return;
      }
      setStatusError(null);
      setStatus(data);
    } catch {
      setStatusError("Không kết nối được tới máy chủ");
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (!linkResult) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(linkResult.deepLink, { width: 200, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [linkResult]);

  async function generateCode() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/telegram/link-code", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Không tạo được mã liên kết");
      return;
    }

    setLinkResult(data);
  }

  async function unlink() {
    setLoading(true);
    await fetch("/api/telegram/link-code", { method: "DELETE" });
    setLoading(false);
    setLinkResult(null);
    loadStatus();
  }

  return (
    <Card variant="soft">
      <div className="flex items-center gap-sm">
        <Send size={20} strokeWidth={1.75} className="text-ink-deep" />
        <h2 className="display-xs">Liên kết Telegram</h2>
      </div>

      {!status && !statusError && (
        <p className="mt-lg text-[14px] text-mute">Đang tải trạng thái liên kết...</p>
      )}

      {statusError && (
        <div className="mt-lg flex items-center justify-between gap-md text-[14px] text-negative-darkest">
          {statusError}
          <Button variant="tertiary" onClick={loadStatus} className="px-md py-xs text-[13px]">
            Thử lại
          </Button>
        </div>
      )}

      {status && status.linked ? (
        <div className="mt-lg flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-center gap-sm text-[14px] text-ink">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-positive" />
            Đã liên kết {status.telegramUsername ? `@${status.telegramUsername}` : "Telegram"} — bot sẽ đồng bộ
            đúng tài khoản này khi bạn nhắn tin.
          </div>
          <Button variant="tertiary" onClick={unlink} disabled={loading} className="gap-sm px-md py-xs text-[13px]">
            <Unlink size={14} strokeWidth={1.75} />
            Huỷ liên kết
          </Button>
        </div>
      ) : status ? (
        <div className="mt-lg flex flex-col gap-md">
          <p className="text-[14px] text-body">
            Liên kết để bot Telegram luôn hiển thị đúng số dư, đơn hàng của tài khoản này — tránh bị tạo hồ sơ
            Telegram rời rạc không đồng bộ.
          </p>

          {linkResult ? (
            <div className="flex flex-col gap-md rounded-md bg-canvas p-lg sm:flex-row sm:items-start">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR liên kết Telegram"
                  className="h-[140px] w-[140px] shrink-0 rounded-md border border-canvas-soft"
                />
              )}
              <div className="flex flex-col gap-sm">
                <div className="text-[12px] text-mute">
                  Quét mã QR bằng camera điện thoại để tự động liên kết — mã hết hạn sau{" "}
                  {linkResult.expiresInMinutes} phút:
                </div>
                <code className="w-fit rounded-sm bg-canvas-soft px-md py-xs text-[16px] font-bold tracking-wider text-ink-deep">
                  {linkResult.code}
                </code>
                <a href={linkResult.deepLink} target="_blank" rel="noreferrer">
                  <Button className="gap-sm">
                    <ExternalLink size={16} strokeWidth={1.75} />
                    Mở Telegram để liên kết
                  </Button>
                </a>
                <p className="text-[12px] text-mute">
                  Hoặc mở Telegram, tìm bot và gửi lệnh: <code>/start {linkResult.code}</code>
                </p>
              </div>
            </div>
          ) : (
            <Button onClick={generateCode} disabled={loading} className="w-fit gap-sm">
              <Send size={16} strokeWidth={1.75} />
              {loading ? "Đang tạo mã..." : "Tạo mã liên kết"}
            </Button>
          )}

          {error && <div className="text-[13px] text-negative-darkest">{error}</div>}
        </div>
      ) : null}
    </Card>
  );
}
