"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, ArrowRight, ShieldCheck, HeartHandshake, Gift } from "lucide-react";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";

/*
 * Tỷ lệ hoa hồng trung bình mà sàn (Shopee/TikTok) trả cho affiliate
 * theo từng ngành hàng. MeowBack sau đó chia lại 20% số hoa hồng này
 * cho khách hàng.
 *
 * Công thức: Hoàn tiền = Chi tiêu × commissionRate × 20%
 * Ví dụ: 1.000.000 × 8% = 80.000 (hoa hồng) → 80.000 × 20% = 16.000đ hoàn
 */
const CATEGORIES = [
  { id: "fashion", name: "Thời Trang & Giày Dép", avgRate: 0.12, emoji: "👗" },
  { id: "beauty", name: "Mỹ Phẩm & Skin Care", avgRate: 0.10, emoji: "💄" },
  { id: "baby", name: "Mẹ & Bé", avgRate: 0.08, emoji: "🍼" },
  { id: "tech", name: "Điện Thoại & Phụ Kiện", avgRate: 0.06, emoji: "📱" },
  { id: "home", name: "Nhà Cửa & Đời Sống", avgRate: 0.07, emoji: "🏡" },
];

/* Tỷ lệ MeowBack chia lại cho khách hàng (20% trên tổng hoa hồng affiliate) */
const CASHBACK_SHARE_RATE = 0.2;

