import type { Metadata, Viewport } from "next";
import { Quicksand, Be_Vietnam_Pro } from "next/font/google";
import { ModalProvider } from "@/components/ui/ModalProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
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
  metadataBase: new URL("https://meowback.vn"),
  title: {
    default: "MeowBack — Hoàn Tiền Mua Sắm Shopee & TikTok Shop",
    template: "%s | MeowBack",
  },
  description: "MeowBack — Nền tảng hoàn tiền affiliate uy tín cho Shopee & TikTok Shop. Tự động nhận hoa hồng lên tới 80%, rút tiền từ 10.000đ. Miễn phí 100%.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MeowBack",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/icon-192.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6D9E",
  width: "device-width",
  initialScale: 1,
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
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}

