import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createWithdrawRequest } from "@/lib/withdrawRequest";
import { verifyPaymentPin } from "@/lib/paymentPin";
import { prisma } from "@/lib/prisma";

const STATUS_BY_CODE: Record<string, number> = {
  not_found: 404,
  insufficient_balance: 400,
  missing_bank_info: 400,
  already_pending: 409,
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  // Check if customer has a PIN set up
  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    select: { paymentPin: true },
  });

  if (customer?.paymentPin) {
    // PIN is set — verify it
    const body = await req.json().catch(() => ({}));
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: "Vui lòng nhập mã PIN rút tiền", requirePin: true }, { status: 400 });
    }

    const pinResult = await verifyPaymentPin(session.customerId, pin);
    if (!pinResult.ok) {
      return NextResponse.json(
        { error: pinResult.error, pinError: true, code: pinResult.code },
        { status: pinResult.code === "locked" ? 429 : 400 }
      );
    }
  }

  const result = await createWithdrawRequest(session.customerId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: STATUS_BY_CODE[result.code] ?? 400 });
  }

  return NextResponse.json({ request: result.request });
}
