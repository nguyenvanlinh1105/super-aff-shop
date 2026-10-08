"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Shield,
  Pencil,
  Plus,
  Search,
  X,
  Save,
  BellRing,
  BellOff,
  Copy,
  Check,
  Mail,
  Info,
  KeyRound,
  FileSpreadsheet,
  Send,
  CheckCircle2,
  ExternalLink,
  Unlink,
  QrCode,
  RefreshCw,
  AlertCircle,
  User,
  Lock,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
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
  telegramUsername?: string | null;
  notifyOnNewCustomer: boolean;
  notifyOnImport: boolean;
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

  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [search, setSearch] = useState("");
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
  const [createNotifyImport, setCreateNotifyImport] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form sửa admin
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTelegramId, setEditTelegramId] = useState("");
  const [editTelegramUsername, setEditTelegramUsername] = useState("");
  const [editNotify, setEditNotify] = useState(true);
  const [editNotifyImport, setEditNotifyImport] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Trạng thái kết nối Telegram trong Modal Sửa
  const [linkCodeResult, setLinkCodeResult] = useState<{
    code: string;
    expiresInMinutes: number;
    deepLink: string;
    botUsername: string;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [isManualInput, setIsManualInput] = useState(false);

  // Sinh mã QR khi có linkCodeResult
  useEffect(() => {
    if (!linkCodeResult) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(linkCodeResult.deepLink, { width: 180, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [linkCodeResult]);

  // Tự động kiểm tra trạng thái kết nối (polling) khi đang hiển thị QR Code
  useEffect(() => {
    if (!editingAdmin || !linkCodeResult || editTelegramId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/admins/${editingAdmin.id}/telegram-link`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.linked && data.telegramChatId) {
          setEditTelegramId(data.telegramChatId);
          setEditTelegramUsername(data.telegramUsername || "");
          setLinkCodeResult(null);
          setQrDataUrl(null);
          setAdmins((prev) =>
            prev.map((a) =>
              a.id === editingAdmin.id
                ? { ...a, telegramChatId: data.telegramChatId, telegramUsername: data.telegramUsername }
                : a
            )
          );
          toast.success("🎉 Đã kết nối tài khoản Telegram thành công!");
        }
      } catch {
        // bỏ qua lỗi polling mạng tạm thời
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [editingAdmin, linkCodeResult, editTelegramId]);

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
    setCreateNotifyImport(true);
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
          notifyOnImport: createNotifyImport,
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
    setEditTelegramUsername(admin.telegramUsername || "");
    setEditNotify(admin.notifyOnNewCustomer);
    setEditNotifyImport(admin.notifyOnImport ?? true);
    setEditError(null);
    setTelegramError(null);
    setLinkCodeResult(null);
    setQrDataUrl(null);
    setIsManualInput(false);
  };

  const handleGenerateTelegramCode = async () => {
    if (!editingAdmin) return;
    setTelegramLoading(true);
    setTelegramError(null);
    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}/telegram-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo mã liên kết");
      }
      setLinkCodeResult(data);
    } catch (err: any) {
      setTelegramError(err.message || "Lỗi tạo mã kết nối Telegram");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!editingAdmin) return;
    setTelegramLoading(true);
    setTelegramError(null);
    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}/telegram-link`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể hủy liên kết Telegram");
      }
      setEditTelegramId("");
      setEditTelegramUsername("");
      setLinkCodeResult(null);
      setQrDataUrl(null);
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? { ...a, telegramChatId: null, telegramUsername: null }
            : a
        )
      );
      toast.success("Đã hủy liên kết Telegram. Bạn có thể kết nối tài khoản mới.");
    } catch (err: any) {
      setTelegramError(err.message || "Lỗi hủy liên kết Telegram");
    } finally {
      setTelegramLoading(false);
    }
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
          notifyOnImport: editNotifyImport,
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

  // Lọc dữ liệu
  const filteredAdmins = admins.filter((a) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q)) ||
      (a.telegramChatId && a.telegramChatId.includes(q));

    const hasAnyNotify = (a.notifyOnNewCustomer || a.notifyOnImport) && Boolean(a.telegramChatId);
    const matchNotify =
      filterNotify === "all" ||
      (filterNotify === "enabled" && hasAnyNotify) ||
      (filterNotify === "disabled" && !hasAnyNotify);

    return matchSearch && matchNotify;
  });

  return (
    <>
      {/* ── MODAL THÊM ADMIN MỚI (GIAO DIỆN PC 2 CỘT HIỆN ĐẠI) ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm fade-in">
          <div
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-100 bg-white/95 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/20">
                  <Shield size={20} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Thêm Quản Trị Viên Mới</h3>
                  <p className="text-xs text-neutral-500">Cấp tài khoản đăng nhập &amp; phân quyền truy cập hệ thống</p>
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
            <form onSubmit={handleCreateAdmin} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Cột 1: Thông tin tài khoản */}
                <div className="flex flex-col gap-4 p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-100">
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 pb-1 border-b border-neutral-200/60">
                    <User size={13} />
                    Thông Tin Tài Khoản
                  </div>

                  {/* Họ tên */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <TextInput
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                      required
                      className="bg-white text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Email đăng nhập <span className="text-rose-500">*</span>
                    </label>
                    <TextInput
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="admin.moi@meowback.shop"
                      required
                      className="bg-white text-sm"
                    />
                  </div>

                  {/* Mật khẩu khởi tạo */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-700">
                        Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCreatePassword(generateStrongPassword())}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
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
                        className="bg-white font-mono text-sm tracking-wide pr-10"
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
                    <label className="text-xs font-bold text-neutral-700">
                      Số điện thoại (Tuỳ chọn)
                    </label>
                    <TextInput
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      placeholder="0987654321"
                      className="bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Cột 2: Cài đặt thông báo & Telegram ban đầu */}
                <div className="flex flex-col gap-4 p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-100">
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 pb-1 border-b border-neutral-200/60">
                    <Send size={13} className="text-[#24A1DE]" />
                    Cài Đặt Thông Báo &amp; Telegram
                  </div>

                  {/* Telegram Chat ID (Tuỳ chọn) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Telegram Chat ID (Tuỳ chọn)
                    </label>
                    <TextInput
                      value={createTelegramId}
                      onChange={(e) => setCreateTelegramId(e.target.value)}
                      placeholder="Ví dụ: 7558379347"
                      className="bg-white font-mono text-sm"
                    />
                    <span className="text-[11px] text-neutral-400 leading-relaxed">
                      💡 Sau khi tạo tài khoản, admin có thể bấm <b>Sửa</b> để quét mã QR kết nối trực tiếp với Bot cực kỳ nhanh chóng.
                    </span>
                  </div>

                  {/* Toggle thông báo Telegram: Khách đăng ký */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <BellRing size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Báo khi có khách mới</div>
                        <div className="text-[10.5px] text-neutral-400">Gửi tin nhắn Telegram tức thì</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createNotify}
                        onChange={(e) => setCreateNotify(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {/* Toggle thông báo Telegram: Import CSV */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Báo kết quả Import CSV</div>
                        <div className="text-[10.5px] text-neutral-400">Chi tiết thành công hoặc thất bại</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createNotifyImport}
                        onChange={(e) => setCreateNotifyImport(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {/* Thông báo gửi email tự động */}
                  <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/70 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
                    <Mail size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      Hệ thống sẽ tự động gửi email thông báo kèm mật khẩu khởi tạo đến <span className="font-bold underline">{createEmail || "email quản trị viên"}</span>.
                    </div>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                  {createError}
                </div>
              )}

              {/* Footer Buttons */}
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

      {/* ── MODAL SỬA ADMIN (GIAO DIỆN PC CHUYÊN NGHIỆP 2 CỘT TỶ LỆ VÀNG) ── */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm fade-in">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-neutral-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Cao Cấp */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-100 bg-white/95 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-rose-500/20 shrink-0">
                  {editingAdmin.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                      Chỉnh Sửa Quản Trị Viên
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                      Staff Admin
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">{editingAdmin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form Thân Modal */}
            <form onSubmit={handleUpdateAdmin} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* ── CỘT TRÁI (5 PHẦN): HỒ SƠ QUẢN TRỊ ── */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-100 flex flex-col gap-4">
                    <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 pb-1 border-b border-neutral-200/60">
                      <User size={13} />
                      Thông Tin Cá Nhân
                    </div>

                    {/* Họ tên */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <TextInput
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="bg-white text-sm font-medium"
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-400">
                          Email đăng nhập
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400">
                          <Lock size={10} /> Cố định
                        </span>
                      </div>
                      <TextInput
                        value={editingAdmin.email}
                        disabled
                        className="bg-neutral-100 text-neutral-500 cursor-not-allowed text-sm"
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Số điện thoại liên hệ
                      </label>
                      <TextInput
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0987654321"
                        className="bg-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Thông tin bảo mật & hệ thống */}
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col gap-2.5 text-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-100">
                      Trạng Thái Bảo Mật
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Xác thực 2MFA:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                          editingAdmin.mfaEnabled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}
                      >
                        {editingAdmin.mfaEnabled ? "🛡️ Đã bật 2MFA" : "⚪ Chưa bật"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Ngày tạo:</span>
                      <span className="font-mono text-neutral-700 font-medium">
                        {new Date(editingAdmin.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── CỘT PHẢI (7 PHẦN): TÍCH HỢP TELEGRAM BOT & THÔNG BÁO ── */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Card Kết Nối Telegram */}
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-100 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                      <div className="text-[11px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Send size={13} className="text-[#24A1DE]" />
                        Tích Hợp Telegram Bot
                      </div>

                      {!isManualInput ? (
                        <button
                          type="button"
                          onClick={() => setIsManualInput(true)}
                          className="text-[11px] text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
                        >
                          Nhập Chat ID thủ công
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsManualInput(false)}
                          className="text-[11px] text-[#24A1DE] hover:underline font-bold cursor-pointer flex items-center gap-1"
                        >
                          <QrCode size={12} />
                          Quét mã QR / Nút kết nối
                        </button>
                      )}
                    </div>

                    {isManualInput ? (
                      /* Chế độ nhập thủ công */
                      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-neutral-200">
                        <label className="text-xs font-bold text-neutral-700">
                          Telegram Chat ID số hoặc ID Nhóm (-100...)
                        </label>
                        <TextInput
                          value={editTelegramId}
                          onChange={(e) => setEditTelegramId(e.target.value)}
                          placeholder="Ví dụ: 7558379347 hoặc -100xxxxxxxx"
                          className="bg-neutral-50 font-mono text-sm"
                        />
                        <span className="text-[11px] text-neutral-500">
                          💡 Dành cho quản trị viên muốn cài đặt ID Nhóm Telegram để cả ban quản trị cùng nhận tin.
                        </span>
                      </div>
                    ) : editTelegramId ? (
                      /* TRẠNG THÁI: ĐÃ KẾT NỐI THÀNH CÔNG */
                      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 size={20} strokeWidth={2.6} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full mb-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Đã kết nối Telegram</span>
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 truncate">
                              {editTelegramUsername ? `@${editTelegramUsername}` : `Chat ID: ${editTelegramId}`}
                            </h4>
                            <p className="text-[11px] text-neutral-600 font-mono">
                              Chat ID: <span className="font-bold text-neutral-800">{editTelegramId}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleUnlinkTelegram}
                          disabled={telegramLoading}
                          className="h-8.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-98 disabled:opacity-50"
                          title="Hủy liên kết tài khoản này để kết nối tài khoản Telegram khác"
                        >
                          <Unlink size={13} strokeWidth={2} />
                          <span>{telegramLoading ? "Đang xử lý..." : "Đổi tài khoản"}</span>
                        </button>
                      </div>
                    ) : (
                      /* TRẠNG THÁI: CHƯA KẾT NỐI */
                      <div className="rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-sky-50/80 border border-sky-200/80 p-4 flex flex-col gap-3">
                        {linkCodeResult ? (
                          /* Khi đã tạo mã -> Hiển thị QR và Nút mở bot */
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white p-3.5 rounded-2xl border border-sky-200/80 shadow-2xs">
                            {qrDataUrl ? (
                              <div className="bg-white p-1.5 rounded-xl border border-neutral-200 shadow-2xs shrink-0">
                                <img
                                  src={qrDataUrl}
                                  alt="QR liên kết Telegram"
                                  className="h-[110px] w-[110px] object-contain rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="h-[110px] w-[110px] rounded-xl bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                                Đang tải QR...
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5 w-full text-center sm:text-left min-w-0">
                              <div className="text-xs font-semibold text-neutral-600">
                                Quét mã trên điện thoại hoặc bấm nút bên dưới:
                              </div>
                              <div>
                                <code className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-0.5 font-mono text-sm font-black tracking-widest text-sky-900">
                                  {linkCodeResult.code}
                                </code>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1 justify-center sm:justify-start">
                                <a
                                  href={linkCodeResult.deepLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-[#24A1DE] hover:bg-[#1E8BC0] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                                >
                                  <Send size={12} />
                                  <span>Mở Telegram để kết nối ngay</span>
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                              <p className="text-[11px] text-sky-700 animate-pulse font-medium mt-0.5">
                                ⏳ Đang chờ bạn mở Telegram và nhấn <b>START</b>...
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Chưa bấm tạo mã */
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#24A1DE]/30">
                                <Send size={18} className="translate-x-[-1px] translate-y-[-1px]" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                                  Kết nối với MeowBack Bot
                                </h4>
                                <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                                  Quét mã QR hoặc nhấn nút để tự động lưu Chat ID nhận thông báo khách mới &amp; đối soát CSV.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateTelegramCode}
                              disabled={telegramLoading}
                              className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              <Send size={13} />
                              <span>{telegramLoading ? "Đang tạo..." : "Tạo mã kết nối Telegram"}</span>
                            </button>
                          </div>
                        )}

                        {telegramError && (
                          <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                            {telegramError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2 Toggle Cài Đặt Thông Báo Tự Động */}
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-100 flex flex-col gap-3">
                    <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 pb-1 border-b border-neutral-200/60">
                      Tùy Chọn Nhận Thông Báo
                    </div>

                    {/* Toggle thông báo Telegram: Khách đăng ký mới */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <BellRing size={17} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900">
                            Báo khi có khách hàng đăng ký mới
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {editNotify
                              ? "Đang BẬT: Bot gửi tin nhắn mỗi khi có tài khoản mới."
                              : "Đang TẮT: Bot sẽ không gửi thông báo đăng ký."}
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
                        <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                      </label>
                    </div>

                    {/* Toggle thông báo Telegram: Import đơn / CSV */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                          <FileSpreadsheet size={17} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900">
                            Báo kết quả Import CSV &amp; đối soát
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {editNotifyImport
                              ? "Đang BẬT: Nhận kết quả import chi tiết (thành công / lỗi)."
                              : "Đang TẮT: Bot sẽ không gửi kết quả import CSV."}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editNotifyImport}
                          onChange={(e) => setEditNotifyImport(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold">
                  {editError}
                </div>
              )}

              {/* Sticky Footer Buttons */}
              <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white/95 backdrop-blur-md border-t border-neutral-100 flex items-center justify-between gap-3">
                <span className="hidden sm:inline-block text-[11px] text-neutral-400 font-medium">
                  💡 Thay đổi thông báo và liên kết Telegram sẽ có hiệu lực ngay.
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button type="button" variant="tertiary" onClick={() => setEditingAdmin(null)}>
                    Hủy bỏ
                  </Button>
                  <Button type="submit" disabled={editLoading} className="min-w-[140px] bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/20">
                    {editLoading ? "Đang lưu..." : <><Save size={15} className="mr-1.5" />Lưu Thay Đổi</>}
                  </Button>
                </div>
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
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-neutral-500">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Shield size={32} className="mx-auto mb-2 opacity-30 text-rose-500" />
                    <p className="font-bold text-neutral-600">Không tìm thấy tài khoản quản trị viên nào</p>
                    <p className="text-xs text-neutral-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isSelf = admin.id === currentAdminId;
                  const hasTelegram = Boolean(admin.telegramChatId);
                  const isNotifyUserActive = hasTelegram && admin.notifyOnNewCustomer;
                  const isNotifyImportActive = hasTelegram && admin.notifyOnImport;

                  return (
                    <tr
                      key={admin.id}
                      className="border-b border-neutral-100 hover:bg-rose-50/20 transition-colors"
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
                        <div className="flex flex-col gap-1.5">
                          {hasTelegram ? (
                            <div className="flex flex-col gap-1">
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
                                <Send size={12} className="text-[#24A1DE]" />
                                <span>{admin.telegramUsername ? `@${admin.telegramUsername}` : `ID: ${admin.telegramChatId}`}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isNotifyUserActive
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-neutral-100 text-neutral-400 border border-neutral-200 line-through"
                                  }`}
                                  title={isNotifyUserActive ? "Đang bật thông báo người dùng mới" : "Đang tắt thông báo người dùng mới"}
                                >
                                  <BellRing size={11} className={isNotifyUserActive ? "text-amber-600" : "text-neutral-400"} /> User mới
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isNotifyImportActive
                                      ? "bg-sky-50 text-sky-800 border border-sky-200"
                                      : "bg-neutral-100 text-neutral-400 border border-neutral-200 line-through"
                                  }`}
                                  title={isNotifyImportActive ? "Đang bật thông báo import CSV" : "Đang tắt thông báo import CSV"}
                                >
                                  <FileSpreadsheet size={11} className={isNotifyImportActive ? "text-sky-600" : "text-neutral-400"} /> Import CSV
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md w-fit">
                              Chưa gắn Chat ID
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

                      {/* Thao tác (Chỉ Chỉnh sửa — Không Khóa, Không Xóa) */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="h-8 px-3 flex items-center gap-1.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 transition-colors shadow-xs"
                            title="Chỉnh sửa thông tin"
                          >
                            <Pencil size={13} className="text-neutral-500" />
                            <span>Sửa</span>
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
              Tài khoản Quản trị viên hệ thống MeowBack. Để đổi mật khẩu cá nhân, vui lòng vào mục <strong>Cài đặt</strong>.
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
