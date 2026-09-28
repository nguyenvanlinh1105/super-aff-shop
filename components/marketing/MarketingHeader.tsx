"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogoMeowBack } from "@/components/icons/CatRibbonIcons";

const NAV_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Ưu đãi 🎀", href: "/uu-dai" },
  { label: "Hướng dẫn", href: "/huong-dan" },
  { label: "FAQ", href: "/faq" },
];

export function MarketingHeader({ activePath = "/" }: { activePath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-primary-100/80 shadow-cute">
      <nav className="flex justify-between items-center w-full px-5 md:px-10 py-0 max-w-[1200px] mx-auto h-16">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="hover:scale-[1.02] transition-transform"
        >
          <LogoMeowBack />
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-[14px] font-extrabold px-4 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 text-white shadow-cute scale-105"
                    : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── CTA + Hamburger ── */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/app"
              className="bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full px-4 py-2 font-bold text-[14px] whitespace-nowrap shadow-cute hover:shadow-cute-lg hover:scale-[1.02] transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              <span>Vào ứng dụng 🐾</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full px-3 py-2 font-bold text-[14px] whitespace-nowrap shadow-cute hover:shadow-cute-lg hover:scale-[1.02] transition-all duration-200 active:scale-95 flex items-center gap-1.5"
            >
              Đăng nhập 
            </Link>
          )}

          {/* Hamburger (mobile only) */}
          <button
            className="flex md:hidden flex-col justify-center items-center w-9 h-9 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-4 h-0.5 bg-primary-500 rounded-full transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block w-4 h-0.5 bg-primary-500 rounded-full my-1 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-4 h-0.5 bg-primary-500 rounded-full transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile Dropdown Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-primary-100 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-[14px] font-extrabold py-2 px-4 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 text-white shadow-cute"
                    : "text-neutral-600 hover:text-primary-600 hover:bg-primary-50"
                }`}
              >
                {isActive ? "🎀 " : ""}{label}
              </Link>
            );
          })}

          <div className="mt-2 pt-3 border-t border-primary-100">
            {isLoggedIn ? (
              <Link
                href="/app"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full px-3 py-2.5 font-bold text-[14px] shadow-cute hover:shadow-cute-lg transition-all duration-200"
              >
                Vào ứng dụng MeowBack 🐾
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full px-3 py-2.5 font-bold text-[14px] shadow-cute hover:shadow-cute-lg transition-all duration-200"
              >
                Đăng nhập 
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

