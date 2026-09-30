"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share, SquarePlus, MoreVertical, Download, Sparkles, Smartphone, CheckCircle2 } from "lucide-react";
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

/**
 * Modal Hướng dẫn cài đặt PWA đa nền tảng (Hỗ trợ cả iOS Safari và Android Chrome).
 * Có 2 tab chuyển đổi trực quan, tự phát hiện hệ điều hành của người dùng.
 */
export function PwaInstallGuideModal({
  initialPlatform = "ios",
  deferredPrompt,
  onClose,
}: {
  initialPlatform?: Platform;
  deferredPrompt?: any;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">(() =>
    initialPlatform === "android" ? "android" : "ios"
  );

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  async function handleDirectAndroidInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          onClose();
        }
      } catch {}
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Tối ưu không gian phía trên, không chiếm diện tích */}
        <div
          className="relative px-4 pt-3.5 pb-2.5 shrink-0"
          style={{ background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 100%)" }}
        >
          {/* Row 1: Mascot + Title + Close Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <img
                src={versionedAsset("/meowback_lucky_cat_logo.png")}
                alt=""
                className="h-8 w-8 rounded-xl object-cover shadow-xs border border-white"
              />
              <div>
                <h3 className="text-[15px] font-black text-neutral-900 leading-tight">
                  Cài đặt MeowBack
                </h3>
                <p className="text-[11px] font-semibold text-neutral-500">
                  Dùng mượt như app thật, không tốn bộ nhớ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
              title="Đóng"
            >
              <X size={15} />
            </button>
          </div>

          {/* Segmented Control / Tabs: iPhone vs Android gọn gàng */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-primary-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("ios")}
              className={`py-1.5 px-3 rounded-lg text-[13px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ios"
                  ? "bg-gradient-to-r from-primary-500 to-[#FF3B7B] text-white shadow-cute"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span>iPhone</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`py-1.5 px-3 rounded-lg text-[13px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "android"
                  ? "bg-gradient-to-r from-primary-500 to-[#FF3B7B] text-white shadow-cute"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <span>Android</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Nhỏ gọn, vừa vặn màn hình không bị scroll */}
        <div className="p-3.5 space-y-2">
          {activeTab === "ios" ? (
            /* TAB IPHONE */
            <div className="space-y-2">
              {/* Bước 1 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  1
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Mở Safari, nhấn biểu tượng <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs mx-0.5"><Share size={11} /> Chia sẻ</span> ở thanh dưới.
                </span>
              </div>

              {/* Bước 2 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  2
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Cuộn chọn <span className="inline-flex items-center gap-1 font-bold text-neutral-800 bg-white px-1.5 py-0.5 rounded border border-neutral-300 shadow-2xs mx-0.5"><SquarePlus size={11} /> Thêm vào MH chính</span>.
                </span>
              </div>

              {/* Bước 3 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  3
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Nhấn <strong className="text-primary-600 font-black bg-white px-1.5 py-0.5 rounded border border-primary-200 mx-0.5">Thêm</strong> ở góc trên bên phải là xong! 🐾
                </span>
              </div>

              {/* Mẹo nhỏ in-app */}
              <div className="rounded-xl bg-amber-50/90 px-2.5 py-1.5 border border-amber-200/80 text-[10.5px] text-amber-900 flex items-center gap-1.5">
                <span className="shrink-0 text-xs">💡</span>
                <span>Mở từ Zalo/FB? Bấm <strong>(...)</strong> chọn <strong>&quot;Mở bằng Safari&quot;</strong> trước.</span>
              </div>
            </div>
          ) : (
            /* TAB ANDROID */
            <div className="space-y-2">
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleDirectAndroidInstall}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[12.5px] shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Cài đặt ứng dụng ngay (1 chạm) ⚡</span>
                </button>
              )}

              {/* Bước 1 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  1
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Mở Chrome, nhấn biểu tượng <span className="inline-flex items-center gap-0.5 font-bold text-neutral-800 bg-white px-1.5 py-0.5 rounded border border-neutral-300 shadow-2xs mx-0.5"><MoreVertical size={11} /> 3 chấm (⋮)</span> ở góc trên.
                </span>
              </div>

              {/* Bước 2 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  2
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Chọn <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs mx-0.5"><Download size={11} /> Cài đặt ứng dụng</span> (hoặc Thêm vào MH chính).
                </span>
              </div>

              {/* Bước 3 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-primary-50/40 border border-primary-100/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-black text-primary-600">
                  3
                </span>
                <span className="text-[12px] text-neutral-700 font-medium leading-snug">
                  Nhấn <strong className="text-emerald-700 font-black bg-white px-1.5 py-0.5 rounded border border-emerald-200 mx-0.5">Cài đặt</strong> để đưa icon ra màn hình chính! 🐾
                </span>
              </div>

              {/* Mẹo nhỏ in-app */}
              <div className="rounded-xl bg-amber-50/90 px-2.5 py-1.5 border border-amber-200/80 text-[10.5px] text-amber-900 flex items-center gap-1.5">
                <span className="shrink-0 text-xs">💡</span>
                <span>Mở từ Zalo/FB? Bấm <strong>(...)</strong> chọn <strong>&quot;Mở bằng Chrome&quot;</strong> trước.</span>
              </div>
            </div>
          )}

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 py-2.5 text-[13px] font-black text-white active:scale-[0.98] transition-all shadow-cute hover:shadow-cute-lg cursor-pointer mt-1"
          >
            Đã hiểu rồi 🐾
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Alias giữ tương thích ngược với các file cũ nếu có
export const IosStepsModal = PwaInstallGuideModal;

