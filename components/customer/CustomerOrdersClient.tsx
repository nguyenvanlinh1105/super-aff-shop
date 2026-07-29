"use client";

import { CalendarDays, ExternalLink, Package, Gift } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Order = {
  id: string;
  orderExternalId: string;
  platformName: string;
  sourceType: string;
  createdAt: string;
  orderAmount: string;
  customerRewardAmount: string;
  orderStatus: string;
  payoutStatus: string;
  daysLeft: number | null;
  completedAtText: string | null;
  readyAtText: string | null;
};

type Props = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  counts: { all: number; completed: number; pending: number; reconciling: number; processing: number; cancelled: number };
};

export function CustomerOrdersClient({ orders, totalPages, currentPage, counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getStatusBadge = (order: Order) => {
    if (order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback") {
      return <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600">❌ Đã huỷ</span>;
    }
    if (order.orderStatus === "approved" && order.payoutStatus === "paid") {
      return <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">✅ Đã nhận tiền</span>;
    }
    if (order.orderStatus === "approved" && order.payoutStatus !== "paid") {
      return <span className="inline-flex rounded-md bg-[#fff0e6] px-2 py-1 text-[11px] font-bold text-[#e86a33]">💰 Tiền đã về — chờ chuyển khoản</span>;
    }
    if (order.orderStatus === "processing") {
      const daysText = order.daysLeft === 0 ? "hôm nay" : order.daysLeft === 1 ? "1 ngày nữa" : `${order.daysLeft} ngày nữa`;
      return <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">🕐 Đang đối soát — còn {daysText}</span>;
    }
    return <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600">⏳ Chờ Shopee xác nhận</span>;
  };

  const getStatusHint = (order: Order) => {
    if (order.orderStatus === "cancelled" || order.orderStatus === "rejected" || order.orderStatus === "clawback") return null;
    if (order.orderStatus === "approved") return null;
    if (order.orderStatus === "processing") {
      if (order.completedAtText && order.readyAtText) {
        return `Hoàn thành ngày ${order.completedAtText} — đủ điều kiện rút từ ngày ${order.readyAtText} (theo quy định 15 ngày đối soát, phòng trường hợp đổi/trả hàng).`;
      }
      return "Shopee đã xác nhận đơn hoàn thành. Theo quy định, tiền hoàn chỉ chắc chắn về ví sau đúng 15 ngày kể từ ngày hoàn thành (thời gian Shopee đối soát, phòng trường hợp đổi/trả hàng).";
    }
    return "Shopee chưa xác nhận đơn đã hoàn thành giao hàng — tiền hoàn ước tính bên dưới chưa chắc chắn, có thể thay đổi hoặc không được ghi nhận nếu đơn bị huỷ.";
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-lg fade-in pb-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-sm">
        <h1 className="text-[28px] font-black tracking-tight text-gray-900">
          Đơn hàng
        </h1>
        <div className="flex h-6 items-center justify-center rounded-full bg-gray-100 px-[10px] text-[12px] font-bold text-gray-500 ring-1 ring-gray-200">
          {counts.all}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ServerSearchInput placeholder="Tìm mã đơn hoặc tên sản phẩm..." />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} />
        <TabButton active={currentTab === "pending"} onClick={() => handleTabChange("pending")} label="⏳ Chờ Shopee xác nhận" count={counts.pending} />
        <TabButton active={currentTab === "reconciling"} onClick={() => handleTabChange("reconciling")} label="🕐 Đang đối soát" count={counts.reconciling} />
        <TabButton active={currentTab === "processing"} onClick={() => handleTabChange("processing")} label="💰 Chờ chuyển khoản" count={counts.processing} />
        <TabButton active={currentTab === "completed"} onClick={() => handleTabChange("completed")} label="✅ Đã nhận tiền" count={counts.completed} />
        <TabButton active={currentTab === "cancelled"} onClick={() => handleTabChange("cancelled")} label="❌ Đã huỷ" count={counts.cancelled} />
      </div>

      {/* GIẢI THÍCH THEO TAB — giúp khách hiểu rõ từng trạng thái nghĩa là gì */}
      {currentTab === "pending" && (
        <InfoBox tone="amber">
          Shopee <strong>chưa xác nhận</strong> bạn đã nhận hàng/hoàn tất đơn. Số tiền hoàn hiển thị chỉ là{" "}
          <strong>ước tính</strong> — có thể thay đổi hoặc mất nếu đơn bị huỷ/hoàn trả trước khi Shopee xác nhận.
        </InfoBox>
      )}
      {currentTab === "reconciling" && (
        <InfoBox tone="blue">
          Shopee đã xác nhận đơn <strong>hoàn thành</strong> — số tiền hoàn đã chắc chắn hơn nhiều, nhưng theo quy định
          vẫn cần đợi đúng <strong>15 ngày kể từ ngày hoàn thành</strong> (thời gian Shopee đối soát, phòng trường hợp
          đổi/trả hàng) trước khi được cộng vào ví và cho rút.
        </InfoBox>
      )}
      {currentTab === "processing" && (
        <InfoBox tone="orange">
          Tiền hoàn đã <strong>chắc chắn về ví</strong> và sẵn sàng rút — hệ thống đang chờ được xử lý chuyển khoản.
          Vào mục <strong>Ví tiền</strong> để gửi yêu cầu rút.
        </InfoBox>
      )}
      {currentTab === "completed" && (
        <InfoBox tone="emerald">Đơn đã hoàn tất — tiền hoàn đã được chuyển khoản thành công vào tài khoản của bạn.</InfoBox>
      )}
      {currentTab === "cancelled" && (
        <InfoBox tone="red">
          Đơn không được ghi nhận hoàn tiền — do Shopee huỷ/hoàn trả, hoặc hoa hồng bị Shopee đòi lại sau khi đã duyệt.
        </InfoBox>
      )}

      {/* CONTENT LIST */}
      <div className="mt-md rounded-3xl bg-white p-md shadow-sm ring-1 ring-black/5 min-h-[400px]">
        {orders.length === 0 ? (
          <div className="flex h-full min-h-[350px] flex-col items-center justify-center">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="mb-md h-20 w-20 object-contain opacity-90" />
            <div className="text-[14px] font-bold text-gray-400">Chưa có đơn hàng</div>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {orders.map((o) => (
              <div
                key={o.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-2xl border p-md transition-all ${
                  o.sourceType === "referral"
                    ? "border-purple-100 bg-purple-50/30 hover:border-purple-200"
                    : "border-gray-100 hover:border-[#e86a33]/30 hover:bg-[#fff0e6]/20"
                }`}
              >
                <div className="flex items-start gap-md">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      o.sourceType === "referral"
                        ? "bg-purple-100 text-purple-500 ring-purple-100"
                        : "bg-gray-50 text-gray-400 ring-gray-100 group-hover:bg-white group-hover:text-[#e86a33]"
                    }`}
                  >
                    {o.sourceType === "referral" ? <Gift size={20} strokeWidth={2.5} /> : <Package size={20} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${o.sourceType === "referral" ? "text-purple-600" : "text-gray-500"}`}>
                        {o.sourceType === "referral" ? "🎁 Hoa hồng giới thiệu" : o.platformName}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[12px] font-medium text-gray-400 flex items-center gap-1">
                        <CalendarDays size={12} />
                        {o.createdAt}
                      </span>
                    </div>
                    <div className="mt-[2px] text-[14px] font-bold text-gray-900 font-mono">
                      {o.orderExternalId}
                    </div>
                    {o.sourceType === "referral" && (
                      <div className="mt-1 max-w-[280px] text-[11px] leading-snug text-purple-500/90">
                        Không phải đơn bạn mua — đây là tiền thưởng vì bạn đã giới thiệu người này cho MeowBack. Xem chi tiết tại mục "Mời bạn".
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-xs">
                      {getStatusBadge(o)}
                    </div>
                    {getStatusHint(o) && (
                      <div className="mt-1 max-w-[280px] text-[11px] leading-snug text-amber-600/80">
                        {getStatusHint(o)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-xl sm:text-right mt-sm sm:mt-0 pt-sm border-t border-gray-50 sm:border-0 sm:pt-0">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {o.sourceType === "referral" ? "Giá trị đơn (của bạn F1)" : "Giá trị đơn"}
                    </div>
                    <div className="text-[14px] font-bold text-gray-900">{o.orderAmount}</div>
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${o.sourceType === "referral" ? "text-purple-600" : "text-[#e86a33]"}`}>
                      {o.sourceType === "referral" ? "Hoa hồng nhận" : "Tiền hoàn"}
                    </div>
                    <div className={`text-[15px] font-black ${o.sourceType === "referral" ? "text-purple-600" : "text-[#e86a33]"}`}>{o.customerRewardAmount}</div>
                  </div>
                  <button className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors hover:bg-[#e86a33] hover:text-white">
                    <ExternalLink size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}

const INFO_BOX_TONES = {
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  orange: "bg-[#fff0e6] border-[#e86a33]/20 text-[#e86a33]",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

function InfoBox({ tone, children }: { tone: keyof typeof INFO_BOX_TONES; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border px-lg py-md text-[13px] font-medium leading-relaxed ${INFO_BOX_TONES[tone]}`}>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
        active
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm"
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
        active ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-400"
      }`}>
        {count}
      </span>
    </button>
  );
}
