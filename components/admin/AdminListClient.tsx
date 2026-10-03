"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Pencil,
  Plus,
  Search,
  X,
  Save,
  Send,
  BellRing,
  BellOff,
  Copy,
  Check,
  Mail,
  Lock,
  Phone,
  Info,
  Sparkles,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/ui/ModalProvider";
import { TextInput } from "@/components/ui/TextInput";
import { Button } from "@/components/ui/Button";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  telegramChatId: string | null;
  notifyOnNewCustomer: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

function generateStrongPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function AdminListClient({
  initialAdmins,
  currentAdminId,
}: {
  initialAdmins: AdminUser[];
  currentAdminId: string;
}) {
  const { toast } = useToast();
  const modal = useModal();

  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNotify, setFilterNotify] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  // Form thêm admin
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState(generateStrongPassword());
  const [createPhone, setCreatePhone] = useState("");
  const [createTelegramId, setCreateTelegramId] = useState("");
  const [createNotify, setCreateNotify] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form sửa admin
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTelegramId, setEditTelegramId] = useState("");
  const [editNotify, setEditNotify] = useState(true);
  const [editStatus, setEditStatus] = useState("active");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép vào bộ nhớ tạm!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword(generateStrongPassword());
    setCreatePhone("");
    setCreateTelegramId("");
    setCreateNotify(true);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: createName,
          email: createEmail,
          password: createPassword,
          phone: createPhone || null,
          telegramChatId: createTelegramId || null,
          notifyOnNewCustomer: createNotify,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo tài khoản admin");
      }

      setAdmins((prev) => [data.admin, ...prev]);
      setIsCreateOpen(false);
      toast.success(`Đã tạo thành công tài khoản quản trị viên và gửi email tới ${createEmail}!`);
    } catch (err: any) {
      setCreateError(err.message || "Đã xảy ra lỗi");
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditName(admin.fullName);
    setEditPhone(admin.phone || "");
    setEditTelegramId(admin.telegramChatId || "");
    setEditNotify(admin.notifyOnNewCustomer);
    setEditStatus(admin.status);
    setEditNewPassword("");
    setEditError(null);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editName,
          phone: editPhone || null,
          telegramChatId: editTelegramId || null,
          notifyOnNewCustomer: editNotify,
          status: editStatus,
          newPassword: editNewPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật quản trị viên");
      }

      setAdmins((prev) => prev.map((a) => (a.id === editingAdmin.id ? data.admin : a)));
      setEditingAdmin(null);
      toast.success("Cập nhật thông tin quản trị viên thành công!");
    } catch (err: any) {
      setEditError(err.message || "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setEditLoading(false);
    }
  };

  const toggleAdminStatus = async (admin: AdminUser) => {
    const isCurrentlyActive = admin.status === "active";
    const newStatus = isCurrentlyActive ? "inactive" : "active";

    const confirmed = await modal.confirm({
      title: isCurrentlyActive ? "Tạm khóa tài khoản Admin?" : "Kích hoạt lại tài khoản Admin?",
      message: isCurrentlyActive
        ? `Bạn có chắc muốn tạm khóa tài khoản của "${admin.fullName}" (${admin.email}) không? Admin này sẽ không thể đăng nhập vào hệ thống cho tới khi được mở khóa.`
        : `Kích hoạt lại quyền truy cập hệ thống cho "${admin.fullName}" (${admin.email})?`,
      confirmText: isCurrentlyActive ? "Tạm khóa" : "Mở khóa",
      cancelText: "Hủy",
      iconType: isCurrentlyActive ? "danger" : "info",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể thay đổi trạng thái");

      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data.admin : a)));
      toast.info(newStatus === "active" ? "Đã kích hoạt lại tài khoản" : "Đã tạm khóa tài khoản Admin");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  // Lọc dữ liệu
  const filteredAdmins = admins.filter((a) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q)) ||
      (a.telegramChatId && a.telegramChatId.includes(q));

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && a.status === "active") ||
      (filterStatus === "inactive" && a.status === "inactive");

    const matchNotify =
      filterNotify === "all" ||
      (filterNotify === "enabled" && a.notifyOnNewCustomer && a.telegramChatId) ||
      (filterNotify === "disabled" && (!a.notifyOnNewCustomer || !a.telegramChatId));

    return matchSearch && matchStatus && matchNotify;
  });

  return (
    <>
      {/* ── MODAL THÊM ADMIN MỚI ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs fade-in">
          <div
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white/95 backdrop-blur-md rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Thêm Quản Trị Viên Mới</h3>
                  <p className="text-xs text-neutral-500">Cấp tài khoản &amp; phân quyền truy cập hệ thống</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="p-6 flex flex-col gap-5">
              {/* Họ tên */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Họ và tên Quản trị viên <span className="text-rose-500">*</span>
                </label>
                <TextInput
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                  required
                  className="bg-neutral-50/70"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Địa chỉ Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <TextInput
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin.moi@meowback.shop"
                  required
                  className="bg-neutral-50/70"
                />
                <span className="text-[11px] text-neutral-400">
                  Hệ thống sẽ gửi email chứa liên kết đăng nhập và mật khẩu khởi tạo đến email này.
                </span>
              </div>

              {/* Mật khẩu khởi tạo */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateStrongPassword())}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 hover:underline cursor-pointer"
                  >
                    <KeyRound size={12} />
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <TextInput
                    type="text"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    required
                    className="bg-neutral-50/70 font-mono text-sm tracking-wide pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(createPassword, "pwd")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                    title="Copy mật khẩu"
                  >
                    {copiedId === "pwd" ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Số điện thoại liên hệ (Tuỳ chọn)
                </label>
                <TextInput
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="0987654321"
                  className="bg-neutral-50/70"
                />
              </div>

              {/* Telegram Chat ID */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Telegram Chat ID (Tuỳ chọn)
                  </label>
                  <a
                    href="/admin/telegram"
                    target="_blank"
                    className="text-[11px] font-bold text-sky-600 hover:underline"
                  >
                    Xem lịch sử Chat Bot ↗
                  </a>
                </div>
                <TextInput
                  value={createTelegramId}
                  onChange={(e) => setCreateTelegramId(e.target.value)}
                  placeholder="Ví dụ: 987654321"
                  className="bg-neutral-50/70 font-mono"
                />
                <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/70 text-[11px] text-sky-800 leading-relaxed flex items-start gap-2">
                  <Info size={15} className="shrink-0 text-sky-600 mt-0.5" />
                  <div>
                    <strong>Cách lấy Chat ID Telegram:</strong> Admin chỉ cần mở ứng dụng Telegram và nhắn tin bất kỳ cho bot{" "}
                    <strong>@userinfobot</strong> hoặc <strong>@myidbot</strong> để lấy số <code>Id</code> của mình.
                  </div>
                </div>
              </div>

              {/* Toggle thông báo Telegram */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-neutral-900">
                      Nhận thông báo khi có người đăng ký mới
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Bot Telegram sẽ tự động gửi tin nhắn báo ngay khi có khách hàng tạo tài khoản.
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNotify}
                    onChange={(e) => setCreateNotify(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Thông báo gửi email tự động */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2.5">
                <Mail size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong>Tự động gửi email cấp tài khoản:</strong> Ngay sau khi bấm &quot;Tạo tài khoản&quot;, hệ thống
                  sẽ gửi 1 email chuyên nghiệp chứa đường link web, email và mật khẩu khởi tạo đến địa chỉ{" "}
                  <span className="font-bold underline">{createEmail || "email đăng ký"}</span>.
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                  {createError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button type="button" variant="tertiary" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createLoading} className="min-w-[140px] bg-rose-600 hover:bg-rose-700">
                  {createLoading ? "Đang xử lý..." : <><Plus size={16} className="mr-1" />Tạo Quản Trị Viên</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SỬA ADMIN ── */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs fade-in">
          <div
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white/95 backdrop-blur-md rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                    Chỉnh Sửa Quản Trị Viên
                  </h3>
                  <p className="text-xs text-neutral-500">{editingAdmin.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateAdmin} className="p-6 flex flex-col gap-5">
              {/* Họ tên */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <TextInput
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="bg-neutral-50/70"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Email đăng nhập (Cố định)
                </label>
                <TextInput value={editingAdmin.email} disabled className="bg-neutral-100 text-neutral-500 cursor-not-allowed" />
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Số điện thoại
                </label>
                <TextInput
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0987654321"
                  className="bg-neutral-50/70"
                />
              </div>

              {/* Telegram Chat ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Telegram Chat ID
                </label>
                <TextInput
                  value={editTelegramId}
                  onChange={(e) => setEditTelegramId(e.target.value)}
                  placeholder="Ví dụ: 123456789"
                  className="bg-neutral-50/70 font-mono"
                />
                <span className="text-[11px] text-neutral-400">
                  Nhập Chat ID để bot Telegram gửi tin nhắn thông báo trực tiếp đến tài khoản của bạn.
                </span>
              </div>

              {/* Toggle thông báo Telegram */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-neutral-900">
                      Gửi tin bot Telegram khi có người đăng ký mới
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {editNotify
                        ? "Đang BẬT: Bạn sẽ nhận được tin nhắn Telegram mỗi khi có khách đăng ký."
                        : "Đang TẮT: Bot sẽ không gửi tin nhắn đăng ký mới đến tài khoản này."}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editNotify}
                    onChange={(e) => setEditNotify(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Đổi trạng thái */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Trạng thái tài khoản
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-11 px-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-extrabold text-neutral-800 focus:outline-none focus:border-rose-400"
                >
                  <option value="active">🟢 Đang hoạt động</option>
                  <option value="inactive">🔒 Tạm khóa tài khoản</option>
                </select>
              </div>

              {/* Đổi mật khẩu mới (tuỳ chọn) */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Đổi mật khẩu mới (Tuỳ chọn)
                </label>
                <TextInput
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                  className="bg-neutral-50/70"
                />
                <span className="text-[11px] text-neutral-400">
                  Nếu nhập mật khẩu mới, tối thiểu 6 ký tự.
                </span>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                  {editError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button type="button" variant="tertiary" onClick={() => setEditingAdmin(null)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={editLoading} className="min-w-[130px] bg-rose-600 hover:bg-rose-700">
                  {editLoading ? "Đang lưu..." : <><Save size={15} className="mr-1" />Lưu Thay Đổi</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BẢNG DANH SÁCH QUẢN TRỊ VIÊN ── */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-5 sm:p-6 border-b border-neutral-200/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-rose-50/40 via-white to-rose-50/20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[240px] sm:min-w-[300px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, SĐT, Chat ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-8 text-xs font-medium bg-white rounded-xl border border-neutral-200/80 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/40 transition-all shadow-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Trạng thái */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-bold text-neutral-800 focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động</option>
              <option value="inactive">🔒 Tạm khóa</option>
            </select>

            {/* Filter Telegram Notify */}
            <select
              value={filterNotify}
              onChange={(e) => setFilterNotify(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white border border-neutral-200/80 text-xs font-bold text-neutral-800 focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="all">Thông báo Telegram: Tất cả</option>
              <option value="enabled">🔔 Đang bật báo bot</option>
              <option value="disabled">🔕 Chưa bật / Chưa nối</option>
            </select>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 shadow-sm shadow-rose-500/20"
          >
            <Plus size={16} className="mr-1.5" />
            Thêm Quản Trị Viên Mới
          </Button>
        </div>

        {/* Table */}
        <div className="responsive-table overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80">
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Quản Trị Viên
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Số Điện Thoại
                </th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Bot Telegram Thông Báo
                </th>
                <th className="text-center px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Bảo Mật 2MFA
                </th>
                <th className="text-center px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Trạng Thái
                </th>
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Shield size={32} className="mx-auto mb-2 opacity-30 text-rose-500" />
                    <p className="font-bold text-neutral-600">Không tìm thấy tài khoản quản trị viên nào</p>
                    <p className="text-xs text-neutral-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isSelf = admin.id === currentAdminId;
                  const hasTelegram = Boolean(admin.telegramChatId);
                  const isNotifyActive = hasTelegram && admin.notifyOnNewCustomer;

                  return (
                    <tr
                      key={admin.id}
                      className={`border-b border-neutral-100 hover:bg-rose-50/20 transition-colors ${
                        admin.status === "inactive" ? "opacity-60 bg-neutral-50/40" : ""
                      }`}
                    >
                      {/* Tên & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                            {admin.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-neutral-900">{admin.fullName}</span>
                              {isSelf && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                              <span>{admin.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(admin.email, `email-${admin.id}`)}
                                className="text-neutral-400 hover:text-neutral-700 p-0.5"
                                title="Copy email"
                              >
                                {copiedId === `email-${admin.id}` ? (
                                  <Check size={11} className="text-emerald-500" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số điện thoại */}
                      <td className="px-4 py-3.5 text-neutral-700 font-mono text-xs">
                        {admin.phone ? admin.phone : <span className="text-neutral-400">—</span>}
                      </td>

                      {/* Bot Telegram Thông Báo */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {hasTelegram ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                  isNotifyActive
                                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                                }`}
                              >
                                {isNotifyActive ? (
                                  <>
                                    <BellRing size={12} className="text-sky-600" /> Báo bot khi có user mới
                                  </>
                                ) : (
                                  <>
                                    <BellOff size={12} className="text-neutral-400" /> Đang tắt báo bot
                                  </>
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md w-fit">
                              Chưa gắn Chat ID
                            </span>
                          )}

                          {admin.telegramChatId && (
                            <span className="text-[10px] text-neutral-400 font-mono pl-1">
                              ID: {admin.telegramChatId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bảo mật 2MFA */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            admin.mfaEnabled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          {admin.mfaEnabled ? "🛡️ 2MFA Bật" : "⚪ Chưa bật"}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                            admin.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {admin.status === "active" ? "🟢 Hoạt động" : "🔒 Tạm khóa"}
                        </span>
                      </td>

                      {/* Thao tác (Chỉnh sửa / Khóa - KHÔNG CÓ NÚT XÓA) */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="h-8 px-2.5 flex items-center gap-1 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200/80 transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Pencil size={13} />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAdminStatus(admin)}
                            className={`h-8 px-2.5 flex items-center gap-1 rounded-xl text-xs font-bold transition-colors ${
                              admin.status === "active"
                                ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                            title={admin.status === "active" ? "Tạm khóa tài khoản này" : "Kích hoạt lại tài khoản này"}
                          >
                            {admin.status === "active" ? (
                              <>
                                <UserX size={13} />
                                <span>Khóa</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} />
                                <span>Mở khóa</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info notice */}
        <div className="p-4 bg-neutral-50/70 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-rose-500" />
            <span>
              Tài khoản Quản trị viên được bảo vệ: <strong>Không hỗ trợ xoá tài khoản</strong> để bảo toàn toàn bộ dữ liệu đối soát và lịch sử hệ thống.
            </span>
          </div>
          <div className="font-extrabold text-neutral-700">
            Tổng cộng: {filteredAdmins.length} quản trị viên
          </div>
        </div>
      </div>
    </>
  );
}
