import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Thiếu TELEGRAM_BOT_TOKEN trong .env" }, { status: 400 });
  }

  const [meRes, webhookRes] = await Promise.all([
    fetch(`https://api.telegram.org/bot${token}/getMe`),
    fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`),
  ]);

  const me = await meRes.json().catch(() => null);
  const webhook = await webhookRes.json().catch(() => null);

  if (!me?.ok) {
    return NextResponse.json({ error: "Bot token không hợp lệ" }, { status: 400 });
  }

  return NextResponse.json({
    bot: me.result,
    webhook: webhook?.result ?? null,
  });
}
