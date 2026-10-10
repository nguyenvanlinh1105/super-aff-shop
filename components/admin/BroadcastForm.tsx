"use client";

import { useState } from "react";
import { Megaphone, Send, Sparkles, Smartphone, Bell, CheckCircle2 } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

const PRESET_TEMPLATES = [
  {
    title: "⚡ Shopee Flash Sale 12H rồi sen ơi! 🐾",
    message: "Đừng mua vội! Mở MeowBack lấy link để được hoàn thêm tới 15% tiền ăn trưa/cà phê nhé 🎀",
    link: "/app/deals",
  },
  {
    title: "🔥 Đang xem Live chốt đơn hả bạn? ⚡",
    message: "Chỉ mất 5 giây qua MeowBack là có thêm tiền hoàn về ví rút về tài khoản ngân hàng rồi 💸",
    link: "/app",
  },
  {
    title: "🌙 0H Bão Sale Shopee đừng quên MeowBack ⏰",
    message: "Áp mã giảm của sàn xong, nhớ qua MeowBack để nhận hoàn tiền kép. Tiết kiệm tối đa nha! 🐾",
    link: "/app",
  },
  {
    title: "🎁 Lương Đã Về Ví — Tự Thưởng Thôi! 💰",
    message: "Mua sắm tẹt ga trên Shopee & TikTok, MeowBack lo hoàn tiền tới 200k cho bạn hôm nay!",
    link: "/app/deals",
  },
  {
    title: "🏆 Đua Top Giới Thiệu — Nhận Ngay +50.000đ Vào Ví",
    message: "Bùng nổ đường đua tháng này! Top các thành viên giới thiệu bạn bè nhiều nhất sẽ được cộng ngay +50.000đ trực tiếp vào ví MeowBack. Rủ rê hội bạn cùng mua sắm hoàn tiền để giật giải ngay hôm nay!",
    link: "/app/referral",
  },
  {
    title: "⚡ Siêu Flash Sale Hoàn Tiền X2",
    message: "Duy nhất hôm nay! Mua sắm mọi đơn Shopee & TikTok Shop qua MeowBack để nhận gấp đôi hoa hồng hoàn về ví. Số lượng có hạn, chốt đơn ngay!",
    link: "/app/deals",
  },
  {
    title: "🎁 Thưởng Nạp Ví Thành Viên Mới 50.000đ",
    message: "Chúc mừng bạn gia nhập MeowBack! Hoàn thành đơn hàng đầu tiên ngay hôm nay để nhận thêm thưởng 50k vào ví, rút trực tiếp về ngân hàng.",
    link: "/app/wallet",
  },
  {
    title: "📦 Cập Nhật Đơn Hàng & Hoa Hồng Hoàn Tiền",
    message: "Các đơn hàng Shopee kỳ mới nhất đã được đối soát thành công. Mời bạn kiểm tra tiến độ đơn hàng và số dư khả dụng.",
    link: "/app/orders",
  },
  {
    title: "🔧 Thông Báo Bảo Trì Hệ Thống",
    message: "MeowBack sẽ tiến hành nâng cấp hạ tầng đối soát vào 02:00 sáng mai (dự kiến 30 phút). Các giao dịch chốt đơn trong thời gian này vẫn được tự động ghi nhận bình thường.",
    link: "/app",
  },
];

