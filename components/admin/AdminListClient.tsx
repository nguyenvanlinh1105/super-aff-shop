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
  Phone,
  Sparkles,
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
    if (!q) return true;
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q)) ||
      (a.telegramChatId && a.telegramChatId.includes(q))
    );
  });

  return (
    <>
      {/* ── MODAL THÊM ADMIN MỚI (GIAO DIỆN PC 2 CỘT HIỆN ĐẠI) ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm fade-in">
          <div
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-neutral-200/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thanh accent màu sắc trên cùng */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-7 py-4.5 border-b border-neutral-200/70 bg-gradient-to-r from-neutral-50/70 via-white to-neutral-50/40">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-100">
                  <Shield size={20} strokeWidth={2.3} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">Thêm Quản Trị Viên Mới</h3>
                  <p className="text-xs text-neutral-500 font-medium">Cấp tài khoản đăng nhập &amp; phân quyền truy cập hệ thống</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="flex-1 overflow-y-auto p-6 sm:p-7 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Cột 1: Thông tin tài khoản */}
                <div className="flex flex-col gap-4 p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 shadow-2xs">
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5 pb-2 border-b border-neutral-200/60">
                    <User size={13} className="text-rose-500" />
                    Thông Tin Tài Khoản
                  </div>

                  {/* Họ tên */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                        required
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 hover:border-neutral-300"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Email đăng nhập <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="admin.moi@meowback.shop"
                        required
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 hover:border-neutral-300"
                      />
                    </div>
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
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        <KeyRound size={12} />
                        Tạo ngẫu nhiên
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        required
                        className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-200 bg-white font-mono text-xs sm:text-sm font-bold text-neutral-900 tracking-wide shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(createPassword, "pwd")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Sao chép mật khẩu"
                      >
                        {copiedId === "pwd" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Số điện thoại (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={createPhone}
                        onChange={(e) => setCreatePhone(e.target.value)}
                        placeholder="Ví dụ: 0987654321"
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 hover:border-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Cột 2: Cài đặt thông báo & Telegram ban đầu */}
                <div className="flex flex-col gap-4 p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 shadow-2xs">
                  <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5 pb-2 border-b border-neutral-200/60">
                    <Send size={13} className="text-[#24A1DE]" />
                    Cài Đặt Thông Báo &amp; Telegram
                  </div>

                  {/* Telegram Chat ID (Tùy chọn) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      Telegram Chat ID (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={createTelegramId}
                      onChange={(e) => setCreateTelegramId(e.target.value)}
                      placeholder="Ví dụ: 7558379347"
                      className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-white font-mono text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
                    />
                    <span className="text-[11px] text-neutral-500 leading-relaxed">
                      💡 Sau khi tạo, admin có thể quét mã QR để kết nối tự động với Bot cực kỳ nhanh chóng.
                    </span>
                  </div>

                  {/* Toggle thông báo Telegram: Khách đăng ký */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <BellRing size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Báo khi có khách mới</div>
                        <div className="text-[11px] text-neutral-400">Gửi tin nhắn Telegram tức thì</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={createNotify}
                      onClick={() => setCreateNotify(!createNotify)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-inner ${
                        createNotify ? "bg-rose-500" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                          createNotify ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle thông báo Telegram: Import CSV */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Báo kết quả Import CSV</div>
                        <div className="text-[11px] text-neutral-400">Chi tiết thành công hoặc thất bại</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={createNotifyImport}
                      onClick={() => setCreateNotifyImport(!createNotifyImport)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-inner ${
                        createNotifyImport ? "bg-rose-500" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                          createNotifyImport ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Thông báo gửi email tự động */}
                  <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/70 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
                    <Mail size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      Hệ thống sẽ gửi email thông báo kèm mật khẩu khởi tạo đến <span className="font-bold underline">{createEmail || "email quản trị viên"}</span>.
                    </div>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{createError}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="sticky bottom-0 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 px-6 sm:px-7 py-4 bg-neutral-50/90 backdrop-blur-md border-t border-neutral-200/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 px-4.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createLoading ? "Đang xử lý..." : <><Plus size={16} /><span>Tạo Quản Trị Viên</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SỬA ADMIN (GIAO DIỆN PC CHUYÊN NGHIỆP, THỜI THƯỢNG) ── */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm fade-in">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-neutral-200/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thanh accent màu sắc trên cùng */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 shrink-0" />

            {/* Header Cao Cấp */}
            <div className="flex items-center justify-between px-6 sm:px-7 py-4.5 border-b border-neutral-200/70 bg-gradient-to-r from-neutral-50/70 via-white to-neutral-50/40">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-rose-500/25 ring-2 ring-rose-100 shrink-0">
                  {editingAdmin.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                      {editingAdmin.fullName}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      <Shield size={10} className="text-rose-500" />
                      Staff Admin
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mt-0.5">
                    <span>{editingAdmin.email}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="font-mono text-[11px] text-neutral-400">ID: {editingAdmin.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
                  title="Đóng modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form Thân Modal */}
            <form onSubmit={handleUpdateAdmin} className="flex-1 overflow-y-auto p-6 sm:p-7 flex flex-col gap-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* ── CỘT TRÁI (5 PHẦN): HỒ SƠ QUẢN TRỊ & BẢO MẬT ── */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Card Thông tin cá nhân */}
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                      <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                        <User size={13} className="text-rose-500" />
                        Thông Tin Cá Nhân
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">Bắt buộc (*)</span>
                    </div>

                    {/* Họ tên */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          placeholder="Ví dụ: Trần Nam"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 hover:border-neutral-300"
                        />
                      </div>
                    </div>

                    {/* Email đăng nhập (Read-only) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-500">
                          Email đăng nhập
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-200/60 px-1.5 py-0.2 rounded">
                          <Lock size={10} /> Cố định
                        </span>
                      </div>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="email"
                          value={editingAdmin.email}
                          disabled
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-neutral-100/70 text-xs sm:text-sm font-medium text-neutral-500 cursor-not-allowed shadow-2xs select-all"
                        />
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-neutral-700">
                        Số điện thoại liên hệ
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Ví dụ: 0987654321"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15 hover:border-neutral-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Trạng Thái & Bảo Mật */}
                  <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-3 shadow-2xs">
                    <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 pb-2 border-b border-neutral-200/60 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        Bảo Mật &amp; Hệ Thống
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 font-mono">STATUS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col gap-1">
                        <span className="text-[10.5px] font-bold text-neutral-400 flex items-center gap-1">
                          <Shield size={11} /> Xác thực 2MFA
                        </span>
                        {editingAdmin.mfaEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Đã bật 2MFA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                            Chưa bật
                          </span>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col gap-1">
                        <span className="text-[10.5px] font-bold text-neutral-400 flex items-center gap-1">
                          <Calendar size={11} /> Ngày khởi tạo
                        </span>
                        <span className="text-[11px] font-extrabold text-neutral-800 font-mono">
                          {new Date(editingAdmin.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CỘT PHẢI (7 PHẦN): TÍCH HỢP TELEGRAM BOT & THÔNG BÁO ── */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Card Kết Nối Telegram */}
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-3.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                      <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                        <Send size={13} className="text-[#24A1DE]" />
                        Tích Hợp Telegram Bot
                      </div>

                      {!isManualInput ? (
                        <button
                          type="button"
                          onClick={() => setIsManualInput(true)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-800 font-semibold transition-colors cursor-pointer"
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
                      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                        <label className="text-xs font-bold text-neutral-700">
                          Telegram Chat ID số hoặc ID Nhóm (-100...)
                        </label>
                        <input
                          type="text"
                          value={editTelegramId}
                          onChange={(e) => setEditTelegramId(e.target.value)}
                          placeholder="Ví dụ: 7558379347 hoặc -100xxxxxxxx"
                          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50 font-mono text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
                        />
                        <span className="text-[11px] text-neutral-500">
                          💡 Dành cho quản trị viên muốn cài đặt ID Nhóm Telegram để cả ban quản trị cùng nhận tin.
                        </span>
                      </div>
                    ) : editTelegramId ? (
                      /* TRẠNG THÁI: ĐÃ KẾT NỐI THÀNH CÔNG */
                      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                            <CheckCircle2 size={20} strokeWidth={2.6} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full mb-0.5">
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
                      <div>
                        {linkCodeResult ? (
                          /* Khi đã tạo mã -> Hiển thị QR và Nút mở bot */
                          <div className="rounded-2xl bg-white border border-sky-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
                            {/* QR Code Container */}
                            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 shrink-0">
                              {qrDataUrl ? (
                                <img
                                  src={qrDataUrl}
                                  alt="QR liên kết Telegram"
                                  className="h-[105px] w-[105px] object-contain rounded-lg"
                                />
                              ) : (
                                <div className="h-[105px] w-[105px] rounded-lg bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                                  Đang tạo QR...
                                </div>
                              )}
                              <span className="text-[10px] font-bold text-neutral-400 mt-1">Quét bằng camera</span>
                            </div>

                            {/* Deep link & Code Container */}
                            <div className="flex flex-col justify-between gap-2.5 w-full min-w-0 text-center sm:text-left">
                              <div>
                                <div className="text-xs font-bold text-neutral-700 mb-1">
                                  Mã kết nối Telegram của bạn:
                                </div>
                                <div className="inline-flex items-center gap-2">
                                  <code className="rounded-lg bg-sky-50 border border-sky-200/80 px-2.5 py-1 font-mono text-sm font-black tracking-widest text-sky-950 select-all">
                                    {linkCodeResult.code}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(linkCodeResult.code, "code")}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                    title="Copy mã liên kết"
                                  >
                                    {copiedId === "code" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <a
                                  href={linkCodeResult.deepLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-[#24A1DE] hover:bg-[#1E8BC0] text-white text-xs font-extrabold transition-all shadow-md shadow-[#24A1DE]/20 active:scale-98 cursor-pointer"
                                >
                                  <Send size={13} />
                                  <span>Mở Telegram để kết nối ngay</span>
                                  <ExternalLink size={12} />
                                </a>

                                <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-sky-700 font-medium">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                  </span>
                                  <span>Đang chờ bạn mở bot &amp; nhấn <b>START</b>...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Chưa bấm tạo mã */
                          <div className="rounded-2xl bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 border border-sky-200/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#24A1DE]/25">
                                <Send size={18} className="-translate-x-0.5 translate-y-0.5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                                  Kết Nối Với MeowBack Bot
                                </h4>
                                <p className="text-[11px] text-neutral-500 font-medium mt-0.5 leading-relaxed">
                                  Quét mã QR hoặc nhấn nút để tự động lưu Chat ID nhận thông báo khách mới &amp; đối soát CSV.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateTelegramCode}
                              disabled={telegramLoading}
                              className="w-full sm:w-auto h-9 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              <Send size={13} />
                              <span>{telegramLoading ? "Đang tạo..." : "Tạo mã kết nối Telegram"}</span>
                            </button>
                          </div>
                        )}

                        {telegramError && (
                          <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2.5 rounded-xl mt-2.5">
                            {telegramError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2 Toggle Cài Đặt Thông Báo Tự Động */}
                  <div className="p-4.5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-3 shadow-2xs">
                    <div className="text-[11px] font-black uppercase tracking-wider text-neutral-600 pb-1 border-b border-neutral-200/60">
                      Tùy Chọn Nhận Thông Báo
                    </div>

                    {/* Toggle thông báo Telegram: Khách đăng ký mới */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
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

                      <button
                        type="button"
                        role="switch"
                        aria-checked={editNotify}
                        onClick={() => setEditNotify(!editNotify)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-inner ${
                          editNotify ? "bg-rose-500" : "bg-neutral-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                            editNotify ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle thông báo Telegram: Import đơn / CSV */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200/70 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
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

                      <button
                        type="button"
                        role="switch"
                        aria-checked={editNotifyImport}
                        onClick={() => setEditNotifyImport(!editNotifyImport)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-inner ${
                          editNotifyImport ? "bg-rose-500" : "bg-neutral-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                            editNotifyImport ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {editError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{editError}</span>
                </div>
              )}

              {/* Sticky Footer Buttons */}
              <div className="sticky bottom-0 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 px-6 sm:px-7 py-4 bg-neutral-50/90 backdrop-blur-md border-t border-neutral-200/80 flex items-center justify-between gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span>Thay đổi thông báo và liên kết Telegram sẽ có hiệu lực ngay.</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="h-10 px-4.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {editLoading ? "Đang lưu..." : <><Save size={15} /><span>Lưu Thay Đổi</span></>}
                  </button>
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
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT, Chat ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-8 text-xs font-medium bg-white rounded-xl border border-neutral-200/80 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/40 transition-all shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
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
