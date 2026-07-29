"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const GALLERY_SLIDES = [
  {
    id: 1,
    image: "/meowback_gallery_1.png",
    alt: "MeowBack Web Dashboard Mockup",
    caption: "Dashboard Hoàn Tiền Tự Động 🎀",
  },
  {
    id: 2,
    image: "/meowback_gallery_2.png",
    alt: "MeowBack Mobile App Mockup",
    caption: "Dán Link Nhận Tiền Shopee & TikTok",
  },
  {
    id: 3,
    image: "/meowback_gallery_3.png",
    alt: "Mèo Thần Tài Chiêu Tài Lộc",
    caption: "Mèo Thần Tài Tích Lũy Hoa Hồng",
  },
];

export function HeroGallerySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
  };

  return (
    <div
      className="relative w-full max-w-md md:max-w-lg lg:max-w-xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Expanded Slider Container */}
      <div className="relative aspect-[4/3.3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary-100/60 via-white to-primary-50 p-2.5 shadow-cute-lg border-2 border-primary-200/80">
        {GALLERY_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-2.5 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="h-full w-full object-cover rounded-2xl shadow-sm hover:scale-[1.015] transition-transform duration-500"
            />
          </div>
        ))}

        {/* Top-Right Indicator Dots (Glassmorphism Capsule - Zero Collision) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-neutral-900/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/40 shadow-sm">
          {GALLERY_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-primary-500" : "w-2 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Badge Overlay (Generous Padding & Positioned cleanly at bottom left) */}
      <div className="absolute -bottom-4 left-3 md:left-6 bg-white/95 backdrop-blur-md px-6 md:px-7 py-3 rounded-full md:rounded-2xl border-2 border-primary-200/90 shadow-cute-lg flex items-center gap-3 z-30">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-black text-xs shrink-0">
          80%
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-black text-neutral-950 leading-tight">
            Tự động nhận hoa hồng 80%
          </span>
          <span className="text-[11px] font-bold text-primary-600 flex items-center gap-1 mt-0.5">
            <Sparkles size={11} /> {GALLERY_SLIDES[currentIndex].caption}
          </span>
        </div>
      </div>
    </div>
  );
}
