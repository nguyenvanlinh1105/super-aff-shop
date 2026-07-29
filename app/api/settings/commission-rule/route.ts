import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { taxRate, customerRate, systemRate, referralRate, maxReferralOrders, referralValidityMonths } = await req.json();
  if (
    typeof taxRate !== "number" ||
    taxRate < 0 ||
    taxRate >= 100 ||
    typeof customerRate !== "number" ||
    typeof systemRate !== "number" ||
    customerRate + systemRate !== 100 ||
    typeof referralRate !== "number" ||
    typeof maxReferralOrders !== "number" ||
    typeof referralValidityMonths !== "number"
  ) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  await prisma.commissionRule.updateMany({
    where: { active: true },
    data: { active: false },
  });

  const rule = await prisma.commissionRule.create({
    data: {
      name: `Cấu hình ${new Date().toLocaleDateString("vi-VN")}`,
      taxRate,
      customerRate,
      systemRate,
      referralRate,
      maxReferralOrders,
      referralValidityMonths,
      active: true,
      createdByUserId: session.userId,
    },
  });

  return NextResponse.json({ rule });
}
