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

  const prevActive = await prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

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

  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        entityType: "commission_rule",
        entityId: rule.id,
        action: "update_commission_rule",
        beforeData: prevActive
          ? JSON.stringify({
              taxRate: Number(prevActive.taxRate),
              customerRate: Number(prevActive.customerRate),
              systemRate: Number(prevActive.systemRate),
              referralRate: Number(prevActive.referralRate),
              maxReferralOrders: prevActive.maxReferralOrders,
              referralValidityMonths: prevActive.referralValidityMonths,
            })
          : null,
        afterData: JSON.stringify({
          taxRate,
          customerRate,
          systemRate,
          referralRate,
          maxReferralOrders,
          referralValidityMonths,
        }),
      },
    });
  } catch (auditErr) {
    console.warn("Lỗi ghi audit log khi đổi commission rule:", auditErr);
  }

  return NextResponse.json({ rule });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wantHistory = searchParams.get("history") === "1" || searchParams.get("history") === "true";

  if (wantHistory) {
    const history = await prisma.commissionRule.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdByUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
      take: 50,
    });
    return NextResponse.json({ history });
  }

  const rule = await prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    customerRate: rule ? Number(rule.customerRate) : 80,
    taxRate: rule ? Number(rule.taxRate) : 10.98,
    systemRate: rule ? Number(rule.systemRate) : 20,
    referralRate: rule ? Number(rule.referralRate) : 0.05,
    maxReferralOrders: rule?.maxReferralOrders ?? 5,
    referralValidityMonths: rule?.referralValidityMonths ?? 6,
  });
}

