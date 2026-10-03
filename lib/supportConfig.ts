export interface SupportChannelConfig {
  key: string;
  label: string;
  handle: string;
  href: string;
  enabled: boolean; // Flag to enable/disable showing this channel
  iconType:
    | "hotline"
    | "facebook"
    | "zalo"
    | "youtube"
    | "tiktok"
    | "instagram"
    | "threads";
  badgeColor?: string;
  gradient?: string;
}

export const SUPPORT_CONFIG: SupportChannelConfig[] = [
  {
    key: "hotline",
    label: "Hotline Hỗ Trợ",
    handle: "0387.092.630",
    href: "tel:0387092630",
    enabled: process.env.NEXT_PUBLIC_SHOW_SUPPORT_HOTLINE === "true", // default: false (tạm ẩn)
    iconType: "hotline",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    key: "zalo",
    label: "Zalo MeowBack",
    handle: "Cộng đồng Zalo",
    href: "https://zalo.me/g/cgmmvw394",
    enabled:
      process.env.NEXT_PUBLIC_SHOW_SUPPORT_ZALO === "true" ||
      process.env.NEXT_PUBLIC_SHOW_SUPPORT_ZALO === undefined, // default: true
    iconType: "zalo",
    gradient: "from-blue-500 to-sky-600",
  },
  {
    key: "tiktok",
    label: "TikTok MeowBack",
    handle: "@meowback.official",
    href: "https://www.tiktok.com/@meowback.official",
    enabled:
      process.env.NEXT_PUBLIC_SHOW_SUPPORT_TIKTOK === "true" ||
      process.env.NEXT_PUBLIC_SHOW_SUPPORT_TIKTOK === undefined, // default: true
    iconType: "tiktok",
    gradient: "from-neutral-900 to-neutral-800",
  },
  {
    key: "facebook",
    label: "Facebook Fanpage",
    handle: "Fanpage MeowBack",
    href: "https://www.facebook.com/meowback.official",
    enabled: process.env.NEXT_PUBLIC_SHOW_SUPPORT_FACEBOOK === "true", // default: false
    iconType: "facebook",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    key: "youtube",
    label: "YouTube MeowBack",
    handle: "@meowback.official",
    href: "https://youtube.com/@meowback.official",
    enabled: process.env.NEXT_PUBLIC_SHOW_SUPPORT_YOUTUBE === "true", // default: false
    iconType: "youtube",
    gradient: "from-red-600 to-rose-700",
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@meowback.official",
    href: "https://www.instagram.com/meowback.official",
    enabled: process.env.NEXT_PUBLIC_SHOW_SUPPORT_INSTAGRAM === "true", // default: false
    iconType: "instagram",
    gradient: "from-purple-600 via-pink-600 to-amber-500",
  },
  {
    key: "threads",
    label: "Threads",
    handle: "@meowback.official",
    href: "https://www.threads.com/@meowback.official",
    enabled: process.env.NEXT_PUBLIC_SHOW_SUPPORT_THREADS === "true", // default: false
    iconType: "threads",
    gradient: "from-neutral-950 to-neutral-800",
  },
];

/**
 * Returns only the support channels where enabled flag is true
 */
export function getEnabledSupportChannels(): SupportChannelConfig[] {
  return SUPPORT_CONFIG.filter((c) => c.enabled);
}