export function LiveCashbackCalculator() {
  const [monthlySpend, setMonthlySpend] = useState<number>(3000000);
  const [platform, setPlatform] = useState<"shopee" | "tiktok">("shopee");
  const [selectedCatId, setSelectedCatId] = useState<string>("fashion");

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];
  const platformMultiplier = platform === "tiktok" ? 1.1 : 1.0;

  // Hoa hồng sàn trả cho affiliate
  const grossCommission = Math.round(monthlySpend * selectedCat.avgRate * platformMultiplier);
  // MeowBack chia lại 20% hoa hồng cho khách
  const monthlyCashback = Math.round(grossCommission * CASHBACK_SHARE_RATE);
  const yearlyCashback = monthlyCashback * 12;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  const formatShort = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")} triệu`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toLocaleString("vi-VN");
  };

  // Cá nhân hóa thông điệp UX — phù hợp với mức hoàn thực tế (20% hoa hồng)
  const getPersonalizedTip = (spend: number, monthly: number, yearly: number) => {
    if (spend <= 1500000) {
      return `Mỗi tháng bạn được hoàn ~${formatCurrency(monthly)} — tích góp dần, cuối năm có thêm ${formatCurrency(yearly)} tiêu vặt không mất đồng nào 🧋`;
    }
    if (spend <= 5000000) {
      return `Tích lũy ~${formatCurrency(yearly)}/năm hoàn toàn tự động — đủ tiền đi ăn nhà hàng hay mua quà tặng bạn bè mỗi dịp lễ 🎁`;
    }
    if (spend <= 10000000) {
      return `Bạn chi tiêu nhiều = hoàn nhiều! ~${formatCurrency(yearly)}/năm đủ nâng cấp phụ kiện yêu thích hoặc 1 chuyến đi chơi ngắn ngày ✈️`;
    }
    return `Với mức chi tiêu của bạn, ~${formatCurrency(yearly)}/năm hoàn về ví là con số rất đáng kể — tiền "rơi" tự động mà không cần làm gì thêm 💰`;
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white via-primary-50/40 to-white overflow-hidden">
      {/* Glow hiệu ứng nền */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary-200/25 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-8">
        {/* Header mang tính đối thoại trực tiếp cá nhân */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100/90 text-[#8A0B37] px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-primary-200">
            <HeartHandshake size={16} className="text-primary-600" />
            <span>Góc cá nhân hóa chi tiêu của bạn 🎀</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Chào bạn! Mỗi tháng bạn thường <br className="hidden sm:inline" />
            <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
              mua sắm bao nhiêu tiền?
            </span>
          </h2>
          <p className="text-neutral-600 font-semibold max-w-xl mx-auto text-base">
            Kéo thử mức chi tiêu bên dưới — tôi sẽ tính số tiền bạn được hoàn mỗi tháng, hoàn toàn tự động khi mua qua MeowBack.
          </p>
        </div>

        {/* Khung tính toán tương tác cao */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl bg-white/90 p-6 md:p-10 shadow-cute-lg border border-primary-200/80 backdrop-blur-xl">
          {/* Cột điều khiển */}
          <div className="lg:col-span-7 space-y-7 flex flex-col justify-between">
            {/* Chọn sàn */}
            <div className="space-y-3">
              <label className="text-xs font-black text-neutral-700 uppercase tracking-wider flex items-center gap-2">
                <span>1. Sàn bạn hay mua nhất</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform("shopee")}
                  className={`flex items-center justify-center gap-3 p-3.5 rounded-2xl font-black transition-all border-2 ${
                    platform === "shopee"
                      ? "border-orange-500 bg-orange-50/80 text-orange-600 shadow-sm scale-[1.02]"
                      : "border-neutral-200 bg-neutral-50/60 text-neutral-600 hover:bg-neutral-100/60"
                  }`}
                >
                  <ShopeeIcon className="w-5 h-5" />
                  <span className="text-sm">Shopee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform("tiktok")}
                  className={`flex items-center justify-center gap-3 p-3.5 rounded-2xl font-black transition-all border-2 ${
                    platform === "tiktok"
                      ? "border-primary-600 bg-gradient-to-r from-primary-600 to-rose-600 text-white shadow-sm scale-[1.02]"
                      : "border-neutral-200 bg-neutral-50/60 text-neutral-600 hover:bg-neutral-100/60"
                  }`}
                >
                  <TiktokIcon className="w-5 h-5" />
                  <span className="text-sm">TikTok Shop</span>
                </button>
              </div>
            </div>

            {/* Chọn ngành hàng */}
            <div className="space-y-3">
              <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                2. Ngành hàng bạn hay chốt đơn
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedCatId === cat.id
                        ? "bg-primary-500 text-white border-primary-500 shadow-cute-sm scale-[1.03]"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-primary-50 hover:border-primary-200"
                    }`}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider mức chi tiêu */}
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  3. Mức chi tiêu trung bình / tháng
                </label>
                <span className="text-xl font-black text-primary-600 bg-primary-100/80 px-3.5 py-1 rounded-xl">
                  {formatCurrency(monthlySpend)}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={20000000}
                step={500000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs font-bold text-neutral-400 px-1">
                <span>500K</span>
                <span>5 Triệu</span>
                <span>10 Triệu</span>
                <span>20 Triệu+</span>
              </div>
            </div>
          </div>

          {/* Thẻ hiển thị kết quả cá nhân hóa */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#8A0B37] via-primary-600 to-rose-600 p-7 text-white shadow-cute-lg relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <span className="text-xs font-black uppercase tracking-widest text-primary-100 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" /> Kết quả dành riêng cho bạn
                </span>
                <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                  <Gift size={12} /> Hoàn lại 20%
                </span>
              </div>

              <div>
                <div className="text-xs font-extrabold text-primary-100 mb-1">Mỗi tháng bạn được hoàn về ví:</div>
                <div className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                  ~ {formatCurrency(monthlyCashback)}
                </div>
                <div className="text-[11px] font-semibold text-white/60 mt-1">
                  Từ hoa hồng {formatCurrency(grossCommission)} × 20% chia sẻ
                </div>
              </div>

              {/* Hộp gợi ý cá nhân hóa độc đáo */}
              <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-md border border-white/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-primary-100">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-amber-300" /> Tích lũy 1 năm:
                  </span>
                  <span className="text-amber-200 font-extrabold">{formatCurrency(yearlyCashback)}</span>
                </div>
                <p className="text-[12px] font-bold text-white/90 leading-relaxed italic border-t border-white/10 pt-2">
                  &ldquo;{getPersonalizedTip(monthlySpend, monthlyCashback, yearlyCashback)}&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10 space-y-3">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-white text-[#8A0B37] font-black text-base shadow-lg hover:bg-rose-50 transition-all active:scale-[0.98] border border-rose-200"
              >
                <span>Nhận tiền hoàn ngay 🎀</span>
                <ArrowRight size={18} />
              </Link>
              <div className="flex items-center justify-center gap-2 text-[11px] text-white/80 font-semibold">
                <ShieldCheck size={14} />
                <span>Rút về ngân hàng từ 10.000đ • Miễn phí 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
