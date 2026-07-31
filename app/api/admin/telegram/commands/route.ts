import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commands = await prisma.telegramBotCommand.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ commands });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let commandStr = (body.command ?? "").trim().toLowerCase();
    if (!commandStr.startsWith("/")) {
      commandStr = `/${commandStr}`;
    }

    if (!commandStr || commandStr.length < 2) {
      return NextResponse.json({ error: "Lệnh bot không hợp lệ (ví dụ: /khuyenmai)" }, { status: 400 });
    }

    if (!body.title?.trim() || !body.replyText?.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ tiêu đề và nội dung phản hồi" }, { status: 400 });
    }

    const command = await prisma.telegramBotCommand.upsert({
      where: { command: commandStr },
      create: {
        command: commandStr,
        title: body.title.trim(),
        replyText: body.replyText.trim(),
        isActive: body.isActive ?? true,
      },
      update: {
        title: body.title.trim(),
        replyText: body.replyText.trim(),
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, command });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi tạo câu lệnh" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updated = await prisma.telegramBotCommand.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, command: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi cập nhật trạng thái" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.telegramBotCommand.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xóa câu lệnh" }, { status: 500 });
  }
}
