import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
import {
  fetchProductInfo,
  extractTikTokOgInfo,
  extractPriceFromTitle,
  cleanTitle,
  cleanImage,
} from "@/lib/productInfo";
import { fetchShopeeProductDetail } from "@/lib/shopeeProductApi";
import { estimateCashback } from "@/lib/cashbackEstimate";

// Xem trước link KHÔNG cần đăng nhập — cho khách vãng lai "dùng thử trước
// khi đăng ký". KHÔNG ghi DB, không tạo TrackingLink/customer nào, chỉ đọc
// thông tin sản phẩm + ước tính hoàn tiền để hiển thị. Link thật chỉ được
// tạo sau khi khách đăng ký xong, qua /api/links (có session).
export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({}));
  if (!url?.trim()) {
    return NextResponse.json({ error: "Thiếu link sản phẩm" }, { status: 400 });
  }

  const rawUrl = url.trim();
  const platform = detectPlatform(rawUrl);
  if (platform === "unknown") {
    return NextResponse.json({ error: "Chỉ hỗ trợ link Shopee, TikTok Shop hoặc Lazada" }, { status: 400 });
  }

  try {
    const resolved = await resolveShortLink(rawUrl);
    const normalized = normalizeUrl(resolved);

    const isTikTok = platform === "tiktok";
    const isShopee = platform === "shopee";

    // Bóc tách og_info từ link TikTok chia sẻ từ app
    const tiktokOg = isTikTok
      ? extractTikTokOgInfo(rawUrl) || extractTikTokOgInfo(resolved)
      : null;

    const [productInfo, shopeeDetail] = await Promise.all([
      !tiktokOg?.title ? fetchProductInfo(normalized) : Promise.resolve(null),
      isShopee ? fetchShopeeProductDetail(normalized) : Promise.resolve(null),
    ]);

    const rawTitle =
      tiktokOg?.title ||
      productInfo?.title ||
      shopeeDetail?.name ||
      null;
    const title = cleanTitle(rawTitle);

    const rawImage =
      tiktokOg?.image ||
      productInfo?.image ||
      shopeeDetail?.image ||
      null;
    const image = cleanImage(rawImage);

    const price =
      productInfo?.price ??
      shopeeDetail?.price ??
      extractPriceFromTitle(title) ??
      null;

    const cashback = await estimateCashback(title, price);

    return NextResponse.json({
      platformCode: platform.toUpperCase(),
      productTitle: title,
      productImage: image,
      productPrice: price,
      estimatedCashback: cashback?.estimatedCashback != null ? Number(cashback.estimatedCashback) : null,
      categoryName: cashback?.categoryName ?? null,
      categoryRate: cashback?.categoryRate != null ? Number(cashback.categoryRate) : null,
      customerEffectiveRate: cashback?.customerEffectiveRate != null ? Number(cashback.customerEffectiveRate) : null,
      sampleCashbacks: cashback?.sampleCashbacks ?? null,
    });
  } catch {
    // Không lấy được thông tin sản phẩm (link lạ, site chặn bot...) — vẫn
    // trả về thành công tối thiểu để không chặn khách, chỉ là preview rỗng.
    return NextResponse.json({
      platformCode: platform.toUpperCase(),
      productTitle: null,
      productImage: null,
      productPrice: null,
      estimatedCashback: null,
      categoryName: null,
      categoryRate: null,
      customerEffectiveRate: null,
      sampleCashbacks: null,
    });
  }
}

