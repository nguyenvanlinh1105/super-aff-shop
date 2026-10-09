"use client";

import { useState } from "react";
import {
  BellRing,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  RotateCcw,
  Users,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ReconciliationReminderConfig } from "@/lib/reconciliationReminder";

interface Props {
  initialConfig: ReconciliationReminderConfig;
  adminLinh?: {
    id: string;
    fullName: string;
    email: string;
    telegramChatId: string | null;
  } | null;
  botAccount?: {
    botName: string;
    botUsername: string | null;
    status: string;
  } | null;
}

export function ReconciliationReminderCard({
  initialConfig,
  adminLinh,
  botAccount,
}: Props) {
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(initialConfig.enabled ?? true);
  const [scheduledTime, setScheduledTime] = useState(initialConfig.scheduledTime || "21:30");
  // Mặc định luôn chọn "ALL_ADMINS" (Tất cả quản trị viên)
  const [targetMode, setTargetMode] = useState<"ALL_ADMINS" | "LINH_ONLY">(
    initialConfig.targetMode || "ALL_ADMINS"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastSent, setLastSent] = useState<{
    at: string | null;
    status: "success" | "error" | null;
    detail: string | null;
  }>({
    at: initialConfig.lastSentAt || null,
    status: initialConfig.lastSentStatus || null,
    detail: initialConfig.lastSentDetail || null,
  });

  // Lưu cấu hình
  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/reconciliation-reminder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          scheduledTime,
          targetMode,
          customMessage: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu cấu hình");
      }

      toast.success(
        enabled
          ? `Đã lưu nhắc nhở đối soát lúc ${scheduledTime} hàng ngày!`
          : "Đã tạm dừng nhắc nhở đối soát hàng ngày."
      );
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  }

  // Gửi thử nghiệm / Thử lại (Retry)
  async function handleTestSend() {
    setIsTesting(true);
    try {
      const res = await fetch("/api/admin/reconciliation-reminder/test", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Gửi tin nhắn qua Telegram thất bại");
      }

      setLastSent({
        at: new Date().toISOString(),
        status: "success",
        detail: data.message || "Đã gửi thông báo nhắc nhở thành công tới Telegram!",
      });

      toast.success("Đã gửi tin nhắc nhở thành công tới Telegram! 🚀");
    } catch (err: any) {
      setLastSent({
        at: new Date().toISOString(),
        status: "error",
        detail: err.message || "Lỗi kết nối hoặc Bot chưa sẵn sàng",
      });

      toast.error(err.message || "Gửi tin nhắn Telegram thất bại");
    } finally {
      setIsTesting(false);
    }
  }

  // Format ngày giờ hiển thị gọn
  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const TIME_PRESETS = ["21:30", "21:00", "22:00", "07:30"];

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-4 sm:p-6 flex flex-col gap-4">
      {/* ─── HEADER GỌN GÀNG ─── */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BellRing size={17} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                Nhắc Nhở Đối Soát Telegram
              </h2>
              {enabled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10.5px] font-black text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kích hoạt lúc {scheduledTime}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-[10.5px] font-bold text-neutral-500">
                  Đang tắt
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium truncate hidden sm:block">
              Tự động nhắn Telegram vào giờ hẹn để nhắc tải lên &amp; đối soát file Shopee / Lazada.
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-xs font-bold text-neutral-700 hidden xs:inline">
            {enabled ? "Bật" : "Tắt"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-rose-500" : "bg-neutral-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ─── HÀNG 1: GIỜ GỬI NHẮC NHỞ & PRESETS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-neutral-50/70 border border-neutral-100">
        <div className="flex items-center gap-2 shrink-0">
          <Clock size={14} className="text-rose-500" />
          <span className="text-xs font-bold text-neutral-700">Giờ gửi (GMT+7):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={!enabled}
            className="h-8 w-28 rounded-xl border border-neutral-200 bg-white px-2.5 text-center text-xs font-black text-neutral-900 shadow-2xs focus:border-rose-500 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {TIME_PRESETS.map((t) => {
              const isSelected = scheduledTime === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setScheduledTime(t)}
                  className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-2xs font-black"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 disabled:opacity-50"
                  }`}
                >
                  {t === "21:30" ? "⭐ 21:30 (Mặc định)" : t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── HÀNG 2: ĐỐI TƯỢNG NHẬN THÔNG BÁO (SEGMENTED TABS) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-neutral-50/70 border border-neutral-100">
        <div className="flex items-center gap-2 shrink-0">
          <Users size={14} className="text-sky-500" />
          <span className="text-xs font-bold text-neutral-700">Đối tượng nhận:</span>
        </div>

        {/* Tab chuyển đổi gọn gàng - MẶC ĐỊNH CHỌN TẤT CẢ ADMIN */}
        <div className="flex items-center gap-1 bg-neutral-200/60 p-1 rounded-xl">
          <button
            type="button"
            disabled={!enabled}
            onClick={() => setTargetMode("ALL_ADMINS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              targetMode === "ALL_ADMINS"
                ? "bg-white text-neutral-900 shadow-xs font-black"
                : "text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
            }`}
          >
            <Users size={13} className={targetMode === "ALL_ADMINS" ? "text-rose-500" : ""} />
            <span>Tất Cả Quản Trị Viên (Mặc định)</span>
          </button>

          <button
            type="button"
            disabled={!enabled}
            onClick={() => setTargetMode("LINH_ONLY")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              targetMode === "LINH_ONLY"
                ? "bg-white text-neutral-900 shadow-xs font-black"
                : "text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
            }`}
          >
            <User size={13} className={targetMode === "LINH_ONLY" ? "text-sky-500" : ""} />
            <span>Riêng Admin Linh</span>
          </button>
        </div>
      </div>

      {/* Thông tin phụ khi chọn gửi riêng Linh */}
      {targetMode === "LINH_ONLY" && (
        <div className="flex items-center justify-between text-[11.5px] px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 flex-wrap gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold truncate">
              {adminLinh?.fullName || "Nguyễn Văn Linh"}
            </span>
            <span className="text-[10px] text-sky-700 font-mono">
              (Chat ID: {adminLinh?.telegramChatId || "7558379347"})
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
            <Check size={11} className="stroke-[3]" />
            Bot Telegram Sẵn Sàng
          </span>
        </div>
      )}

      {/* ─── HÀNG 3: TRẠNG THÁI GỬI / RETRY KHI CÓ KẾT QUẢ ─── */}
      {lastSent.status === "error" ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 rounded-2xl bg-rose-50/95 border border-rose-200 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900 min-w-0">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-rose-950">Gửi thông báo thất bại!</span>
                {lastSent.at && (
                  <span className="text-[10.5px] font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md font-bold">
                    {formatDateTime(lastSent.at)}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-rose-700 font-medium mt-0.5 truncate">{lastSent.detail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestSend}
            disabled={isTesting}
            className="flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-2xs transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={12} className={isTesting ? "animate-spin" : ""} />
            <span>{isTesting ? "Đang thử lại..." : "Thử lại (Retry)"}</span>
          </button>
        </div>
      ) : lastSent.status === "success" ? (
        <div className="flex items-center justify-between gap-2.5 p-3 sm:px-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900 min-w-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-extrabold text-emerald-950">Đã phát tin thành công</span>
              {lastSent.at && (
                <span className="text-[11px] text-emerald-800 font-mono font-bold bg-emerald-200/60 px-2 py-0.5 rounded-lg">
                  {formatDateTime(lastSent.at)}
                </span>
              )}
              {lastSent.detail && (
                <span className="text-[11.5px] text-emerald-700 font-medium truncate hidden md:inline">
                  • {lastSent.detail}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-xl shrink-0">
            <Check size={12} className="stroke-[3]" />
            Thành công
          </span>
        </div>
      ) : null}

      {/* ─── HÀNG 4: HÀNH ĐỘNG LƯU & GỬI THỬ ─── */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <p className="text-[11px] text-neutral-400 font-medium">
          {enabled ? `Tự động quét và phát tin lúc ${scheduledTime} hàng ngày.` : "Đang tạm dừng nhắc nhở."}
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestSend}
            disabled={isTesting}
            className="flex-1 sm:flex-initial text-xs h-9 px-4 font-bold cursor-pointer"
          >
            {lastSent.status === "success" ? (
              <>
                <RotateCcw size={13} className={isTesting ? "animate-spin" : ""} />
                <span>{isTesting ? "Đang gửi..." : "Gửi lại kiểm tra"}</span>
              </>
            ) : (
              <>
                <Send size={13} className={isTesting ? "animate-spin" : ""} />
                <span>{isTesting ? "Đang gửi..." : "Gửi thử Telegram"}</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial text-xs h-9 px-4 font-black cursor-pointer bg-gradient-to-r from-rose-500 to-pink-600 text-white"
          >
            <Save size={13} />
            <span>{isSaving ? "Đang lưu..." : "Lưu cấu hình"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
