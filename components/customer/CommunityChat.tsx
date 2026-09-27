"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Trash2, Users, ShieldAlert, MessageCircle, Heart, X, Minus } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";
import { useToast } from "@/components/ui/Toast";

type ChatMessage = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { fullName: string; role: string };
};

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(-2)
    .join("")
    .toUpperCase();
}

export function CommunityChat({
  initialMessages,
  currentUserId,
  isAdmin,
  isPopup = false,
  isActive = true,
  onClose,
  onMinimize,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
  isPopup?: boolean;
  isActive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const lastCreatedAtRef = useRef<string | null>(initialMessages.at(-1)?.createdAt ?? null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!listRef.current) return;
    // 1. Direct assignment for instant jump
    listRef.current.scrollTop = listRef.current.scrollHeight;
    // 2. requestAnimationFrame for next paint cycle
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior });
      }
      bottomAnchorRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  // Cuộn ngay khi component mount
  useEffect(() => {
    scrollToBottom("auto");
    const t1 = setTimeout(() => scrollToBottom("auto"), 60);
    const t2 = setTimeout(() => scrollToBottom("smooth"), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scrollToBottom]);

  // Cuộn tức thì khi isActive chuyển sang true (người dùng bấm tab Cộng đồng trên mobile)
  useEffect(() => {
    if (isActive) {
      scrollToBottom("auto");
      const t1 = setTimeout(() => scrollToBottom("auto"), 50);
      const t2 = setTimeout(() => scrollToBottom("smooth"), 180);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isActive, scrollToBottom]);

  // Tự động phát hiện khi container chuyển từ display:none sang visible (IntersectionObserver)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            scrollToBottom("auto");
            setTimeout(() => scrollToBottom("smooth"), 100);
          }
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  // Cuộn khi danh sách tin nhắn có thêm tin mới
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const since = lastCreatedAtRef.current;
      const url = since ? `/api/chat/messages?since=${encodeURIComponent(since)}` : "/api/chat/messages";
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const fresh: ChatMessage[] = data.messages ?? [];
        if (fresh.length === 0) return;
        lastCreatedAtRef.current = fresh.at(-1)!.createdAt;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const merged = [...prev, ...fresh.filter((m) => !seen.has(m.id))];
          return merged.slice(-200);
        });
        scrollToBottom();
      } catch {
        // silent polling failure
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function send(textToSend?: string) {
    const text = (textToSend ?? input).trim();
    if (!text || sending) return;
    setSending(true);
    if (!textToSend) setInput("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        lastCreatedAtRef.current = data.message.createdAt;
        scrollToBottom();
      } else {
        toast.error("Không thể gửi tin nhắn lúc này", "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối", "Lỗi");
    } finally {
      setSending(false);
    }
  }

  async function removeMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/chat/messages/${id}`, { method: "DELETE" });
      toast.success("Đã xoá tin nhắn", "Thành công");
    } catch {
      toast.error("Không thể xoá tin nhắn", "Lỗi");
    }
  }

  return (
    <div
      className={`flex flex-col bg-white overflow-hidden ${
        isPopup
          ? "h-full w-full"
          : "rounded-3xl shadow-cute border border-primary-200/70 h-[520px]"
      }`}
    >
      {/* ═══ LOUNGE HEADER ═══ */}
      <div className="flex items-center justify-between border-b border-primary-100/80 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-primary-50/95 via-pink-50/70 to-white shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="h-9 w-9 sm:h-10 sm:w-10 object-contain drop-shadow-sm" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-neutral-900 text-xs sm:text-[14.5px] tracking-tight whitespace-nowrap">
                Cộng Đồng MeowBack 🐾
              </span>
              {!isPopup && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary-100/80 px-2 py-0.5 text-[10px] font-black text-primary-700 shrink-0">
                  <Users size={10} /> Mở 24/7
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium truncate">
              Giao lưu bí kíp gom deal & hoàn tiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>

          {isPopup && (
            <div className="flex items-center gap-1 ml-0.5">
              {onMinimize && (
                <button
                  type="button"
                  onClick={onMinimize}
                  title="Thu nhỏ cửa sổ chat"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <Minus size={15} strokeWidth={2.5} />
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  title="Đóng cửa sổ chat"
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PINNED GUIDELINE ═══ */}
      <div className="flex items-center gap-2 px-5 py-2 bg-amber-50/70 border-b border-amber-200/60 text-[11px] sm:text-xs text-amber-800 font-medium">
        <IconBow className="w-3.5 h-3.5 text-accent-bow shrink-0" />
        <span className="truncate">
          <strong className="font-extrabold">Quy tắc cộng đồng:</strong> Giữ giao tiếp văn minh, không spam link độc hại. Chia sẻ mã mời tại mục Mời Bạn Bè để cùng nhận hoa hồng! 🎀
        </span>
      </div>

      {/* ═══ CHAT MESSAGES ═══ */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 bg-neutral-50/40">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center my-auto py-10">
            <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl overflow-hidden shadow-cute border-2 border-primary-100/80 bg-pink-50/60 p-1">
              <img src="/meow-back-mascot.png" alt="" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div className="max-w-sm">
              <p className="text-sm font-extrabold text-neutral-700">Chưa có tin nhắn nào trong phòng chat</p>
              <p className="mt-1 text-xs text-neutral-400 font-medium">
                Hãy là người đầu tiên gửi lời chào đến cộng đồng MeowBack hôm nay nhé! 🐾
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = currentUserId === m.userId;
            const isMsgAdmin = m.user?.role === "admin";

            return (
              <div key={m.id} className={`group flex items-end gap-2.5 ${isMine ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {isMsgAdmin ? (
                  <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden shadow-2xs ring-2 ring-primary-200 bg-primary-50">
                    <img
                      src="/meow-back-mascot.png"
                      alt="MeowBack"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-[11px] font-black text-white shadow-2xs ${
                      isMine
                        ? "bg-gradient-to-br from-neutral-700 to-neutral-800"
                        : "bg-gradient-to-br from-neutral-400 to-neutral-500"
                    }`}
                  >
                    {initialsOf(m.user?.fullName ?? "?")}
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                  {/* Sender Name & Role */}
                  <div className="flex items-center gap-1.5 px-1">
                    {isMsgAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary-600 bg-primary-100/90 px-2 py-0.5 rounded-full border border-primary-200/60">
                        <span>Đội ngũ MeowBack</span>
                        <Heart size={10} className="fill-primary-500 text-primary-500" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-neutral-600">
                        {isMine ? "Bạn" : m.user?.fullName}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 font-medium">{formatTime(m.createdAt)}</span>
                  </div>

                  {/* Bubble Content */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`rounded-2xl px-4 py-2 text-xs sm:text-[13px] leading-relaxed break-words shadow-2xs ${
                        isMsgAdmin
                          ? "bg-primary-50/90 text-primary-950 border border-primary-200/80 font-medium"
                          : isMine
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium"
                          : "bg-white text-neutral-900 border border-neutral-200/80 font-medium"
                      }`}
                    >
                      {m.message}
                    </div>

                    {/* Only allow deleting own messages */}
                    {isMine && (
                      <button
                        onClick={() => removeMessage(m.id)}
                        title="Xoá tin nhắn của bạn"
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-xl text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Invisible anchor element to scroll into view */}
        <div ref={bottomAnchorRef} className="h-0 w-0 shrink-0" />
      </div>

      {/* ═══ MESSAGE COMPOSER ═══ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 sm:gap-3 border-t border-neutral-200/80 p-2.5 sm:p-4 bg-white shrink-0 w-full"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          enterKeyHint="send"
          autoComplete="off"
          placeholder="Nhắn gì đó với cộng đồng săn sale MeowBack..."
          maxLength={1000}
          className="h-11 flex-1 min-w-0 rounded-2xl bg-neutral-50 px-4 text-[16px] sm:text-sm font-medium text-neutral-900 border border-neutral-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-11 px-4 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute transition-all hover:scale-[1.02] active:scale-[0.96] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-xs sm:text-sm font-extrabold cursor-pointer"
        >
          <span>Gửi</span>
          <Send size={14} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
