"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, ArrowRight, ShieldCheck, HeartHandshake, Gift, CheckCircle2 } from "lucide-react";

/*
 * Danh mục ngành hàng và tỷ lệ hoa hồng trung bình của Shopee & TikTok Shop chi trả.
 */
const CATEGORIES = [
  { id: "fashion", name: "Thời Trang & Giày Dép", avgRate: 0.12, emoji: "👗", label: "~12% sàn trả" },
  { id: "beauty", name: "Mỹ Phẩm & Skin Care", avgRate: 0.10, emoji: "💄", label: "~10% sàn trả" },
  { id: "baby", name: "Mẹ & Bé", avgRate: 0.08, emoji: "🍼", label: "~8% sàn trả" },
  { id: "home", name: "Nhà Cửa & Đời Sống", avgRate: 0.07, emoji: "🏡", label: "~7% sàn trả" },
  { id: "tech", name: "Điện Thoại & Phụ Kiện", avgRate: 0.06, emoji: "📱", label: "~6% sàn trả" },
  { id: "grocery", name: "Bách Hóa Online", avgRate: 0.05, emoji: "🛒", label: "~5% sàn trả" },
];

const PRESET_SPENDS = [
  { label: "1.5 Triệu", value: 1500000 },
  { label: "3.5 Triệu", value: 3500000 },
  { label: "5 Triệu", value: 5000000 },
  { label: "10 Triệu", value: 10000000 },
  { label: "20 Triệu", value: 20000000 },
];

const MOBILE_PRESETS = [
  { label: "2 Triệu", spend: 2000000, note: "Đủ trả tiền cà phê, trà sữa mỗi tuần hoàn toàn miễn phí 🧋" },
  { label: "5 Triệu", spend: 5000000, note: "Tích lũy đủ đi ăn nhà hàng hay tự thưởng món đồ yêu thích 🎁" },
  { label: "10 Triệu", spend: 10000000, note: "Khoản tiết kiệm lớn đủ đổi điện thoại hoặc du lịch thả ga ✈️" },
];

