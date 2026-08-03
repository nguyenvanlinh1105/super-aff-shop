import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isValidPin, verifyPaymentPin, setPaymentPin } from "@/lib/paymentPin";

/** POST /api/customer/pin/change — Đổi mã PIN (cần nhập PIN cũ) */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPin, newPin, confirmPin } = await request.json();

    if (!currentPin || !newPin || !confirmPin) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    if (!isValidPin(newPin)) {
      return NextResponse.json({ error: "Mã PIN mới phải là 6 chữ số" }, { status: 400 });
    }

    if (newPin !== confirmPin) {
      return NextResponse.json({ error: "Mã PIN mới nhập lại không khớp" }, { status: 400 });
    }

    if (currentPin === newPin) {
      return NextResponse.json({ error: "Mã PIN mới phải khác mã PIN hiện tại" }, { status: 400 });
    }

    // Verify current PIN
    const result = await verifyPaymentPin(session.customerId, currentPin);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.code === "locked" ? 429 : 400 });
    }

    await setPaymentPin(session.customerId, newPin);

    return NextResponse.json({ success: true, message: "Đổi mã PIN thành công" });
  } catch (error: any) {
    console.error("PIN change error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
