"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import { OrderActions } from "@/components/admin/OrderActions";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  UserRoundX,
  UserRoundCheck,
  Hourglass,
  ScanSearch,
  PiggyBank,
  Clock3,
  CircleCheckBig,
  Ban,
  Archive,
  AlertTriangle,
  Gift,
  type LucideIcon,
} from "lucide-react";

type Option = { id: string; label: string };

type Order = {
  id: string;
  orderExternalId: string;
  itemName: string | null;
  platformName: string;
  customerName: string | null;
  customerId: string | null;
  trackingCode: string | null;
  sourceType: string;
  orderAmount: number;
  commissionAmount: number;
  customerRewardAmount: number;
  systemProfitAmount: number;
  referralBonusDeducted: number;
  orderStatus: string;
  payoutStatus: string;
  orderedAt: string | null;
  completedAt: string | null;
  clawbackWarning: boolean;
};

type Props = {
  orders: Order[];
  customers: Option[];
  totalPages: number;
  currentPage: number;
  counts: { all: number; unassigned: number; assigned: number; pending: number; processing: number; moneyIn: number; unpaid: number; paid: number; cancelled: number; completed: number; clawback: number; referral: number };
  sums: { orderAmount: number; commissionAmount: number; customerRewardAmount: number; systemProfitAmount: number; referralBonusDeductedTotal: number; moneyInTotal: number; unpaidTotal: number };
};

const orderStatusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "🕐 Đang đối soát",
  completed: "🗄️ Dữ liệu cũ — cần re-import",
  approved: "💰 Tiền đã về",
  cancelled: "Đã huỷ",
  rejected: "Từ chối",
  clawback: "Clawback",
};

const orderStatusTone: Record<string, "positive" | "negative" | "warning" | "neutral" | "info"> = {
  pending: "warning",
  processing: "warning",
  completed: "info",
  approved: "positive",
  cancelled: "negative",
  rejected: "negative",
  clawback: "negative",
};

