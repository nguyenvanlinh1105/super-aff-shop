import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
import { fetchProductInfo } from "@/lib/productInfo";

export async function GET() {
  const vouchers = await prisma.voucher.findMany({
    where: { status: "active" },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      platform: true,
      linkMatches: { include: { trackingLink: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({
    vouchers: vouchers.map((v) => ({
      id: v.id,
      title: v.title,
      benefitText: v.benefitText,
      productImage: v.productImage,
      platformName: v.platform.name,
      endsAt: v.endsAt,
      shortUrl: v.linkMatches[0]?.trackingLink.shortUrl ?? v.voucherUrl,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { platformId, title, voucherCode, voucherUrl, benefitText, conditionsText, endsAt } = await req.json();
  if (!platformId || (!title && !voucherUrl)) {
    return NextResponse.json({ error: "Thiếu nền tảng, và cần tên chương trình hoặc link sản phẩm" }, { status: 400 });
  }

  const platform = await prisma.platform.findUnique({ where: { id: platformId } });
  if (!platform) {
    return NextResponse.json({ error: "Nền tảng không hợp lệ" }, { status: 400 });
  }

  let resolvedTitle: string | undefined = title;
  let productImage: string | null = null;
  let voucherUrlToStore: string | undefined = voucherUrl;
  let trackingLinkId: string | null = null;

  if (voucherUrl) {
    try {
      const resolved = await resolveShortLink(voucherUrl);
      const normalized = normalizeUrl(resolved);
      voucherUrlToStore = normalized;
      const info = await fetchProductInfo(normalized);
      if (info?.title && !resolvedTitle) resolvedTitle = info.title;
      if (info?.image && !productImage) productImage = info.image;
    } catch {
      // Neu lay thong tin that bai van cho dang voucher voi link goc
    }
  }

  // Shopee/TikTok thuong chan lay ten san pham tu dong (xem lib/productInfo.ts) —
  // khong vi the ma chan dang tin, vi muc tieu la dang cang nhanh cang tot truoc
  // khi deal so luong gioi han het. Dung ten chung chung, sep sua lai sau cung duoc.
  if (!resolvedTitle) {
    const now = new Date();
    const timeLabel = now.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    resolvedTitle = `Deal ${platform.name} — ${timeLabel}`;
  }

  const voucher = await prisma.voucher.create({
    data: {
      platformId,
      title: resolvedTitle,
      voucherCode,
      voucherUrl: voucherUrlToStore,
      productImage,
      benefitText,
      conditionsText,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      status: "active",
      createdByUserId: session.userId,
      ...(trackingLinkId
        ? { linkMatches: { create: { trackingLinkId } } }
        : {}),
    },
  });

  return NextResponse.json({ voucher });
}
