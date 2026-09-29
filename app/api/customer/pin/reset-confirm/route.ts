import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidPin, setPaymentPin } from "@/lib/paymentPin";
import { verifyPassword } from "@/lib/password";
import { sendMail, buildPinChangedEmail } from "@/lib/mailer";

/** POST /api/customer/pin/reset-confirm — Xác nhận OTP và đặt PIN mới */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp, newPin, confirmPin } = await request.json();

    if (!otp || !newPin || !confirmPin) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    if (!isValidPin(newPin)) {
      return NextResponse.json({ error: "Mã PIN mới phải là 6 chữ số" }, { status: 400 });
    }

    if (newPin !== confirmPin) {
      return NextResponse.json({ error: "Mã PIN mới nhập lại không khớp" }, { status: 400 });
    }

    // Get stored OTP hash
    const user = await prisma.user.findUnique({
      where: { customerId: session.customerId },
      select: { mfaResetToken: true, mfaResetExpiresAt: true, email: true },
    });

    if (!user?.mfaResetToken || !user?.mfaResetExpiresAt) {
      return NextResponse.json({ error: "Chưa có yêu cầu đặt lại PIN. Vui lòng gửi lại mã OTP." }, { status: 400 });
    }

    // Check expiry
    if (user.mfaResetExpiresAt < new Date()) {
      return NextResponse.json({ error: "Mã OTP đã hết hạn. Vui lòng gửi lại." }, { status: 400 });
    }

    // Verify OTP
    const otpMatch = verifyPassword(otp, user.mfaResetToken);
    if (!otpMatch) {
      return NextResponse.json({ error: "Mã OTP không chính xác" }, { status: 400 });
    }

    // Set new PIN and clear OTP
    await setPaymentPin(session.customerId, newPin);

    // Clear OTP token
    await prisma.user.update({
      where: { customerId: session.customerId },
      data: { mfaResetToken: null, mfaResetExpiresAt: null },
    });

    // Gửi email thông báo bảo mật
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { fullName: true },
    });
    if (user.email && customer) {
      void sendMail({
        to: user.email,
        subject: "Đặt lại mã PIN rút tiền thành công — MeowBack",
        html: buildPinChangedEmail({ fullName: customer.fullName }),
      });
    }

    return NextResponse.json({ success: true, message: "Đặt lại mã PIN thành công" });
  } catch (error: any) {
    console.error("PIN reset confirm error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
