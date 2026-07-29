"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

type ZaloAccount = {
  id: string;
  oaName: string;
  oaId: string | null;
  appId: string | null;
  webhookUrl: string | null;
  status: string;
};

export function ZaloAccountForm({ account }: { account: ZaloAccount | null }) {
  const router = useRouter();
  const [oaName, setOaName] = useState(account?.oaName ?? "");
  const [oaId, setOaId] = useState(account?.oaId ?? "");
  const [appId, setAppId] = useState(account?.appId ?? "");
  const [webhookUrl, setWebhookUrl] = useState(account?.webhookUrl ?? "");
  const [status, setStatus] = useState(account?.status ?? "inactive");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/zalo/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: account?.id, oaName, oaId, appId, webhookUrl, status }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
        <TextInput placeholder="Tên OA" required value={oaName} onChange={(e) => setOaName(e.target.value)} />
        <TextInput placeholder="OA ID" value={oaId} onChange={(e) => setOaId(e.target.value)} />
        <TextInput placeholder="App ID" value={appId} onChange={(e) => setAppId(e.target.value)} />
        <TextInput
          placeholder="Webhook URL"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-sm text-[14px]">
        <input type="checkbox" checked={status === "active"} onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")} />
        Bật auto reply
      </label>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Đang lưu..." : "Lưu cấu hình"}
      </Button>
    </form>
  );
}
