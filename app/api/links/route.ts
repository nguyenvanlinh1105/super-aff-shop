import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createTrackingLink } from "@/lib/trackingLinkService";
import { detectPlatform } from "@/lib/linkConversion";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }

  const customerId = session.role === "customer" ? session.customerId : req.nextUrl.searchParams.get("customerId");

  const links = await prisma.trackingLink.findMany({
    where: customerId ? { customerId } : undefined,
    include: { platform: true, customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    links: links.map((link) => ({
      ...link,
      generatedLink: link.affiliateUrl,
      subId: link.subId2,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
  }

  const body = await req.json();
  const { originalUrl, platformId: bodyPlatformId, platformCode, channelSource = "web", productPrice } = body as {
    originalUrl?: string;
    platformId?: string;
    platformCode?: string;
    channelSource?: "web" | "zalo" | "telegram";
    productPrice?: number;
  };

  if (!originalUrl || typeof originalUrl !== "string" || (!bodyPlatformId && !platformCode)) {
    return NextResponse.json({ error: "Thiếu link gốc hoặc chưa chọn nền tảng" }, { status: 400 });
  }

  if (originalUrl.length > 2000) {
    return NextResponse.json({ error: "Link quá dài, vui lòng kiểm tra lại" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(originalUrl.trim());
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Link không hợp lệ. URL phải bắt đầu bằng http:// hoặc https://" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Định dạng URL không hợp lệ. Vui lòng kiểm tra lại" }, { status: 400 });
  }

  // Cho phép truyền platformCode ("SHOPEE"/"TIKTOK") thay vì platformId nội
  // bộ — dùng khi tạo link demo tự động sau đăng ký, lúc đó client chỉ biết
  // mã sàn đã phát hiện từ bước xem trước, không có platformId.
  let platformId = bodyPlatformId;
  let finalPlatformCode = platformCode;
  
  if (!platformId && platformCode) {
    const platform = await prisma.platform.findUnique({ where: { code: platformCode } });
    if (!platform) {
      return NextResponse.json({ error: "Nền tảng không hợp lệ" }, { status: 400 });
    }
    platformId = platform.id;
  } else if (platformId && !finalPlatformCode) {
    const platform = await prisma.platform.findUnique({ where: { id: platformId } });
    if (platform) {
      finalPlatformCode = platform.code;
    }
  }

  if (!platformId) {
    return NextResponse.json({ error: "Thiếu thông tin nền tảng" }, { status: 400 });
  }

  const detected = detectPlatform(originalUrl);
  if (finalPlatformCode?.toUpperCase() === "SHOPEE" && detected !== "shopee") {
    return NextResponse.json({ error: "Link không thuộc hệ thống Shopee. Vui lòng dán đúng link sản phẩm Shopee." }, { status: 400 });
  }
  if (finalPlatformCode?.toUpperCase() === "TIKTOK" && detected !== "tiktok") {
    return NextResponse.json({ error: "Link không thuộc hệ thống TikTok. Vui lòng dán đúng link sản phẩm TikTok." }, { status: 400 });
  }

  const customerId = session.role === "customer" ? session.customerId : body.customerId;
  if (!customerId) {
    return NextResponse.json({ error: "Thieu khach hang" }, { status: 400 });
  }

  try {
    const result = await createTrackingLink({
      originalUrl,
      platformId,
      customerId,
      channelSource,
      createdByUserId: session.userId,
      manualPrice: typeof productPrice === "number" && productPrice > 0 ? productPrice : null,
    });

    return NextResponse.json({
      success: true,
      data: [
        {
          ...result.link,
          generatedLink: result.generatedLink,
          subId: result.subId,
          shortCode: result.shortCode,
        },
      ],
      link: {
        ...result.link,
        generatedLink: result.generatedLink,
        subId: result.subId,
        shortCode: result.shortCode,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Khong tao duoc link",
      },
      { status: 400 }
    );
  }
}
