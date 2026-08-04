import { CalendarDays, User, Award, Link2, Wallet, Gift } from "lucide-react";
import { formatDate } from "@/lib/format";
import Link from "next/link";

interface ProfileSummaryCardProps {
  customer: {
    fullName: string;
    email: string;
    createdAt: Date;
    isPartner: boolean;
  };
}

const QUICK_LINKS = [
  { href: "/app/refunds", icon: Link2, label: "Tạo link hoàn tiền", color: "text-primary-500 bg-primary-50 hover:bg-primary-100" },
  { href: "/app/wallet",  icon: Wallet, label: "Xem ví tiền",        color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
  { href: "/app/referral", icon: Gift, label: "Mời bạn bè",          color: "text-purple-500 bg-purple-50 hover:bg-purple-100" },
];

export function ProfileSummaryCard({ customer }: ProfileSummaryCardProps) {
  const initials = (customer.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-3xl border border-primary-100 shadow-sm relative overflow-hidden flex flex-col h-full">
      {/* Top gradient banner */}
      <div className="h-24 bg-gradient-to-br from-primary-200 via-primary-100 to-pink-50 relative shrink-0">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary-300/30" />
        <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-full bg-white/40" />
      </div>

      {/* Avatar — overlapping the banner */}
      <div className="flex flex-col items-center -mt-12 px-6 pb-5">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg ring-4 ring-white">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-black tracking-tighter">
              {initials || "🐱"}
            </div>
          </div>
          {customer.isPartner && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white" title="Đối tác MeowBack">
              <Award size={16} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Name & Email */}
        <h3 className="text-[19px] font-black text-neutral-900 tracking-tight text-center leading-tight">
          {customer.fullName || "Chưa cập nhật"}
        </h3>
        <p className="text-[13px] text-neutral-500 font-medium mt-0.5 mb-3 text-center">{customer.email}</p>

        {/* Role badge */}
        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-black shadow-sm mb-5 ${
          customer.isPartner
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
            : "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
        }`}>
          {customer.isPartner ? "⭐ ĐỐI TÁC" : "🎀 THÀNH VIÊN"}
        </div>

        {/* Info rows */}
        <div className="w-full border-t border-neutral-100 pt-4 flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <CalendarDays size={13} /> Tham gia
            </span>
            <span className="font-bold text-neutral-800">{formatDate(customer.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <User size={13} /> Trạng thái
            </span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[12px]">
              Hoạt động
            </span>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="w-full border-t border-neutral-100 pt-4 flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-1">Truy cập nhanh</p>
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${link.color}`}
              >
                <Icon size={15} strokeWidth={2.2} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
