import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

/**
 * Quản lý các khoảng thời gian áp dụng tỷ lệ hoa hồng cho Đối Tác (Partner Rate Periods).
 * Cho phép thiết lập % riêng (3%, 5%, 7%, 10%...) cho từng khoảng thời gian (startsAt - endsAt).
 */

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: { id: true, fullName: true, isPartner: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const periods = await prisma.partnerRatePeriod.findMany({
    where: { customerId: params.id },
    orderBy: { startsAt: "desc" },
  });

  return NextResponse.json({ periods });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: { id: true, isPartner: true },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { rate, startsAt, endsAt, note } = body;

  if (typeof rate !== "number" || rate <= 0 || rate > 1) {
    return NextResponse.json(
      { error: "Tỷ lệ hoa hồng không hợp lệ (phải từ 0.01 đến 1.0, ví dụ 0.07 tương ứng 7%)" },
      { status: 400 }
    );
  }

  if (!startsAt || isNaN(new Date(startsAt).getTime())) {
    return NextResponse.json({ error: "Ngày bắt đầu (startsAt) không hợp lệ" }, { status: 400 });
  }

  const startDate = new Date(startsAt);
  let endDate: Date | null = null;
  if (endsAt) {
    if (isNaN(new Date(endsAt).getTime())) {
      return NextResponse.json({ error: "Ngày kết thúc (endsAt) không hợp lệ" }, { status: 400 });
    }
    endDate = new Date(endsAt);
    if (endDate <= startDate) {
      return NextResponse.json({ error: "Ngày kết thúc phải lớn hơn ngày bắt đầu" }, { status: 400 });
    }
  }

  // Tự động kích hoạt isPartner = true cho khách hàng nếu chưa bật
  if (!customer.isPartner) {
    await prisma.customer.update({
      where: { id: params.id },
      data: { isPartner: true },
    });
  }

  const newPeriod = await prisma.partnerRatePeriod.create({
    data: {
      customerId: params.id,
      rate: new Prisma.Decimal(rate),
      startsAt: startDate,
      endsAt: endDate,
      note: typeof note === "string" ? note.trim() : null,
    },
  });

  return NextResponse.json({ success: true, period: newPeriod });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const rateId = searchParams.get("rateId");
  if (!rateId) {
    return NextResponse.json({ error: "Thiếu rateId" }, { status: 400 });
  }

  const existing = await prisma.partnerRatePeriod.findUnique({
    where: { id: rateId },
  });
  if (!existing || existing.customerId !== params.id) {
    return NextResponse.json({ error: "Không tìm thấy cấu hình tỷ lệ cần xoá" }, { status: 404 });
  }

  await prisma.partnerRatePeriod.delete({ where: { id: rateId } });

  return NextResponse.json({ success: true });
}
