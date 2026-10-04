"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2, DollarSign } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";

interface CategoryRateOption extends CustomSelectOption {
  avgRate: number;
}

const CATEGORY_OPTIONS: CategoryRateOption[] = [
  { value: "tech", label: "Điện Thoại & Phụ Kiện (sàn trả ~6%)", icon: <span className="text-base">📱</span>, avgRate: 0.06 },
  { value: "fashion", label: "Thời Trang & Giày Dép (sàn trả ~12%)", icon: <span className="text-base">👗</span>, avgRate: 0.12 },
  { value: "beauty", label: "Mỹ Phẩm & Skin Care (sàn trả ~10%)", icon: <span className="text-base">💄</span>, avgRate: 0.10 },
  { value: "baby", label: "Mẹ & Bé (sàn trả ~8%)", icon: <span className="text-base">🍼</span>, avgRate: 0.08 },
  { value: "home", label: "Nhà Cửa & Đời Sống (sàn trả ~7%)", icon: <span className="text-base">🏡</span>, avgRate: 0.07 },
  { value: "grocery", label: "Bách Hóa Online (sàn trả ~5%)", icon: <span className="text-base">🛒</span>, avgRate: 0.05 },
];

const PRESET_SPENDS = [
  { label: "1.5 Triệu", value: 1500000 },
  { label: "3.5 Triệu", value: 3500000 },
  { label: "5 Triệu", value: 5000000 },
  { label: "10 Triệu", value: 10000000 },
  { label: "20 Triệu", value: 20000000 },
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
  const [effectiveCustomerRate, setEffectiveCustomerRate] = useState<number>(customerRate);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number>(taxRate);

  // Tự động đồng bộ với cấu hình admin mới nhất
  useEffect(() => {
    fetch("/api/settings/commission-rule")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customerRate != null) setEffectiveCustomerRate(Number(data.customerRate));
        if (data?.taxRate != null) setEffectiveTaxRate(Number(data.taxRate));
      })
      .catch(() => {});
  }, []);

  const selectedCat = CATEGORY_OPTIONS.find((c) => c.value === selectedCatId) || CATEGORY_OPTIONS[0];

  // 1. Hoa hồng sàn chi trả (Gross Commission)
  const grossCommission = Math.round(monthlySpend * selectedCat.avgRate);
  
  // 2. Khấu trừ thuế TNCN & VAT tại sàn (10.98%)
  const taxAmount = Math.round(grossCommission * (effectiveTaxRate / 100));
  
  // 3. Hoa hồng ròng sau thuế
  const netCommission = grossCommission - taxAmount;
  
  // 4. MeowBack hoàn lại cho khách hàng theo tỷ lệ (mặc định 80%)
  const monthlyCashback = Math.round(netCommission * (effectiveCustomerRate / 100));
  
  // 5. Tích lũy 1 năm (12 tháng)
  const yearlyCashback = monthlyCashback * 12;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const val = Number(raw) || 0;
    setMonthlySpend(Math.min(val, 100000000));
  }

  return (
    <section className="relative pt-8 pb-10 sm:pt-10 sm:pb-14 md:pt-14 md:pb-16 bg-gradient-to-b from-white via-primary-50/20 to-white overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary-200/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container: Strictly matches MarketingHeader width (max-w-[1200px] px-3.5 sm:px-5 md:px-10) */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-3.5 sm:px-5 md:px-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100/90 text-[#8A0B37] px-3.5 py-1 rounded-full text-xs font-black shadow-2xs border border-primary-200">
            <HeartHandshake size={14} className="text-primary-600" />
            <span>Góc tính tiền hoàn thực tế của bạn 🎀</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Mỗi tháng bạn thường{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-[#FF3B7B] to-rose-600">
              mua sắm bao nhiêu tiền?
            </span>
          </h2>

          <p className="text-neutral-600 font-semibold max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-1">
            Chọn ngành hàng và nhập mức chi tiêu bên dưới — MeowBack tự động tính số tiền hoàn thực nhận về ví với tỷ lệ cam kết{" "}
            <strong className="text-primary-600 font-black">{effectiveCustomerRate}% hoa hồng ròng</strong>.
          </p>
        </div>

        {/* Unified Calculator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch rounded-3xl bg-white/95 p-4 sm:p-7 md:p-9 shadow-cute-lg border border-primary-200/80 backdrop-blur-xl">
          {/* Left Column: Custom Selection & Price Input */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5 sm:space-y-6">
            {/* Step 1: Custom Selection Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] sm:text-[14px] font-black uppercase tracking-wide text-neutral-800 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-black">1</span>
                  <span>Ngành hàng bạn hay mua sắm</span>
                </label>
                <span className="text-[11px] sm:text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                  ~{(selectedCat.avgRate * 100).toFixed(0)}% sàn trả
                </span>
              </div>

              {/* Custom Selection */}
              <CustomSelect
                value={selectedCatId}
                onChange={(val) => setSelectedCatId(val)}
                options={CATEGORY_OPTIONS}
                className="w-full"
                buttonClassName="h-11 sm:h-12 text-[13px] sm:text-[14px] font-bold rounded-2xl border-primary-200 shadow-2xs px-3.5 sm:px-4"
                ariaLabel="Chọn ngành hàng mua sắm"
              />
            </div>

            {/* Step 2: Price Input & Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] sm:text-[14px] font-black uppercase tracking-wide text-neutral-800 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-black">2</span>
                  <span>Mức chi tiêu trung bình / tháng</span>
                </label>
                <span className="text-[14px] sm:text-[17px] font-black text-primary-600 tabular-nums">
                  {formatCurrency(monthlySpend)}
                </span>
              </div>

              {/* Direct Numeric Input with Currency Affix */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={monthlySpend > 0 ? monthlySpend.toLocaleString("vi-VN") : ""}
                  onChange={handleInputChange}
                  placeholder="Nhập số tiền mua sắm (VD: 3.500.000)..."
                  className="w-full h-11 sm:h-12 pl-10 pr-12 rounded-2xl bg-white border border-primary-200 text-sm sm:text-base font-extrabold text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all tabular-nums"
                />
                <span className="absolute left-3.5 text-primary-400 font-extrabold text-sm pointer-events-none">
                  ₫
                </span>
                <span className="absolute right-3.5 text-neutral-400 text-xs font-bold pointer-events-none">
                  VND
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {PRESET_SPENDS.map((p) => {
                  const isSelected = monthlySpend === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setMonthlySpend(p.value)}
                      className={`px-3 py-1.5 rounded-xl text-[11.5px] sm:text-xs font-extrabold transition-all cursor-pointer select-none ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs scale-105"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Range Slider for fine control */}
              <div className="pt-2">
                <input
                  type="range"
                  min={500000}
                  max={20000000}
                  step={500000}
                  value={Math.min(Math.max(monthlySpend, 500000), 20000000)}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-[10px] font-bold text-neutral-400 pt-1">
                  <span>500K</span>
                  <span>5 Triệu</span>
                  <span>10 Triệu</span>
                  <span>20 Triệu</span>
                </div>
              </div>
            </div>

            {/* Trust commitments */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary-100/70 text-[11px] font-bold text-neutral-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Giữ nguyên mã giảm, freeship</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Rút từ 10.000đ miễn phí</span>
              </div>
            </div>
          </div>

          {/* Right Column: Result Card */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#8A0B37] via-primary-600 to-rose-600 p-5 sm:p-7 text-white shadow-cute border border-primary-300/40 relative overflow-hidden flex flex-col justify-between space-y-4">
            {/* Top result badge */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-primary-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-300" /> Kết quả thực nhận
              </span>
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md">
                Hoàn {effectiveCustomerRate}% sau thuế
              </span>
            </div>

            {/* Highlight Number */}
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-primary-100">Tiền hoàn về ví mỗi tháng:</div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                ~ {formatCurrency(monthlyCashback)}
              </div>
              <div className="text-xs font-bold text-amber-200">
                Tương đương <strong>~ {formatCurrency(yearlyCashback)}</strong> / năm
              </div>
            </div>

            {/* Transparent formula breakdown */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-white/90">
                <span>• Chi tiêu mua sắm:</span>
                <span className="font-bold tabular-nums">{formatCurrency(monthlySpend)}</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>• Sàn chi trả (~{(selectedCat.avgRate * 100).toFixed(0)}%):</span>
                <span className="font-bold tabular-nums">{formatCurrency(grossCommission)}</span>
              </div>
              <div className="flex justify-between text-white/80 text-[11px]">
                <span>• Thuế sàn trừ ({effectiveTaxRate}%):</span>
                <span className="tabular-nums">- {formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t border-white/20 pt-1.5 flex justify-between text-amber-200 font-bold">
                <span>• Hoa hồng ròng sau thuế:</span>
                <span className="tabular-nums">{formatCurrency(netCommission)}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-black">
                <span>• MeowBack chuyển ví bạn ({effectiveCustomerRate}%):</span>
                <span className="tabular-nums">{formatCurrency(monthlyCashback)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-1.5 py-3 sm:py-3.5 px-4 rounded-2xl bg-white text-[#8A0B37] hover:bg-rose-50 font-black text-sm shadow-md transition-all active:scale-98"
              >
                <span>Đăng ký nhận tiền hoàn ngay 🎀</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
