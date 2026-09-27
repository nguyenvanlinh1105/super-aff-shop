import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLazadaConversionReport, LazadaApiError } from "@/lib/lazadaApi";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const { total } = await getLazadaConversionReport({ dateStart: today, dateEnd: today, page: 1, limit: 1 });
    return NextResponse.json({ ok: true, total });
  } catch (error) {
    if (error instanceof LazadaApiError) {
      return NextResponse.json({ error: `${error.message}${error.code ? ` (code: ${error.code})` : ""}` }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kết nối Lazada thất bại" },
      { status: 400 }
    );
  }
}
