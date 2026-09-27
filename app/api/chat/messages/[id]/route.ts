import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const msg = await prisma.chatMessage.findUnique({ where: { id: params.id } });
  if (!msg) {
    return NextResponse.json({ success: true });
  }

  // Người dùng chỉ có quyền xoá tin nhắn của chính mình (admin có quyền xoá khi kiểm duyệt)
  if (msg.userId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Bạn chỉ có thể xoá tin nhắn của chính mình" }, { status: 403 });
  }

  await prisma.chatMessage.delete({ where: { id: params.id } }).catch(() => null);

  return NextResponse.json({ success: true });
}
