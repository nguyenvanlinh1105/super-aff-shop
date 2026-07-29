"use client";

import { useState } from "react";
import { ShoppingBag, UserPlus, CheckCircle } from "lucide-react";

export function ProgressTabs({ hasShoppingActivity }: { hasShoppingActivity: boolean }) {
  const [tab, setTab] = useState<"shopping" | "referral">("shopping");

  return (
    <div>
      {/* Tab headers */}
      <div className="mb-lg flex rounded-lg bg-canvas-soft p-xs">
        {(["shopping", "referral"] as const).map((t) => (
          <button
            key={t}
            className={`flex-1 rounded-md px-lg py-sm text-[13px] font-semibold transition-all duration-150 ${
              tab === t
                ? "bg-canvas text-ink shadow-sm"
                : "text-mute hover:text-body"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "shopping" ? "Mua sắm" : "Giới thiệu"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fade-in">
        {tab === "shopping" ? (
          hasShoppingActivity ? (
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-sm rounded-xl bg-primary-pale p-lg">
                <CheckCircle size={18} strokeWidth={1.75} className="text-positive-deep shrink-0" />
                <div>
                  <div className="text-[14px] font-semibold text-ink">Đang hoạt động</div>
                  <div className="text-[12px] text-mute">Xem chi tiết ở mục Đơn hàng.</div>
                </div>
              </div>
              <p className="text-[13px] text-body leading-relaxed">
                Tiếp tục mua sắm qua link hoàn tiền để tích luỹ thêm.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-xl text-center gap-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-pale text-ink-deep">
                <ShoppingBag size={22} strokeWidth={1.5} />
              </div>
              <div className="text-[14px] font-semibold text-ink">Chưa có hoạt động mua sắm</div>
              <div className="text-[12px] text-mute leading-relaxed">Đổi link sản phẩm và mua sắm để bắt đầu tích luỹ hoàn tiền.</div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center py-xl text-center gap-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-pale text-ink-deep">
              <UserPlus size={22} strokeWidth={1.5} />
            </div>
            <div className="text-[14px] font-semibold text-ink">Chưa mời bạn bè nào</div>
            <div className="text-[12px] text-mute leading-relaxed">Chia sẻ link mời để nhận thêm 10% hoa hồng trên đơn hàng của bạn bè.</div>
          </div>
        )}
      </div>
    </div>
  );
}
