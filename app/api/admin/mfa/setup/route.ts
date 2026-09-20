import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateTotpSecret, verifyTotpCode, generateBackupCodes } from "@/lib/mfa";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Sinh QR Code & Secret mới cho việc setup
  const mfaSetup = await generateTotpSecret(user.email);

  let backupCodes: string[] = [];
  if (user.mfaBackupCodes) {
    try {
      backupCodes = JSON.parse(user.mfaBackupCodes);
    } catch {
      backupCodes = [];
    }
  }

  return NextResponse.json({
    mfaEnabled: Boolean(user.mfaEnabled),
    secret: mfaSetup.secret,
    qrCodeDataUrl: mfaSetup.qrCodeDataUrl,
    otpauth: mfaSetup.otpauth,
    backupCodes,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { secret, code } = await req.json();

    if (!secret || !code) {
      return NextResponse.json({ error: "Thiếu thông tin secret hoặc mã xác nhận 6 số" }, { status: 400 });
    }

    const isValid = verifyTotpCode(secret, code);
    if (!isValid) {
      return NextResponse.json({ error: "Mã 6 số từ Google Authenticator không đúng. Vui lòng kiểm tra đồng hồ thiết bị và thử lại." }, { status: 400 });
    }

    // Sinh 8 mã dự phòng khẩn cấp
    const backupCodes = generateBackupCodes();
    const backupCodesJson = JSON.stringify(backupCodes);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaBackupCodes: backupCodesJson,
      },
    });

    return NextResponse.json({
      success: true,
      mfaEnabled: true,
      backupCodes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Không thể bật 2MFA. Vui lòng thử lại." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
      },
    });

    return NextResponse.json({ success: true, mfaEnabled: false });
  } catch (error: any) {
    return NextResponse.json({ error: "Không thể tắt 2MFA. Vui lòng thử lại." }, { status: 500 });
  }
}
