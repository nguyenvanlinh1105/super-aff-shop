import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Sanitize: chỉ cho phép tên file đơn giản, không path traversal
  const key = params.key.replace(/[/\\..]/g, "");
  if (!key) return new NextResponse("Not found", { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "storage", "bills", key);
    const data = await readFile(filePath);

    // Đoán content-type từ extension
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "gif"
        ? "image/gif"
        : "image/jpeg";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
