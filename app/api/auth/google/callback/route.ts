import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { sendMail, buildAdminNewRegistrationEmail, buildReferralSuccessEmail } from "@/lib/mailer";
import { generateCustomerCode } from "@/lib/customerCode";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

// Đăng ký đồng thời hiếm khi trùng mã (2 request cùng đọc mã lớn nhất trước
// khi request nào insert xong) — thử lại tối đa 3 lần thay vì để lỗi 500.
async function createCustomerWithUniqueCode(data: { fullName: string; referredById: string | null }) {
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

export async function GET(req: NextRequest) {
  const origin = getRequestOrigin(req);
  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return failRedirect("google_state_mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return failRedirect("google_not_configured");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return failRedirect("google_token_exchange_failed");
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string | undefined;
  if (!accessToken) {
    return failRedirect("google_token_exchange_failed");
  }

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    return failRedirect("google_userinfo_failed");
  }

  const profile = await userInfoRes.json();
  const email = profile.email as string | undefined;
  const emailVerified = profile.email_verified as boolean | undefined;
  const fullName = (profile.name as string | undefined) || email || "Người dùng Google";

  if (!email || !emailVerified) {
    return failRedirect("google_email_not_verified");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.status !== "active") {
      return failRedirect("account_inactive");
    }
  } else {
    const refCode = req.cookies.get("ref_code")?.value;
    let referredById: string | null = null;
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

    const customer = await createCustomerWithUniqueCode({ fullName, referredById });
    const customerCode = customer.customerCode;

    user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
        fullName,
        role: "customer",
        customerId: customer.id,
      },
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
          source: "google",
          referredByCode: referredById ? refCode : null,
          referrerName,
          referrerEmail,
        }),
      })
        .then((result) => {
          if (!result.ok) console.error("[google-callback] Gửi email thông báo admin thất bại:", result.error);
          else if (result.simulated) console.warn("[google-callback] SMTP chưa cấu hình — bỏ qua email thông báo admin");
          else console.log("[google-callback] Đã gửi email thông báo admin thành công tới", adminEmail);
        })
        .catch((err) => console.error("[google-callback] sendMail throw lỗi:", err));
    } else {
      console.warn("[google-callback] Thiếu ADMIN_NOTIFICATION_EMAIL — không gửi được email thông báo admin");
    }

    // Báo cho NGƯỜI GIỚI THIỆU biết họ vừa mời thành công — cùng cơ chế với
    // luồng đăng ký email/mật khẩu (app/api/auth/register/route.ts).
    if (referrerEmail && referrerName) {
      sendMail({
        to: referrerEmail,
        subject: `🎁 ${fullName} vừa đăng ký bằng link giới thiệu của bạn`,
        html: buildReferralSuccessEmail({ referrerName, friendName: fullName }),
      })
        .then((result) => {
          if (!result.ok) console.error("[google-callback] Gửi email báo giới thiệu thành công thất bại:", result.error);
          else if (result.simulated) console.warn("[google-callback] SMTP chưa cấu hình — bỏ qua email báo giới thiệu");
          else console.log("[google-callback] Đã gửi email báo giới thiệu thành công tới", referrerEmail);
        })
        .catch((err) => console.error("[google-callback] sendMail (referral) throw lỗi:", err));
    }
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "customer",
    fullName: user.fullName,
    customerId: user.customerId,
  });

  const res = NextResponse.redirect(`${origin}${user.role === "admin" ? "/admin" : "/app"}`);
  res.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return res;
}
