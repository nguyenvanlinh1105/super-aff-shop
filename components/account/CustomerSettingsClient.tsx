"use client";

import { useEffect, useState } from "react";
import { User, Lock, KeyRound, Bell, Send } from "lucide-react";
import { isPushNotificationSupported } from "@/lib/pushClient";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { PaymentPinSettings } from "./PaymentPinSettings";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { PushNotificationPrompt } from "@/components/pwa/PushNotificationPrompt";
import { TelegramLinkCard } from "@/components/customer/TelegramLinkCard";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";

interface CustomerSettingsClientProps {
  initialProfile: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
  customer: {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    isPartner: boolean;
    hasPaymentPin?: boolean;
    hasBankInfo?: boolean;
    hasTelegram?: boolean;
    phone?: string | null;
  };
  hasPin: boolean;
  defaultTab?: string;
}

export function CustomerSettingsClient({
  initialProfile,
  customer,
  hasPin,
  defaultTab,
}: CustomerSettingsClientProps) {
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    setPushSupported(isPushNotificationSupported());
  }, []);
  // Tự động cuộn mượt mà đến khu vực mong muốn nếu có defaultTab hoặc hash trên URL
  useEffect(() => {
    if (defaultTab && defaultTab !== "profile") {
      const tabMap: Record<string, string> = {
        security: "pin-security",
        pin: "pin-security",
        password: "password-security",
        notifications: "notifications",
        telegram: "telegram-integration",
        integrations: "notifications",
      };
      const targetId = tabMap[defaultTab] || defaultTab;
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }, [defaultTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start pb-28 sm:pb-14">
      {/* ═══════════════════════════════════════════════════════════
          CỘT 1 (BÊN TRÁI): HỒ SƠ, THÔNG TIN CÁ NHÂN & ỨNG DỤNG
         ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-6 w-full">
        {/* Khối 1.1: Thẻ thành viên VIP MeowBack */}
        <ProfileSummaryCard customer={customer} />

        {/* Khối 1.2: Chi tiết hồ sơ cá nhân */}
        <section
          id="profile"
          className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-4 sm:p-6 lg:p-7 scroll-mt-24"
        >
          <div className="flex items-start sm:items-center gap-3 pb-4 mb-4 sm:pb-5 sm:mb-5 border-b border-neutral-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
              <User size={19} strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                  Chi tiết hồ sơ
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-primary-100/80 text-primary-700 whitespace-nowrap shrink-0">
                  Cá nhân
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-0.5 leading-relaxed">
                Cập nhật họ và tên, số điện thoại và nơi ở hiện tại
              </p>
            </div>
          </div>

          <ProfileInfoForm initialData={initialProfile} />
        </section>

        {/* Khối 1.3: Cài đặt ứng dụng MeowBack lên điện thoại */}
        <div id="app-install" className="scroll-mt-24">
          <PwaInstallSettingsCard />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CỘT 2 (BÊN PHẢI): BẢO MẬT TÀI KHOẢN, THÔNG BÁO & TIỆN ÍCH
         ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-6 w-full">
        {/* Khối 2.1: Mã PIN rút tiền 6 số */}
        <section
          id="pin-security"
          className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-4 sm:p-6 lg:p-7 scroll-mt-24"
        >
          <div className="flex items-start sm:items-center gap-3 pb-4 mb-4 sm:pb-5 sm:mb-5 border-b border-neutral-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <KeyRound size={19} strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                  Mã PIN rút tiền (6 số)
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                    hasPin
                      ? "bg-emerald-100/80 text-emerald-700"
                      : "bg-amber-100/80 text-amber-800"
                  }`}
                >
                  {hasPin ? "Đã bật bảo vệ" : "Chưa cài PIN"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-0.5 leading-relaxed">
                Bảo vệ số dư ví khi thực hiện các yêu cầu rút tiền về ngân hàng
              </p>
            </div>
          </div>

          <PaymentPinSettings hasPin={hasPin} />
        </section>

        {/* Khối 2.2: Đổi mật khẩu tài khoản */}
        <section
          id="password-security"
          className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-4 sm:p-6 lg:p-7 scroll-mt-24"
        >
          <div className="flex items-start sm:items-center gap-3 pb-4 mb-4 sm:pb-5 sm:mb-5 border-b border-neutral-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock size={19} strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                Đổi mật khẩu tài khoản
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5 leading-relaxed">
                Nên đổi mật khẩu định kỳ để giữ tài khoản luôn an toàn
              </p>
            </div>
          </div>

          <ChangePasswordForm />
        </section>

        {/* Khối 2.3: Cài đặt nhận thông báo thiết bị (Bật / Tắt thông báo) - Ẩn hoàn toàn nếu trình duyệt không hỗ trợ */}
        {pushSupported && (
          <section
            id="notifications"
            className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-4 sm:p-6 lg:p-7 scroll-mt-24"
          >
            <div className="flex items-start sm:items-center gap-3 pb-4 mb-4 sm:pb-5 sm:mb-5 border-b border-neutral-100">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Bell size={19} strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                    Cài đặt nhận thông báo
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100/80 text-rose-700 whitespace-nowrap shrink-0">
                    Thiết bị
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-0.5 leading-relaxed">
                  Quản lý bật hoặc tắt nhận thông báo hoàn tiền &amp; đơn hàng trên thiết bị này
                </p>
              </div>
            </div>

            <PushNotificationPrompt inSettings />
          </section>
        )}

        {/* Khối 2.4: Tiện ích Telegram Bot */}
        <section
          id="telegram-integration"
          className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-4 sm:p-6 lg:p-7 scroll-mt-24"
        >
          <div className="flex items-start sm:items-center gap-3 pb-4 mb-4 sm:pb-5 sm:mb-5 border-b border-neutral-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Send size={19} strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-snug">
                  Liên kết Telegram Bot
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-100/80 text-sky-700 whitespace-nowrap shrink-0">
                  Thông báo tức thì
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-0.5 leading-relaxed">
                Nhận tin nhắn hoa hồng tức thì và tra cứu số dư trực tiếp qua Telegram
              </p>
            </div>
          </div>

          <TelegramLinkCard />
        </section>
      </div>
    </div>
  );
}