const payoutStatusLabel: Record<string, string> = {
  unpaid: "Chưa trả khách",
  paid: "✅ Đã trả khách",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminOrdersClient({ orders, customers, totalPages, currentPage, counts, sums }: Props) {
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

  return (
    <div className="flex flex-col gap-lg fade-in pb-2xl">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ServerSearchInput placeholder="Tìm mã đơn, tên sản phẩm, tên khách hoặc tracking code..." />
        </div>
      </div>

      {/* TABS — 2 luồng tách biệt: (1) Shopee đã trả tiền cho MÌNH chưa, (2) mình đã trả khách chưa */}
      <div className="flex flex-nowrap md:flex-wrap items-center gap-sm overflow-x-auto pb-2 -mx-md px-md md:mx-0 md:px-0 scrollbar-hide w-full max-w-[100vw]">
        <TabButton active={currentTab === "all"} onClick={() => handleTabChange("all")} label="Tất cả" count={counts.all} icon={LayoutGrid} />
        <TabButton active={currentTab === "unassigned"} onClick={() => handleTabChange("unassigned")} label="Chưa map khách" count={counts.unassigned} icon={UserRoundX} />
        <TabButton active={currentTab === "assigned"} onClick={() => handleTabChange("assigned")} label="Đã map khách" count={counts.assigned} icon={UserRoundCheck} />
        <TabButton active={currentTab === "pending"} onClick={() => handleTabChange("pending")} label="Chờ xác nhận" count={counts.pending} icon={Hourglass} />
        {counts.processing > 0 && (
          <TabButton active={currentTab === "processing"} onClick={() => handleTabChange("processing")} label="Đang đối soát" count={counts.processing} icon={ScanSearch} highlight />
        )}
        <TabButton active={currentTab === "money_in"} onClick={() => handleTabChange("money_in")} label="Tiền đã về" count={counts.moneyIn} icon={PiggyBank} />
        <TabButton active={currentTab === "unpaid"} onClick={() => handleTabChange("unpaid")} label="Chưa trả khách" count={counts.unpaid} icon={Clock3} />
        <TabButton active={currentTab === "paid"} onClick={() => handleTabChange("paid")} label="Đã trả khách" count={counts.paid} icon={CircleCheckBig} />
        <TabButton active={currentTab === "cancelled"} onClick={() => handleTabChange("cancelled")} label="Đã huỷ" count={counts.cancelled} icon={Ban} />
        {counts.completed > 0 && (
          <TabButton active={currentTab === "completed"} onClick={() => handleTabChange("completed")} label="Dữ liệu cũ" count={counts.completed} icon={Archive} highlight />
        )}
        {counts.clawback > 0 && (
          <TabButton active={currentTab === "clawback"} onClick={() => handleTabChange("clawback")} label="Clawback" count={counts.clawback} icon={AlertTriangle} highlight />
        )}
        {counts.referral > 0 && (
          <TabButton active={currentTab === "referral"} onClick={() => handleTabChange("referral")} label="🎁 Giới thiệu" count={counts.referral} icon={Gift} />
        )}
      </div>

      {/* INFO BOX theo từng tab — giải thích rõ ý nghĩa để đỡ nhầm giữa "tiền Shopee trả mình" và "mình trả khách" */}
      {currentTab === "pending" && (
        <div className="flex items-start gap-sm bg-gray-50 border border-gray-200 rounded-2xl px-lg py-md">
          <img src="/heoQA.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
            Shopee <strong>chưa xác nhận</strong> sản phẩm nào trong đơn là "Hoàn thành" hay "Đã huỷ" — số tiền hiển thị chỉ là ước tính,
            có thể thay đổi khi <strong>import lại CSV mới</strong> sau khi Shopee cập nhật trạng thái.
          </p>
        </div>
      )}
      {currentTab === "cancelled" && (
        <div className="flex items-start gap-sm bg-red-50 border border-red-200 rounded-2xl px-lg py-md">
          <img src="/heoQA.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-red-700 font-medium leading-relaxed">
            Shopee báo <strong>tất cả sản phẩm trong đơn đều bị huỷ</strong> (khách huỷ đơn hoặc trả hàng trước khi được duyệt) — không tính hoa hồng.
            Đơn đã duyệt rồi mới bị huỷ nằm ở tab <strong>⚠️ Clawback</strong> riêng, không nằm ở đây.
          </p>
        </div>
      )}
      {currentTab === "completed" && (
        <div className="flex items-start gap-sm bg-blue-50 border border-blue-200 rounded-2xl px-lg py-md">
          <img src="/heothongbao.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-blue-700 font-medium leading-relaxed">
            Đây là đơn được import <strong>trước khi hệ thống sửa lại logic đọc CSV</strong> nên còn kẹt ở trạng thái cũ, không phản ánh đúng thực tế.
            <strong> Import lại đúng file CSV đã dùng cho các đơn này</strong> — hệ thống sẽ tự phân loại lại chính xác thành "💰 Tiền đã về" hoặc "Đã huỷ" theo đúng trạng thái sản phẩm liên kết thật.
          </p>
        </div>
      )}
      {currentTab === "processing" && (
        <div className="flex items-start gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-md">
          <img src="/heochodoi.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-amber-700 font-medium leading-relaxed">
            Shopee đã báo <strong>"Hoàn thành"</strong> nhưng hoa hồng còn trong thời gian đối soát — hệ thống chỉ tính là
            <strong> "💰 Tiền đã về"</strong> (và cho khách rút) sau <strong>15 ngày kể từ ngày hoàn thành</strong>.
            Các đơn này sẽ tự chuyển tab khi đủ điều kiện ở lần import CSV tiếp theo.
          </p>
        </div>
      )}
      {currentTab === "money_in" && (
        <div className="flex items-start gap-sm bg-emerald-50 border border-emerald-200 rounded-2xl px-lg py-md">
          <img src="/heovitien.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-emerald-700 font-medium leading-relaxed">
            Toàn bộ đơn ở đây <strong>Shopee đã duyệt và trả hoa hồng thật cho bạn</strong> — không phân biệt đã trả tiền cho khách hay chưa.
            Muốn xem riêng phần <strong>chưa trả khách</strong> hay <strong>đã trả khách</strong>, bấm 2 tab kế bên.
          </p>
        </div>
      )}
      {currentTab === "unpaid" && (
        <div className="flex items-start gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-md">
          <img src="/heochodoi.png" alt="" className="h-[26px] w-[26px] object-contain shrink-0 -mt-[2px]" />
          <p className="text-[13px] text-amber-700 font-medium leading-relaxed">
            Tiền Shopee đã về (approved) nhưng <strong>bạn chưa chuyển cho khách</strong>. Vào trang <strong>Thanh toán</strong> để tạo phiếu chi cho khách.
          </p>
        </div>
      )}
      {currentTab === "referral" && (
        <div className="flex items-start gap-sm bg-purple-50 border border-purple-200 rounded-2xl px-lg py-md">
          <span className="text-[20px] leading-none">🎁</span>
          <p className="text-[13px] text-purple-700 font-medium leading-relaxed">
            Đây là các dòng <strong>hoa hồng giới thiệu</strong> tự động sinh ra khi đơn của người được giới thiệu (F1) được duyệt — mã đơn luôn có dạng <strong>REF-...</strong>, không phải đơn Shopee thật.
            Số tiền ở cột "Tiền hoàn" được trích thẳng từ phần hệ thống giữ (không đụng vào phần khách F1 nhận), và cộng vào ví người giới thiệu y hệt tiền hoàn bình thường — rút được đầy đủ.
          </p>
        </div>
      )}

      {/* COMPACT TABLE WITH SUMMARY */}
      <div className="rounded-3xl bg-white p-0 shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col gap-0 w-full max-w-[100vw]">

        {/* Summary Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 p-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-md">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng giá trị đơn</span>
            <span className="text-[20px] font-bold text-gray-900 leading-none">
              {formatCurrency(sums.orderAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng HH trước thuế (đang lọc)</span>
            <span className="text-[20px] font-bold text-gray-700 leading-none">
              {formatCurrency(sums.commissionAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider mb-1">💰 Tiền đã về (tất cả)</span>
            <span className="text-[20px] font-bold text-emerald-600 leading-none">
              {formatCurrency(sums.moneyInTotal)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#e86a33] uppercase tracking-wider mb-1">Tổng hoàn khách (đang lọc)</span>
            <span className="text-[20px] font-bold text-[#e86a33] leading-none">
              {formatCurrency(sums.customerRewardAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng hệ thống giữ (đang lọc)</span>
            <span className="text-[20px] font-bold text-gray-700 leading-none">
              {formatCurrency(sums.systemProfitAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-purple-600 uppercase tracking-wider mb-1">🎁 Đã trích cho GT (đang lọc)</span>
            <span className="text-[20px] font-bold text-purple-600 leading-none">
              {formatCurrency(sums.referralBonusDeductedTotal)}
            </span>
          </div>
        </div>

        <div className="responsive-table overflow-x-auto">
          <table className="w-full text-left text-[13px] min-w-[1040px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Đơn hàng / Tracking</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Khách hàng</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px]">Ngày ĐH / HT</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">Giá trị đơn</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">HH trước thuế</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-[#e86a33] text-[11px] text-right">Tiền hoàn / Giữ lại</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] w-[150px]">Trạng thái</th>
                <th className="px-md py-sm font-bold uppercase tracking-wider text-gray-500 text-[11px] w-[160px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-2xl text-center">
                    <div className="flex flex-col items-center gap-sm">
                      <img src="/heochodoi.png" alt="" className="h-16 w-16 object-contain opacity-70" />
                      <span className="text-[14px] font-bold text-gray-400">Không tìm thấy đơn hàng nào phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className={`border-b border-gray-50 transition-colors ${o.orderStatus === "clawback" ? "bg-red-50/40" : o.sourceType === "referral" ? "bg-purple-50/30" : o.clawbackWarning ? "bg-amber-50/40" : "hover:bg-[#fff0e6]/20"}`}>
                    {/* Order Info */}
                    <td className="px-md py-sm" data-label="Đơn hàng / Tracking">
                      <div className="font-mono font-bold text-gray-900 flex items-center gap-1">
                        {o.clawbackWarning && (
                          <span title="Quá 15 ngày — kiểm tra Shopee đã thanh toán chưa">
                            <img src="/heothongbao.png" alt="" className="h-4 w-4 object-contain shrink-0" />
                          </span>
                        )}
                        {o.orderExternalId}
                      </div>
                      {o.itemName && (
                        <div className="mt-[2px] max-w-[260px] truncate text-[12px] font-medium text-gray-600" title={o.itemName}>
                          {o.itemName}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {o.sourceType === "referral" ? (
                          <span className="inline-flex items-center gap-[3px] rounded-md bg-purple-100 px-1.5 py-[2px] text-[10px] font-bold text-purple-700">
                            🎁 Hoa hồng giới thiệu
                          </span>
                        ) : (
                          <span className="rounded-md bg-gray-100 px-1.5 py-[2px] text-[10px] font-bold text-gray-500 uppercase">{o.platformName}</span>
                        )}
                        <span className="font-mono text-[11px] text-gray-400">{o.trackingCode || "No tracking"}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-md py-sm" data-label="Khách hàng">
                      {o.customerName ? (
                        <span className="font-bold text-gray-700">{o.customerName}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Chưa map
                        </span>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="px-md py-sm" data-label="Ngày ĐH / HT">
                      <div className="text-[11px] text-gray-500 space-y-[2px]">
                        <div><span className="font-bold text-gray-400 mr-1">ĐH:</span>{formatDate(o.orderedAt)}</div>
                        <div><span className="font-bold text-gray-400 mr-1">HT:</span>{formatDate(o.completedAt)}</div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-md py-sm text-right font-medium text-gray-600" data-label="Giá trị đơn">
                      {formatCurrency(o.orderAmount)}
                    </td>

                    {/* Hoa hồng trước thuế */}
                    <td className="px-md py-sm text-right font-medium text-gray-500" data-label="HH trước thuế">
                      {formatCurrency(o.commissionAmount)}
                    </td>

                    {/* Commissions */}
                    <td className="px-md py-sm text-right" data-label="Tiền hoàn / Giữ lại">
                      <div className={`font-bold text-[14px] ${o.customerRewardAmount < 0 ? "text-red-600" : "text-[#e86a33]"}`}>
                        {formatCurrency(o.customerRewardAmount)}
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 mt-[2px]">
                        Giữ: {formatCurrency(o.systemProfitAmount)}
                      </div>
                      {o.referralBonusDeducted > 0 && (
                        <div
                          className="mt-[3px] inline-flex items-center gap-[3px] rounded-md bg-purple-50 px-1.5 py-[2px] text-[10px] font-bold text-purple-700"
                          title="Số tiền đã trích từ phần hệ thống giữ để trả hoa hồng cho người giới thiệu"
                        >
                          🎁 -{formatCurrency(o.referralBonusDeducted)} cho GT
                        </div>
                      )}
                    </td>

                    {/* Statuses */}
                    <td className="px-md py-sm" data-label="Trạng thái">
                      <div className="flex flex-wrap items-center justify-end gap-1 sm:justify-start">
                        <Badge tone={orderStatusTone[o.orderStatus] ?? "neutral"} dot>
                          {orderStatusLabel[o.orderStatus] ?? o.orderStatus}
                        </Badge>
                        <Badge tone={o.payoutStatus === "paid" ? "positive" : "neutral"}>
                          {payoutStatusLabel[o.payoutStatus] ?? o.payoutStatus}
                        </Badge>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-md py-sm" data-label="Thao tác">
                      <OrderActions
                        orderId={o.id}
                        orderStatus={o.orderStatus}
                        payoutStatus={o.payoutStatus}
                        hasCustomer={Boolean(o.customerId)}
                        customers={customers}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon: Icon, highlight }: { active: boolean; onClick: () => void; label: string; count: number; icon?: LucideIcon; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-all ${
        active
          ? "border-2 border-gray-900 bg-white text-gray-900 shadow-sm"
          : highlight
          ? "border-2 border-amber-400 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100"
          : "border-2 border-transparent bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {Icon && <Icon size={14} strokeWidth={2.25} className="shrink-0" />}
      {label}
      <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] ${
        active ? "bg-gray-100 text-gray-900" : highlight ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-400"
      }`}>
        {count}
      </span>
    </button>
  );
}
