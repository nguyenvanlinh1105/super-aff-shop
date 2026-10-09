"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Users,
  Building2,
  Gift,
  ShoppingBag,
  Calendar,
  Save,
  Info,
  Handshake,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function cleanNumberInput(raw: string): string {
  if (raw === "") return "";
  if (raw === "0" || raw.startsWith("0.")) return raw;
  return raw.replace(/^0+(?=\d)/, "");
}

export function CommissionRuleForm({
  taxRate = 10.98,
  customerRate = 80,
  systemRate = 20,
  referralRate = 10,
  maxReferralOrders = 5,
  referralValidityMonths = 6,
}: {
  taxRate?: number;
  customerRate: number;
  systemRate: number;
  referralRate?: number;
  maxReferralOrders?: number;
  referralValidityMonths?: number;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [tax, setTax] = useState<number | string>(taxRate);
  const [customer, setCustomer] = useState<number | string>(customerRate);
  const [system, setSystem] = useState<number | string>(systemRate);
  const [referral, setReferral] = useState<number | string>(referralRate);
  const [maxOrders, setMaxOrders] = useState<number | string>(maxReferralOrders);
  const [validMonths, setValidMonths] = useState<number | string>(referralValidityMonths);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-balance customer & system to keep total = 100%
  const handleCustomerChange = (raw: string) => {
    const clean = cleanNumberInput(raw);
    setCustomer(clean);

    if (clean === "") return;

    const val = Number(clean);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setSystem(Math.round((100 - val) * 100) / 100);
    }
  };

  const handleCustomerBlur = () => {
    if (customer === "" || isNaN(Number(customer))) {
      const sysNum = Number(system) || 0;
      setCustomer(Math.max(0, Math.min(100, Math.round((100 - sysNum) * 100) / 100)));
    }
  };

  const handleSystemChange = (raw: string) => {
    const clean = cleanNumberInput(raw);
    setSystem(clean);

    if (clean === "") return;

    const val = Number(clean);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setCustomer(Math.round((100 - val) * 100) / 100);
    }
  };

  const handleSystemBlur = () => {
    if (system === "" || isNaN(Number(system))) {
      const custNum = Number(customer) || 0;
      setSystem(Math.max(0, Math.min(100, Math.round((100 - custNum) * 100) / 100)));
    }
  };

  const handleTaxChange = (raw: string) => {
    setTax(cleanNumberInput(raw));
  };

  const handleTaxBlur = () => {
    if (tax === "" || isNaN(Number(tax))) {
      setTax(taxRate);
    }
  };

  const handleReferralChange = (raw: string) => {
    setReferral(cleanNumberInput(raw));
  };

  const handleReferralBlur = () => {
    if (referral === "" || isNaN(Number(referral))) {
      setReferral(referralRate);
    }
  };

  const handleMaxOrdersChange = (raw: string) => {
    setMaxOrders(cleanNumberInput(raw));
  };

  const handleMaxOrdersBlur = () => {
    if (maxOrders === "" || isNaN(Number(maxOrders)) || Number(maxOrders) <= 0) {
      setMaxOrders(maxReferralOrders);
    }
  };

  const handleValidMonthsChange = (raw: string) => {
    setValidMonths(cleanNumberInput(raw));
  };

  const handleValidMonthsBlur = () => {
    if (validMonths === "" || isNaN(Number(validMonths)) || Number(validMonths) <= 0) {
      setValidMonths(referralValidityMonths);
    }
  };

  const applyPresetSplit = (cust: number, sys: number) => {
    setCustomer(cust);
    setSystem(sys);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numTax = Number(tax) || 0;
    const numCust = Number(customer) || 0;
    const numSys = Number(system) || 0;
    const numRef = Number(referral) || 0;
    const numOrders = Number(maxOrders) || 5;
    const numMonths = Number(validMonths) || 6;

    const total = Math.round((numCust + numSys) * 100) / 100;
    if (total !== 100) {
      setError(`Tổng tỷ lệ khách nhận (${numCust}%) và hệ thống giữ (${numSys}%) phải bằng đúng 100% (Hiện tại: ${total}%).`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/commission-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxRate: numTax,
          customerRate: numCust,
          systemRate: numSys,
          referralRate: numRef / 100,
          maxReferralOrders: numOrders,
          referralValidityMonths: numMonths,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Không thể lưu cấu hình tỷ lệ hoa hồng");
      }

      toast.success("Đã cập nhật tỷ lệ chia sẻ hoa hồng thành công! ✨");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không lưu được");
      toast.error(err.message || "Lỗi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  }

  const numCust = Number(customer) || 0;
  const numSys = Number(system) || 0;
  const isTotal100 = Math.round((numCust + numSys) * 100) / 100 === 100;
  const netSystemRetained = (numSys - (Number(referral) || 0)).toFixed(2).replace(/\.00$/, "");

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {/* ─── 1. THUẾ THU NHẬP KHẤU TRỪ (TNCN) ─── */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 border-2 border-amber-200/90 p-4 sm:p-5 flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
            <Receipt size={17} className="text-amber-600 shrink-0" />
            <span>Thuế Thu Nhập Khấu Trừ (TNCN)</span>
          </label>
          <span className="text-[11px] font-black text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-lg border border-amber-300">
            Khấu trừ trước khi chia hoa hồng
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-48">
            <input
              type="number"
              value={tax}
              onChange={(e) => handleTaxChange(e.target.value)}
              onBlur={handleTaxBlur}
              step="0.01"
              min="0"
              max="99.99"
              required
              className="h-12 w-full rounded-2xl border-2 border-amber-300 bg-white px-4 pr-9 text-base sm:text-lg font-black text-amber-950 shadow-2xs focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-amber-600 pointer-events-none">
              %
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[10.98, 10, 5, 0].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTax(t)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tax === t
                    ? "bg-amber-600 text-white shadow-xs ring-2 ring-amber-300"
                    : "bg-white text-amber-900 border border-amber-300/80 hover:bg-amber-100/70"
                }`}
              >
                {t === 10.98 ? "Chuẩn: 10.98%" : `${t}%`}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-amber-900/90 leading-relaxed font-medium">
          Đây là thuế TNCN hệ thống tự khấu trừ hộ khách trên hoa hồng nhận từ Shopee/TikTok trước khi chia — không phải khoản Shopee/TikTok tự trừ. Số tiền trả khách được tính trên phần hoa hồng đã trừ thuế này, không phải trên hoa hồng ghi nhận ban đầu.
        </p>
      </div>

      {/* ─── 2. TỶ LỆ CHIA SẺ GIỮA KHÁCH HÀNG & HỆ THỐNG ─── */}
      <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/80 p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Percent size={16} className="text-rose-500 shrink-0" />
            <span>Phân Bổ Hoa Hồng (Tổng = 100%)</span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { cust: 80, sys: 20, label: "80 / 20 (Mặc định)" },
              { cust: 85, sys: 15, label: "85 / 15" },
              { cust: 75, sys: 25, label: "75 / 25" },
              { cust: 70, sys: 30, label: "70 / 30" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPresetSplit(preset.cust, preset.sys)}
                className={`min-h-[34px] px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  customer === preset.cust && system === preset.sys
                    ? "bg-rose-500 text-white shadow-xs ring-2 ring-rose-200"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:border-rose-300 hover:bg-rose-50/50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Visual Ratio Bar */}
        <div className="rounded-2xl bg-white border border-neutral-200/80 p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-black">
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Khách nhận: <b className="text-sm">{customer}%</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Hệ thống giữ: <b className="text-sm">{system}%</b></span>
            </div>
          </div>
          <div className="h-4 w-full rounded-full bg-neutral-100 overflow-hidden flex shadow-inner border border-neutral-200/60 p-0.5">
            <div
              style={{ width: `${Math.min(100, Math.max(0, numCust))}%` }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
            />
            <div
              style={{ width: `${Math.min(100, Math.max(0, numSys))}%` }}
              className="bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-300 ml-0.5"
            />
          </div>
          {!isTotal100 && (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle size={13} />
              <span>Tổng tỷ lệ hiện là {Math.round((numCust + numSys) * 100) / 100}%. Vui lòng điều chỉnh để tổng đúng 100%.</span>
            </p>
          )}
        </div>

        {/* 2 Input Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card Khách nhận */}
          <div className="rounded-2xl bg-white border-2 border-rose-100 p-4 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Users size={16} strokeWidth={2.4} />
              </div>
              <span className="text-xs sm:text-[13px] font-black text-neutral-900">
                Tỷ lệ khách hàng nhận (%)
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                value={customer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                onBlur={handleCustomerBlur}
                min="0"
                max="100"
                required
                className="h-12 w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 pr-9 text-lg font-black text-neutral-900 shadow-2xs focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400 pointer-events-none">
                %
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">
              Số tiền hoàn được cộng trực tiếp vào số dư ví của khách.
            </span>
          </div>

          {/* Card Hệ thống giữ */}
          <div className="rounded-2xl bg-white border-2 border-indigo-100 p-4 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 size={16} strokeWidth={2.4} />
              </div>
              <span className="text-xs sm:text-[13px] font-black text-neutral-900">
                Tỷ lệ hệ thống giữ (%)
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                value={system}
                onChange={(e) => handleSystemChange(e.target.value)}
                onBlur={handleSystemBlur}
                min="0"
                max="100"
                required
                className="h-12 w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 pr-9 text-lg font-black text-neutral-900 shadow-2xs focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400 pointer-events-none">
                %
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">
              Doanh thu hệ thống dùng để chi trả Referral &amp; vận hành.
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. CẤU HÌNH HOA HỒNG GIỚI THIỆU (REFERRAL F1) ─── */}
      <div className="rounded-2xl bg-neutral-50/70 border border-neutral-200/80 p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-200/70">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Gift size={16} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-xs sm:text-[13.5px] font-black text-neutral-900 tracking-tight">
              Cấu Hình Hoa Hồng Giới Thiệu (Referral F1)
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Chính sách thưởng hoa hồng cho người giới thiệu bạn bè tham gia mua sắm.
            </p>
          </div>
        </div>

        {/* 3 Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tỷ lệ chia */}
          <div className="rounded-2xl bg-white border border-neutral-200/80 p-3.5 flex flex-col gap-1.5 shadow-2xs">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Percent size={14} className="text-amber-500" />
              <span>Tỷ lệ chia (%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={referral}
                onChange={(e) => handleReferralChange(e.target.value)}
                onBlur={handleReferralBlur}
                step="0.1"
                min="0"
                max="100"
                required
                className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 pr-8 text-sm font-black text-neutral-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                %
              </span>
            </div>
            <span className="text-[10.5px] text-neutral-400">Trích từ phần hệ thống</span>
          </div>

          {/* Giới hạn số đơn */}
          <div className="rounded-2xl bg-white border border-neutral-200/80 p-3.5 flex flex-col gap-1.5 shadow-2xs">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-rose-500" />
              <span>Giới hạn số đơn (Max)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={maxOrders}
                onChange={(e) => handleMaxOrdersChange(e.target.value)}
                onBlur={handleMaxOrdersBlur}
                min="1"
                max="999"
                required
                className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 pr-12 text-sm font-black text-neutral-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 pointer-events-none">
                đơn
              </span>
            </div>
            <span className="text-[10.5px] text-neutral-400">Áp dụng cho mỗi F1</span>
          </div>

          {/* Thời hạn áp dụng */}
          <div className="rounded-2xl bg-white border border-neutral-200/80 p-3.5 flex flex-col gap-1.5 shadow-2xs">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Calendar size={14} className="text-sky-500" />
              <span>Thời hạn áp dụng</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={validMonths}
                onChange={(e) => handleValidMonthsChange(e.target.value)}
                onBlur={handleValidMonthsBlur}
                min="1"
                max="60"
                required
                className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 pr-14 text-sm font-black text-neutral-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 pointer-events-none">
                tháng
              </span>
            </div>
            <span className="text-[10.5px] text-neutral-400">Kể từ khi F1 đăng ký</span>
          </div>
        </div>

        {/* Explain & Callout Box */}
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-[11.5px] text-neutral-600 leading-relaxed font-medium">
            Người giới thiệu (A) nhận <b>{referral}% hoa hồng</b> — <strong>trích từ phần hệ thống giữ lại</strong>, không đụng vào phần khách hàng (B) đã nhận — cho tối đa <b>{maxOrders} đơn hàng đầu tiên của mỗi người bạn</b> được duyệt trong vòng <b>{validMonths} tháng</b> kể từ khi người bạn đó (F1) đăng ký.
          </p>

          <div className="rounded-xl bg-sky-50/90 border border-sky-200/80 p-3 text-xs text-sky-950 flex items-start gap-2.5">
            <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <b>Ví dụ phân bổ thực tế:</b> Hệ thống giữ <b>{system}%</b> → sau khi trích <b>{referral}%</b> cho người giới thiệu, hệ thống thực giữ <b>{netSystemRetained}%</b>. Khách hàng mua (B) vẫn nhận trọn vẹn <b>{customer}%</b> như bình thường.
              {referral > system && (
                <span className="block mt-1 font-bold text-rose-600">
                  ⚠️ Tỷ lệ chia ({referral}%) đang lớn hơn phần hệ thống giữ ({system}%) — hệ thống sẽ bù lỗ phần chênh lệch cho mỗi đơn có giới thiệu!
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-3 text-xs text-emerald-950 flex items-start gap-2.5">
            <Handshake size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <b>Đặc quyền Đối tác (Partner):</b> Khách hàng được bật <i>Đối tác</i> (ở trang chi tiết từng khách hàng) <strong>không bị giới hạn</strong> {maxOrders} đơn hay {validMonths} tháng. Admin có thể cấu hình mức % riêng linh hoạt (3%, 5%, 7%, 10%...) theo từng khoảng thời gian (Từ ngày → Đến ngày) cho từng đối tác, bảo toàn lịch sử tính toán cũ. Nếu chưa cấu hình lịch riêng, sẽ tự động áp dụng tỷ lệ mặc định ({referral}%).
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-600 flex items-center gap-2 fade-in">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !isTotal100}
          className="h-12 px-7 text-sm font-black justify-center shadow-md shadow-rose-500/20 cursor-pointer"
        >
          <Save size={16} />
          <span>{loading ? "Đang lưu cấu hình..." : "Lưu cấu hình"}</span>
        </Button>
      </div>
    </form>
  );
}
