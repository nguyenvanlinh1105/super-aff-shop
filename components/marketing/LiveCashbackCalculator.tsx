"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, HeartHandshake, CheckCircle2, ShoppingBag, Gift, Wallet, Coins, Info } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";

interface CategoryRateOption extends CustomSelectOption {
  avgRate: number;
  shortLabel: string;
}

const CATEGORY_OPTIONS: CategoryRateOption[] = [
  { value: "tech", label: "Điện Thoại & Phụ Kiện (sàn trả ~6%)", shortLabel: "Phụ kiện", icon: <span className="text-base">📱</span>, avgRate: 0.06 },
  { value: "fashion", label: "Thời Trang & Giày Dép (sàn trả ~12%)", shortLabel: "Thời trang", icon: <span className="text-base">👗</span>, avgRate: 0.12 },
  { value: "beauty", label: "Mỹ Phẩm & Skin Care (sàn trả ~10%)", shortLabel: "Mỹ phẩm", icon: <span className="text-base">💄</span>, avgRate: 0.10 },
  { value: "baby", label: "Mẹ & Bé (sàn trả ~8%)", shortLabel: "Mẹ & bé", icon: <span className="text-base">🍼</span>, avgRate: 0.08 },
  { value: "home", label: "Nhà Cửa & Đời Sống (sàn trả ~7%)", shortLabel: "Nhà cửa", icon: <span className="text-base">🏡</span>, avgRate: 0.07 },
  { value: "grocery", label: "Bách Hóa Online (sàn trả ~5%)", shortLabel: "Bách hóa", icon: <span className="text-base">🛒</span>, avgRate: 0.05 },
];

