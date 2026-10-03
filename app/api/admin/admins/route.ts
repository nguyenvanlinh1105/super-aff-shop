import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { sendMail, buildAdminAccountCreatedEmail } from "@/lib/mailer";

// GET /api/admin/admins — Lấy danh sách toàn bộ tài khoản Admin
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      telegramChatId: true,
      notifyOnNewCustomer: true,
      mfaEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ admins });
}

// POST /api/admin/admins — Tạo mới tài khoản Admin và gửi email thông tin đăng nhập
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { fullName, email, password, phone, telegramChatId, notifyOnNewCustomer } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên của Quản trị viên" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ error: "Email không đúng định dạng hợp lệ" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu khởi tạo phải từ 6 ký tự trở lên" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra email đã tồn tại hay chưa
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json({ error: "Email này đã được sử dụng cho một tài khoản khác trong hệ thống" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    // Tạo tài khoản admin
    const newAdmin = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role: "admin",
        status: "active",
        phone: phone ? phone.trim() : null,
        telegramChatId: telegramChatId ? telegramChatId.trim() : null,
        notifyOnNewCustomer: notifyOnNewCustomer ?? true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        telegramChatId: true,
        notifyOnNewCustomer: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Gửi email cấp tài khoản admin tới địa chỉ email của người nhận
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";
    const loginUrl = `${appUrl}/login`;

    sendMail({
      to: cleanEmail,
      subject: `🛡️ [MeowBack] Tài khoản Quản trị viên (Admin) của bạn đã được khởi tạo`,
      html: buildAdminAccountCreatedEmail({
        adminName: newAdmin.fullName,
        adminEmail: cleanEmail,
        password: password,
        loginUrl,
        createdByAdminName: session.fullName,
      }),
    })
      .then((mailRes) => {
        if (!mailRes.ok) {
          console.error(`[admin-create] Gửi email cấp tài khoản tới ${cleanEmail} thất bại:`, mailRes.error);
        } else {
          console.log(`[admin-create] Đã gửi email cấp tài khoản admin thành công tới ${cleanEmail}`);
        }
      })
      .catch((err) => console.error("[admin-create] Lỗi gửi mail:", err));

    return NextResponse.json({
      success: true,
      admin: newAdmin,
      message: `Đã tạo tài khoản quản trị viên và gửi email đăng nhập tới ${cleanEmail}`,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/admins] Error:", error);
    return NextResponse.json({ error: error.message || "Đã xảy ra lỗi khi tạo tài khoản Admin" }, { status: 500 });
  }
}
