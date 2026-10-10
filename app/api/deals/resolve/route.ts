import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { detectPlatform, resolveShortLink, normalizeUrl, buildAffiliateUrl } from "@/lib/linkConversion";
import { generateShortCode, buildShortUrl } from "@/lib/shortLink";
import { fetchProductInfo } from "@/lib/productInfo";

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

  const shortCode = await generateShortCode();
  const shortUrl = buildShortUrl(shortCode);

  const platformType = detectPlatform(cleanLink);
  const platformCode =
    platformType === "tiktok"
      ? "TIKTOK"
      : platformType === "lazada"
      ? "LAZADA"
      : "SHOPEE";

  let affiliateUrl = cleanLink;
  try {
    affiliateUrl = await buildAffiliateUrl(cleanLink, `DEAL_${shortCode}`, undefined, { platformCode });
  } catch (err) {
    console.warn("Không build được affiliate url trực tiếp, dùng link sạch:", err);
  }

  // Lấy thêm thông tin chi tiết (giá, ảnh, tiêu đề) bằng fetchProductInfo
  let productTitle: string | null = null;
  let shopeeImageUrl: string | null = null;
  let productPrice: number | null = null;

  try {
    const productInfo = await fetchProductInfo(cleanLink);
    if (productInfo?.title) productTitle = productInfo.title;
    if (productInfo?.image) shopeeImageUrl = productInfo.image;
    if (productInfo?.price) productPrice = productInfo.price;
  } catch (err) {
    console.warn("Lỗi scrape thông tin sản phẩm deal:", err);
  }

  return NextResponse.json({
    rawInputLink: url.trim(),
    cleanLink,
    affiliateUrl,
    shortCode, // trả về để client giữ và truyền lên khi tạo deal
    shortUrl, // link dạng tên miền của mình, hiện ngay cho admin
    productTitle,
    shopeeImageUrl,
    price: productPrice,
  });
}
