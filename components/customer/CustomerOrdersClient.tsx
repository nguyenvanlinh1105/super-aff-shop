"use client";

import { CalendarDays, ExternalLink, Package, Gift } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-200/40 to-pink-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-primary-100/30 to-pink-100/30 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-orders.png" alt="Orders" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Đơn hàng ghi nhận
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Tổng cộng có <strong className="text-neutral-900">{counts.all}</strong> đơn hàng đã được theo dõi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ServerSearchInput placeholder="Tìm mã đơn hoặc tên sản phẩm..." />
        </div>
      </div>

      {/* TABS */}
      <div className="relative">
        <div className="flex flex-nowrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
          <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} />
          <TabButton active={currentTab === "pending"} onClick={() => handleTabChange("pending")} label="⏳ Chờ Shopee xác nhận" count={counts.pending} />
          <TabButton active={currentTab === "reconciling"} onClick={() => handleTabChange("reconciling")} label="🕐 Đang đối soát" count={counts.reconciling} />
          <TabButton active={currentTab === "processing"} onClick={() => handleTabChange("processing")} label="💰 Chờ chuyển khoản" count={counts.processing} />
          <TabButton active={currentTab === "completed"} onClick={() => handleTabChange("completed")} label="✅ Đã nhận tiền" count={counts.completed} />
          <TabButton active={currentTab === "cancelled"} onClick={() => handleTabChange("cancelled")} label="❌ Đã huỷ" count={counts.cancelled} />
        </div>
        {/* Fade gradient to indicate scrollable */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-neutral-50 to-transparent md:hidden" />
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
      <div className="mt-md rounded-3xl bg-white p-md shadow-lg shadow-primary-500/5 ring-1 ring-primary-100/50 min-h-[400px]">
        {orders.length === 0 ? (
          <div className="flex h-full min-h-[350px] flex-col items-center justify-center">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="mb-md h-20 w-20 object-contain opacity-90" />
            <div className="text-[14px] font-bold text-gray-400">Chưa có đơn hàng</div>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            <AnimatePresence mode="popLayout">
              {orders.map((o) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={o.id}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-md rounded-2xl border p-md transition-colors ${
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
                </motion.div>
              ))}
            </AnimatePresence>
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
          ? "border-2 border-primary-500 bg-white text-primary-600 shadow-md shadow-primary-500/10"
          : "border-2 border-transparent bg-white text-neutral-500 shadow-sm ring-1 ring-primary-100/50 hover:bg-primary-50/50 hover:text-neutral-900"
      }`}
    >
      {label}
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] ${
        active ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-400"
      }`}>
        {count}
      </span>
    </button>
  );
}
