"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, QrCode, Key, Lock, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";
import { useToast } from "@/components/ui/Toast";

export function AdminMfaSetupCard() {
  const modal = useModal();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [testCode, setTestCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

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

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    toast.success("Đã copy danh sách mã dự phòng vào bộ nhớ tạm! 📋", "Đã sao chép");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="p-8 text-center text-xs font-bold text-neutral-400">Đang tải cấu hình bảo mật 2MFA...</div>;
  }

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border shrink-0 text-xl ${
              mfaEnabled
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}
          >
            {mfaEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">Xác Thực 2 Bước Admin (2MFA)</h2>
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
            <p className="text-xs text-neutral-500 font-medium">Bảo vệ tài khoản Admin bằng ứng dụng Google Authenticator / Authy</p>
          </div>
        </div>

        {mfaEnabled && (
          <button
            onClick={handleDisableMfa}
            className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 transition-colors shrink-0"
          >
            Tắt 2MFA
          </button>
        )}
      </div>

      {!mfaEnabled ? (
        /* UI Setup 2MFA lần đầu */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-neutral-50 border border-neutral-200/80">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code 2FA" className="w-48 h-48 object-contain rounded-xl" />
            ) : (
              <div className="w-48 h-48 bg-neutral-100 rounded-xl flex items-center justify-center text-xs font-bold text-neutral-400">QR Code</div>
            )}
            <div className="mt-3 text-center">
              <span className="text-[11px] font-extrabold text-neutral-400 block mb-1">Mã khóa nhập tay (Secret Key):</span>
              <code className="text-xs font-mono font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 select-all">
                {secret}
              </code>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                <QrCode size={16} className="text-indigo-600" />
                <span>Hướng dẫn kích hoạt Google Authenticator:</span>
              </h3>
              <ol className="text-xs text-neutral-600 font-medium space-y-1.5 list-decimal list-inside pl-1">
                <li>Tải ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại.</li>
                <li>Mở ứng dụng, chọn <strong>Quét mã QR Code</strong> và hướng camera vào hình bên trái.</li>
                <li>Nhập mã 6 chữ số hiển thị trên ứng dụng vào ô bên dưới để xác nhận.</li>
              </ol>
            </div>

            <form onSubmit={handleEnableMfa} className="flex flex-col gap-3 pt-2 border-t border-neutral-200/60">
              <label className="text-xs font-extrabold text-neutral-800">Nhập mã 6 số chạy thử để kích hoạt:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="h-11 w-40 rounded-2xl bg-white px-4 text-center font-mono text-base font-black tracking-widest text-neutral-900 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || testCode.length < 6}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-40"
                >
                  {submitting ? "Đang xác nhận..." : "Kích Hoạt 2MFA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* UI Trạng thái đã bật 2MFA & Mã Dự Phòng */
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-900 font-medium">
              Tài khoản Admin của bạn đang được bảo vệ 2 lớp. Mỗi khi đăng nhập bằng Mật khẩu, hệ thống sẽ yêu cầu nhập thêm mã 6 số từ Google Authenticator.
            </div>
          </div>

          {backupCodes.length > 0 && (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-amber-600" />
                  <span className="text-xs font-extrabold text-neutral-900">8 Mã Dự Phòng Khẩn Cấp (Backup Codes):</span>
                </div>
                <button
                  onClick={copyBackupCodes}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1 rounded-xl border border-neutral-200 shadow-2xs"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? "Đã sao chép" : "Sao chép tất cả mã"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs font-black text-neutral-800">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded-xl border border-neutral-200 text-center tracking-wider">
                    {code}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                <span>Mỗi mã dự phòng dùng được 1 lần duy nhất khi bạn không có điện thoại bên cạnh. Hãy lưu lại cẩn thận.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
