"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem("mb_vid");
    if (!vid) {
      // Tìm trong document.cookie
      const match = document.cookie.match(/(?:^|;\s*)mb_vid=([^;]+)/);
      if (match) {
        vid = match[1];
      } else {
        vid = crypto.randomUUID();
      }
      localStorage.setItem("mb_vid", vid);
    }
    return vid;
  } catch {
    return "";
  }
}

export function UserActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Không track các đường dẫn nội bộ admin nếu muốn phân tách,
    // hoặc vẫn track nhưng đánh dấu rõ (ở đây track hết để admin biết)
    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Tránh gửi duplicate nếu path không thay đổi
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    const visitorId = getOrCreateVisitorId();
    const title = typeof document !== "undefined" ? document.title : "";
    const referer = typeof document !== "undefined" ? document.referrer : "";
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    const payload = JSON.stringify({
      path: fullPath,
      title,
      referer,
      visitorId,
      screenWidth,
    });

    // Ưu tiên navigator.sendBeacon (cực nhẹ, không chặn unmount/navigation)
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/track", blob);
      if (sent) return;
    }

    // Fallback qua fetch keepalive
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, [pathname, searchParams]);

  return null;
}
