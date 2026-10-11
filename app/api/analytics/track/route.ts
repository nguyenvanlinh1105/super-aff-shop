import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function parseDevice(ua: string, width?: number): { deviceType: string; browser: string; os: string } {
  const uaLower = ua.toLowerCase();

  // 1. OS Detection
  let os = "Khác";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) os = "iOS";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("macintosh") || uaLower.includes("mac os")) os = "macOS";
  else if (uaLower.includes("linux")) os = "Linux";

  // 2. Browser Detection (ưu tiên các In-App browser phổ biến ở VN)
  let browser = "Trình duyệt";
  if (ua.includes("Zalo")) browser = "Zalo In-App";
  else if (ua.includes("FBAN") || ua.includes("FBAV")) browser = "Facebook In-App";
  else if (ua.includes("TikTok")) browser = "TikTok In-App";
  else if (ua.includes("CocCoc") || uaLower.includes("coccoc")) browser = "Cốc Cốc";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";

  // 3. Device Type
  let deviceType = "desktop";
  if (width != null) {
    if (width < 768) deviceType = "mobile";
    else if (width < 1024) deviceType = "tablet";
    else deviceType = "desktop";
  } else {
    if (uaLower.includes("mobile") || uaLower.includes("iphone") || uaLower.includes("android")) {
      deviceType = "mobile";
    } else if (uaLower.includes("ipad") || uaLower.includes("tablet")) {
      deviceType = "tablet";
    }
  }

  return { deviceType, browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPath = typeof body.path === "string" ? body.path.trim() : "/";
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

    // Bỏ qua các API route, socket, asset tĩnh, và toàn bộ trang quản trị /admin
    if (
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.startsWith("/favicon") ||
      path.startsWith("/admin") ||
      path.includes(".")
    ) {
      return NextResponse.json({ ok: true, skipped: true, reason: "excluded_path" });
    }

    const title = typeof body.title === "string" ? body.title.slice(0, 255) : null;
    const referer = typeof body.referer === "string" ? body.referer.slice(0, 500) : null;
    const screenWidth = typeof body.screenWidth === "number" ? body.screenWidth : undefined;

    // Cookie hoặc client ID
    const cookieVid = req.cookies.get("mb_vid")?.value;
    const visitorId = (typeof body.visitorId === "string" && body.visitorId.length > 5)
      ? body.visitorId
      : cookieVid || crypto.randomUUID();

    const ua = req.headers.get("user-agent") || "";
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { deviceType, browser, os } = parseDevice(ua, screenWidth);

    // Xác thực người dùng
    const session = await getSession();

    // ── QUY TẮC: KHÔNG THU THẬP DỮ LIỆU CỦA ADMIN, CHỈ THU THẬP USER THỰC TẾ ──
    if (session?.role === "admin") {
      return NextResponse.json({ ok: true, skipped: true, reason: "admin_excluded" });
    }

    let userRole = "guest";
    let userId: string | null = null;
    let customerId: string | null = null;
    let userDisplayName = `Khách #${visitorId.replace(/-/g, "").slice(0, 5).toUpperCase()}`;

    if (session?.userId) {
      userId = session.userId;
      userRole = session.role || "customer";

      if (session.customerId) {
        customerId = session.customerId;
        // Lấy mã khách và họ tên thực
        const customer = await prisma.customer.findUnique({
          where: { id: session.customerId },
          select: { fullName: true, customerCode: true },
        });
        if (customer) {
          userDisplayName = `${customer.fullName} (${customer.customerCode})`;
        } else if (session.fullName) {
          userDisplayName = session.fullName;
        }
      } else if (session.fullName) {
        userDisplayName = `${session.fullName} (Admin)`;
      }
    }

    // Ghi nhận log truy cập vào database
    await prisma.userActivityLog.create({
      data: {
        path,
        title,
        userId,
        customerId,
        userRole,
        userDisplayName,
        visitorId,
        deviceType,
        browser,
        os,
        ipAddress,
        referer,
      },
    });

    const res = NextResponse.json({ ok: true, visitorId });

    // Cập nhật cookie định danh khách lâu dài (1 năm) nếu chưa có
    if (!cookieVid) {
      res.cookies.set("mb_vid", visitorId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: false, // client JS có thể đọc để đồng bộ
      });
    }

    return res;
  } catch (err) {
    console.error("[Analytics Track Error]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
