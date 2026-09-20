"use client";

import { useEffect, useRef } from "react";

/**
 * Hiệu ứng pháo bông mini khi click — nhẹ, chỉ bắn confetti tại vị trí
 * click. Bỏ qua input/textarea/select để không gây phiền khi nhập liệu.
 * 
 * Đặt component này 1 lần duy nhất ở layout gốc.
 */
export function GlobalClickSparkle() {
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Preload canvas-confetti
    import("canvas-confetti")
      .then((mod) => {
        confettiRef.current = mod.default;
      })
      .catch(() => {});

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Bỏ qua input, textarea, select — không nổ pháo khi đang gõ
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Chỉ nổ khi click vào button, link, hoặc phần tử có role="button"
      const isInteractive =
        tag === "BUTTON" ||
        tag === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.closest("[role='button']");

      if (!isInteractive) return;
      if (!confettiRef.current) return;

      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      confettiRef.current({
        particleCount: 12,
        spread: 45,
        startVelocity: 18,
        ticks: 40,
        origin: { x, y },
        colors: ["#FF80AA", "#FFB6C1", "#FFD700", "#FF69B4", "#FFF0F5", "#A8E6CF"],
        shapes: ["circle"],
        scalar: 0.8,
        gravity: 1.2,
        disableForReducedMotion: true,
      });
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return null;
}
