import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const rates = await prisma.categoryCommissionRate.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rates });
}

type RateInput = {
  name: string;
  keywords: string;
  rate: number;
  isDefault: boolean;
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { rates } = (await req.json()) as { rates?: RateInput[] };

  if (!Array.isArray(rates) || rates.length === 0) {
    return NextResponse.json({ error: "Cần ít nhất 1 ngành hàng" }, { status: 400 });
  }

  for (const r of rates) {
    if (
      typeof r.name !== "string" ||
      !r.name.trim() ||
      typeof r.keywords !== "string" ||
      typeof r.rate !== "number" ||
      r.rate < 0 ||
      r.rate > 100
    ) {
      return NextResponse.json({ error: "Dữ liệu ngành hàng không hợp lệ" }, { status: 400 });
    }
  }

  if (rates.filter((r) => r.isDefault).length !== 1) {
    return NextResponse.json({ error: "Phải chọn đúng 1 ngành hàng làm mặc định" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.categoryCommissionRate.deleteMany({}),
    prisma.categoryCommissionRate.createMany({
      data: rates.map((r, i) => ({
        name: r.name.trim(),
        keywords: r.keywords.trim(),
        rate: r.rate,
        sortOrder: i,
        isDefault: !!r.isDefault,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
