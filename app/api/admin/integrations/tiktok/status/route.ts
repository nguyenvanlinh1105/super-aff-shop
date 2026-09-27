import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getRioHubConfigStatus } from "@/lib/riohubTikTok";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const platform = await prisma.platform.findUnique({ where: { code: "TIKTOK" } });
  return NextResponse.json({
    riohub: getRioHubConfigStatus(),
    platform: platform
      ? { id: platform.id, code: platform.code, name: platform.name, status: platform.status }
      : null,
  });
}
