import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { id, oaName, oaId, appId, webhookUrl, status } = await req.json();

  const account = id
    ? await prisma.zaloAccount.update({
        where: { id },
        data: { oaName, oaId, appId, webhookUrl, status },
      })
    : await prisma.zaloAccount.create({
        data: { oaName, oaId, appId, webhookUrl, status: status ?? "inactive" },
      });

  return NextResponse.json({ account });
}