export function BroadcastForm() {
  const modal = useModal();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("/app/deals");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState("");
  const [loading, setLoading] = useState(false);

  function applyPreset(preset: typeof PRESET_TEMPLATES[0], index?: number) {
    setTitle(preset.title);
    setMessage(preset.message);
    setLink(preset.link);
    if (index !== undefined) {
      setSelectedPresetIndex(String(index));
    }
  }

  async function send() {
    if (!title.trim() || !message.trim()) return;

    const confirmed = await modal.confirm({
      title: "Phát thông báo cho toàn bộ khách hàng?",
      message: (
        <div className="flex flex-col gap-3 text-left w-full my-1.5">
          <p className="text-[13px] text-neutral-600 text-center font-medium leading-relaxed">
            Thông báo này sẽ gửi tức thì tới <strong>tất cả thành viên</strong> qua chuông thông báo trên app và web.
          </p>

          <div className="rounded-2xl bg-white/95 border border-primary-200/80 p-3.5 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-start gap-2">
              <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 mt-0.5">
                Tiêu đề
              </span>
              <span className="text-[13px] font-black text-neutral-900 line-clamp-2">{title}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                Khi bấm
              </span>
              <span className="text-[11.5px] font-mono font-bold text-neutral-600 truncate">{link || "/app (Trang chủ)"}</span>
            </div>

            {message && (
              <div className="pt-2 border-t border-neutral-100 text-[12px] text-neutral-600 font-medium line-clamp-3 leading-relaxed bg-neutral-50/70 p-2.5 rounded-xl border border-neutral-100">
                &ldquo;{message}&rdquo;
              </div>
            )}
          </div>
        </div>
      ),
      confirmText: "Gửi thông báo ngay",
      cancelText: "Hủy bỏ",
      iconType: "warning",
    });
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch("/api/notifications/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, link }),
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setTitle("");
      setMessage("");
      setSelectedPresetIndex("");
      toast.success(`Đã phát thông báo thành công tới ${data.sentCount} khách hàng! 📢`, "Thành công");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Đã có lỗi xảy ra khi phát thông báo.", "Không gửi được");
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-neutral-200/70 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shadow-xs border border-rose-100 shrink-0 text-rose-600">
            <Megaphone size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Phát Thông Báo Toàn Hệ Thống</h2>
            <p className="text-xs text-neutral-500 font-medium">Gửi thông báo tức thì tới tất cả người dùng MeowBack</p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shrink-0">
          Broadcast Center
        </span>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/80">
        <div className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
          <Sparkles size={14} className="text-rose-500 shrink-0" />
          <span>Mẫu thông báo sẵn có (Click để điền nhanh):</span>
        </div>

        {/* Mobile View: Dùng CustomSelect tinh tế, không chiếm nhiều diện tích màn hình */}
        <div className="block sm:hidden w-full">
          <CustomSelect
            options={PRESET_TEMPLATES.map((p, idx) => ({
              value: String(idx),
              label: p.title,
            }))}
            value={selectedPresetIndex}
            onChange={(val) => {
              setSelectedPresetIndex(val);
              const p = PRESET_TEMPLATES[Number(val)];
              if (p) applyPreset(p, Number(val));
            }}
            placeholder="— Chọn mẫu thông báo sẵn có —"
            icon={<Sparkles size={15} className="text-rose-500" />}
            className="w-full"
            ariaLabel="Mẫu thông báo sẵn có"
          />
        </div>

        {/* Desktop View: Giữ nguyên các nút pill bấm nhanh */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((p, idx) => (
            <button
              type="button"
              key={p.title}
              onClick={() => applyPreset(p, idx)}
              className="text-xs font-extrabold bg-white hover:bg-rose-50 text-neutral-800 px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs transition-colors cursor-pointer"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 3 cols: Input Form */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div>
            <label className="text-xs font-extrabold text-neutral-700 block mb-1">Tiêu đề thông báo:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: ⚡ Siêu Flash Sale Hoàn Tiền X2 Hôm Nay..."
              maxLength={120}
              className="h-11 w-full rounded-2xl bg-neutral-50 px-4 text-xs font-extrabold text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-neutral-700 block mb-1">Nội dung chi tiết:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo muốn truyền tải tới người dùng..."
              maxLength={500}
              rows={5}
              className="w-full rounded-2xl bg-neutral-50 p-4 text-xs font-medium text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-neutral-700 block mb-1">
              Chuyển hướng khi người dùng nhấn vào thông báo:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { label: "🛍️ Săn Deals Hot", path: "/app/deals" },
                { label: "👛 Ví tiền & Rút tiền", path: "/app/wallet" },
                { label: "📦 Đơn hàng hoàn tiền", path: "/app/orders" },
                { label: "🎁 Mời bạn bè & Hoa hồng", path: "/app/referral" },
                { label: "🏠 Trang chủ", path: "/app" },
              ].map((btn) => (
                <button
                  key={btn.path}
                  type="button"
                  onClick={() => setLink(btn.path)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                    link === btn.path
                      ? "bg-rose-500 text-white shadow-xs font-black"
                      : "bg-neutral-100 text-neutral-600 hover:bg-rose-50 hover:text-rose-600 border border-neutral-200/80"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Nhập đường dẫn đích (VD: /app/deals hoặc https://...)"
              className="h-10 w-full rounded-2xl bg-neutral-50 px-4 text-xs font-bold text-neutral-800 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono transition-all"
            />
          </div>

          <button
            onClick={send}
            disabled={loading || !title.trim() || !message.trim()}
            className="w-full sm:w-fit inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-pink-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} strokeWidth={2.5} />
            <span>{loading ? "Đang gửi thông báo..." : "Phát thông báo cho tất cả khách hàng"}</span>
          </button>
        </div>

        {/* Right 2 cols: Live Mobile Notification Preview */}
        <div className="lg:col-span-2 flex flex-col gap-2 p-4 rounded-3xl bg-neutral-900 text-white shadow-inner relative overflow-hidden min-h-[220px]">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] font-extrabold text-neutral-400">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Smartphone size={14} /> Live Phone Preview
            </span>
            <span>MeowBack App Notification</span>
          </div>

          <div className="mt-2 p-3.5 rounded-2xl bg-neutral-800/90 border border-neutral-700/60 shadow-lg flex items-start gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell size={16} />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-white truncate">{title.trim() || "Tiêu đề thông báo..."}</span>
                <span className="text-[9px] font-bold text-neutral-400 shrink-0">Bây giờ</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-medium line-clamp-4">
                {message.trim() || "Nội dung tin nhắn thông báo sẽ hiển thị trực quan ở đây..."}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-2 text-center text-[10px] text-neutral-500 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Mô phỏng tin nhắn hiển thị trên App khách hàng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
