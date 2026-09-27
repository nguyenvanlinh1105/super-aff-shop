import { ShieldCheck, Gift, PiggyBank, Wallet, Store, type LucideIcon } from "lucide-react";

const BADGES: { icon: LucideIcon; label: string; color: string }[] = [
  { icon: ShieldCheck, label: "Bảo mật 100%", color: "text-emerald-600" },
  { icon: Gift, label: "Nhận 5% hoa hồng giới thiệu", color: "text-primary-600" },
  { icon: PiggyBank, label: "Hoàn tiền tự động", color: "text-primary-600" },
  { icon: Wallet, label: "Rút tiền từ 10K", color: "text-emerald-600" },
  { icon: Store, label: "Hỗ trợ Shopee, Lazada & TikTok", color: "text-primary-600" },
];

export function TrustBadgesCard({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-[11px] font-black uppercase tracking-widest text-primary-600">
        Vì sao chọn chúng tôi
      </div>
      <p className="mt-1 text-[16px] font-black text-neutral-950">
        Mua Hàng Tích Nơ — <span className="text-primary-600">Hoàn Tiền Thật 🎀</span>
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {BADGES.map(({ icon: Icon, label, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-neutral-800 border border-primary-200/90 shadow-sm"
          >
            <Icon size={14} className={color} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

