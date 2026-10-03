import type { Metadata, Viewport } from "next";
import { Quicksand, Be_Vietnam_Pro } from "next/font/google";
import { ModalProvider } from "@/components/ui/ModalProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { GlobalDragScroll } from "@/components/ui/GlobalDragScroll";
import { GlobalClickSparkle } from "@/components/ui/GlobalClickSparkle";
import "./globals.css";

const fontQuicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meowback.shop"),
  title: {
    default: "MeowBack — Hoàn Tiền Mua Sắm Shopee, Lazada & TikTok Shop",
    template: "%s | MeowBack",
  },
  description: "MeowBack — Nền tảng hoàn tiền affiliate uy tín cho Shopee, Lazada & TikTok Shop. Tự động nhận hoa hồng lên tới 80%, rút tiền từ 10.000đ. Miễn phí 100%.",
  keywords: [
    "MeowBack",
    "meowback",
    "meowback shop",
    "meowback.shop",
    "hoàn tiền meowback",
    "hoàn tiền shopee",
    "hoàn tiền lazada",
    "hoàn tiền tiktok shop",
    "affiliate hoàn tiền",
    "mua sắm hoàn tiền",
    "tích nơ hoàn tiền",
  ],
  authors: [{ name: "MeowBack", url: "https://meowback.shop" }],
  creator: "MeowBack",
  publisher: "MeowBack",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MeowBack",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6D9E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${fontQuicksand.variable}`} suppressHydrationWarning>
      <body className={`${beVietnamPro.className} selection:bg-primary-200 selection:text-primary-600`} suppressHydrationWarning>
        <ServiceWorkerRegister />
        <GlobalDragScroll />
        <ToastProvider>
          <ModalProvider>{children}</ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

