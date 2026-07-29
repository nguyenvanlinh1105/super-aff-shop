import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
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

  // shortCode/shortUrl riêng của deal — dùng cho link công khai + đếm click
  // trên trang /uu-dai, độc lập với TrackingLink bên dưới.
  const shortCode = await generateShortCode();
  const shortUrl = buildShortUrl(shortCode);

  // Link affiliate PHẢI đi qua createTrackingLink (giống hệt luồng voucher)
  // để có trackingCode + sub_id đúng chuẩn, gắn cho khách hệ thống "SYSTEM"
  // (Link chia sẻ công khai) — nếu không, sub_id gửi cho Shopee sẽ không
  // khớp với bất kỳ TrackingLink nào khi đối soát CSV, khiến đơn hàng của
  // deal rơi vào "chưa map" và không ai được ghi nhận hoa hồng.
  let affiliateUrl = cleanLink;
  let productTitle: string | null = null;
  let shopeeImageUrl: string | null = null;

  if (cleanLink.includes("shopee.vn")) {
    try {
      const platform = await prisma.platform.findFirst({ where: { code: "SHOPEE" } });
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
      }
    } catch {
      // Thiếu SHOPEE_AFFILIATE_ID hoặc lỗi tạm thời — vẫn cho đăng deal với
      // link gốc, không chặn luồng đăng tin của admin.
    }
  }

  // Chỉ fetch riêng nếu chưa có sẵn từ createTrackingLink ở trên (tránh gọi
  // fetchProductInfo 2 lần cho cùng 1 link).
  if (productTitle === null && shopeeImageUrl === null) {
    const productInfo = await fetchProductInfo(cleanLink);
    productTitle = productInfo?.title ?? null;
    shopeeImageUrl = productInfo?.image ?? null;
  }

  return NextResponse.json({
    rawInputLink: url.trim(),
    cleanLink,
    affiliateUrl,
    shortCode,   // trả về để client giữ và truyền lên khi tạo deal
    shortUrl,    // link đã dạng tên miền của mình, hiện ngay cho admin
    productTitle,
    shopeeImageUrl,
  });
}