/**
 * Banner nhắc cài app, tự hiện 1 lần rồi ẩn theo cooldown khi người dùng đóng.
 */
export function PwaInstallBanner() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [visible, setVisible] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
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
      setShowGuideModal(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
          setVisible(false);
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
          return;
        }
      } catch {}
    }
    // Nếu không có prompt tự động hoặc user cần xem các bước, mở modal hướng dẫn
    setShowGuideModal(true);
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
            <h3 className="text-[14px] font-bold text-gray-900 sm:text-[15px]">Cài đặt ứng dụng MeowBack</h3>
            <p className="mt-0.5 text-[12px] text-gray-600 sm:text-[13px]">
              Cài lên điện thoại (iPhone &amp; Android) để mở nhanh hơn, dùng mượt mà như app thật.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            onClick={handleInstallClick}
            className="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-primary-600 cursor-pointer"
          >
            Xem hướng dẫn
          </button>
          <button onClick={dismiss} className="rounded-full p-2 text-gray-400 hover:bg-black/5 hover:text-gray-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      {showGuideModal && (
        <PwaInstallGuideModal
          initialPlatform={platform || "ios"}
          deferredPrompt={deferredPrompt}
          onClose={() => {
            setShowGuideModal(false);
            dismiss();
          }}
        />
      )}
    </>
  );
}

/**
 * Thẻ cài đặt cố định trong trang Cài đặt (CustomerSettingsClient).
 */
export function PwaInstallSettingsCard() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<"ios" | "android">("ios");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setInstalled(isStandalone());
    const detected = detectPlatform();
    setPlatform(detected);
    setModalInitialTab(detected === "android" ? "android" : "ios");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleOpenGuide(target: "ios" | "android") {
    setModalInitialTab(target);
    setShowGuideModal(true);
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-cute border border-primary-100/80">
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-neutral-100">
        <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 shadow-2xs">
          <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="" className="h-8 w-8 rounded-xl object-cover" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">Cài đặt ứng dụng MeowBack</h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">Trải nghiệm mượt mà như app gốc ngay trên màn hình chính</p>
        </div>
      </div>
      {installed ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-[13px] font-bold text-emerald-800 flex items-center gap-2">
          <span>🎉</span> Bạn đã cài đặt ứng dụng MeowBack lên thiết bị này rồi!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px] leading-relaxed text-neutral-600 font-medium">
            Cài đặt MeowBack lên điện thoại (hỗ trợ cả <strong>iPhone</strong> &amp; <strong>Android</strong>) giúp bạn mở ứng dụng nhanh chóng chỉ với 1 chạm, nhận thông báo tiền hoàn và mua sắm tiện lợi hơn.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="rounded-full bg-gradient-to-r from-primary-400 to-primary-500 px-7 py-3 text-[14px] font-bold text-white shadow-cute hover:shadow-cute-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Hướng dẫn cài đặt</span>
            </button>
          </div>
        </div>
      )}
      {showGuideModal && (
        <PwaInstallGuideModal
          initialPlatform={modalInitialTab}
          deferredPrompt={deferredPrompt}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}

/**
 * Thẻ ngang cố định dùng cho màn hình Trang chủ (Dashboard) nằm ngay dưới banner Xin chào.
 */
export function PwaInstallHorizontalCard() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [installed, setInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
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
      setShowGuideModal(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
          return;
        }
      } catch {}
    }
    setShowGuideModal(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 rounded-3xl border border-primary-100/80 bg-white p-4 shadow-cute sm:p-5 hover:border-primary-300 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 shadow-cute ring-2 ring-white p-1">
            <img src={versionedAsset("/meowback_lucky_cat_logo.png")} alt="MeowBack" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold text-neutral-900 tracking-tight">Cài đặt ứng dụng MeowBack</h3>
            <p className="mt-0.5 text-[12.5px] sm:text-[13px] text-neutral-500 font-medium leading-relaxed">
              Cài lên điện thoại (iPhone &amp; Android) để mở nhanh hơn, dùng mượt mà như app thật.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 w-full sm:w-auto">
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary to-primary-active px-5 py-2.5 text-[13.5px] sm:text-[14px] font-bold text-white shadow-md shadow-primary/20 hover:scale-[1.02] sm:hover:scale-105 active:scale-98 transition-all cursor-pointer text-center"
          >
            Hướng dẫn cài đặt
          </button>
        </div>
      </div>

      {showGuideModal && (
        <PwaInstallGuideModal
          initialPlatform={platform}
          deferredPrompt={deferredPrompt}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
}
