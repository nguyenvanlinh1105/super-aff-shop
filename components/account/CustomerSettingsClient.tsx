"use client";

import { useEffect } from "react";
import { User, Lock, Send } from "lucide-react";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { TelegramLinkCard } from "@/components/customer/TelegramLinkCard";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";

interface CustomerSettingsClientProps {
  initialProfile: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
  defaultTab?: string;
}

export function CustomerSettingsClient({
  initialProfile,
  defaultTab,
}: CustomerSettingsClientProps) {
  // Tự động cuộn đến khu vực mong muốn nếu có defaultTab hoặc hash
  useEffect(() => {
    if (defaultTab && defaultTab !== "profile") {
      const targetId = defaultTab === "security" ? "password-security" : defaultTab;
      const el = document.getElementById(targetId) || document.getElementById(defaultTab);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [defaultTab]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ═══════════════════════════════════════════════════════════
          1. CHI TIẾT HỒ SƠ & THÔNG TIN CÁ NHÂN
         ═══════════════════════════════════════════════════════════ */}
      <section
        id="profile"
        className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-6 sm:p-8 scroll-mt-24 transition-all"
      >
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
            <User size={22} strokeWidth={2.3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Chi tiết hồ sơ
              </h2>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary-100/80 text-primary-700">
                Cá nhân
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              Cập nhật họ và tên, số điện thoại và nơi ở hiện tại của bạn
            </p>
          </div>
        </div>

        <ProfileInfoForm initialData={initialProfile} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. ĐỔI MẬT KHẨU TÀI KHOẢN
         ═══════════════════════════════════════════════════════════ */}
      <section
        id="password-security"
        className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-6 sm:p-8 scroll-mt-24"
      >
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
            <Lock size={22} strokeWidth={2.3} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Đổi mật khẩu tài khoản
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              Nên đổi mật khẩu định kỳ để giữ tài khoản luôn trong trạng thái an toàn
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. TIỆN ÍCH & KẾT NỐI MỞ RỘNG
         ═══════════════════════════════════════════════════════════ */}
      <section id="integrations" className="flex flex-col gap-6 scroll-mt-24">
        {/* Card 3.1: Telegram */}
        <div className="bg-white rounded-3xl border border-primary-100/90 shadow-cute p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Send size={22} strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Liên kết Telegram Bot
                </h2>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700">
                  Thông báo tức thì
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                Nhận thông báo hoa hồng tức thì và tra cứu số dư nhanh chóng trực tiếp qua Telegram
              </p>
            </div>
          </div>

          <TelegramLinkCard />
        </div>

        {/* Card 3.2: PWA Install */}
        <PwaInstallSettingsCard />
      </section>
    </div>
  );
}
