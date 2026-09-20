"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type ParticleType = "flower" | "petal" | "sparkle" | "bubble" | "bow";

interface FloatingItem {
  id: number;
  type: ParticleType;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  rotateEnd: number;
  sway: number;
}

// Danh sách đốm trang trí bồng bềnh nhẹ nhàng
const ITEMS: FloatingItem[] = [
  { id: 1, type: "flower", left: "6%", top: "15%", size: 24, duration: 9, delay: 0, rotateEnd: 360, sway: 15 },
  { id: 2, type: "petal", left: "14%", top: "72%", size: 18, duration: 11, delay: 1.5, rotateEnd: -240, sway: -20 },
  { id: 3, type: "sparkle", left: "22%", top: "30%", size: 16, duration: 7, delay: 0.8, rotateEnd: 180, sway: 12 },
  { id: 4, type: "bubble", left: "10%", top: "48%", size: 22, duration: 10, delay: 2.2, rotateEnd: 120, sway: -16 },
  { id: 5, type: "bow", left: "18%", top: "86%", size: 20, duration: 12, delay: 3, rotateEnd: -180, sway: 18 },

  { id: 6, type: "flower", left: "88%", top: "18%", size: 26, duration: 8.5, delay: 0.5, rotateEnd: -360, sway: -15 },
  { id: 7, type: "petal", left: "80%", top: "65%", size: 19, duration: 10.5, delay: 1.8, rotateEnd: 280, sway: 22 },
  { id: 8, type: "sparkle", left: "74%", top: "28%", size: 16, duration: 7.5, delay: 1.2, rotateEnd: -180, sway: -14 },
  { id: 9, type: "bubble", left: "92%", top: "45%", size: 24, duration: 11.5, delay: 2.5, rotateEnd: -90, sway: 16 },
  { id: 10, type: "bow", left: "82%", top: "84%", size: 21, duration: 9.5, delay: 3.5, rotateEnd: 180, sway: -18 },

  { id: 11, type: "sparkle", left: "32%", top: "12%", size: 15, duration: 8, delay: 2, rotateEnd: 180, sway: 10 },
  { id: 12, type: "petal", left: "68%", top: "10%", size: 17, duration: 10, delay: 1, rotateEnd: -200, sway: -12 },
  { id: 13, type: "bubble", left: "48%", top: "88%", size: 20, duration: 12, delay: 0.3, rotateEnd: 90, sway: 14 },
];

/**
 * Bắn pháo bông nở hoa rực rỡ chúc mừng thành công (Đăng nhập / Đăng ký)
 */
export function triggerSuccessFireworks() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;

    // Pháo bông góc trái
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.7 },
      colors: ["#FF3B7B", "#FF6D9E", "#FFB5D0", "#FFD166", "#10B981"],
      disableForReducedMotion: true,
    });

    // Pháo bông góc phải
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.7 },
      colors: ["#FF3B7B", "#FF6D9E", "#FFB5D0", "#FFD166", "#10B981"],
      disableForReducedMotion: true,
    });

    // Chùm hoa nở bung ở giữa
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 90,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#FF69B4", "#FFC0CB", "#FFD700", "#FFF0F5"],
        shapes: ["circle"],
        scalar: 1.1,
        disableForReducedMotion: true,
      });
    }, 200);
  }).catch(() => {});
}

export function BloomAndFireworkEffect() {
  const [mounted, setMounted] = useState(false);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    // Tải trước canvas-confetti trong background để khi click không có độ trễ
    import("canvas-confetti").then((mod) => {
      confettiRef.current = mod.default;
    }).catch(() => {});

    // Lắng nghe click toàn màn hình: tạo hiệu ứng nở hoa / pháo bông mini tại vị trí click
    const handleGlobalClick = (e: MouseEvent) => {
      // Bỏ qua nếu click vào các input, select, textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }

      if (confettiRef.current) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Pháo bông nở hoa mini siêu nhẹ: 14 hạt màu pastel
        confettiRef.current({
          particleCount: 14,
          spread: 50,
          startVelocity: 16,
          ticks: 45,
          origin: { x, y },
          colors: ["#FF80AA", "#FFB6C1", "#FFD700", "#FF69B4", "#FFF0F5", "#A8E6CF"],
          shapes: ["circle"],
          scalar: 0.85,
          disableForReducedMotion: true,
        });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ── 1. CÁC QUẦNG ÁNH SÁNG PASTEL NỞ HOA (AURA GLOW) ── */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-pink-300/25 via-primary-200/20 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-amber-200/20 via-pink-300/25 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-primary-100/20 blur-3xl"
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* ── 2. CÁNH HOA & BONG BÓNG PHÁO HOA BAY LƯỢN (GPU-ACCELERATED) ── */}
      {ITEMS.map((item) => (
        <motion.div
          key={item.id}
          style={{
            position: "absolute",
            left: item.left,
            top: item.top,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, item.sway, 0],
            rotate: [0, item.rotateEnd / 2, item.rotateEnd],
            scale: [0.9, 1.1, 0.9],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
          className="flex items-center justify-center filter drop-shadow-xs"
        >
          {item.type === "flower" && (
            <span style={{ fontSize: `${item.size}px` }} className="opacity-85 select-none">
              🌸
            </span>
          )}
          {item.type === "petal" && (
            <span style={{ fontSize: `${item.size}px` }} className="opacity-75 select-none">
              🌺
            </span>
          )}
          {item.type === "sparkle" && (
            <span style={{ fontSize: `${item.size}px` }} className="opacity-90 select-none">
              ✨
            </span>
          )}
          {item.type === "bubble" && (
            <div
              style={{
                width: `${item.size}px`,
                height: `${item.size}px`,
              }}
              className="rounded-full bg-gradient-to-br from-white/70 via-pink-200/40 to-primary-300/30 border border-white/60 shadow-inner backdrop-blur-[1px]"
            />
          )}
          {item.type === "bow" && (
            <span style={{ fontSize: `${item.size}px` }} className="opacity-80 select-none">
              🎀
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
