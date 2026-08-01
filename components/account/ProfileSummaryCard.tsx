import { User, ShieldCheck, CalendarDays, Award } from "lucide-react";
import { formatDate } from "@/lib/format";

interface ProfileSummaryCardProps {
  customer: {
    fullName: string;
    email: string;
    createdAt: Date;
    isPartner: boolean;
  };
}

export function ProfileSummaryCard({ customer }: ProfileSummaryCardProps) {
  // Extract initials for the avatar
  const initials = (customer.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-3xl p-6 border border-primary-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center h-full">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-100 to-primary-50 z-0" />
      
      {/* Avatar */}
      <div className="relative z-10 mb-4 mt-4">
        <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md mx-auto">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary flex items-center justify-center text-white text-3xl font-black tracking-tighter">
            {initials || "🐱"}
          </div>
        </div>
        {customer.isPartner && (
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white" title="Đối tác MeowBack">
            <Award size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <h3 className="text-[20px] font-black text-ink tracking-tight mb-1">
          {customer.fullName}
        </h3>
        <p className="text-[14px] text-mute font-medium mb-4">{customer.email}</p>

        {/* Rank Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[12px] font-bold shadow-sm shadow-primary/20 mb-6">
          <ShieldCheck size={14} strokeWidth={2.5} />
          {customer.isPartner ? "ĐỐI TÁC" : "THÀNH VIÊN"}
        </div>

        {/* Details */}
        <div className="w-full border-t border-neutral-100 pt-5 flex flex-col gap-3 text-left">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-mute font-medium flex items-center gap-1.5">
              <CalendarDays size={14} /> Tham gia
            </span>
            <span className="font-bold text-ink">{formatDate(customer.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-mute font-medium flex items-center gap-1.5">
              <User size={14} /> Trạng thái
            </span>
            <span className="font-bold text-positive bg-positive-bg px-2 py-0.5 rounded-md">Hoạt động</span>
          </div>
        </div>
      </div>
    </div>
  );
}
