"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

export function BroadcastForm() {
  const modal = useModal();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!title.trim() || !message.trim()) return;

    const confirmed = await modal.confirm({
      title: "Gửi thông báo cho toàn bộ khách hàng?",
      message: `Tiêu đề: "${title}". Thông báo này sẽ hiện trong mục Thông báo của tất cả khách hàng đang có tài khoản.`,
      confirmText: "Gửi thông báo",
      cancelText: "Huỷ",
      iconType: "warning",
    });
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch("/api/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message }),
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setTitle("");
      setMessage("");
      await modal.alert({
        title: "Đã gửi thông báo",
        message: `Đã gửi tới ${data.sentCount} khách hàng.`,
        iconType: "success",
      });
    } else {
      const data = await res.json().catch(() => ({}));
      await modal.alert({
        title: "Không gửi được",
        message: data.error ?? "Đã có lỗi xảy ra.",
        iconType: "danger",
      });
    }
  }

  return (
    <div className="rounded-3xl bg-white p-xl shadow-sm ring-1 ring-black/5 flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0e6] text-[#e86a33]">
          <Megaphone size={18} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">Gửi thông báo hệ thống</h2>
          <p className="text-[12px] text-gray-400">Hiện ngay trong mục Thông báo của toàn bộ khách hàng</p>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề thông báo..."
        maxLength={120}
        className="h-11 w-full rounded-xl bg-gray-50 px-md text-[14px] font-medium text-gray-900 ring-1 ring-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/30 transition-all"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Nội dung thông báo..."
        maxLength={500}
        rows={3}
        className="w-full rounded-xl bg-gray-50 p-md text-[14px] font-medium text-gray-900 ring-1 ring-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e86a33]/30 transition-all resize-none"
      />

      <button
        onClick={send}
        disabled={loading || !title.trim() || !message.trim()}
        className="w-fit rounded-xl bg-[#e86a33] px-lg py-[10px] text-[13px] font-bold text-white shadow-md shadow-[#e86a33]/25 transition-all hover:bg-[#d65d2a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Đang gửi..." : "Gửi cho tất cả khách hàng"}
      </button>
    </div>
  );
}
