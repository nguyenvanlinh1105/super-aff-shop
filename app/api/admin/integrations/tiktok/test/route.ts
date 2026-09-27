import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listRioHubTikTokLinks } from "@/lib/riohubTikTok";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const result = await listRioHubTikTokLinks();
    return NextResponse.json({ ok: true, total: result.total, creatorUsername: result.creator_username });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Không kiểm tra được RioHub" },
      { status: 400 }
    );
  }
}
