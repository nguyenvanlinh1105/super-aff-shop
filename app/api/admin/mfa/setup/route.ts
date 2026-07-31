import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateTotpSecret, verifyTotpCode, generateBackupCodes } from "@/lib/mfa";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users: any[] = await prisma.$queryRawUnsafe("SELECT * FROM users WHERE id = ?", session.userId);
  const user = users[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Sinh QR Code & Secret mới cho việc setup
  const mfaSetup = await generateTotpSecret(user.email);

  let backupCodes: string[] = [];
  if (user.mfa_backup_codes) {
    try {
      backupCodes = JSON.parse(user.mfa_backup_codes);
    } catch {
      backupCodes = [];
    }
  }

  return NextResponse.json({
    mfaEnabled: Boolean(user.mfa_enabled),
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

    await prisma.$executeRawUnsafe(
      "UPDATE users SET mfa_enabled = 1, mfa_secret = ?, mfa_backup_codes = ? WHERE id = ?",
      secret,
      backupCodesJson,
      session.userId
    );

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
    await prisma.$executeRawUnsafe(
      "UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL WHERE id = ?",
      session.userId
    );

    return NextResponse.json({ success: true, mfaEnabled: false });
  } catch (error: any) {
    return NextResponse.json({ error: "Không thể tắt 2MFA. Vui lòng thử lại." }, { status: 500 });
  }
}
