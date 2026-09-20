"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Users } from "lucide-react";

type ChatMessage = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { fullName: string; role: string };
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
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
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastCreatedAtRef = useRef<string | null>(initialMessages.at(-1)?.createdAt ?? null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const since = lastCreatedAtRef.current;
      const url = since ? `/api/chat/messages?since=${encodeURIComponent(since)}` : "/api/chat/messages";
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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      lastCreatedAtRef.current = data.message.createdAt;
      scrollToBottom();
    }
    setSending(false);
  }

  async function removeMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/chat/messages/${id}`, { method: "DELETE" });
  }

  return (
    <div className="flex flex-col rounded-3xl bg-white shadow-cute border border-primary-100/80 overflow-hidden h-[560px]">
      {/* Header */}
      <div className="flex items-center gap-sm border-b border-primary-100/80 px-lg py-md bg-gradient-to-r from-primary-50/80 via-primary-50 to-pink-50">
        <img src="/meowback_lucky_cat_logo.png" alt="" className="h-9 w-9 object-contain" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-neutral-900 text-[14px]">Cộng đồng MeowBack</div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Users size={11} /> Mọi thành viên đều thấy tin nhắn này
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-lg py-md flex flex-col gap-md">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-sm text-center">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="h-16 w-16 object-contain opacity-70" />
            <p className="text-[13px] font-bold text-neutral-400">Chưa có tin nhắn nào — hãy là người đầu tiên!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = currentUserId === m.userId;
            const isMsgAdmin = m.user?.role === "admin";
            return (
              <div key={m.id} className={`group flex items-end gap-sm ${isMine ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                    isMsgAdmin ? "bg-gradient-to-br from-primary-400 to-primary-500" : "bg-gradient-to-br from-neutral-400 to-neutral-500"
                  }`}
                >
                  {isMsgAdmin ? "🐱" : initialsOf(m.user?.fullName ?? "?")}
                </div>
                <div className={`flex flex-col gap-[2px] max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-xs px-1">
                    <span className="text-[11px] font-bold text-neutral-500">
                      {isMsgAdmin ? "Đội ngũ MeowBack" : m.user?.fullName}
                    </span>
                    <span className="text-[10px] text-neutral-300">{formatTime(m.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <div
                      className={`rounded-2xl px-md py-[8px] text-[13px] leading-relaxed break-words ${
                        isMsgAdmin
                          ? "bg-primary-50 text-primary-800 border border-primary-200/80"
                          : isMine
                          ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {m.message}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => removeMessage(m.id)}
                        title="Xoá tin nhắn"
                        className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-md text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-sm border-t border-primary-100/80 p-md bg-white/95">
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
          placeholder="Nhắn gì đó với cộng đồng..."
          maxLength={1000}
          className="h-11 flex-1 rounded-2xl bg-neutral-50 px-lg text-[14px] font-medium text-neutral-900 border border-primary-100/80 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all placeholder:text-neutral-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute transition-all hover:scale-105 active:scale-[0.94] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <Send size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
