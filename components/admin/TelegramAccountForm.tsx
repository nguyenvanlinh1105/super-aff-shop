"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

type TelegramAccount = {
  id: string;
  botName: string;
  botUsername: string | null;
  botTokenHint: string | null;
  webhookUrl: string | null;
  status: string;
};

export function TelegramAccountForm({ account }: { account: TelegramAccount | null }) {
  const router = useRouter();
  const [botName, setBotName] = useState(account?.botName ?? "");
  const [botUsername, setBotUsername] = useState(account?.botUsername ?? "");
  const [botTokenHint, setBotTokenHint] = useState(account?.botTokenHint ?? "");
  const [webhookUrl, setWebhookUrl] = useState(account?.webhookUrl ?? "");
  const [status, setStatus] = useState(account?.status ?? "inactive");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/telegram/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: account?.id, botName, botUsername, botTokenHint, webhookUrl, status }),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (data?.nameSyncError) {
      setError(`Đã lưu vào hệ thống, nhưng đổi tên trên Telegram thất bại: ${data.nameSyncError}`);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
        <div>
          <TextInput placeholder="Tên bot" required value={botName} onChange={(e) => setBotName(e.target.value)} />
          <p className="mt-xxs text-[12px] text-gray-400">Lưu sẽ đổi luôn tên hiển thị thật của bot trên Telegram.</p>
        </div>
        <div>
          <TextInput placeholder="@botusername" value={botUsername} onChange={(e) => setBotUsername(e.target.value)} />
          <p className="mt-xxs text-[12px] text-gray-400">
            Chỉ để ghi chú — đổi @username thật phải nhắn <code>/setusername</code> với @BotFather trên Telegram.
          </p>
        </div>
        <TextInput
          placeholder="Token hint de doi chieu"
          value={botTokenHint}
          onChange={(e) => setBotTokenHint(e.target.value)}
        />
        <TextInput placeholder="Webhook URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
      </div>
      <label className="flex items-center gap-sm text-[14px]">
        <input type="checkbox" checked={status === "active"} onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")} />
        Bat bot auto reply
      </label>
      {error && (
        <div className="rounded-xl bg-negative/10 border border-negative/20 px-lg py-md text-[13px] font-semibold text-negative-darkest">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-lg py-md text-[13px] font-semibold text-emerald-700">
          Đã lưu và đồng bộ tên bot lên Telegram.
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Dang luu..." : "Luu cau hinh"}
      </Button>
    </form>
  );
}
