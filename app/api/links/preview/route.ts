import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, resolveShortLink, normalizeUrl } from "@/lib/linkConversion";
import { fetchProductInfo } from "@/lib/productInfo";
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

  const platform = detectPlatform(url.trim());
  if (platform === "unknown") {
    return NextResponse.json({ error: "Chỉ hỗ trợ link Shopee hoặc TikTok Shop" }, { status: 400 });
  }

  try {
    const resolved = await resolveShortLink(url.trim());
    const normalized = normalizeUrl(resolved);
    const productInfo = await fetchProductInfo(normalized);
    const cashback = await estimateCashback(productInfo?.title ?? null, productInfo?.price ?? null);

    return NextResponse.json({
      platformCode: platform === "shopee" ? "SHOPEE" : "TIKTOK",
      productTitle: productInfo?.title ?? null,
      productImage: productInfo?.image ?? null,
      productPrice: productInfo?.price ?? null,
      estimatedCashback: cashback ? Number(cashback.estimatedCashback) : null,
      categoryName: cashback?.categoryName ?? null,
    });
  } catch {
    // Không lấy được thông tin sản phẩm (link lạ, site chặn bot...) — vẫn
    // trả về thành công tối thiểu để không chặn khách, chỉ là preview rỗng.
    return NextResponse.json({
      platformCode: platform === "shopee" ? "SHOPEE" : "TIKTOK",
      productTitle: null,
      productImage: null,
      productPrice: null,
      estimatedCashback: null,
      categoryName: null,
    });
  }
}
