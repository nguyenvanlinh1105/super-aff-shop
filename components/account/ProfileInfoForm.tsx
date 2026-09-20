"use client";

import { useState } from "react";
import { User, Phone, Mail, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ProfileInfoFormProps {
  initialData: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
}

export function ProfileInfoForm({ initialData }: ProfileInfoFormProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống.";
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (phone && !phoneRegex.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (bắt đầu bằng 0, gồm 10 chữ số).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể cập nhật thông tin.", "Cập nhật thất bại");
        return;
      }
      toast.success("Thông tin cá nhân đã được cập nhật thành công! 🎀", "Đã lưu hồ sơ");
    } catch {
      toast.error("Đã xảy ra lỗi kết nối tới máy chủ. Vui lòng thử lại sau.", "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 w-full max-w-full lg:max-w-[700px]">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[13px] font-bold text-neutral-900">Họ và tên</label>
          <div className="relative">
            <User size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="Nhập họ và tên"
              className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-4 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
                errors.fullName
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
              }`}
            />
          </div>
          {errors.fullName && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.fullName}</span>}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[13px] font-bold text-neutral-900">Số điện thoại</label>
          <div className="relative">
            <Phone size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="0901234567"
              className={`h-14 w-full rounded-2xl border bg-white pl-[52px] pr-4 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 ${
                errors.phone
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : "border-primary-100/90 focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-300"
              }`}
            />
          </div>
          {errors.phone && <span className="text-[12px] font-semibold text-rose-500 px-1">{errors.phone}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-neutral-900">Địa chỉ cụ thể</label>
        <div className="relative">
          <MapPin size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-[18px] text-neutral-400" />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ nhận hàng của bạn..."
            className="min-h-[100px] w-full rounded-2xl border border-primary-100/90 bg-white pl-[52px] pr-4 py-4 text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 hover:border-primary-300 resize-y"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-neutral-900">Email (Chỉ đọc)</label>
        <div className="relative">
          <Mail size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            value={initialData.email}
            readOnly
            className="h-14 w-full rounded-2xl border border-neutral-200 bg-neutral-100/70 pl-[52px] pr-4 text-[15px] font-medium text-neutral-500 cursor-not-allowed select-none"
          />
        </div>
        <p className="text-[12px] text-neutral-500 font-medium mt-1">
          Lưu ý: Vui lòng sử dụng thông tin cá nhân chính xác để thuận tiện cho việc đối soát đơn hàng. Email không thể thay đổi sau khi tạo tài khoản.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || (fullName === initialData.fullName && phone === (initialData.phone || "") && address === (initialData.address || ""))}
          className="h-12 w-full sm:w-fit px-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[14px] font-bold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi hồ sơ 🎀"}
        </button>
      </div>
    </form>
  );
}
