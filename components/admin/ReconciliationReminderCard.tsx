"use client";

import { useState } from "react";
import {
  BellRing,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Save,
  Sparkles,
  ExternalLink,
  Check,
  MessageSquare,
  Bot,
  History,
  Calendar,
  Terminal,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/ui/ModalProvider";
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
  const modal = useModal();

  const [enabled, setEnabled] = useState(initialConfig.enabled ?? true);
  const [scheduledTime, setScheduledTime] = useState(initialConfig.scheduledTime || "07:00");
  const [targetMode, setTargetMode] = useState<"LINH_ONLY" | "ALL_ADMINS">(
    initialConfig.targetMode || "LINH_ONLY"
  );
  const [customMessage, setCustomMessage] = useState(initialConfig.customMessage || "");

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
          customMessage: customMessage.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu cấu hình");
      }

      toast.success(
        enabled
          ? `Đã bật nhắc nhở đối soát lúc ${scheduledTime} sáng hàng ngày! ✨`
          : "Đã tắt chức năng nhắc nhở đối soát hàng ngày."
      );
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  }

  // Thử nghiệm gửi tin ngay tới Telegram của Admin
  async function handleTestSend() {
    setIsTesting(true);
    try {
      const res = await fetch("/api/admin/reconciliation-reminder/test", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gửi tin nhắn thử nghiệm thất bại");
      }

      setLastSent({
        at: new Date().toISOString(),
        status: "success",
        detail: data.message,
      });

      await modal.alert({
        title: "Gửi Thử Nghiệm Thành Công! 🚀",
        message: (
          <div className="flex flex-col gap-3 text-left text-xs mt-2">
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Trạng thái:</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Đã chuyển tới Telegram
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Người nhận:</span>
                <span className="font-bold text-neutral-900">
                  {adminLinh?.fullName || "Nguyễn Văn Linh"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Telegram Chat ID:</span>
                <span className="font-mono font-extrabold text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                  {adminLinh?.telegramChatId || "7558379347"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-neutral-600">Bot gửi:</span>
                <span className="font-bold text-neutral-900">
                  @{botAccount?.botUsername || "meoback_hoantien_bot"}
                </span>
              </div>
            </div>
            <p className="text-[12px] text-emerald-800 font-medium px-1 leading-relaxed">
              Tin nhắn mẫu đã được gửi thẳng tới ứng dụng Telegram của Admin Nguyễn Văn Linh kèm theo 2 nút tắt dẫn nhanh vào trang <b>Import Đối Soát</b>.
            </p>
          </div>
        ),
        iconType: "success",
        confirmText: "Đã hiểu",
      });

      toast.success("Đã gửi tin nhắn thử nghiệm tới Telegram của Admin!");
    } catch (err: any) {
      setLastSent({
        at: new Date().toISOString(),
        status: "error",
        detail: err.message,
      });

      await modal.alert({
        title: "Gửi Thử Nghiệm Thất Bại",
        message: err.message || "Không thể gửi tin nhắn qua bot Telegram. Vui lòng kiểm tra lại Bot Token.",
        iconType: "danger",
        confirmText: "Đóng",
      });

      toast.error(err.message || "Gửi tin thử nghiệm thất bại");
    } finally {
      setIsTesting(false);
    }
  }

  // Format ngày giờ hiển thị
  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return "Chưa có lượt gửi nào";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-rose-100/40 via-amber-100/30 to-sky-100/30 blur-2xl" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-xl shadow-md shadow-rose-500/20 shrink-0">
            <BellRing size={24} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 border border-rose-200/60">
                <Sparkles size={11} className="text-rose-500" />
                Tự Động Hóa Quản Trị
              </span>
              {enabled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-extrabold text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang Kích Hoạt Lúc {scheduledTime} Sáng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[11px] font-extrabold text-neutral-500 border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  Đang Tắt
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-neutral-900 tracking-tight">
              Nhắc Nhở Import Đối Soát Hàng Ngày Qua Telegram
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Mặc định vào <b>07:00 sáng mỗi ngày</b>, hệ thống sẽ tự động gửi thông báo đến Telegram của Quản trị viên để nhắc nhở tải lên & import file đối soát đơn hàng từ sàn.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3.5 shrink-0 self-start sm:self-auto bg-gradient-to-r from-neutral-50 via-white to-neutral-100/80 p-2 sm:px-3.5 sm:py-2 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex flex-col text-right select-none">
            <span className="text-xs font-black text-neutral-800 tracking-tight">
              {enabled ? "Bật nhắc nhở" : "Tắt nhắc nhở"}
            </span>
            <span className="text-[10px] font-semibold text-neutral-400">
              {enabled ? "Gửi lúc 07:00 sáng" : "Tạm dừng gửi"}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-inner ${
              enabled
                ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/20"
                : "bg-neutral-300"
            }`}
          >
            <span
              className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  enabled ? "bg-rose-500" : "bg-neutral-400"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Main configuration grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Column: Settings Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Scheduled Time */}
          <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/70 p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                <Clock size={15} className="text-rose-500" />
                Giờ Gửi Nhắc Nhở Hàng Ngày (Múi Giờ GMT+7)
              </label>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/50">
                Mặc định: 07:00 Sáng
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={!enabled}
                className="w-36 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-black text-neutral-900 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:bg-neutral-100 disabled:text-neutral-400"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {["07:00", "07:30", "08:00"].map((timePreset) => (
                  <button
                    key={timePreset}
                    type="button"
                    disabled={!enabled}
                    onClick={() => setScheduledTime(timePreset)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      scheduledTime === timePreset
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white text-neutral-600 border border-neutral-200 hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
                    }`}
                  >
                    {timePreset === "07:00" ? "⏰ 07:00 (Mặc định)" : timePreset}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Hệ thống sẽ tự động quét và gửi tin nhắn Telegram vào đúng giờ này mỗi ngày nếu công tắc nhắc nhở đang được bật.
            </p>
          </div>

          {/* 2. Target Recipient Selection */}
          <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/70 p-4 sm:p-5 flex flex-col gap-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <Bot size={15} className="text-sky-500" />
              Đối Tượng Nhận Thông Báo Qua Telegram
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => setTargetMode("LINH_ONLY")}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col gap-1.5 ${
                  targetMode === "LINH_ONLY"
                    ? "bg-white border-rose-400 ring-2 ring-rose-200 shadow-xs"
                    : "bg-white/80 border-neutral-200/80 hover:border-neutral-300 disabled:opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Admin Nguyễn Văn Linh
                  </span>
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Khuyên Dùng Test
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                  Chỉ gửi duy nhất tới tài khoản Telegram của Quản trị viên Nguyễn Văn Linh.
                </p>
              </button>

              <button
                type="button"
                disabled={!enabled}
                onClick={() => setTargetMode("ALL_ADMINS")}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col gap-1.5 ${
                  targetMode === "ALL_ADMINS"
                    ? "bg-white border-rose-400 ring-2 ring-rose-200 shadow-xs"
                    : "bg-white/80 border-neutral-200/80 hover:border-neutral-300 disabled:opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    Tất Cả Quản Trị Viên
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                  Gửi đồng loạt tới mọi Admin đã cấu hình Telegram Chat ID trong hệ thống.
                </p>
              </button>
            </div>

            {/* Recipient Profile Details */}
            <div className="mt-1 rounded-xl bg-white border border-neutral-200/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  NL
                </div>
                <div>
                  <div className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                    {adminLinh?.fullName || "Nguyễn Văn Linh"}
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Chat ID: <b className="text-neutral-800">{adminLinh?.telegramChatId || "7558379347"}</b>
                    {" • "}{adminLinh?.email || "vanlinh11052004nguyenvan@gmail.com"}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70 shrink-0 self-start sm:self-auto">
                <Check size={13} className="text-emerald-600 stroke-[3]" />
                Bot Telegram Sẵn Sàng
              </div>
            </div>
          </div>

          {/* 3. Optional Custom Message */}
          <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/70 p-4 sm:p-5 flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
              <MessageSquare size={15} className="text-neutral-500" />
              Lời Nhắn Bổ Sung (Tùy Chọn)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={!enabled}
              placeholder="VD: Nhớ kiểm tra thêm đơn hoàn từ ngày 25 đến 30 nhé!"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 placeholder-neutral-400 shadow-2xs focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:bg-neutral-100"
            />
            <p className="text-[11px] text-neutral-400">
              Nếu để trống, hệ thống sẽ sử dụng mẫu tin nhắn chuẩn chuyên nghiệp.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <Save size={16} />
              {isSaving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình"}
            </Button>

            <Button
              type="button"
              variant="tertiary"
              size="md"
              onClick={handleTestSend}
              disabled={isTesting}
              className="w-full sm:w-auto text-sky-700 border-sky-200 hover:bg-sky-50 hover:border-sky-300"
            >
              <Send size={15} />
              {isTesting ? "Đang gửi thử..." : "Thử Nghiệm Gửi Ngay (Test Telegram)"}
            </Button>
          </div>
        </div>

        {/* Right Column: Telegram Mock Preview & Status (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Telegram Bubble Mockup */}
          <div className="rounded-3xl bg-neutral-900 p-5 shadow-lg border border-neutral-800 text-white flex flex-col gap-3 relative overflow-hidden">
            {/* Ambient Telegram glow */}
            <div className="pointer-events-none absolute -right-10 -bottom-10 w-36 h-36 bg-sky-500/20 rounded-full blur-xl" />

            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-xs font-black shadow-xs">
                  🤖
                </div>
                <div>
                  <div className="text-xs font-black text-neutral-100 flex items-center gap-1">
                    {botAccount?.botName || "MeowBack - Hoàn Tiền"}
                    <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                      bot
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    @{botAccount?.botUsername || "meoback_hoantien_bot"}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Telegram Preview
              </span>
            </div>

            {/* Bubble content */}
            <div className="rounded-2xl bg-neutral-800/90 border border-neutral-700/80 p-4 text-xs flex flex-col gap-2.5 text-neutral-200 shadow-xs">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5 text-[13px]">
                ⏰ NHẮC NHỞ IMPORT FILE ĐỐI SOÁT HÀNG NGÀY
              </div>

              <p className="leading-relaxed">
                Chào bạn <b>{targetMode === "LINH_ONLY" ? "Nguyễn Văn Linh" : "Quản Trị Viên"}</b>! 👋
                <br />
                Đã đến <b>{scheduledTime} sáng</b> rồi, hãy tải lên và <b>import file đối soát của khách hàng</b> (Shopee/Lazada) để hệ thống kịp thời cập nhật đơn hàng, đối soát hoa hồng &amp; số dư khả dụng nhé! 📑✨
              </p>

              {customMessage.trim() && (
                <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-700/60 text-[11px] text-neutral-300 italic">
                  📝 Lời nhắn: {customMessage.trim()}
                </div>
              )}

              <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1 border-t border-neutral-700/60">
                <span>⏰ Thời gian: {scheduledTime} sáng (GMT+7)</span>
                <span>Vừa xong</span>
              </div>
            </div>

            {/* Inline Action Buttons Mockup */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="rounded-xl bg-sky-600/90 hover:bg-sky-500 transition-colors p-2 text-center text-xs font-black text-white shadow-xs flex items-center justify-center gap-1.5 cursor-default">
                <span>📥 Mở Trang Import Đối Soát Ngay</span>
                <ExternalLink size={12} />
              </div>
              <div className="rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors p-2 text-center text-xs font-bold text-neutral-300 flex items-center justify-center gap-1.5 cursor-default">
                <span>📊 Xem Danh Sách Đơn Hàng</span>
                <ExternalLink size={12} />
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center italic mt-1">
              * Nút bấm trực tiếp trong Telegram sẽ mở thẳng trang web quản trị của bạn.
            </p>
          </div>

          {/* Last Run & Status Card — Monitoring Console Style */}
          <div className="rounded-3xl bg-gradient-to-b from-white via-neutral-50/70 to-neutral-100/60 border border-neutral-200/90 p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                  <History size={15} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                    Lịch Sử Gửi Gần Nhất
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Nhật ký phát tin tự động từ hệ thống Cron
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 shadow-2xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>CRON LOG</span>
              </div>
            </div>

            {/* Status Hero Card */}
            {lastSent.status === "success" ? (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 size={18} strokeWidth={2.6} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span>ĐÃ PHÁT TIN THÀNH CÔNG</span>
                    </div>
                    <p className="text-[11px] text-emerald-700/90 font-medium">
                      Toàn bộ quản trị viên đã nhận được tin nhắn nhắc nhở.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900">
                  200 OK
                </span>
              </div>
            ) : lastSent.status === "error" ? (
              <div className="rounded-2xl bg-gradient-to-r from-rose-50 via-red-50/50 to-rose-50 border border-rose-200/90 p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle size={18} strokeWidth={2.6} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                      <span>GỬI TIN THẤT BẠI</span>
                    </div>
                    <p className="text-[11px] text-rose-700/90 font-medium">
                      Không thể kết nối Telegram Bot. Vui lòng kiểm tra lại cấu hình.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-900">
                  ERROR
                </span>
              </div>
            ) : (
              <div className="rounded-2xl bg-neutral-100/80 border border-neutral-200/80 p-3.5 flex items-center gap-3 text-neutral-500">
                <Clock size={16} className="text-neutral-400" />
                <span className="text-xs font-medium">Chưa có lượt gửi nào trong phiên làm việc này.</span>
              </div>
            )}

            {/* Metrics 2-column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Clock size={11} /> Thời Điểm Phát Tin
                </span>
                <span className="text-xs font-black text-neutral-800 font-mono">
                  {formatDateTime(lastSent.at)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Calendar size={11} /> Lần Gửi Kế Tiếp
                </span>
                <span className="text-xs font-black text-rose-600 font-mono flex items-center gap-1">
                  {enabled ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {scheduledTime} sáng hôm nay/ngày mai
                    </>
                  ) : (
                    "Đã tạm dừng"
                  )}
                </span>
              </div>
            </div>

            {/* Terminal Log Console */}
            {lastSent.detail && (
              <div className="rounded-2xl bg-neutral-900 text-neutral-200 p-3.5 border border-neutral-800 shadow-inner flex flex-col gap-2 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-1 text-neutral-400 font-semibold flex items-center gap-1">
                      <Terminal size={11} /> dispatch_result.log
                    </span>
                  </div>
                  <span className="text-[9.5px] text-neutral-500">TELEGRAM BROADCAST</span>
                </div>

                <div className="flex items-start gap-2 text-emerald-400 leading-relaxed break-words">
                  <span className="text-neutral-500 select-none">&gt;</span>
                  <span>{lastSent.detail}</span>
                </div>
              </div>
            )}

            {/* Quick Test Action Button Footer */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
              <span className="font-medium text-[11px]">
                Cần kiểm tra ngay?
              </span>
              <button
                type="button"
                onClick={handleTestSend}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 font-bold text-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Send size={12} />
                <span>{isTesting ? "Đang gửi thử..." : "Bấm gửi test Telegram ngay"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