export function LiveCashbackCalculator({
  customerRate = 80,
  taxRate = 10.98,
}: {
  customerRate?: number;
  taxRate?: number;
}) {
  const [monthlySpend, setMonthlySpend] = useState<number>(3500000);
  const [selectedCatId, setSelectedCatId] = useState<string>("tech");
  const [mobileSpendIndex, setMobileSpendIndex] = useState<number>(1);
  const [effectiveCustomerRate, setEffectiveCustomerRate] = useState<number>(customerRate);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(taxRate);

  // Tự động đồng bộ với cấu hình admin mới nhất nếu có
  useEffect(() => {
    fetch("/api/settings/commission-rule")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customerRate != null) setEffectiveCustomerRate(Number(data.customerRate));
        if (data?.taxRate != null) setEffectiveTaxRate(Number(data.taxRate));
      })
      .catch(() => {});
  }, []);

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];

  // 1. Hoa hồng sàn chi trả (Gross Commission)
  const grossCommission = Math.round(monthlySpend * selectedCat.avgRate);
  
  // 2. Khấu trừ thuế TNCN & VAT tại sàn (10.98%)
  const taxAmount = Math.round(grossCommission * (effectiveTaxRate / 100));
  
  // 3. Hoa hồng ròng sau thuế
  const netCommission = grossCommission - taxAmount;
  
  // 4. MeowBack hoàn lại cho khách hàng theo tỷ lệ (mặc định 80%, hoặc setting từ admin)
  const monthlyCashback = Math.round(netCommission * (effectiveCustomerRate / 100));
  
  // 5. Tích lũy 1 năm (12 tháng)
  const yearlyCashback = monthlyCashback * 12;

  // Tính toán nhanh cho mobile
  const currentMobileSpend = MOBILE_PRESETS[mobileSpendIndex].spend;
  const mobileGross = Math.round(currentMobileSpend * 0.08); // avg 8%
  const mobileTax = Math.round(mobileGross * (effectiveTaxRate / 100));
  const mobileNet = mobileGross - mobileTax;
  const mobileMonthly = Math.round(mobileNet * (effectiveCustomerRate / 100));
  const mobileYearly = mobileMonthly * 12;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  const getPersonalizedTip = (spend: number, monthly: number, yearly: number) => {
    if (spend <= 2000000) {
      return `Mỗi tháng bạn nhận về ~${formatCurrency(monthly)} — đủ trả tiền cà phê, trà sữa mỗi tuần hoàn toàn miễn phí 🧋`;
    }
    if (spend <= 5000000) {
      return `Tích lũy ~${formatCurrency(yearly)}/năm hoàn toàn tự động — đủ tiền đi ăn nhà hàng hay tự thưởng món đồ yêu thích 🎁`;
    }
    if (spend <= 10000000) {
      return `Mỗi tháng nhận ~${formatCurrency(monthly)} tiền tươi về tài khoản — cuối năm có ~${formatCurrency(yearly)} du lịch thả ga ✈️`;
    }
    return `Tích lũy khủng ~${formatCurrency(yearly)}/năm — một khoản tiết kiệm rất lớn hoàn toàn tự động từ chính thói quen mua sắm của bạn 💰`;
  };

  return (
    <section className="relative pt-8 pb-10 sm:pt-10 sm:pb-12 md:pt-14 md:pb-16 bg-gradient-to-b from-white via-primary-50/30 to-white overflow-hidden">
      {/* Glow hiệu ứng nền */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary-200/25 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-3.5 sm:px-6 md:px-8">
        
        {/* =================================================================== */}
        {/* MOBILE VIEW (< md): GỌN GÀNG, TRỰC QUAN, ĐÁNH TRÚNG TÂM LÝ (1 MÀN HÌNH) */}
        {/* =================================================================== */}
        <div className="block md:hidden">
          <div className="text-center space-y-1.5 mb-3.5">
            <div className="inline-flex items-center gap-1.5 bg-primary-100 text-[#8A0B37] px-3 py-1 rounded-full text-[11px] font-black border border-primary-200 shadow-2xs">
              <Sparkles size={13} className="text-primary-600" />
              <span>Góc tính tiền hoàn thực tế 🎀</span>
            </div>
            <h2 className="text-[21px] xs:text-[23px] font-black text-neutral-900 tracking-tight leading-snug">
              Mỗi năm bạn tích lũy được bao nhiêu?
            </h2>
            <p className="text-[12px] text-neutral-600 font-semibold max-w-xs mx-auto">
              Chỉ cần mua sắm bình thường qua MeowBack, tiền hoàn tự động chảy về ví bạn:
            </p>
          </div>

          {/* 3 Nút chọn mức chi tiêu nhanh */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/80 mb-3">
            {MOBILE_PRESETS.map((p, idx) => (
              <button
                key={p.spend}
                type="button"
                onClick={() => setMobileSpendIndex(idx)}
                className={`py-2 px-1 rounded-xl text-[12px] font-black transition-all flex flex-col items-center justify-center ${
                  mobileSpendIndex === idx
                    ? "bg-white text-primary-700 shadow-xs border border-primary-200/90 scale-[1.02]"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span className="whitespace-nowrap">{p.label}</span>
                <span className="text-[9.5px] font-bold text-neutral-400 whitespace-nowrap">/ tháng</span>
              </button>
            ))}
          </div>

          {/* Thẻ Kết quả Pocket Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#8A0B37] via-primary-600 to-rose-600 p-4 text-white shadow-cute border border-primary-300/40 relative overflow-hidden space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary-100 flex items-center gap-1">
                <Gift size={13} className="text-amber-300" /> Nhận về sau 1 năm
              </span>
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-md whitespace-nowrap">
                Hoàn {effectiveCustomerRate}% sau thuế
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-extrabold text-primary-100">Tiền hoàn tích lũy cả năm:</div>
              <div className="text-[28px] xs:text-[32px] font-black tracking-tight text-white leading-tight">
                ~ {formatCurrency(mobileYearly)}
              </div>
              <div className="text-[11.5px] font-semibold text-amber-200">
                Tương đương ~ <strong>{formatCurrency(mobileMonthly)}</strong> / tháng
              </div>
            </div>

            {/* Gợi ý gần gũi */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2.5 border border-white/20">
              <p className="text-[11.5px] font-bold text-white/95 leading-relaxed">
                &ldquo;{MOBILE_PRESETS[mobileSpendIndex].note}&rdquo;
              </p>
            </div>

            {/* 3 Cam kết siêu ngắn */}
            <div className="space-y-1.5 text-[11px] font-bold text-white/90 pt-0.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                <span className="whitespace-nowrap">Giữ nguyên 100% voucher, freeship của sàn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                <span className="whitespace-nowrap">Rút từ 10.000đ về mọi ngân hàng, miễn phí</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                <span className="whitespace-nowrap">Tự động cộng ví, không cần chụp bill hoá đơn</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/register"
                className="btn-shine-effect w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white text-[#8A0B37] font-black text-[13.5px] shadow-md hover:bg-rose-50 transition-all active:scale-98"
              >
                <span>Nhận tiền hoàn ngay 🎀</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* DESKTOP VIEW (>= md): BẢNG TÍNH TƯƠNG TÁC ĐẦY ĐỦ CHO PC              */}
        {/* =================================================================== */}
        <div className="hidden md:block">
        <div className="text-center space-y-3 mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100/90 text-[#8A0B37] px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-primary-200">
            <HeartHandshake size={16} className="text-primary-600" />
            <span>Góc tính tiền hoàn thực tế của bạn 🎀</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Mỗi tháng bạn thường <br className="hidden sm:inline" />
            <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
              mua sắm bao nhiêu tiền?
            </span>
          </h2>
          <p className="text-neutral-600 font-semibold max-w-xl mx-auto text-base">
            Chọn ngành hàng và mức chi tiêu bên dưới — MeowBack tự động tính số tiền hoàn thực nhận về ví với tỷ lệ cam kết <strong className="text-primary-600 font-black">{effectiveCustomerRate}% hoa hồng ròng</strong>.
          </p>
        </div>

        {/* Khung tính toán tương tác cao */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl bg-white/90 p-6 md:p-10 shadow-cute-lg border border-primary-200/80 backdrop-blur-xl">
          {/* Cột điều khiển (Trái) */}
          <div className="lg:col-span-7 space-y-7 flex flex-col justify-between">

            {/* Bước 1: Chọn ngành hàng */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  1. Ngành hàng bạn hay mua sắm
                </label>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200/60">
                  {selectedCat.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-extrabold transition-all border text-left flex items-center gap-2 ${
                      selectedCatId === cat.id
                        ? "bg-primary-500 text-white border-primary-500 shadow-cute-sm scale-[1.02]"
                        : "bg-white text-neutral-700 border-neutral-200/90 hover:bg-primary-50 hover:border-primary-200"
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.emoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bước 2: Mức chi tiêu trung bình / tháng */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  2. Mức chi tiêu trung bình / tháng
                </label>
                <span className="text-xl font-black text-primary-600 bg-primary-100/80 px-3.5 py-1 rounded-xl shadow-xs">
                  {formatCurrency(monthlySpend)}
                </span>
              </div>

              {/* Preset buttons tiện lợi - bấm là chọn ngay, không cần trượt */}
              <div className="flex flex-wrap gap-2">
                {PRESET_SPENDS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setMonthlySpend(p.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                      monthlySpend === p.value
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs scale-105"
                        : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Slider tuỳ chỉnh chi tiết */}
              <div className="pt-2 space-y-2">
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

            {/* Banner cam kết hoàn tiền cố định - Không ép thăng hạng */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black text-emerald-950 block mb-0.5">
                  Cam kết luôn hoàn {effectiveCustomerRate}% hoa hồng ròng cho mọi đơn hàng 🎀
                </span>
                <span className="text-emerald-800 font-medium">
                  Áp dụng ngay từ đơn đầu tiên cho tất cả khách hàng. Không phân cấp bậc, không ép doanh số.
                </span>
              </div>
            </div>
          </div>

          {/* Thẻ hiển thị kết quả cá nhân hóa (Phải) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#8A0B37] via-primary-600 to-rose-600 p-6 md:p-7 text-white shadow-cute-lg relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-primary-100 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" /> Kết quả thực nhận
                </span>
                <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1">
                  <Gift size={12} /> Hoàn {effectiveCustomerRate}% sau thuế
                </span>
              </div>

              <div>
                <div className="text-xs font-extrabold text-primary-100 mb-1">Tiền hoàn về ví mỗi tháng:</div>
                <div className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                  ~ {formatCurrency(monthlyCashback)}
                </div>
                <div className="text-[11px] font-semibold text-white/70 mt-1">
                  Tương đương ~ <strong className="text-amber-200 font-extrabold">{formatCurrency(yearlyCashback)}</strong> / năm
                </div>
              </div>

              {/* Bảng bóc tách công thức minh bạch chuẩn xác */}
              <div className="bg-white/15 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 space-y-2 text-xs">
                <div className="font-extrabold text-primary-100 flex items-center justify-between pb-1 border-b border-white/15">
                  <span>Minh bạch công thức tính:</span>
                  <span className="text-amber-200 font-black">Chuẩn 100%</span>
                </div>
                
                <div className="flex justify-between text-white/90">
                  <span>• Chi tiêu mua sắm:</span>
                  <span className="font-bold">{formatCurrency(monthlySpend)}</span>
                </div>

                <div className="flex justify-between text-white/90">
                  <span>• Sàn chi trả (~{Math.round(selectedCat.avgRate * 100)}%):</span>
                  <span className="font-bold">{formatCurrency(grossCommission)}</span>
                </div>

                <div className="flex justify-between text-white/70">
                  <span>• Thuế sàn trừ ({effectiveTaxRate}%):</span>
                  <span className="font-bold">- {formatCurrency(taxAmount)}</span>
                </div>

                <div className="flex justify-between text-amber-200 font-bold pt-1 border-t border-white/10">
                  <span>• Hoa hồng ròng sau thuế:</span>
                  <span>{formatCurrency(netCommission)}</span>
                </div>

                <div className="flex justify-between text-emerald-200 font-black text-[12.5px] pt-1 border-t border-white/10">
                  <span>• MeowBack chuyển ví bạn ({effectiveCustomerRate}%):</span>
                  <span>{formatCurrency(monthlyCashback)}</span>
                </div>
              </div>

              {/* Gợi ý cá nhân hóa */}
              <div className="bg-black/10 p-3 rounded-xl border border-white/10">
                <p className="text-[11.5px] font-bold text-white/90 leading-relaxed italic">
                  &ldquo;{getPersonalizedTip(monthlySpend, monthlyCashback, yearlyCashback)}&rdquo;
                </p>
              </div>
            </div>

            <div className="pt-5 relative z-10 space-y-2.5">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-[#8A0B37] font-black text-base shadow-lg hover:bg-rose-50 transition-all active:scale-[0.98] border border-rose-200"
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
      </div>
    </section>
  );
}
