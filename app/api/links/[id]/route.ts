import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }

  const link = await prisma.trackingLink.findUnique({ where: { id: params.id } });
  if (!link) {
    return NextResponse.json({ error: "Khong tim thay link" }, { status: 404 });
  }

  // Chỉ chủ link hoặc admin mới được đổi trạng thái yêu thích.
  if (session.role !== "admin" && link.customerId !== session.customerId) {
    return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
  }

  const { isFavorite } = await req.json();
  if (typeof isFavorite !== "boolean") {
    return NextResponse.json({ error: "Thieu isFavorite" }, { status: 400 });
  }

  const updated = await prisma.trackingLink.update({
    where: { id: params.id },
    data: { isFavorite },
  });

  return NextResponse.json({ id: updated.id, isFavorite: updated.isFavorite });
}
