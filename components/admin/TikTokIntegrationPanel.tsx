"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Power,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";

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
  const modal = useModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Filter mode: "create" | "update"
  const [filterMode, setFilterMode] = useState<"create" | "update">("create");

  // Date picker states (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activePreset, setActivePreset] = useState<string | null>("30d");
  const [orderId, setOrderId] = useState("");
  const active = platformStatus === "active";

  function applyPreset(preset: "today" | "yesterday" | "7d" | "30d") {
    setActivePreset(preset);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (preset === "today") {
      const dStr = today.toISOString().split("T")[0];
      setStartDate(dStr);
      setEndDate(dStr);
    } else if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dStr = yesterday.toISOString().split("T")[0];
      setStartDate(dStr);
      setEndDate(dStr);
    } else if (preset === "7d") {
      const past7 = new Date(today);
      past7.setDate(past7.getDate() - 7);
      setStartDate(past7.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "30d") {
      const past30 = new Date(today);
      past30.setDate(past30.getDate() - 30);
      setStartDate(past30.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  }

  // Khởi tạo mặc định 30 ngày gần nhất
  useEffect(() => {
    applyPreset("30d");
  }, []);

  async function togglePlatform() {
    setLoading("toggle");
    const nextActive = !active;
    const res = await fetch("/api/admin/platforms/TIKTOK", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextActive ? "active" : "inactive" }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (res.ok) {
      toast.success(nextActive ? "Đã bật TikTok Shop thành công! 🐾" : "Đã tạm tắt TikTok Shop.");
      router.refresh();
    } else {
      await modal.alert({
        title: "Lỗi Cập Nhật Nền Tảng",
        message: data.error ?? "Không thể cập nhật trạng thái TikTok Shop.",
        iconType: "danger",
        confirmText: "Đóng",
      });
      toast.error(data.error ?? "Lỗi cập nhật nền tảng");
    }
  }

  async function testConnection() {
    setLoading("test");
    const res = await fetch("/api/admin/integrations/tiktok/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);

    if (res.ok) {
      await modal.alert({
        title: "Kết Nối RioHub Thành Công! ✨",
        message: (
          <div className="flex flex-col gap-3 text-left text-xs mt-2">
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Trạng thái API:</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Đang hoạt động ổn định
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Tài khoản Creator:</span>
                <span className="font-mono font-extrabold text-neutral-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-200/90 shadow-2xs">
                  @{data.creatorUsername || config.creatorUsername || "bubududu0301"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-neutral-600">Tổng link đã liên kết:</span>
                <span className="font-extrabold text-neutral-900 text-[13px]">{data.total ?? 0} link</span>
              </div>
            </div>
            <p className="text-[12px] text-emerald-800/90 font-medium px-1 leading-relaxed">
              API RioHub TikTok Shop đã xác thực chính xác. Khách hàng có thể dán link sản phẩm TikTok để tạo link hoàn tiền tự động ngay bây giờ.
            </p>
          </div>
        ),
        iconType: "success",
        confirmText: "Tuyệt vời",
      });
      toast.success("Kiểm tra kết nối RioHub thành công!");
    } else {
      await modal.alert({
        title: "Kết Nối RioHub Thất Bại",
        message: (
          <div className="flex flex-col gap-2 text-left text-xs bg-rose-50 border border-rose-200 rounded-2xl p-4 mt-2 text-rose-800">
            <div className="flex items-center gap-1.5 font-extrabold text-rose-900 mb-1">
              <AlertCircle size={15} className="text-rose-600" />
              <span>Chi tiết phản hồi từ hệ thống:</span>
            </div>
            <div className="font-mono text-[11.5px] bg-white p-3 rounded-xl border border-rose-200 text-rose-900 break-words leading-relaxed shadow-2xs">
              {data.error ?? "Không thể kết nối đến RioHub API. Vui lòng kiểm tra lại cấu hình RIOHUB_API_KEY trong file .env."}
            </div>
          </div>
        ),
        iconType: "danger",
        confirmText: "Đã hiểu",
      });
      toast.error(data.error ?? "Kiểm tra kết nối RioHub thất bại");
    }
  }

  async function syncOrders() {
    setLoading("sync");

    const startIso = startDate ? `${startDate}T00:00:00` : null;
    const endIso = endDate ? `${endDate}T23:59:59` : null;

    const res = await fetch("/api/admin/integrations/tiktok/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeStart: filterMode === "create" ? startIso : null,
        timeEnd: filterMode === "create" ? endIso : null,
        updateTimeStart: filterMode === "update" ? startIso : null,
        updateTimeEnd: filterMode === "update" ? endIso : null,
        orderId: orderId.trim() || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);

    if (!res.ok) {
      await modal.alert({
        title: "Đồng Bộ Đơn TikTok Thất Bại",
        message: (
          <div className="text-left text-xs bg-rose-50 border border-rose-200 rounded-2xl p-3.5 mt-2 text-rose-800">
            {data.error ?? "Có lỗi xảy ra khi kéo dữ liệu đơn hàng từ RioHub."}
          </div>
        ),
        iconType: "danger",
        confirmText: "Đóng",
      });
      toast.error(data.error ?? "Đồng bộ thất bại");
      return;
    }

    const r = data.result;
    await modal.alert({
      title: "Đồng Bộ Đơn TikTok Thành Công! 🎉",
      message: (
        <div className="flex flex-col gap-2.5 text-left text-xs mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-neutral-500 font-bold text-[11px]">Tổng đơn xử lý:</span>
              <span className="text-base font-extrabold text-neutral-900">{r.processed}</span>
            </div>
            <div className="flex flex-col bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-neutral-500 font-bold text-[11px]">Đơn tạo mới:</span>
              <span className="text-base font-extrabold text-emerald-600">+{r.created}</span>
            </div>
            <div className="flex flex-col bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-neutral-500 font-bold text-[11px]">Đã cập nhật:</span>
              <span className="text-base font-extrabold text-sky-600">{r.updated}</span>
            </div>
            <div className="flex flex-col bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-neutral-500 font-bold text-[11px]">Đơn Approved:</span>
              <span className="text-base font-extrabold text-purple-600">{r.approved}</span>
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <span className="text-neutral-600 font-bold text-[11.5px]">Chưa map khách (thiếu sub_id):</span>
            <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {r.unmapped} đơn
            </span>
          </div>
        </div>
      ),
      iconType: "success",
      confirmText: "Hoàn tất",
    });
    toast.success(`Đồng bộ xong ${r.processed} đơn hàng TikTok!`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ─── HÀNG 1: TRẠNG THÁI NỀN TẢNG & CẤU HÌNH RIOHUB ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nền tảng TikTok */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-900">
                <Power size={14} className="text-neutral-500" />
                <span>Trạng Thái Nền Tảng</span>
              </div>
              <Badge tone={active ? "positive" : "warning"} dot>
                {active ? "Đang bật" : "Tạm tắt"}
              </Badge>
            </div>
            <p className="text-[11.5px] leading-relaxed text-neutral-500 mb-3">
              Khi tạm tắt, TikTok sẽ ẩn khỏi danh sách chọn sàn lúc tạo link hoàn tiền.
            </p>
          </div>
          <Button
            type="button"
            variant={active ? "danger" : "primary"}
            className="w-full justify-center text-xs"
            onClick={togglePlatform}
            disabled={loading === "toggle"}
          >
            <Power size={14} />
            <span>{active ? "Tạm tắt TikTok" : "Bật TikTok"}</span>
          </Button>
        </div>

        {/* Cấu hình RioHub */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-900">
                <ShieldCheck size={14} className="text-neutral-500" />
                <span>Cấu Hình RioHub</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500 font-bold truncate max-w-[120px]">
                @{config.creatorUsername ?? "bubududu"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2">
              <Status label="API key" ok={config.hasApiKey} />
              <Status label="Creator" ok={config.hasCreatorUsername} />
              <Status label="Webhook" ok={config.hasSigningSecret} />
              <Status label="Tạo link" ok={config.readyForLinks} />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center text-xs mt-1"
            onClick={testConnection}
            disabled={loading === "test"}
          >
            <Activity size={14} />
            <span>Kiểm tra kết nối</span>
          </Button>
        </div>
      </div>

      {/* ─── HÀNG 2: ĐỒNG BỘ ĐƠN HÀNG TIKTOK (BỘ CHỌN THỜI GIAN & PRESETS) ─── */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-black">
              <RefreshCw size={14} />
            </div>
            <div className="text-[13.5px] font-black text-neutral-900">Đồng Bộ Đơn Hàng TikTok</div>
          </div>

          {/* Chọn lọc theo: Ngày tạo đơn vs Ngày cập nhật */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterMode("create")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === "create" ? "bg-white text-neutral-900 shadow-xs font-black" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Ngày tạo đơn
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("update")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === "update" ? "bg-white text-neutral-900 shadow-xs font-black" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Ngày cập nhật
            </button>
          </div>
        </div>

        {/* Nút chọn nhanh (Quick Presets) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Chọn nhanh khoảng thời gian:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "yesterday", label: "Hôm qua" },
              { id: "7d", label: "7 ngày qua" },
              { id: "30d", label: "30 ngày qua" },
            ].map((p) => {
              const active = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id as any)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
                      ? "bg-pink-50 text-pink-700 border-pink-300 shadow-2xs font-black ring-1 ring-pink-200"
                      : "bg-neutral-50/80 text-neutral-600 border-neutral-200 hover:bg-white hover:border-neutral-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bộ chọn Ngày: Từ ngày -> Đến ngày */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-extrabold text-neutral-700 mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-pink-500" />
              <span>Từ ngày:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset(null);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-neutral-700 mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-pink-500" />
              <span>Đến ngày:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset(null);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </div>
        </div>

        {/* Ô nhập mã đơn hàng cụ thể */}
        <div>
          <label className="block text-[11.5px] font-bold text-neutral-600 mb-1">
            Lọc theo mã đơn hàng (Tùy chọn):
          </label>
          <input
            type="text"
            placeholder="VD: 5782910..., ngăn cách dấu phẩy nếu kéo nhiều đơn"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs font-medium text-neutral-900 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Nút hành động Đồng bộ */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            onClick={syncOrders}
            disabled={loading === "sync"}
            className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold shadow-sm text-xs px-5 py-2.5 rounded-xl cursor-pointer shrink-0"
          >
            <span>{loading === "sync" ? "Đang đồng bộ..." : "Đồng bộ đơn"}</span>
          </Button>

          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
            Hệ thống sẽ kéo dữ liệu từ RioHub TikTok để tự động ghi nhận hoa hồng cho khách hàng.
          </p>
        </div>
      </div>
    </div>
  );
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white border border-neutral-200/80 px-2 py-1 shadow-2xs">
      <span className="text-neutral-500 font-medium">{label}</span>
      <span className={ok ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
        {ok ? "OK" : "Thiếu"}
      </span>
    </div>
  );
}
