import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/paymentPin";
import { sendMail, buildPinResetEmail } from "@/lib/mailer";
import { hashPassword } from "@/lib/password";

/** POST /api/customer/pin/reset-request — Gửi OTP qua email để reset PIN */
export async function POST(_request: Request) {
  try {
    const session = await getSession();
    if (!session?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: { user: { select: { email: true } } },
    });

    if (!customer?.user?.email) {
      return NextResponse.json(
        { error: "Không tìm thấy email liên kết. Vui lòng liên hệ Admin." },
        { status: 400 }
      );
    }

    // Generate OTP and store as hashed token with expiry
    const otp = generateOtp();
    const hashedOtp = hashPassword(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Reuse mfaResetToken fields on User model for PIN reset OTP
    // (alternative: could create a separate model, but this is simpler)
    await prisma.user.update({
      where: { customerId: session.customerId },
      data: {
        mfaResetToken: hashedOtp,
        mfaResetExpiresAt: expiresAt,
      },
    });

    // Send OTP via email
    const emailResult = await sendMail({
      to: customer.user.email,
      subject: "Mã xác nhận đặt lại PIN rút tiền — MeowBack",
      html: buildPinResetEmail({ fullName: customer.fullName, otp }),
    });

    if (!emailResult.ok && !emailResult.simulated) {
      return NextResponse.json({ error: "Không gửi được email. Vui lòng thử lại." }, { status: 500 });
    }

    // Nếu simulated (dev mode), log OTP ra console
    if (emailResult.simulated) {
      console.log(`[PIN RESET OTP] Customer ${customer.customerCode}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
      email: maskEmail(customer.user.email),
    });
  } catch (error: any) {
    console.error("PIN reset request error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 3) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 3)}***@${domain}`;
}
