import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createTrackingLink } from "@/lib/trackingLinkService";

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

  if (!originalUrl || (!bodyPlatformId && !platformCode)) {
    return NextResponse.json({ error: "Thieu link goc hoac nen tang" }, { status: 400 });
  }

  // Cho phép truyền platformCode ("SHOPEE"/"TIKTOK") thay vì platformId nội
  // bộ — dùng khi tạo link demo tự động sau đăng ký, lúc đó client chỉ biết
  // mã sàn đã phát hiện từ bước xem trước, không có platformId.
  let platformId = bodyPlatformId;
  if (!platformId && platformCode) {
    const platform = await prisma.platform.findUnique({ where: { code: platformCode } });
    if (!platform) {
      return NextResponse.json({ error: "Nen tang khong hop le" }, { status: 400 });
    }
    platformId = platform.id;
  }
  if (!platformId) {
    return NextResponse.json({ error: "Thieu nen tang" }, { status: 400 });
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
