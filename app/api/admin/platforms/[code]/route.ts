import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const code = params.code.toUpperCase();
  const { status } = await req.json().catch(() => ({}));
  if (!["active", "inactive"].includes(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }

  const platform = await prisma.platform.update({
    where: { code },
    data: { status },
  });

  return NextResponse.json({ platform });
}
