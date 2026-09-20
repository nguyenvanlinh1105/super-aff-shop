"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share, SquarePlus } from "lucide-react";
import { versionedAsset } from "@/lib/versionedAsset";

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_COOLDOWN_DAYS = 14;

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function IosStepsModal({ onClose }: { onClose: () => void }) {
  // Portal ra document.body: div bọc ngoài trong layout /app có class "fade-in"
  // (dùng CSS animation trên transform/opacity) tạo stacking context riêng,
  // khiến modal "fixed" lồng bên trong bị kẹt phía SAU thanh điều hướng dưới
  // (MobileBottomNav) dù z-index cao hơn — portal ra body để thoát hẳn context đó.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-md sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-xl text-center" style={{ background: "linear-gradient(135deg,#FFF5F8,#FFE4EC)" }}>
          <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="" className="mx-auto mb-sm h-14 w-14 rounded-full object-cover" />
          <h3 className="text-[17px] font-black text-gray-900">Thêm vào Màn hình chính</h3>
          <p className="mt-1 text-[12px] text-gray-500">3 bước để dùng MeowBack như một app thật trên iPhone</p>
        </div>
        <div className="flex flex-col gap-md p-xl">
          <div className="flex items-center gap-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[14px] font-black text-primary-600">
              1
            </div>
            <div className="flex items-center gap-xs text-[13px] text-neutral-700">
              Nhấn nút <Share size={16} className="text-blue-500" /> <b>Chia sẻ</b> ở thanh dưới trình duyệt Safari
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[14px] font-black text-primary-600">
              2
            </div>
            <div className="flex items-center gap-xs text-[13px] text-neutral-700">
              Chọn <SquarePlus size={16} className="text-neutral-500" /> <b>&quot;Thêm vào MH chính&quot;</b>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[14px] font-black text-primary-600">
              3
            </div>
            <div className="text-[13px] text-neutral-700">
              Nhấn <b>&quot;Thêm&quot;</b> ở góc trên bên phải màn hình
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-sm w-full rounded-2xl bg-primary-500 py-[12px] text-[14px] font-bold text-white active:scale-[0.98] transition-transform"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Banner nhắc cài app, tự hiện 1 lần rồi ẩn theo cooldown khi người dùng đóng
 * — tránh làm phiền mỗi lần vào /app. Đặt ở đầu nội dung trang, không dùng
 * fixed để không đè lên FloatingQuickAccess/MobileBottomNav.
 */
export function PwaInstallBanner() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_COOLDOWN_DAYS) return;
    }

    const p = detectPlatform();
    setPlatform(p);

    if (p === "ios") {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstallClick() {
    if (platform === "ios") {
      setShowIosSteps(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }

  if (!visible) return null;

  return (
    <>
      <div className="mb-lg flex items-center justify-between gap-md rounded-2xl border border-primary-200 bg-primary-50 p-md shadow-sm sm:p-lg">
        <div className="flex items-center gap-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-cute border border-primary-200/80">
            <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="MeowBack" className="h-8 w-8 object-cover rounded-xl" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 sm:text-[15px]">Cài đặt ứng dụng</h3>
            <p className="mt-0.5 text-[12px] text-gray-600 sm:text-[13px]">
              Cài MeowBack lên điện thoại để mở nhanh hơn, dùng như một ứng dụng thật.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            onClick={handleInstallClick}
            className="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-primary-600"
          >
            Cài đặt ngay
          </button>
          <button onClick={dismiss} className="rounded-full p-2 text-gray-400 hover:bg-black/5 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>

      {showIosSteps && (
        <IosStepsModal
          onClose={() => {
            setShowIosSteps(false);
            dismiss();
          }}
        />
      )}
    </>
  );
}

/**
 * Thẻ cài đặt cố định trong trang Cài đặt — luôn hiện để người dùng chủ động
 * cài lại bất cứ lúc nào kể cả sau khi đã đóng banner nhắc tự động.
 */
export function PwaInstallSettingsCard() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setInstalled(isStandalone());
    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstallClick() {
    if (platform === "ios") {
      setShowIosSteps(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-xl shadow-cute border border-primary-100/80">
      <div className="mb-md flex items-center gap-sm">
        <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="" className="h-9 w-9 rounded-full object-cover" />
        <h2 className="text-[15px] font-bold text-gray-900">Cài đặt ứng dụng</h2>
      </div>
      {installed ? (
        <p className="text-[13px] text-gray-500">Bạn đã cài MeowBack lên máy này rồi 🎉</p>
      ) : (
        <>
          <p className="mb-md text-[13px] leading-relaxed text-gray-400">
            Cài MeowBack lên {platform === "ios" ? "iPhone" : "điện thoại"} để mở nhanh hơn, dùng như một ứng dụng thật.
          </p>
          <button
            onClick={handleInstallClick}
            className="rounded-2xl bg-primary-500 px-lg py-[10px] text-[13px] font-bold text-white shadow-md shadow-primary-500/30 transition-transform active:scale-[0.97]"
          >
            {platform === "ios" ? "Xem hướng dẫn cài đặt" : "Cài đặt ngay"}
          </button>
        </>
      )}
      {showIosSteps && <IosStepsModal onClose={() => setShowIosSteps(false)} />}
    </div>
  );
}

/**
 * Thẻ ngang cố định dùng cho màn hình Trang chủ (Dashboard) nằm ngay dưới banner Xin chào.
 */
export function PwaInstallHorizontalCard() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setInstalled(isStandalone());
    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) return null;

  async function handleInstallClick() {
    if (platform === "ios") {
      setShowIosSteps(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-md rounded-3xl border border-primary-100/80 bg-white p-4 shadow-cute sm:p-5 hover:border-primary-300 transition-colors">
        <div className="flex items-center gap-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 shadow-cute ring-2 ring-white p-1">
            <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="MeowBack" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">Cài đặt ứng dụng</h3>
            <p className="mt-0.5 text-[13px] text-gray-500 font-medium">
              Cài MeowBack lên {platform === "ios" ? "iPhone" : "điện thoại"} để mở nhanh hơn, dùng như một ứng dụng thật.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            onClick={handleInstallClick}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary-active px-5 py-2.5 text-[14px] font-bold text-white shadow-md shadow-primary/20 hover:scale-105 transition-transform"
          >
            {platform === "ios" ? "Hướng dẫn" : "Cài đặt ngay"}
          </button>
        </div>
      </div>

      {showIosSteps && (
        <IosStepsModal
          onClose={() => setShowIosSteps(false)}
        />
      )}
    </>
  );
}
