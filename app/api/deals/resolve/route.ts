import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { detectPlatform, resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
import { generateShortCode, buildShortUrl } from "@/lib/shortLink";
import { fetchProductInfo } from "@/lib/productInfo";
import { createTrackingLink } from "@/lib/trackingLinkService";
import { getSystemCustomer } from "@/lib/systemCustomer";

// Tất cả params affiliate thường thấy của đối thủ
const COMPETITOR_PARAMS = [
  "mmp_pid", "uls_trackid", "utm_source", "utm_medium", "utm_campaign",
  "utm_content", "utm_term", "af_siteid", "af_sub_siteid", "pid",
  "cns", "affiliate_id", "sub_id", "sub_id1", "sub_id2", "sub_id3",
  "sub_id4", "sub_id5", "click_id", "sp_atk", "xptdk", "smtt",
  "share_channel_code", "deep_and_deferred", "is_from_login", "action_from",
  "credential_token", "exp_group", "gads_t_sig",
];

function stripCompetitorParams(url: string): string {
  try {
    const parsed = new URL(url);
    COMPETITOR_PARAMS.forEach((p) => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { url } = await req.json();
  if (!url?.trim()) {
    return NextResponse.json({ error: "Thiếu link" }, { status: 400 });
  }

  const resolved = await resolveShortLink(url.trim());
  const normalized = normalizeUrl(resolved);
  const cleanLink = stripCompetitorParams(normalized);

  let shortCode = await generateShortCode();
  let shortUrl = buildShortUrl(shortCode);

  let affiliateUrl = cleanLink;
  let productTitle: string | null = null;
  let shopeeImageUrl: string | null = null;
  let trackingCreated = false;

  const platformType = detectPlatform(cleanLink);
  const platformCode =
    platformType === "tiktok"
      ? "TIKTOK"
      : platformType === "lazada"
      ? "LAZADA"
      : "SHOPEE";

  try {
    const platform =
      (await prisma.platform.findFirst({ where: { code: platformCode } })) ||
      (await prisma.platform.findFirst({ where: { code: "SHOPEE" } }));

    if (platform) {
      const systemCustomer = await getSystemCustomer();
      const result = await createTrackingLink({
        originalUrl: cleanLink,
        platformId: platform.id,
        customerId: systemCustomer.id,
        channelSource: "web",
        createdByUserId: session.userId,
      });

      affiliateUrl = result.generatedLink;
      productTitle = result.link.productTitle;
      shopeeImageUrl = result.link.productImage;
      // Dùng luôn shortCode/shortUrl của TrackingLink đã lưu vào DB
      // để khi admin copy/click test ở bước 2 KHÔNG BAO GIỜ bị 404!
      if (result.link.shortCode) shortCode = result.link.shortCode;
      if (result.link.shortUrl) shortUrl = result.link.shortUrl;
      trackingCreated = true;
    }
  } catch (err) {
    console.error("Lỗi tạo tracking link cho deal:", err);
  }

  // Nếu chưa lấy đủ tiêu đề hoặc ảnh từ createTrackingLink, dùng fetchProductInfo
  if (!productTitle || !shopeeImageUrl) {
    const productInfo = await fetchProductInfo(cleanLink);
    if (!productTitle && productInfo?.title) productTitle = productInfo.title;
    if (!shopeeImageUrl && productInfo?.image) shopeeImageUrl = productInfo.image;
  }

  // Đảm bảo shortCode được lưu trong DB ngay lập tức để link luôn hoạt động 100%
  if (!trackingCreated) {
    try {
      const systemCustomer = await getSystemCustomer();
      const fallbackPlatform =
        (await prisma.platform.findFirst({ where: { code: platformCode } })) ||
        (await prisma.platform.findFirst());
      if (fallbackPlatform) {
        await prisma.trackingLink.create({
          data: {
            customerId: systemCustomer.id,
            platformId: fallbackPlatform.id,
            channelSource: "web",
            trackingCode: `DEAL_${shortCode}`,
            originalUrl: cleanLink,
            normalizedUrl: cleanLink,
            affiliateUrl,
            productTitle,
            productImage: shopeeImageUrl,
            shortCode,
            shortUrl,
            createdByUserId: session.userId,
          },
        });
      }
    } catch (e) {
      console.error("Lỗi tạo fallback tracking link:", e);
    }
  }

  return NextResponse.json({
    rawInputLink: url.trim(),
    cleanLink,
    affiliateUrl,
    shortCode, // trả về để client giữ và truyền lên khi tạo deal
    shortUrl, // link đã dạng tên miền của mình, hiện ngay cho admin và hoạt động ngay lập tức
    productTitle,
    shopeeImageUrl,
  });
}

