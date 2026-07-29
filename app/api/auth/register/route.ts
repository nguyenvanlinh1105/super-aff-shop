import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { sendMail, buildAdminNewRegistrationEmail, buildReferralSuccessEmail } from "@/lib/mailer";
import { generateCustomerCode } from "@/lib/customerCode";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// Đăng ký đồng thời hiếm khi trùng mã (2 request cùng đọc mã lớn nhất trước
// khi request nào insert xong) — thử lại tối đa 3 lần thay vì để lỗi 500.
async function createCustomerWithUniqueCode(data: {
  fullName: string;
  phone: string | null;
  referredById: string | null;
}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const customerCode = await generateCustomerCode();
    try {
      return await prisma.customer.create({ data: { customerCode, ...data } });
    } catch (err) {
      const isCodeCollision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        (err.meta?.target as string[] | undefined)?.includes("customer_code");
      if (!isCodeCollision || attempt === 2) throw err;
    }
  }
  throw new Error("Không sinh được mã khách hàng sau nhiều lần thử");
}

export async function POST(req: NextRequest) {
  // Chặn tạo tài khoản hàng loạt tự động — 1 IP tối đa 10 lần đăng ký/giờ.
  const ip = getClientIp(req);
  const limit = checkRateLimit(`register:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Đăng ký quá nhiều lần, vui lòng thử lại sau ${Math.ceil((limit.retryAfterSeconds ?? 0) / 60)} phút` },
      { status: 429 }
    );
  }

  const { email, password, fullName, phone } = await req.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Thiếu email, mật khẩu hoặc họ tên" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 409 });
  }

  const passwordHash = hashPassword(password);

  // Check referral cookie
  const refCode = req.cookies.get("ref_code")?.value;
  let referredById = null;
  let referrerName: string | null = null;
  let referrerEmail: string | null = null;
  if (refCode) {
    const referrer = await prisma.customer.findUnique({
      where: { customerCode: refCode },
      select: { id: true, fullName: true, user: { select: { email: true } } },
    });
    if (referrer) {
      referredById = referrer.id;
      referrerName = referrer.fullName;
      referrerEmail = referrer.user?.email ?? null;
    }
  }

  const customer = await createCustomerWithUniqueCode({
    fullName,
    phone: phone || null,
    referredById,
  });
  const customerCode = customer.customerCode;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "customer",
      customerId: customer.id,
    },
  });

  await setSessionCookie({
    userId: user.id,
    role: "customer",
    fullName: user.fullName,
    customerId: customer.id,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    sendMail({
      to: adminEmail,
      subject: `[Đăng ký mới] ${fullName} (${customerCode})`,
      html: buildAdminNewRegistrationEmail({
        fullName,
        email,
        customerCode,
        phone,
        source: "email",
        referredByCode: referredById ? refCode : null,
        referrerName,
        referrerEmail,
      }),
    })
      .then((result) => {
        if (!result.ok) console.error("[register] Gửi email thông báo admin thất bại:", result.error);
        else if (result.simulated) console.warn("[register] SMTP chưa cấu hình — bỏ qua email thông báo admin");
        else console.log("[register] Đã gửi email thông báo admin thành công tới", adminEmail);
      })
      .catch((err) => console.error("[register] sendMail throw lỗi:", err));
  } else {
    console.warn("[register] Thiếu ADMIN_NOTIFICATION_EMAIL — không gửi được email thông báo admin");
  }

  // Báo cho NGƯỜI GIỚI THIỆU biết họ vừa mời thành công — chỉ gửi được nếu
  // người giới thiệu có tài khoản email (khách chỉ liên kết Zalo/Telegram
  // thì referrerEmail sẽ null, bỏ qua, không chặn luồng đăng ký chính).
  if (referrerEmail && referrerName) {
    sendMail({
      to: referrerEmail,
      subject: `🎁 ${fullName} vừa đăng ký bằng link giới thiệu của bạn`,
      html: buildReferralSuccessEmail({ referrerName, friendName: fullName }),
    })
      .then((result) => {
        if (!result.ok) console.error("[register] Gửi email báo giới thiệu thành công thất bại:", result.error);
        else if (result.simulated) console.warn("[register] SMTP chưa cấu hình — bỏ qua email báo giới thiệu");
        else console.log("[register] Đã gửi email báo giới thiệu thành công tới", referrerEmail);
      })
      .catch((err) => console.error("[register] sendMail (referral) throw lỗi:", err));
  }

  return NextResponse.json({ role: "customer", redirectTo: "/app" });
}
