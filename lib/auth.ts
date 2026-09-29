import { cookies, headers } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  SessionPayload,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./session";

// Cookie "Secure" chỉ nên bật khi request THỰC SỰ qua HTTPS — không phải cứ
// production là bật cứng. Trong giai đoạn domain mới (meowback.shop) chưa kịp
// cấp SSL, nếu ép Secure=true, trình duyệt sẽ âm thầm từ chối lưu cookie khi
// truy cập qua HTTP, khiến đăng nhập/Google OAuth báo "hết hạn phiên" dù mọi
// thứ khác đều đúng. Dùng header x-forwarded-proto (Nginx set) để biết chính
// xác request đang tới qua giao thức nào.
function isSecureRequest(): boolean {
  const proto = headers().get("x-forwarded-proto");
  if (proto) return proto === "https";
  return process.env.NODE_ENV === "production";
}

export async function getSession(): Promise<SessionPayload | null> {
  const accessPayload = await verifyAccessToken(cookies().get(ACCESS_TOKEN_COOKIE)?.value);
  if (accessPayload) return accessPayload;

  const refreshPayload = await verifyRefreshToken(cookies().get(REFRESH_TOKEN_COOKIE)?.value);
  if (!refreshPayload) return null;

  // Access token hết hạn nhưng refresh token còn hiệu lực — tự cấp lại access
  // token mới để không bắt người dùng đăng nhập lại giữa chừng.
  const newAccessToken = await createAccessToken(refreshPayload);
  try {
    cookies().set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(),
      path: "/",
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });
  } catch {
    // Đang render trong Server Component (chỉ đọc được cookie, không set được)
    // — middleware sẽ cấp lại access token mới ở request kế tiếp.
  }
  return refreshPayload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  const secure = isSecureRequest();

  cookies().set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  cookies().set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(ACCESS_TOKEN_COOKIE);
  cookies().delete(REFRESH_TOKEN_COOKIE);
}
