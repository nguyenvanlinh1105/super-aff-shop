import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { setBotDisplayName } from "@/lib/telegramBot";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  const { id, botName, botUsername, botTokenHint, webhookUrl, status } = await req.json();

  const existing = id ? await prisma.telegramAccount.findUnique({ where: { id } }) : null;

  // botName ở đây là tên hiển thị THẬT của bot trên Telegram (không phải chỉ
  // ghi chú nội bộ) — nên khi đổi, phải gọi API setMyName để đổi thật, không
  // chỉ lưu DB rồi để admin tưởng đã đổi mà Telegram vẫn hiện tên cũ.
  let nameSyncError: string | null = null;
  if (botName && botName !== existing?.botName) {
    const result = await setBotDisplayName(botName);
    if (!result.ok) nameSyncError = result.error ?? "Không đổi được tên bot trên Telegram";
  }

  const account = id
    ? await prisma.telegramAccount.update({
        where: { id },
        data: { botName, botUsername, botTokenHint, webhookUrl, status },
      })
    : await prisma.telegramAccount.create({
        data: { botName, botUsername, botTokenHint, webhookUrl, status: status ?? "inactive" },
      });

  return NextResponse.json({ account, nameSyncError });
}
