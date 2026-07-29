"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";

export function CreateCustomerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zaloUserId, setZaloUserId] = useState("");
  const [telegramUserId, setTelegramUserId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email, zaloUserId, telegramUserId, telegramUsername }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }

    setFullName("");
    setPhone("");
    setEmail("");
    setZaloUserId("");
    setTelegramUserId("");
    setTelegramUsername("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} className="shadow-sm shadow-[#e86a33]/20">
        <Plus size={18} strokeWidth={2} className="mr-1" />
        Thêm khách hàng
      </Button>
    );
  }

  return (
    <Card className="border border-gray-100 bg-white/50 backdrop-blur-md shadow-sm mb-lg">
      <div className="mb-lg flex items-center justify-between border-b border-gray-100 pb-md">
        <div className="flex items-center gap-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e86a33]/10 text-[#e86a33]">
            <Users size={16} strokeWidth={2} />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">Thêm khách hàng mới</h3>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-xs lg:col-span-1">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Họ và tên *</label>
            <TextInput
              placeholder="VD: Nguyễn Văn A"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Email (tên đăng nhập)</label>
            <TextInput
              type="email"
              placeholder="VD: khach@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Số điện thoại</label>
            <TextInput
              placeholder="VD: 0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Zalo ID</label>
            <TextInput
              placeholder="Nhập Zalo User ID"
              value={zaloUserId}
              onChange={(e) => setZaloUserId(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Telegram ID</label>
            <TextInput
              placeholder="Nhập Telegram User ID"
              value={telegramUserId}
              onChange={(e) => setTelegramUserId(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Telegram Username</label>
            <TextInput
              placeholder="@username"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {email && (
          <p className="text-[12px] text-gray-500 -mt-sm">
            Khách sẽ nhận email đặt mật khẩu để đăng nhập bằng địa chỉ này — giống như tự đăng ký tài khoản.
          </p>
        )}

        {error && (
          <div className="flex items-center gap-sm rounded-lg bg-red-50 border border-red-100 px-md py-sm text-[13px] text-red-600 font-medium">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <div className="flex gap-sm justify-end border-t border-gray-100 pt-md">
          <Button type="button" variant="tertiary" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? "Đang lưu..." : "Lưu khách hàng"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
