"use client";

import { useState, useEffect } from "react";
import { Gift, Check, Copy } from "lucide-react";

export function CopyInviteButton({ customerCode }: { customerCode: string }) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/register?ref=${customerCode}`);
  }, [customerCode]);

  function copy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={`group flex items-center gap-xs rounded-xl px-xl py-[10px] text-[13px] font-bold transition-all duration-200 active:scale-[0.97] ${
        copied
          ? "bg-white/20 text-white border border-white/30 backdrop-blur-sm"
          : "bg-white/12 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm"
      }`}
    >
      {copied ? (
        <Check size={14} strokeWidth={2.5} className="text-[#9fe870]" />
      ) : (
        <Gift size={14} strokeWidth={2} className="group-hover:animate-bounce" />
      )}
      <span>{copied ? "Đã sao chép!" : "Copy link mời"}</span>
      {!copied && <Copy size={11} strokeWidth={2} className="opacity-50" />}
    </button>
  );
}
