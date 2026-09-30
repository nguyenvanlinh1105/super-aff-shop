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
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
              <CheckCircle2 size={20} strokeWidth={2.6} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Đã kết nối thành công</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight truncate">
                {status.telegramUsername ? `@${status.telegramUsername}` : "Tài khoản Telegram"}
              </h4>
              <p className="text-xs text-neutral-600 font-medium mt-0.5 leading-relaxed">
                Bot sẽ tự động gửi thông báo hoa hồng và cập nhật số dư cho tài khoản này.
              </p>
            </div>
          </div>
          <button
            onClick={unlink}
            disabled={loading}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-98 disabled:opacity-50"
          >
            <Unlink size={14} strokeWidth={2} />
            <span>{loading ? "Đang huỷ..." : "Huỷ liên kết"}</span>
          </button>
        </div>

      ) : status ? (
        <div className="flex flex-col gap-4">
          {/* Card giới thiệu tiện ích Telegram */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-sky-50/80 border border-sky-200/70 p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#24A1DE]/30">
                <Send size={18} className="translate-x-[-1px] translate-y-[-1px]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-snug">
                  Đồng bộ tài khoản với MeowBack Bot
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Nhận tin nhắn báo tiền về tức thì và tra cứu số dư, đơn hàng 24/7 trực tiếp qua Telegram mà không cần mở website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-sky-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-950">
                <CheckCircle2 size={14} className="text-sky-600 shrink-0" />
                <span>Báo tiền hoàn &amp; duyệt đơn tức thì</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-950">
                <CheckCircle2 size={14} className="text-sky-600 shrink-0" />
                <span>Tra cứu nhanh qua lệnh <code>/vi</code>, <code>/don</code></span>
              </div>
            </div>
          </div>

          {/* Khi đã bấm tạo mã -> Hiển thị QR & Deep Link */}
          {linkResult ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 rounded-2xl bg-neutral-50/90 border border-neutral-200/90 p-4 sm:p-5">
              {qrDataUrl && (
                <div className="bg-white p-2 rounded-2xl border border-neutral-200 shadow-2xs shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="QR liên kết Telegram"
                    className="h-[130px] w-[130px] object-contain rounded-xl"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2.5 w-full text-center sm:text-left min-w-0">
                <div className="text-xs font-semibold text-neutral-500">
                  Quét mã QR hoặc nhấn nút bên dưới (mã hết hạn sau {linkResult.expiresInMinutes} phút):
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <code className="rounded-xl bg-white border border-neutral-200 px-3.5 py-1.5 font-mono text-xl font-black tracking-widest text-neutral-900 shadow-2xs">
                    {linkResult.code}
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <a
                    href={linkResult.deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#24A1DE] hover:bg-[#1E8BC0] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                  >
                    <Send size={14} />
                    <span>Mở Telegram để kết nối ngay</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="text-[11.5px] text-neutral-500 mt-1">
                  Hoặc mở Telegram, tìm bot và gửi tin nhắn:{" "}
                  <code className="font-bold text-neutral-800 bg-neutral-200/70 px-1.5 py-0.5 rounded">/start {linkResult.code}</code>
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={generateCode}
              disabled={loading}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
              <span>{loading ? "Đang tạo mã liên kết..." : "Tạo mã kết nối Telegram"}</span>
            </button>
          )}

          {error && (
            <div className="text-xs text-red-600 font-semibold bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
