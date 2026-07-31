"use client";

import { useState, useEffect } from "react";
import { Terminal, Plus, Trash2, Edit3, Check, X, Sparkles, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

interface BotCommand {
  id: string;
  command: string;
  title: string;
  replyText: string;
  isActive: boolean;
  createdAt: string;
}

const PRESET_COMMANDS = [
  { command: "/khuyenmai", title: "Khuyến Mãi Hot", replyText: "🔥 CHƯƠNG TRÌNH KHUYẾN MÃI MEOWBACK 🔥\n\n- Hoàn tiền lên tới 80% mọi đơn Shopee & TikTok Shop\n- Giới thiệu bạn bè nhận 5% hoa hồng trọn đời\n- Truy cập ngay: {appUrl}/app/deals để săn voucher!" },
  { command: "/event", title: "Sự Kiện Flash Day", replyText: "🎉 SỰ KIỆN X2 HOÀN TIỀN NGÀY ĐÔI 🎉\n\nChào {fullName}, duy nhất hôm nay khi chốt đơn qua MeowBack bạn sẽ nhận thêm X2 tiền hoàn về ví!\nLink mời của bạn: {inviteUrl}" },
  { command: "/quydinh", title: "Quy Định Hoàn Tiền", replyText: "📜 QUY ĐỊNH HOÀN TIỀN MEOWBACK 📜\n\n1. Đơn hàng hoàn tiền được ghi nhận tự động sau khi đối soát thành công.\n2. Tiền khả dụng rút về ngân hàng từ 10.000đ.\n3. Hỗ trợ CSKH 24/7." },
];

export function TelegramCommandManager() {
  const modal = useModal();
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCommand, setEditingCommand] = useState<BotCommand | null>(null);

  // Form state
  const [commandStr, setCommandStr] = useState("");
  const [title, setTitle] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchCommands() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/telegram/commands");
      if (res.ok) {
        const data = await res.json();
        setCommands(data.commands || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCommands();
  }, []);

  function openAddModal(preset?: typeof PRESET_COMMANDS[0]) {
    setEditingCommand(null);
    setCommandStr(preset ? preset.command : "");
    setTitle(preset ? preset.title : "");
    setReplyText(preset ? preset.replyText : "");
    setShowAddModal(true);
  }

  function openEditModal(cmd: BotCommand) {
    setEditingCommand(cmd);
    setCommandStr(cmd.command);
    setTitle(cmd.title);
    setReplyText(cmd.replyText);
    setShowAddModal(true);
  }

  async function handleSaveCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!commandStr.trim() || !title.trim() || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/telegram/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandStr,
          title,
          replyText,
          isActive: editingCommand ? editingCommand.isActive : true,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchCommands();
        await modal.alert({
          title: "Thành công",
          message: editingCommand ? `Đã cập nhật lệnh ${commandStr}` : `Đã thêm mới câu lệnh ${commandStr}`,
          iconType: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        await modal.alert({
          title: "Lỗi",
          message: err.error || "Không thể lưu câu lệnh",
          iconType: "danger",
        });
      }
    } catch (err: any) {
      await modal.alert({ title: "Lỗi", message: err.message, iconType: "danger" });
    }
    setSubmitting(false);
  }

  async function handleToggleActive(cmd: BotCommand) {
    try {
      const res = await fetch("/api/admin/telegram/commands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cmd.id, isActive: !cmd.isActive }),
      });
      if (res.ok) {
        setCommands((prev) =>
          prev.map((c) => (c.id === cmd.id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(cmd: BotCommand) {
    const confirmed = await modal.confirm({
      title: `Xóa câu lệnh ${cmd.command}?`,
      message: "Người dùng gõ lệnh này trên Telegram sẽ không còn nhận được phản hồi tự động nữa.",
      confirmText: "Xóa câu lệnh",
      cancelText: "Hủy",
      iconType: "warning",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/telegram/commands?id=${cmd.id}`, { method: "DELETE" });
      if (res.ok) {
        setCommands((prev) => prev.filter((c) => c.id !== cmd.id));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-xs border border-indigo-100 shrink-0 text-indigo-600">
            <Terminal size={20} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Cấu Hình Lệnh Phản Hồi Tự Động Telegram Bot</h2>
            <p className="text-xs text-neutral-500 font-medium">Tạo & quản lý các câu lệnh bot tùy chỉnh (ví dụ: `/khuyenmai`, `/event`, `/quydinh`)</p>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-sky-700 transition-all shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Thêm lệnh bot mới</span>
        </button>
      </div>

      {/* Dynamic Variable Chips */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 flex flex-col gap-2">
        <div className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
          <Sparkles size={14} className="text-indigo-600" />
          <span>Các biến thông minh tự động thay thế khi Bot phản hồi tin nhắn:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono font-bold">
          <span className="bg-white text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">{"{fullName}"} = Tên khách hàng</span>
          <span className="bg-white text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">{"{customerCode}"} = Mã Cxxx</span>
          <span className="bg-white text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">{"{appUrl}"} = Link trang web</span>
          <span className="bg-white text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">{"{inviteUrl}"} = Link mời bạn bè</span>
        </div>
      </div>

      {/* Preset Quick Add Badges */}
      {commands.length === 0 && !loading && (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
          <span className="text-xs font-extrabold text-amber-900">Gợi ý mẫu lệnh nhanh:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COMMANDS.map((preset) => (
              <button
                key={preset.command}
                onClick={() => openAddModal(preset)}
                className="text-xs font-bold bg-white text-amber-800 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5"
              >
                <span>+ Thêm {preset.command}</span>
                <span className="text-[10px] opacity-75">({preset.title})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Commands List */}
      {loading ? (
        <div className="py-8 text-center text-xs font-bold text-neutral-400">Đang tải danh sách lệnh bot...</div>
      ) : commands.length === 0 ? (
        <div className="py-8 text-center text-xs font-bold text-neutral-400">Chưa có câu lệnh tùy chỉnh nào. Hãy bấm &quot;Thêm lệnh bot mới&quot; để cấu hình!</div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                cmd.isActive
                  ? "bg-white border-indigo-200/80 shadow-xs hover:border-indigo-300"
                  : "bg-neutral-50/80 border-neutral-200/60 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="rounded-xl bg-indigo-600 px-2.5 py-1 text-xs font-black text-white font-mono shadow-xs">
                      {cmd.command}
                    </code>
                    <span className="text-xs font-extrabold text-neutral-900 truncate">{cmd.title}</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(cmd)}
                    className={`flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl transition-all ${
                      cmd.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {cmd.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    <span>{cmd.isActive ? "Đang bật" : "Đang tắt"}</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-600 font-medium whitespace-pre-wrap line-clamp-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-mono text-[11px]">
                  {cmd.replyText}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 text-xs font-bold">
                <button
                  onClick={() => openEditModal(cmd)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Edit3 size={14} /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(cmd)}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-neutral-900">
                {editingCommand ? `Chỉnh sửa lệnh ${editingCommand.command}` : "Thêm lệnh Telegram Bot mới"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCommand} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-extrabold text-neutral-700 block mb-1">
                  Câu lệnh (Bắt đầu bằng dấu /):
                </label>
                <input
                  type="text"
                  value={commandStr}
                  onChange={(e) => setCommandStr(e.target.value)}
                  placeholder="/khuyenmai"
                  className="w-full h-10 rounded-xl bg-neutral-50 px-3 text-xs font-mono font-bold text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-neutral-700 block mb-1">
                  Tiêu đề câu lệnh:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Khuyến Mãi Hot Tháng Này"
                  className="w-full h-10 rounded-xl bg-neutral-50 px-3 text-xs font-bold text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-neutral-700 block mb-1">
                  Nội dung Bot tự động phản hồi:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Gõ nội dung tin nhắn bot sẽ trả lời..."
                  rows={5}
                  className="w-full rounded-xl bg-neutral-50 p-3 text-xs font-mono font-medium text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : editingCommand ? "Lưu thay đổi" : "Tạo lệnh bot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
