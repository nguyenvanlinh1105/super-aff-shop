"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Send, CheckCircle2, ExternalLink, Unlink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LinkStatus = { linked: boolean; telegramUsername: string | null };
type LinkCodeResult = { code: string; expiresInMinutes: number; deepLink: string };

export function TelegramLinkCard() {
  const router = useRouter();
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

  useEffect(() => { loadStatus(); }, []);

  useEffect(() => {
    if (!linkResult) { setQrDataUrl(null); return; }
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
    if (!res.ok) { setError(data.error ?? "Không tạo được mã liên kết"); return; }
    setLinkResult(data);
  }

  async function unlink() {
    setLoading(true);
    await fetch("/api/telegram/link-code", { method: "DELETE" });
    setLoading(false);
    setLinkResult(null);
    loadStatus();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Loading */}
      {!status && !statusError && (
        <p className="text-[14px] text-neutral-500 animate-pulse">Đang tải trạng thái liên kết...</p>
      )}

      {/* Error */}
      {statusError && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[14px] text-red-700">
          <span className="flex items-center gap-2"><AlertCircle size={16} /> {statusError}</span>
          <Button variant="tertiary" onClick={loadStatus} className="px-3 py-1 text-[13px] shrink-0">
            Thử lại
          </Button>
        </div>
      )}

      {/* Linked */}
      {status && status.linked ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-emerald-800">
                Đã liên kết {status.telegramUsername ? `@${status.telegramUsername}` : "Telegram"} ✅
              </div>
              <div className="text-[12px] text-emerald-700">
                Bot sẽ đồng bộ đúng tài khoản này khi bạn nhắn tin.
              </div>
            </div>
          </div>
          <button
            onClick={unlink}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
          >
            <Unlink size={14} strokeWidth={1.75} />
            Huỷ liên kết
          </button>
        </div>

      ) : status ? (
        <div className="flex flex-col gap-4">
          {/* Info banner */}
          <div className="rounded-2xl bg-[#EBF5FF] border border-blue-100 px-4 py-3">
            <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
              Liên kết để bot Telegram luôn hiển thị đúng số dư, đơn hàng của tài khoản này —
              tránh bị tạo hồ sơ Telegram rời rạc không đồng bộ.
            </p>
          </div>

          {/* QR code after generating */}
          {linkResult ? (
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 rounded-2xl bg-neutral-50 border border-neutral-200 p-5">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR liên kết Telegram"
                  className="h-[140px] w-[140px] shrink-0 rounded-xl border border-neutral-200 shadow-sm"
                />
              )}
              <div className="flex flex-col gap-3">
                <div className="text-[12px] font-semibold text-neutral-500">
                  Quét mã QR bằng camera điện thoại — mã hết hạn sau {linkResult.expiresInMinutes} phút:
                </div>
                <code className="w-fit rounded-xl bg-white border border-neutral-200 px-4 py-2 text-[20px] font-black tracking-[0.35em] text-neutral-900 shadow-sm">
                  {linkResult.code}
                </code>
                <a href={linkResult.deepLink} target="_blank" rel="noreferrer">
                  <Button className="gap-2">
                    <ExternalLink size={16} strokeWidth={1.75} />
                    Mở Telegram để liên kết
                  </Button>
                </a>
                <p className="text-[12px] text-neutral-500">
                  Hoặc mở Telegram, tìm bot và gửi lệnh:{" "}
                  <code className="font-bold text-neutral-800">/start {linkResult.code}</code>
                </p>
              </div>
            </div>
          ) : (
            <Button onClick={generateCode} disabled={loading} className="w-fit gap-2">
              <Send size={16} strokeWidth={1.75} />
              {loading ? "Đang tạo mã..." : "Tạo mã liên kết"}
            </Button>
          )}

          {error && (
            <div className="text-[13px] text-red-600 font-medium">{error}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
