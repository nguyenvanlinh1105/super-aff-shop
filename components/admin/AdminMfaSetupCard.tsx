"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Key,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";

export function AdminMfaSetupCard() {
  const modal = useModal();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [setupMethod, setSetupMethod] = useState<"qr" | "manual">("qr");
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [testCode, setTestCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  async function fetchSetupData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mfa/setup");
      if (res.ok) {
        const data = await res.json();
        setMfaEnabled(data.mfaEnabled);
        if (!data.mfaEnabled) {
          setSecret(data.secret || "");
          setQrCodeDataUrl(data.qrCodeDataUrl || "");
          setOtpauthUrl(data.otpauth || "");
        }
        if (data.backupCodes) setBackupCodes(data.backupCodes);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSetupData();
  }, []);

  async function handleEnableMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!testCode.trim() || testCode.length < 6) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, code: testCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setMfaEnabled(true);
        setBackupCodes(data.backupCodes);
        setTestCode("");
        toast.success(
          "Tài khoản Admin của bạn đã được bảo vệ bằng Xác thực 2 bước. Hãy lưu lại 8 mã dự phòng bên dưới.",
          "Kích hoạt 2MFA thành công!"
        );
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Mã 6 số từ Google Authenticator không chính xác.", "Mã 2MFA không đúng");
      }
    } catch (err: any) {
      toast.error(err.message, "Lỗi");
    }
    setSubmitting(false);
  }

  async function handleDisableMfa() {
    const confirmed = await modal.confirm({
      title: "Tắt Bảo mật Xác thực 2 bước (2MFA)?",
      message: "Tài khoản Admin sẽ giảm mức độ bảo vệ. Bạn có chắc chắn muốn tắt 2MFA?",
      confirmText: "Tắt 2MFA",
      cancelText: "Giữ lại 2MFA",
      iconType: "warning",
    });
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/mfa/setup", { method: "DELETE" });
      if (res.ok) {
        setMfaEnabled(false);
        fetchSetupData();
        toast.info("Đã chuyển tài khoản về xác thực 1 bước.", "Đã tắt 2MFA");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function copySecret() {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast.success("Đã sao chép khóa bí mật 2MFA! 📋", "Đã sao chép");
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    toast.success("Đã copy danh sách mã dự phòng vào bộ nhớ tạm! 📋", "Đã sao chép");
    setTimeout(() => setCopiedCodes(false), 2000);
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-7 flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-bold text-neutral-400 flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin text-rose-500" />
          <span>Đang tải cấu hình bảo mật 2MFA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-5 sm:p-7 flex flex-col justify-between h-full gap-5">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/70">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 text-white ${
              mfaEnabled
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
                : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
            }`}
          >
            {mfaEnabled ? <ShieldCheck size={22} strokeWidth={2.2} /> : <ShieldAlert size={22} strokeWidth={2.2} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                Xác Thực 2 Bước (2MFA)
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  mfaEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {mfaEnabled ? "Đã Kích Hoạt" : "Chưa Kích Hoạt"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Bảo vệ tài khoản qua Google Authenticator / Authy.
            </p>
          </div>
        </div>

        {mfaEnabled && (
          <button
            onClick={handleDisableMfa}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Tắt 2MFA
          </button>
        )}
      </div>

      {/* ─── NỘI DUNG CHÍNH (SETUP HOẶC ĐÃ BẬT) ─── */}
      {!mfaEnabled ? (
        /* UI Setup 2MFA lần đầu — TỐI ƯU RESPONSIVE MOBILE & PC */
        <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
          {/* Tab chọn cách kích hoạt: Quét QR (cho PC) vs Khóa nhập tay (cho Mobile) */}
          <div className="flex items-center bg-neutral-200/60 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setSetupMethod("qr")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                setupMethod === "qr"
                  ? "bg-white text-neutral-900 shadow-xs font-black"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <QrCode size={13} className={setupMethod === "qr" ? "text-indigo-600" : ""} />
              <span>Quét Mã QR (PC)</span>
            </button>
            <button
              type="button"
              onClick={() => setSetupMethod("manual")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                setupMethod === "manual"
                  ? "bg-white text-neutral-900 shadow-xs font-black"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Key size={13} className={setupMethod === "manual" ? "text-amber-600" : ""} />
              <span>Khóa Nhập Tay (Mobile)</span>
            </button>
          </div>

          {/* Tab 1: Quét mã QR */}
          {setupMethod === "qr" && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-1">
              <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code 2FA"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-32 h-32 bg-neutral-100 rounded-xl flex items-center justify-center text-xs font-bold text-neutral-400">
                    Đang tải QR...
                  </div>
                )}
              </div>
              <p className="text-[11.5px] text-neutral-500 text-center max-w-xs leading-relaxed">
                Mở <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại và quét mã QR ở trên.
              </p>
            </div>
          )}

          {/* Tab 2: Khóa nhập tay & 1-Chạm (Dành riêng cho người dùng duyệt trên Mobile) */}
          {setupMethod === "manual" && (
            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11.5px] text-amber-900 leading-relaxed">
                <strong>Dành cho điện thoại:</strong> Khi không thể quét màn hình hiện tại, hãy sao chép khóa bí mật bên dưới hoặc bấm nút mở ứng dụng trực tiếp.
              </div>

              {otpauthUrl && (
                <a
                  href={otpauthUrl}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer text-center"
                >
                  <Sparkles size={14} className="text-indigo-600 shrink-0" />
                  <span>Mở Trực Tiếp Trên App Authenticator (1 chạm)</span>
                </a>
              )}
            </div>
          )}

          {/* Hộp hiển thị Khóa bí mật với nút Copy 1 chạm (Không bao giờ bị vỡ dòng) */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Khóa bí mật (Secret Key):
              </span>
              <span className="font-mono text-xs font-black text-rose-600 truncate block select-all tracking-wider">
                {secret || "..."}
              </span>
            </div>
            <button
              type="button"
              onClick={copySecret}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 active:scale-95 text-neutral-700 text-xs font-bold border border-neutral-200 transition-all shrink-0 cursor-pointer"
            >
              {copiedSecret ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedSecret ? "Đã chép" : "Sao chép"}</span>
            </button>
          </div>

          {/* Form nhập mã 6 số để kích hoạt (Responsive cả ngang và dọc) */}
          <form onSubmit={handleEnableMfa} className="flex flex-col gap-2 pt-2 border-t border-neutral-200/70">
            <label className="text-xs font-bold text-neutral-800">
              Nhập mã 6 số từ app Authenticator:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="h-11 flex-1 min-w-0 rounded-xl bg-white px-3 text-center font-mono text-base font-black tracking-widest text-neutral-900 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
              <button
                type="submit"
                disabled={submitting || testCode.length < 6}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-40 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? "Đang xác nhận..." : "Kích Hoạt 2MFA"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* UI Trạng thái đã bật 2MFA & 8 Mã Dự Phòng */
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
            <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 font-medium leading-relaxed">
              Tài khoản Admin của bạn đang được bảo vệ 2 lớp. Mỗi khi đăng nhập, hệ thống sẽ yêu cầu nhập thêm mã 6 số từ Google Authenticator.
            </div>
          </div>

          {backupCodes.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/90 border border-neutral-200 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Key size={15} className="text-amber-600 shrink-0" />
                  <span className="text-xs font-black text-neutral-900">8 Mã Dự Phòng Khẩn Cấp:</span>
                </div>
                <button
                  type="button"
                  onClick={copyBackupCodes}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1 rounded-xl border border-neutral-200 shadow-2xs cursor-pointer"
                >
                  {copiedCodes ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedCodes ? "Đã sao chép" : "Sao chép mã"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs font-black text-neutral-800">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded-xl border border-neutral-200 text-center tracking-wider">
                    {code}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                <span>Mỗi mã chỉ dùng được 1 lần khi không có điện thoại. Hãy lưu giữ an toàn.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
