import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidPin, setPaymentPin } from "@/lib/paymentPin";

/** POST /api/customer/pin/setup — Tạo mã PIN rút tiền lần đầu */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pin, confirmPin } = await request.json();

    if (!pin || !confirmPin) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ mã PIN" }, { status: 400 });
    }

    if (!isValidPin(pin)) {
      return NextResponse.json({ error: "Mã PIN phải là 6 chữ số" }, { status: 400 });
    }

    if (pin !== confirmPin) {
      return NextResponse.json({ error: "Mã PIN nhập lại không khớp" }, { status: 400 });
    }

    // Check if already has PIN
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { paymentPin: true },
    });

    if (customer?.paymentPin) {
      return NextResponse.json({ error: "Bạn đã có mã PIN. Vui lòng sử dụng chức năng đổi mã PIN." }, { status: 409 });
    }

    await setPaymentPin(session.customerId, pin);

    return NextResponse.json({ success: true, message: "Đã thiết lập mã PIN rút tiền thành công" });
  } catch (error: any) {
    console.error("PIN setup error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
