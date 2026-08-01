"use client";

import { useState } from "react";
import { User, Phone, Mail, Loader2, MapPin } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

interface ProfileInfoFormProps {
  initialData: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
}

export function ProfileInfoForm({ initialData }: ProfileInfoFormProps) {
  const [fullName, setFullName] = useState(initialData.fullName);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [loading, setLoading] = useState(false);
  const modal = useModal();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      modal.alert({ title: "Lỗi", message: "Họ và tên không được để trống.", iconType: "danger" });
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (phone && !phoneRegex.test(phone)) {
      modal.alert({ title: "Lỗi", message: "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10 chữ số).", iconType: "danger" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        modal.alert({ title: "Thất bại", message: data.error || "Không thể cập nhật thông tin.", iconType: "danger" });
        return;
      }
      modal.alert({ title: "Thành công", message: "Thông tin cá nhân đã được cập nhật!", iconType: "success" });
    } catch (err) {
      modal.alert({ title: "Lỗi", message: "Đã xảy ra lỗi hệ thống.", iconType: "danger" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-lg w-full max-w-full lg:max-w-[700px]">
      <div className="flex flex-col sm:flex-row gap-lg">
        <div className="flex-1 flex flex-col gap-sm">
          <label className="text-[13px] font-bold text-ink">Họ và tên</label>
          <div className="relative">
            <User size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-sm">
          <label className="text-[13px] font-bold text-ink">Số điện thoại</label>
          <div className="relative">
            <Phone size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="h-14 w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Địa chỉ cụ thể</label>
        <div className="relative">
          <MapPin size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-[18px] text-mute" />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ của bạn..."
            className="min-h-[100px] w-full rounded-2xl border border-ink/10 bg-canvas-soft/60 pl-[52px] pr-lg py-[16px] text-[15px] font-medium text-ink placeholder:text-mute/70 transition-all focus:border-primary focus:bg-canvas focus:outline-none focus:ring-4 focus:ring-primary/15 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <label className="text-[13px] font-bold text-ink">Email (Chỉ đọc)</label>
        <div className="relative">
          <Mail size={18} strokeWidth={2} className="pointer-events-none absolute left-lg top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="email"
            value={initialData.email}
            readOnly
            className="h-14 w-full rounded-2xl border border-ink/10 bg-neutral-100/60 pl-[52px] pr-lg text-[15px] font-medium text-neutral-500 cursor-not-allowed select-none"
          />
        </div>
        <p className="text-[12px] text-mute font-medium mt-1">Lưu ý: Vui lòng sử dụng thông tin cá nhân chính xác để thuận tiện cho việc đối soát sau này. Email không thể thay đổi sau khi xác thực.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || (fullName === initialData.fullName && phone === (initialData.phone || "") && address === (initialData.address || ""))}
          className="h-12 w-fit px-8 rounded-xl bg-gradient-to-r from-primary to-primary-active text-[14px] font-bold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi hồ sơ"}
        </button>
      </div>
    </form>
  );
}
