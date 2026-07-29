import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createWithdrawRequest } from "@/lib/withdrawRequest";

const STATUS_BY_CODE: Record<string, number> = {
  not_found: 404,
  insufficient_balance: 400,
  missing_bank_info: 400,
  already_pending: 409,
};

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const result = await createWithdrawRequest(session.customerId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: STATUS_BY_CODE[result.code] ?? 400 });
  }

  return NextResponse.json({ request: result.request });
}
