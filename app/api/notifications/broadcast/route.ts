import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { broadcastNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { title, message, link } = await req.json();
  if (!title || !message) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
  }

  const sentCount = await broadcastNotification({
    type: "broadcast",
    title,
    message,
    link: link || undefined,
  });

  return NextResponse.json({ success: true, sentCount });
}
