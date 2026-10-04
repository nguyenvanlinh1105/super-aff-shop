import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setupTelegramBotCommands } from "@/lib/telegramBot";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) {
    return NextResponse.json({ error: "Thiếu TELEGRAM_BOT_TOKEN trong .env" }, { status: 400 });
  }
  if (!appUrl || appUrl.includes("localhost")) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL phải là domain public để Telegram gọi tới được" },
      { status: 400 }
    );
  }

  const webhookUrl = `${appUrl.replace(/\/+$/, "")}/api/telegram/webhook`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secretToken || undefined,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    return NextResponse.json(
      { error: data?.description || `Telegram API tra ve loi HTTP ${res.status}` },
      { status: 400 }
    );
  }

  // Tự động cài đặt danh sách lệnh & nút Menu xanh trên Telegram
  await setupTelegramBotCommands();

  return NextResponse.json({ ok: true, webhookUrl, telegram: data });
}
