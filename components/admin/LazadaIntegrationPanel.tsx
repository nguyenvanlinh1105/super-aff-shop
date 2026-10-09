"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Power, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";

type Props = {
  platformStatus: string;
  config: {
    baseUrl: string;
    hasAppKey: boolean;
    hasAppSecret: boolean;
    hasAccessToken: boolean;
    ready: boolean;
  };
};

export function LazadaIntegrationPanel({ platformStatus, config }: Props) {
  const router = useRouter();
  const modal = useModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const active = platformStatus === "active";

  async function togglePlatform() {
    setLoading("toggle");
    const nextActive = !active;
    const res = await fetch("/api/admin/platforms/LAZADA", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextActive ? "active" : "inactive" }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (res.ok) {
      toast.success(nextActive ? "Đã bật Lazada thành công! 🐾" : "Đã tạm tắt Lazada.");
      router.refresh();
    } else {
      await modal.alert({
        title: "Lỗi Cập Nhật Nền Tảng",
        message: data.error ?? "Không thể cập nhật trạng thái Lazada.",
        iconType: "danger",
        confirmText: "Đóng",
      });
      toast.error(data.error ?? "Lỗi cập nhật nền tảng");
    }
  }

  async function testConnection() {
    setLoading("test");
    const res = await fetch("/api/admin/integrations/lazada/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);

    if (res.ok) {
      await modal.alert({
        title: "Kết Nối Lazada Thành Công! ✨",
        message: (
          <div className="flex flex-col gap-3 text-left text-xs mt-2">
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Trạng thái Open API:</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Xác thực hợp lệ
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-200/60">
                <span className="font-bold text-neutral-600">Thuật toán ký chữ ký:</span>
                <span className="font-mono font-extrabold text-neutral-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-200/90 shadow-2xs">
                  HMAC-SHA256 (TOP chuẩn)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-neutral-600">Số đơn ghi nhận hôm nay:</span>
                <span className="font-extrabold text-neutral-900 text-[13px]">{data.total ?? 0} đơn</span>
              </div>
            </div>
            <p className="text-[12px] text-emerald-800/90 font-medium px-1 leading-relaxed">
              Lazada Open API đã xác thực thành công App Key, Secret và Access Token. Hệ thống sẵn sàng tạo link affiliate và đồng bộ báo cáo Conversion Report.
            </p>
          </div>
        ),
        iconType: "success",
        confirmText: "Tuyệt vời",
      });
      toast.success("Kiểm tra kết nối Lazada thành công!");
    } else {
      await modal.alert({
        title: "Kết Nối Lazada Thất Bại",
        message: (
          <div className="flex flex-col gap-2 text-left text-xs bg-rose-50 border border-rose-200 rounded-2xl p-4 mt-2 text-rose-800">
            <div className="flex items-center gap-1.5 font-extrabold text-rose-900 mb-1">
              <AlertCircle size={15} className="text-rose-600" />
              <span>Chi tiết phản hồi từ Lazada:</span>
            </div>
            <div className="font-mono text-[11.5px] bg-white p-3 rounded-xl border border-rose-200 text-rose-900 break-words leading-relaxed shadow-2xs">
              {data.error ?? "Lỗi xác thực hoặc LAZADA_ACCESS_TOKEN đã hết hạn. Vui lòng lấy lại Token mới trên Lazada Open Platform."}
            </div>
          </div>
        ),
        iconType: "danger",
        confirmText: "Đã hiểu",
      });
      toast.error(data.error ?? "Kiểm tra kết nối Lazada thất bại");
    }
  }

  async function syncOrders() {
    setLoading("sync");
    const res = await fetch("/api/admin/integrations/lazada/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: selectedDays }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);

    if (!res.ok) {
      await modal.alert({
        title: "Đồng Bộ Đơn Lazada Thất Bại",
        message: (
          <div className="text-left text-xs bg-rose-50 border border-rose-200 rounded-2xl p-3.5 mt-2 text-rose-800">
            {data.error ?? "Có lỗi xảy ra khi kéo dữ liệu Conversion Report từ Lazada."}
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
      title: "Đồng Bộ Đơn Lazada Hoàn Tất! 🎉",
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
    toast.success(`Đồng bộ xong ${r.processed} đơn hàng Lazada!`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ─── HÀNG 1: TRẠNG THÁI NỀN TẢNG & CẤU HÌNH LAZADA ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nền tảng Lazada */}
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
              Khi tạm tắt, Lazada sẽ ẩn khỏi màn tạo link và API sẽ từ chối tạo link Lazada mới.
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
            <span>{active ? "Tạm tắt Lazada" : "Bật Lazada"}</span>
          </Button>
        </div>

        {/* Cấu hình Lazada Open API */}
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-900">
                <Activity size={14} className="text-neutral-500" />
                <span>Cấu Hình Lazada</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500 font-bold">
                TOP API
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2">
              <Status label="App key" ok={config.hasAppKey} />
              <Status label="App secret" ok={config.hasAppSecret} />
              <Status label="Access token" ok={config.hasAccessToken} />
              <Status label="Sẵn sàng" ok={config.ready} />
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

      {/* ─── HÀNG 2: ĐỒNG BỘ ĐƠN HÀNG LAZADA ─── */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <RefreshCw size={14} />
            </div>
            <div className="text-[13.5px] font-black text-neutral-900">Đồng Bộ Đơn Hàng Lazada</div>
          </div>
          <span className="text-[11px] font-bold text-neutral-400">
            Conversion Report API
          </span>
        </div>

        {/* Nút chọn nhanh số ngày quét */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Chọn khoảng thời gian quét:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { days: 7, label: "7 ngày qua" },
              { days: 14, label: "14 ngày qua" },
              { days: 30, label: "30 ngày qua" },
              { days: 60, label: "60 ngày qua" },
            ].map((p) => {
              const active = selectedDays === p.days;
              return (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setSelectedDays(p.days)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
                      ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-black ring-1 ring-blue-200"
                      : "bg-neutral-50/80 text-neutral-600 border-neutral-200 hover:bg-white hover:border-neutral-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút hành động Đồng bộ */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            onClick={syncOrders}
            disabled={loading === "sync"}
            className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold shadow-sm text-xs px-5 py-2.5 rounded-xl cursor-pointer shrink-0"
          >
            <span>{loading === "sync" ? "Đang đồng bộ..." : "Đồng bộ đơn"}</span>
          </Button>

          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
            Quét {selectedDays} ngày gần nhất qua Conversion Report, tự map đúng khách theo subId.
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
