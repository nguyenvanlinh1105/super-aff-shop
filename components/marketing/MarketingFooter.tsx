import Link from "next/link";
import { Phone } from "lucide-react";
import {
  FacebookIcon,
  ZaloIcon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  ThreadsIcon,
} from "@/components/icons/PlatformIcons";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

const SOCIAL_LINKS = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/meowback.official",
    Icon: FacebookIcon,
  },
  {
    key: "zalo",
    label: "Zalo",
    href: "https://zalo.me/g/cgmmvw394",
    Icon: ZaloIcon,
  },
  {
    key: "youtube",
    label: "Youtube",
    href: "https://youtube.com/@meowback.official",
    Icon: YoutubeIcon,
  },
  {
    key: "tiktok",
    label: "Tiktok",
    href: "https://www.tiktok.com/@meowback.official",
    Icon: TiktokIcon,
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/meowback.official",
    Icon: InstagramIcon,
  },
  {
    key: "threads",
    label: "Threads",
    href: "https://www.threads.com/@meowback.official",
    Icon: ThreadsIcon,
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-primary-50/60 border-t border-primary-100">
      <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-12">
        {/* Brand & Info */}
        <div className="space-y-4 max-w-sm">
          <LogoMeowBack />
          <p className="text-neutral-600 text-[14px] leading-relaxed font-medium">
            MeowBack 🎀 Nơ Mèo Hoàn Tiền — Hoàn tiền dễ như mèo vờn cuộn len 🧶.
            Nền tảng hoàn tiền affiliate mua sắm Shopee, Lazada & TikTok Shop hàng đầu Việt Nam.
          </p>
          <div className="space-y-2">
            <h5 className="font-extrabold text-[14px] text-neutral-900">
              Kết nối với chúng tôi
            </h5>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="transition-transform hover:scale-110"
                >
                  <Icon size={32} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-3">
            <h5 className="font-extrabold text-[16px] text-neutral-900">
              Hỗ trợ
            </h5>
            <ul className="space-y-2 text-neutral-600 font-medium text-[14px]">
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/huong-dan"
                >
                  Hướng dẫn nhận hoàn tiền
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/faq"
                >
                  Trung tâm trợ giúp (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/dieu-khoan-su-dung"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/chinh-sach-bao-mat"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-extrabold text-[16px] text-neutral-900">
              Hành động
            </h5>
            <ul className="space-y-2 text-neutral-600 font-medium text-[14px]">
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/login"
                >
                  Đăng nhập ngay 🐾
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary-600 hover:translate-x-1 inline-block transition-all"
                  href="/register"
                >
                  Tạo tài khoản 🎀
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-100 px-6 py-4 bg-white">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-neutral-500 font-medium text-[13px]">
            © {new Date().getFullYear()} MeowBack - Nơ Mèo Hoàn Tiền. Bản quyền
            thuộc về MeowBack.
          </p>
        </div>
      </div>
    </footer>
  );
}
