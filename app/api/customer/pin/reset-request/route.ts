import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/paymentPin";
import { sendMail } from "@/lib/mailer";
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
      subject: "🔐 Mã xác nhận đặt lại PIN rút tiền — MeowBack",
      html: buildPinResetEmail(customer.fullName, otp),
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

function buildPinResetEmail(name: string, otp: string): string {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FFFBFC; border-radius: 24px; border: 1px solid #FFE0EC;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 36px;">🔐</div>
        <h2 style="font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 12px 0 4px;">Đặt lại mã PIN rút tiền</h2>
        <p style="font-size: 14px; color: #666; margin: 0;">Xin chào <strong>${name}</strong></p>
      </div>
      
      <div style="background: linear-gradient(135deg, #FF6D9E 0%, #FF8FB1 100%); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Mã xác nhận của bạn</p>
        <div style="font-size: 36px; font-weight: 900; color: white; letter-spacing: 8px; font-family: monospace;">${otp}</div>
      </div>
      
      <div style="background: #FFF5F8; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #FFE0EC;">
        <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.6;">
          ⏰ Mã này có hiệu lực trong <strong>5 phút</strong>.<br/>
          🔒 Nếu bạn không yêu cầu đặt lại PIN, vui lòng bỏ qua email này và đổi mật khẩu ngay.
        </p>
      </div>
      
      <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
        MeowBack — Hoàn tiền thông minh 🎀
      </p>
    </div>
  `;
}
