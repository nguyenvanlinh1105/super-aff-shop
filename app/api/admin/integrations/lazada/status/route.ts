import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getLazadaConfigStatus } from "@/lib/lazadaApi";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const platform = await prisma.platform.findUnique({ where: { code: "LAZADA" } });
  return NextResponse.json({
    lazada: getLazadaConfigStatus(),
    platform: platform
      ? { id: platform.id, code: platform.code, name: platform.name, status: platform.status }
      : null,
  });
}
