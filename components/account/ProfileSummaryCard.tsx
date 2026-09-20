"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CalendarDays, 
  Award, 
  Link2, 
  Wallet, 
  Gift, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Building2,
  Mail
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { IconBow } from "@/components/icons/CatRibbonIcons";

interface ProfileSummaryCardProps {
  customer: {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    isPartner: boolean;
    hasPaymentPin?: boolean;
    hasBankInfo?: boolean;
    hasTelegram?: boolean;
    phone?: string | null;
  };
}

const QUICK_LINKS = [
  { 
    href: "/app/refunds", 
    icon: Link2, 
    label: "Tạo link hoàn tiền", 
    color: "text-primary-600 bg-primary-50/80 hover:bg-primary-100/80 border border-primary-200/60" 
  },
  { 
    href: "/app/wallet",  
    icon: Wallet, 
    label: "Xem ví & Rút tiền",        
    color: "text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60" 
  },
  { 
    href: "/app/referral", 
    icon: Gift, 
    label: "Mời bạn bè nhận quà",          
    color: "text-purple-600 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/60" 
  },
];

export function ProfileSummaryCard({ customer }: ProfileSummaryCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const memberCode = `MB-${customer.id.substring(0, 8).toUpperCase()}`;

  const initials = (customer.fullName || "User")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "🐱";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(memberCode);
      setCopied(true);
      toast.success(`Đã sao chép mã thành viên ${memberCode}! 🎀`, "Sao chép thành công");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép mã thành viên.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-primary-100/90 shadow-cute relative overflow-hidden flex flex-col h-fit">
      {/* ── Top Gradient Banner ── */}
      <div className="h-28 bg-gradient-to-r from-primary-400 via-pink-400 to-primary-500 relative shrink-0 overflow-hidden">
        {/* Decorative sparkles & circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/15 blur-xs" />
        <div className="absolute bottom-2 left-6 opacity-30 text-white">
          <IconBow className="w-12 h-12" />
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
              customer.isPartner
                ? "bg-amber-400/90 text-amber-950 border border-white/50"
                : "bg-white/90 text-primary-700 border border-white/60"
            }`}
          >
            {customer.isPartner ? "⭐ ĐỐI TÁC" : "🎀 THÀNH VIÊN"}
          </span>
        </div>
      </div>

      {/* ── Avatar Section ── */}
      <div className="flex flex-col items-center -mt-14 px-5 sm:px-6 pb-6">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-cute ring-4 ring-primary-100/60">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 via-pink-500 to-primary-600 flex items-center justify-center text-white text-2xl font-black tracking-tighter select-none">
              {initials}
            </div>
          </div>
          {customer.isPartner ? (
            <div 
              className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white"
              title="Đối tác MeowBack"
            >
              <Award size={16} strokeWidth={2.5} />
            </div>
          ) : (
            <div 
              className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border-2 border-white"
              title="Tài khoản đã kích hoạt"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* ── Name & Email ── */}
        <h3 className="text-[18px] sm:text-[19px] font-black text-neutral-900 tracking-tight text-center leading-snug">
          {customer.fullName || "Khách hàng MeowBack"}
        </h3>
        <p className="text-[13px] text-neutral-500 font-medium mt-0.5 mb-2.5 text-center truncate max-w-full">
          {customer.email}
        </p>

        {/* ── Member ID Chip ── */}
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 hover:bg-primary-50 text-neutral-600 hover:text-primary-600 text-[12px] font-bold transition-all border border-neutral-200/80 hover:border-primary-200 mb-5 cursor-pointer group"
          title="Bấm để sao chép mã thành viên"
        >
          <span>ID: <strong className="font-mono text-neutral-800 group-hover:text-primary-600">{memberCode}</strong></span>
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-neutral-400 group-hover:text-primary-500" />}
        </button>

        {/* ── Security & Completeness Checklist ── */}
        <div className="w-full bg-neutral-50/80 rounded-2xl p-3.5 border border-neutral-100 flex flex-col gap-2 mb-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 px-1">
            Trạng thái tài khoản
          </div>

          <div className="flex items-center justify-between text-[12px] px-1">
            <span className="text-neutral-600 font-medium flex items-center gap-1.5">
              <Mail size={13} className="text-neutral-400" /> Email
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              Đã xác thực <CheckCircle2 size={12} strokeWidth={2.5} />
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] px-1">
            <span className="text-neutral-600 font-medium flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-neutral-400" /> Mã PIN rút tiền
            </span>
            {customer.hasPaymentPin ? (
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                Đã bật <CheckCircle2 size={12} strokeWidth={2.5} />
              </span>
            ) : (
              <span className="font-bold text-amber-600 flex items-center gap-1">
                Chưa cài <AlertCircle size={12} strokeWidth={2.5} />
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[12px] px-1">
            <span className="text-neutral-600 font-medium flex items-center gap-1.5">
              <Building2 size={13} className="text-neutral-400" /> Ngân hàng
            </span>
            {customer.hasBankInfo ? (
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                Đã liên kết <CheckCircle2 size={12} strokeWidth={2.5} />
              </span>
            ) : (
              <span className="font-bold text-neutral-400">Chưa liên kết</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[12px] px-1">
            <span className="text-neutral-600 font-medium flex items-center gap-1.5">
              <Send size={13} className="text-neutral-400" /> Telegram Bot
            </span>
            {customer.hasTelegram ? (
              <span className="font-bold text-blue-600 flex items-center gap-1">
                Đã kết nối 📲
              </span>
            ) : (
              <span className="font-bold text-neutral-400">Chưa kết nối</span>
            )}
          </div>
        </div>

        {/* ── Info Rows: Join Date ── */}
        <div className="w-full border-t border-neutral-100 pt-3 flex flex-col gap-2.5 mb-5">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <CalendarDays size={13} /> Ngày tham gia
            </span>
            <span className="font-bold text-neutral-800">{formatDate(customer.createdAt)}</span>
          </div>
        </div>

        {/* ── Quick Action Shortcuts ── */}
        <div className="w-full border-t border-neutral-100 pt-3.5 flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400 px-1 mb-0.5">
            Lối tắt tiện ích
          </p>
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-extrabold transition-all shadow-2xs hover:scale-[1.01] active:scale-[0.99] ${link.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} strokeWidth={2.2} />
                  <span>{link.label}</span>
                </div>
                <span className="text-xs opacity-60">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