const PRESET_SPENDS = [
  { label: "1.5 Triệu", value: 1500000 },
  { label: "3 Triệu", value: 3000000 },
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
  const [inputValue, setInputValue] = useState<string>("3.500.000");
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string>("fashion");
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
  const netCommission = Math.max(0, grossCommission - taxAmount);
  
  // 4. MeowBack hoàn lại cho khách hàng theo tỷ lệ (mặc định 80%)
  const monthlyCashback = Math.round(netCommission * (effectiveCustomerRate / 100));
  
  // 5. Tích lũy 1 năm (12 tháng)
  const yearlyCashback = monthlyCashback * 12;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  // Validate nhập liệu: Chỉ chấp nhận số, format hiển thị có dấu chấm
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, ""); // Xóa toàn bộ ký tự không phải số
    
    if (!raw) {
      setInputValue("");
      setMonthlySpend(0);
      setInputError("Nhập số tiền mua sắm để Meow tính cho bạn nha 🐾");
      return;
    }

    const val = Number(raw);
    if (val > 100000000) {
      setInputError("Số tiền tối đa Meow tính là 100.000.000 ₫ nha 🐾");
      setMonthlySpend(100000000);
      setInputValue((100000000).toLocaleString("vi-VN"));
      return;
    }

    setInputError(null);
    setMonthlySpend(val);
    setInputValue(val.toLocaleString("vi-VN"));
  }

  // Chặn gõ chữ ngay từ bàn phím
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setInputError("Meow chỉ hiểu số thôi nha bạn ơi 🐾");
      setTimeout(() => setInputError(null), 2500);
    }
  }

  function handleSelectPreset(val: number) {
    setMonthlySpend(val);
    setInputValue(val.toLocaleString("vi-VN"));
    setInputError(null);
  }

  return (
    <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-16 md:pt-14 md:pb-20 bg-gradient-to-b from-white via-[#FFF5F8] to-white overflow-hidden">
      {/* Background ambient glow dễ thương */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-pink-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-amber-100/40 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-3.5 sm:px-5 md:px-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 mb-7 sm:mb-9 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 text-[#C4245B] px-4 py-1.5 rounded-full text-xs font-black shadow-xs border border-pink-200">
            <Sparkles size={14} className="text-[#FF4D85]" />
            <span>Heo Đất Thông Minh • Cùng Meow Tính Tiền Hoàn 🎀</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Bạn thường mua sắm{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D85] via-[#E02868] to-[#FF6B97]">
              bao nhiêu mỗi tháng?
            </span>
          </h2>

          <p className="text-neutral-600 font-semibold max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-1">
            Chọn ngành hàng &amp; nhập số tiền chi tiêu dự tính — MeowBack tính ngay số tiền bạn đút heo về ví với cam kết{" "}
            <strong className="text-[#E02868] font-black">{effectiveCustomerRate}% hoa hồng ròng</strong>.
          </p>
        </div>

        {/* Unified Calculator Card - Dễ thương, pastel, mềm mại */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch rounded-3xl sm:rounded-[36px] bg-white/95 p-5 sm:p-8 md:p-10 shadow-[0_16px_50px_rgba(255,109,158,0.12)] border-2 border-pink-100/90 backdrop-blur-xl relative">
          
          {/* Cột trái: Nhập liệu đơn giản & Chọn ngành hàng */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              
              {/* Bước 1: Chọn ngành hàng */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-[#E02868] text-xs font-black shadow-2xs">
                      1
                    </span>
                    <span>Ngành hàng bạn hay mua sắm</span>
                  </label>
                  <span className="text-[11px] sm:text-xs font-black text-[#E02868] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/70 flex items-center gap-1">
                    <span>Sàn trả thưởng</span>
                    <strong className="text-pink-600">~{(selectedCat.avgRate * 100).toFixed(0)}%</strong>
                  </span>
                </div>

                {/* Dropdown danh mục */}
                <CustomSelect
                  value={selectedCatId}
                  onChange={(val) => setSelectedCatId(val)}
                  options={CATEGORY_OPTIONS}
                  className="w-full"
                  buttonClassName="h-12 sm:h-13 text-sm sm:text-base font-extrabold rounded-2xl border-pink-200/90 bg-[#FFFDFE] shadow-2xs px-4 hover:border-pink-300 transition-all"
                  ariaLabel="Chọn ngành hàng mua sắm"
                />

                {/* Phím tắt nhanh các ngành hàng phổ biến */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-neutral-400 mr-1 flex items-center gap-1">
                    Gợi ý:
                  </span>
                  {CATEGORY_OPTIONS.slice(0, 4).map((cat) => {
                    const isSelected = selectedCatId === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCatId(cat.value)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#FFF0F5] text-[#E02868] border border-pink-300 shadow-xs scale-102 font-black"
                            : "bg-neutral-50 text-neutral-600 border border-neutral-200/60 hover:bg-pink-50/50 hover:text-neutral-900"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bước 2: Nhập số tiền mua sắm (Đơn giản, không có progress bar) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-[#E02868] text-xs font-black shadow-2xs">
                      2
                    </span>
                    <span>Mức chi tiêu trung bình / tháng</span>
                  </label>
                  <span className="text-sm sm:text-base font-black text-[#E02868] tabular-nums bg-pink-50/80 px-2.5 py-0.5 rounded-lg border border-pink-100">
                    {formatCurrency(monthlySpend)}
                  </span>
                </div>

                {/* Ô nhập tiền trực tiếp: Chặn nhập chữ, định dạng có chấm */}
                <div className="relative">
                  <div className="relative flex items-center rounded-2xl border-2 border-pink-200/90 bg-[#FFFDFE] focus-within:border-[#FF4D85] focus-within:ring-4 focus-within:ring-pink-100 transition-all shadow-2xs">
                    <div className="pl-4 pr-2 text-[#E02868] font-black text-lg pointer-events-none select-none">
                      ₫
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập số tiền (VD: 3.500.000)..."
                      className="w-full h-12 sm:h-14 pr-16 bg-transparent text-base sm:text-lg font-black text-neutral-900 placeholder:text-neutral-300 placeholder:font-semibold focus:outline-none tabular-nums"
                    />
                    <div className="absolute right-3.5 px-2 py-1 rounded-lg bg-pink-100/70 text-[#C4245B] text-xs font-black pointer-events-none select-none">
                      VND
                    </div>
                  </div>

                  {/* Thông báo lỗi hoặc gợi ý dễ thương */}
                  {inputError ? (
                    <p className="text-xs font-bold text-rose-500 mt-1.5 flex items-center gap-1 animate-pulse">
                      <span>⚠️</span>
                      <span>{inputError}</span>
                    </p>
                  ) : (
                    <p className="text-[11.5px] font-semibold text-neutral-400 mt-1.5">
                      💡 Bạn có thể tự gõ số hoặc bấm chọn nhanh các mốc bên dưới:
                    </p>
                  )}
                </div>

                {/* Nút bấm chọn nhanh mức chi tiêu */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {PRESET_SPENDS.map((p) => {
                    const isSelected = monthlySpend === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleSelectPreset(p.value)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? "bg-gradient-to-r from-[#FF528A] to-[#E02868] text-white shadow-cute scale-105"
                            : "bg-pink-50/70 text-neutral-700 hover:bg-pink-100 hover:text-[#E02868] border border-pink-200/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cam kết dễ thương ở chân cột */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-pink-100 text-xs font-bold text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Giữ nguyên voucher &amp; freeship sàn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>Rút về mọi ngân hàng từ 10.000₫</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ kết quả đút heo - Thiết kế xinh xắn, tươi tắn, không khô khan */}
          <div className="lg:col-span-5 rounded-[28px] bg-gradient-to-br from-[#FF6B97] via-[#FF4D85] to-[#E02868] p-6 sm:p-7 text-white shadow-[0_14px_40px_rgba(224,40,104,0.35)] relative overflow-hidden flex flex-col justify-between space-y-5">
            
            {/* Hình mờ trang trí dễ thương */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-4 top-4 text-4xl opacity-15 select-none pointer-events-none">
              🐾
            </div>

            {/* Header thẻ kết quả */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3 relative z-10">
              <span className="text-xs font-black uppercase tracking-wider text-pink-100 flex items-center gap-1.5">
                <Coins size={15} className="text-amber-300" /> Heo Đất MeowBack
              </span>
              <span className="bg-white/25 text-white text-[11px] font-black px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-xs">
                Hoàn {effectiveCustomerRate}% hoa hồng 🎀
              </span>
            </div>

            {/* Con số tiết kiệm nổi bật */}
            <div className="space-y-1.5 relative z-10">
              <div className="text-xs font-bold text-pink-100 flex items-center gap-1">
                <Wallet size={14} className="text-amber-200" />
                <span>Mỗi tháng tiền hoàn về ví bạn:</span>
              </div>
              
              <div className="text-3xl sm:text-4xl md:text-[38px] font-black tracking-tight text-white leading-tight drop-shadow-sm">
                ~ {formatCurrency(monthlyCashback)}
              </div>

              {/* Tích lũy 1 năm */}
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-amber-200 border border-white/20 mt-1">
                <span>✨ Cả năm để dành:</span>
                <strong className="text-white">~ {formatCurrency(yearlyCashback)}</strong>
              </div>
              <p className="text-[11px] font-semibold text-pink-100/90 pt-1">
                🍰 Đủ rinh thêm 3-4 bộ đồ mới hoặc trà sữa xả láng cả năm luôn nha! 🐾
              </p>
            </div>

            {/* Bảng tóm tắt kết quả dễ hiểu - Không công thức thuế rối mắt */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/25 space-y-2.5 text-xs font-bold relative z-10">
              <div className="flex items-center justify-between text-white/95">
                <span className="flex items-center gap-1.5 font-semibold text-white/80">
                  <ShoppingBag size={13} className="text-pink-200" /> Chi tiêu dự tính:
                </span>
                <span className="tabular-nums font-black">{formatCurrency(monthlySpend)}</span>
              </div>

              <div className="flex items-center justify-between text-white/95">
                <span className="flex items-center gap-1.5 font-semibold text-white/80">
                  <Gift size={13} className="text-amber-300" /> Hoa hồng sàn thưởng (~{(selectedCat.avgRate * 100).toFixed(0)}%):
                </span>
                <span className="tabular-nums font-black text-amber-200">+{formatCurrency(grossCommission)}</span>
              </div>

              <div className="border-t border-white/20 pt-2 flex items-center justify-between text-white">
                <span className="flex items-center gap-1.5 font-black text-white">
                  <span>💖</span> Bạn thực nhận (80%):
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums drop-shadow-xs">
                  {formatCurrency(monthlyCashback)}
                </span>
              </div>
            </div>

            {/* Dòng ghi chú minh bạch nhẹ nhàng */}
            <div className="flex items-start gap-1.5 text-[10.5px] font-semibold text-pink-100/80 leading-snug px-0.5">
              <Info size={12} className="shrink-0 mt-0.5 text-pink-200" />
              <span>
                MeowBack tự động khấu trừ thuế sàn ({effectiveTaxRate}%) minh bạch — số tiền hiển thị là tiền tươi vào ví rút được ngay!
              </span>
            </div>

            {/* Nút đăng ký nhận tiền đáng yêu */}
            <div className="pt-1 relative z-10">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white text-[#E02868] hover:bg-rose-50 font-black text-sm sm:text-base shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all active:scale-95 group"
              >
                <span>Đăng ký nhận tiền hoàn ngay 🐾</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
