"use client";

import { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import {
  FacebookIcon,
  ZaloIcon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  ThreadsIcon,
} from "@/components/icons/PlatformIcons";
import { SUPPORT_CONFIG, getEnabledSupportChannels } from "@/lib/supportConfig";

const ICON_MAP = {
  facebook: FacebookIcon,
  zalo: ZaloIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  instagram: InstagramIcon,
  threads: ThreadsIcon,
};

function CopyPhoneButton({ raw }: { raw: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(raw);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-100 px-4 text-[13px] font-bold text-primary-600 transition-colors hover:bg-primary-200"
    >
      {copied ? (
        <Check size={14} className="text-primary-600" />
      ) : (
        <Copy size={14} />
      )}
      {copied ? "Đã copy 🎀" : "Copy số"}
    </button>
  );
}

export function SupportInfoGrid() {
  const enabledChannels = getEnabledSupportChannels();
  const hotlineConfig = SUPPORT_CONFIG.find((c) => c.key === "hotline");
  const socialChannels = enabledChannels.filter((c) => c.key !== "hotline");

  return (
    <div className="flex flex-col gap-5">
      {/* Hotline nổi bật - chỉ hiển thị nếu hotlineConfig.enabled === true */}
      {hotlineConfig?.enabled && (
        <div
          className="flex flex-col gap-4 rounded-3xl p-6 shadow-cute border border-primary-100"
          style={{
            background: "linear-gradient(135deg, #FFF5F8 0%, #FFE4EC 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-cute text-2xl">
              📞
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-primary-600">
                {hotlineConfig.label} 🎀
              </div>
              <div className="text-[22px] font-extrabold text-neutral-900 tracking-tight">
                {hotlineConfig.handle}
              </div>
            </div>
          </div>
          <p className="text-[13px] font-medium text-neutral-600">
            Gọi hoặc nhắn Zalo — hỗ trợ nhanh nhất trong giờ hành chính
          </p>
          <div className="flex items-center gap-3">
            <CopyPhoneButton raw={hotlineConfig.handle.replace(/\D/g, "")} />
            <a
              href={hotlineConfig.href}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-[13px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-[0.97]"
            >
              <Phone size={14} strokeWidth={2.5} /> Gọi ngay 🎀
            </a>
          </div>
        </div>
      )}

      {/* Grid các kênh mạng xã hội đang được BẬT */}
      {socialChannels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {socialChannels.map((c) => {
            const Icon = ICON_MAP[c.iconType as keyof typeof ICON_MAP];
            if (!Icon) return null;
            return (
              <a
                key={c.key}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-3xl bg-white p-4 shadow-cute border border-primary-100/80 transition-all hover:-translate-y-0.5 hover:shadow-cute-lg"
              >
                <div className="shrink-0 transition-transform group-hover:scale-110">
                  <Icon size={40} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-neutral-900 text-[14px]">
                    {c.label}
                  </div>
                  <div className="truncate text-[12px] font-medium text-neutral-500">
                    {c.handle}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
