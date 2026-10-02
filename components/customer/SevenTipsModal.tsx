"use client";

import Link from "next/link";
import {
  X,
  Sparkles,
  ShoppingCart,
  Zap,
  LogOut,
  VideoOff,
  Store,
  MapPinOff,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface SevenTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideUrl?: string;
}

const TIPS = [
  {
    num: 1,
    icon: ShoppingCart,
    iconColor: "text-rose-500 bg-rose-50",
    title: "Xoá sản phẩm khỏi giỏ hàng trước",
    desc: "Xoá sản phẩm khỏi giỏ trước khi bấm link chuyển đổi từ MeowBack, sau đó thêm lại vào giỏ và mua ngay.",
  },
  {
    num: 2,
    icon: Zap,
    iconColor: "text-amber-500 bg-amber-50",
    title: "Bấm vào là mua luôn — Không xem linh tinh",
    desc: "Sau khi mở link hoàn tiền, hãy mua ngay sản phẩm. Đừng lướt video, xem livestream hay bấm sang sản phẩm khác.",
  },
  {
    num: 3,
    icon: LogOut,
    iconColor: "text-indigo-500 bg-indigo-50",
    title: "Thoát hẳn ứng dụng sàn trước & sau khi đặt",
    desc: "Vuốt tắt hẳn ứng dụng Shopee/TikTok/Lazada trước khi bấm link và sau khi đặt xong để chốt phiên tracking sạch.",
  },
  {
    num: 4,
    icon: VideoOff,
    iconColor: "text-red-500 bg-red-50",
    title: "KHÔNG mua sản phẩm trong Live hoặc Video",
    desc: "Đơn mua trong phòng live hoặc video gắn giỏ hàng sẽ bị sàn ưu tiên tính hoa hồng cho chủ video/live đó.",
  },
  {
    num: 5,
    icon: Store,
    iconColor: "text-emerald-500 bg-emerald-50",
    title: "Mỗi lần thanh toán chỉ đặt 1 Shop",
    desc: "Không thanh toán gộp nhiều shop trong 1 lần. Mỗi lượt tạo link chỉ thanh toán 1 shop để đảm bảo đối soát.",
  },
  {
    num: 6,
    icon: MapPinOff,
    iconColor: "text-pink-600 bg-pink-50",
    title: "KHÔNG đổi địa chỉ nhận hàng sau khi bấm link",
    desc: "Giữ nguyên địa chỉ giao hàng. Sửa hoặc đổi địa chỉ lúc thanh toán sẽ làm đổi tuyến kho vận và mất hoa hồng.",
  },
  {
    num: 7,
    icon: CheckCircle2,
    iconColor: "text-primary-600 bg-primary-50",
    title: "Vào nhóm Zalo hoặc mục Đơn hàng kiểm tra",
    desc: "Sau 5–15 phút (tối đa vài giờ), hãy vào mục Đơn hàng trên MeowBack hoặc nhóm Zalo để kiểm tra đơn đã ghi nhận.",
  },
];

export function SevenTipsModal({ isOpen, onClose, guideUrl = "/app/guide#7-luu-y" }: SevenTipsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-neutral-100 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-primary-500/25 shrink-0">
                <Sparkles size={18} strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-snug">
                  7 Lưu Ý Để Không Bị Huỷ Hoàn Tiền 🎀
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Đọc nhanh trước khi tạo link để đơn được ghi nhận 100%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Đóng"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Danh sách 7 lưu ý (gọn gàng, chỉ có icon và nội dung súc tích) */}
        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-neutral-100/80 space-y-2.5">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.num} className="pt-2.5 first:pt-0 flex items-start gap-3">
                <div
                  className={`h-7 w-7 rounded-xl ${tip.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[12.5px] sm:text-[13px] font-bold text-neutral-900 leading-snug">
                    <span className="text-primary-600 font-black mr-1">{tip.num}.</span>
                    {tip.title}
                  </h4>
                  <p className="text-[11.5px] sm:text-xs text-neutral-600 font-medium leading-relaxed mt-0.5">
                    {tip.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={guideUrl}
            onClick={onClose}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline underline-offset-4 group order-2 sm:order-1"
          >
            <span>Xem bài viết chi tiết 7 lưu ý</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-600 hover:from-primary-600 hover:to-rose-700 text-white text-xs sm:text-[13px] font-extrabold shadow-cute hover:shadow-cute-lg transition-all active:scale-95 cursor-pointer order-1 sm:order-2 text-center"
          >
            Tôi đã hiểu, tạo link ngay ✨
          </button>
        </div>
      </div>
    </div>
  );
}
