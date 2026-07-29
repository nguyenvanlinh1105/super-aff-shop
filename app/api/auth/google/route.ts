import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getRequestOrigin } from "@/lib/requestOrigin";

const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google đăng nhập chưa được cấu hình" }, { status: 500 });
  }

  const origin = getRequestOrigin(req);
  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    // Dựa theo giao thức THỰC của request (qua x-forwarded-proto), không ép
    // cứng theo NODE_ENV — nếu không, domain chưa có SSL sẽ bị trình duyệt
    // âm thầm từ chối lưu cookie này, gây lỗi "hết hạn phiên" khi callback.
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
