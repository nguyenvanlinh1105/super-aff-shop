"use client";

import { useState } from "react";
import { User, ShieldCheck, Sparkles, KeyRound, Lock, Send } from "lucide-react";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { PaymentPinSettings } from "./PaymentPinSettings";
import { TelegramLinkCard } from "@/components/customer/TelegramLinkCard";
import { PwaInstallSettingsCard } from "@/components/pwa/PwaInstallPrompt";

type TabKey = "profile" | "security" | "integrations";

interface CustomerSettingsClientProps {
  initialProfile: {
    fullName: string;
    phone: string;
    address: string;
    email: string;
  };
  hasPaymentPin: boolean;
  defaultTab?: TabKey;
}

export function CustomerSettingsClient({
  initialProfile,
  hasPaymentPin,
  defaultTab = "profile",
}: CustomerSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const tabs: {
    key: TabKey;
    label: string;
    shortLabel: string;
    icon: any;
    badge?: string;
    badgeTone?: "amber" | "emerald";
  }[] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      shortLabel: "Hồ sơ",
      icon: User,
    },
    {
      key: "security",
      label: "Bảo mật & Mã PIN",
      shortLabel: "Bảo mật",
      icon: ShieldCheck,
      badge: hasPaymentPin ? "Đã bật PIN" : "Chưa cài PIN",
      badgeTone: hasPaymentPin ? "emerald" : "amber",
    },
    {
      key: "integrations",
      label: "Tiện ích & Ứng dụng",
      shortLabel: "Tiện ích",
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Segmented Navigation Tabs ── */}
      <div className="w-full bg-white/90 backdrop-blur-md p-1.5 rounded-2xl sm:rounded-full border border-primary-100/90 shadow-cute flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-full text-[13px] sm:text-[14px] font-extrabold transition-all shrink-0 cursor-pointer select-none ${
                isActive
                  ? "bg-gradient-to-r from-primary-400 via-primary-500 to-pink-500 text-white shadow-cute"
                  : "bg-transparent text-neutral-600 hover:text-primary-600 hover:bg-primary-50/60"
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-neutral-500"} />
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
              <span className="inline sm:hidden whitespace-nowrap">{tab.shortLabel}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap ${
                    isActive
                      ? "bg-white/25 text-white"
                      : tab.badgeTone === "emerald"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/70"
                      : "bg-amber-50 text-amber-600 border border-amber-200/70"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Profile Info ── */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-primary-100/80 shadow-cute p-6 sm:p-8 fade-in">
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
              <User size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">Chi tiết hồ sơ</h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Cập nhật họ và tên, số điện thoại và địa chỉ nhận quà / đối soát đơn hàng
              </p>
            </div>
          </div>

          <ProfileInfoForm initialData={initialProfile} />
        </div>
      )}

      {/* ── Tab 2: Security & PIN ── */}
      {activeTab === "security" && (
        <div className="flex flex-col gap-6 fade-in">
          {/* Card 1: Payment PIN */}
          <div className="bg-white rounded-3xl border border-primary-100/80 shadow-cute p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Mã PIN rút tiền (6 số)
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Bảo vệ số dư ví tiền của bạn khi thực hiện rút tiền về ngân hàng
                </p>
              </div>
            </div>

            <PaymentPinSettings hasPin={hasPaymentPin} />
          </div>

          {/* Card 2: Password Change */}
          <div className="bg-white rounded-3xl border border-primary-100/80 shadow-cute p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
              <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 text-primary-500 flex items-center justify-center shrink-0 shadow-2xs">
                <Lock size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Đổi mật khẩu tài khoản
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Nên đổi mật khẩu định kỳ để giữ tài khoản luôn trong trạng thái an toàn
                </p>
              </div>
            </div>

            <ChangePasswordForm />
          </div>
        </div>
      )}

      {/* ── Tab 3: Integrations & Apps ── */}
      {activeTab === "integrations" && (
        <div className="flex flex-col gap-6 fade-in">
          {/* Card 1: Telegram */}
          <div className="bg-white rounded-3xl border border-primary-100/80 shadow-cute p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-neutral-100">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Send size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Liên kết Telegram Bot
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Nhận thông báo hoa hồng tức thì và tra cứu số dư nhanh chóng trực tiếp qua Telegram
                </p>
              </div>
            </div>

            <TelegramLinkCard />
          </div>

          {/* Card 2: PWA Install */}
          <PwaInstallSettingsCard />
        </div>
      )}
    </div>
  );
}
