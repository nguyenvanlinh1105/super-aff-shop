"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

const PENDING_LINK_STORAGE_KEY = "meowback_pending_link";

export function PendingLinkClaimer() {
  const router = useRouter();
  const [claimedMessage, setClaimedMessage] = useState<string | null>(null);

  useEffect(() => {
    let pendingUrl: string | null = null;
    try {
      pendingUrl = localStorage.getItem(PENDING_LINK_STORAGE_KEY);
    } catch {
      return;
    }
    if (!pendingUrl) return;

    try {
      localStorage.removeItem(PENDING_LINK_STORAGE_KEY);
    } catch {}

    (async () => {
      try {
        const previewRes = await fetch("/api/links/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: pendingUrl }),
        });
        const previewData = await previewRes.json();
        if (!previewRes.ok) return;

        const createRes = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalUrl: pendingUrl,
            platformCode: previewData.platformCode,
            channelSource: "web",
          }),
        });
        if (!createRes.ok) return;

        setClaimedMessage("Đã tạo link cho sản phẩm bạn xem trước lúc đăng ký! 🎀");
        router.refresh();
      } catch {}
    })();
  }, [router]);

  if (!claimedMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-900 text-white px-5 py-3 shadow-cute-lg fade-in border border-primary-200">
      <CheckCircle2 size={18} className="text-primary-400 shrink-0" />
      <span className="text-[13px] font-bold">{claimedMessage}</span>
      <button onClick={() => setClaimedMessage(null)} className="ml-2 text-white/60 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}

