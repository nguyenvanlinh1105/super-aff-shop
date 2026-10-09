const FETCH_TIMEOUT_MS = 5000;

function extractMeta(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(pattern) ?? html.match(reversed);
  if (!match) return null;
  return match[1]
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim() || null;
}

/**
 * Trích xuất giá từ JSON-LD schema (schema.org/Product > offers.price).
 */
function extractJsonLdPrice(html: string): number | null {
  try {
    const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : [data];
        for (const entry of entries) {
          const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
          for (const node of nodes) {
            if (node["@type"] === "Product" || node["@type"]?.includes?.("Product")) {
              const offers = node.offers ?? node.Offers;
              if (!offers) continue;
              const offerList = Array.isArray(offers) ? offers : [offers];
              for (const offer of offerList) {
                const price = offer.price ?? offer.lowPrice ?? offer.highPrice;
                if (price != null) {
                  const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ""));
                  if (!isNaN(parsed) && parsed > 0) return parsed;
                }
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Trích xuất số lượng đã bán từ JSON-LD hoặc meta.
 */
function extractSold(html: string): number | null {
  try {
    const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : [data];
        for (const entry of entries) {
          const nodes = entry["@graph"] ? [...entry["@graph"], entry] : [entry];
          for (const node of nodes) {
            if (node["@type"] === "Product") {
              const agg = node.aggregateRating;
              if (agg?.reviewCount) return Number(agg.reviewCount);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return null;
}

const CLASS_FALLBACK = {
  title: ["auau1S"],
  image: ["P39yUt"],
  price: ["pyzxvq", "pw3J3G"],
};

function extractTextByClass(html: string, classNames: string[]): string | null {
  for (const className of classNames) {
    const pattern = new RegExp(`class="[^"]*\\b${className}\\b[^"]*"[^>]*>([^<]+)<`, "i");
    const match = html.match(pattern);
    const text = match?.[1]?.trim();
    if (text) return text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }
  return null;
}

function extractImageSrcByClass(html: string, classNames: string[]): string | null {
  for (const className of classNames) {
    let pattern = new RegExp(`<img[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*src="([^"]+)"`, "i");
    let match = html.match(pattern);
    if (match?.[1]) return match[1];
    pattern = new RegExp(`<img[^>]*src="([^"]+)"[^>]*class="[^"]*\\b${className}\\b[^"]*"`, "i");
    match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractPriceByClass(html: string, classNames: string[]): number | null {
  const text = extractTextByClass(html, classNames);
  if (!text) return null;
  const parsed = parseFloat(text.replace(/[^0-9.]/g, ""));
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
}

export function extractPriceFromTitle(title: string | null): number | null {
  if (!title) return null;
  // Match "99k", "150k", "250K"
  const kMatch = title.match(/\b(\d{1,4})\s*[kK]\b/);
  if (kMatch) {
    const val = parseInt(kMatch[1], 10);
    if (val >= 10 && val <= 50000) return val * 1000;
  }
  // Match "99.000đ", "150,000đ", "250.000d"
  const dMatch = title.match(/\b(\d{1,3}(?:[.,]\d{3})+)\s*(?:đ|d|vnd|vnđ)?\b/i);
  if (dMatch) {
    const clean = dMatch[1].replace(/[.,]/g, "");
    const val = parseInt(clean, 10);
    if (val >= 10000 && val <= 500000000) return val;
  }
  return null;
}

function extractShopeeIds(url: string): { shopId: string; itemId: string } | null {
  try {
    const path = new URL(url).pathname;
    const opaanlpMatch = path.match(/\/opaanlp\/(\d+)\/(\d+)/);
    if (opaanlpMatch) return { shopId: opaanlpMatch[1], itemId: opaanlpMatch[2] };
    const suffixMatch = path.match(/-i\.(\d+)\.(\d+)/);
    if (suffixMatch) return { shopId: suffixMatch[1], itemId: suffixMatch[2] };
    const productMatch = path.match(/\/product\/(\d+)\/(\d+)/);
    if (productMatch) return { shopId: productMatch[1], itemId: productMatch[2] };
    return null;
  } catch {
    return null;
  }
}

export function extractTikTokOgInfo(rawUrl: string): { title: string | null; image: string | null } | null {
  try {
    const url = new URL(rawUrl.trim());
    const ogInfoParam = url.searchParams.get("og_info");
    if (ogInfoParam) {
      const parsed = JSON.parse(ogInfoParam);
      if (parsed && typeof parsed === "object") {
        const title = typeof parsed.title === "string" ? cleanTitle(parsed.title) : null;
        const image = typeof parsed.image === "string" ? cleanImage(parsed.image) : null;
        if (title || image) {
          return { title, image };
        }
      }
    }
  } catch {
    try {
      const match = rawUrl.match(/[?&]og_info=([^&]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === "object") {
          const title = typeof parsed.title === "string" ? cleanTitle(parsed.title) : null;
          const image = typeof parsed.image === "string" ? cleanImage(parsed.image) : null;
          if (title || image) {
            return { title, image };
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function cleanTitle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  // Bỏ qua tiêu đề fallback mặc định của Shopee & TikTok khi bot bị redirect hoặc trang chưa tải xong
  if (
    /Mua và Bán Trên Ứng Dụng/i.test(t) ||
    /Shopee Việt Nam \| Mua và Bán/i.test(t) ||
    /^Shopee\s*(?:Việt Nam|Vietnam)?$/i.test(t) ||
    /^Shopee: Mua Sắm/i.test(t) ||
    /^Đăng nhập tài khoản/i.test(t) ||
    /^TikTok\s*Shop(?:\s*\|\s*Mua\s*sắm)?$/i.test(t) ||
    /^TikTok$/i.test(t) ||
    /^TikTok\s*Shop:?\s*Mua\s*sắm/i.test(t)
  ) {
    return null;
  }
  return t
    .replace(/\s*[|\-–—]\s*(?:Shopee|TikTok\s*Shop|TikTok)\s*(?:Việt Nam|Vietnam)?$/i, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim() || null;
}

export function cleanImage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const img = raw.trim();
  // Loại bỏ ảnh logo hệ thống mặc định của Shopee & TikTok
  if (
    /shopee-mobilemall-live/i.test(img) ||
    /shopee_logo/i.test(img) ||
    /favicon/i.test(img) ||
    /tts-logo/i.test(img) ||
    /tiktokcdn.*\/SEO\/tts-logo/i.test(img) ||
    /tiktok-logo/i.test(img)
  ) {
    return null;
  }
  return img;
}

export function resolveDisplayProductName(
  trackingTitle?: string | null,
  itemName?: string | null,
  fallback = "Sản phẩm mua sắm"
): string {
  const cleanTracking = cleanTitle(trackingTitle);
  const cleanItem = cleanTitle(itemName);
  return cleanTracking || cleanItem || fallback;
}

export function resolveDisplayProductImage(
  trackingImage?: string | null
): string | null {
  return cleanImage(trackingImage);
}

export type ProductInfo = {
  title: string | null;
  image: string | null;
  price: number | null; // giá gốc (VNĐ)
  sold: number | null;  // số lượng đã bán (nếu có)
};

/**
 * Best-effort scrape: lấy Open Graph tags + JSON-LD schema để lấy tiêu đề, ảnh, giá.
 * Hỗ trợ linh hoạt cả Shopee, TikTok Shop, Lazada.
 */
export async function fetchProductInfo(url: string): Promise<ProductInfo | null> {
  // 1. Kiểm tra nhanh xem link TikTok có mang theo og_info không
  const tiktokOg = extractTikTokOgInfo(url);
  if (tiktokOg?.title || tiktokOg?.image) {
    const priceFromTitle = extractPriceFromTitle(tiktokOg.title);
    return {
      title: tiktokOg.title,
      image: tiktokOg.image,
      price: priceFromTitle,
      sold: null,
    };
  }

  const candidateUrls: string[] = [];

  // Đối với Shopee, nếu trích xuất được shopId & itemId thì ưu tiên universal-link
  // vì Shopee render đầy đủ OpenGraph meta tags cho bot khi gọi qua universal-link.
  const shopeeIds = extractShopeeIds(url);
  if (shopeeIds) {
    candidateUrls.push(`https://shopee.vn/universal-link/product/${shopeeIds.shopId}/${shopeeIds.itemId}`);
    candidateUrls.push(`https://shopee.vn/product/${shopeeIds.shopId}/${shopeeIds.itemId}`);
  }
  candidateUrls.push(url);

  const UAS = [
    // WhatsApp UA — Shopee trả về 100% og:title + og:image thật, không bị chặn
    "WhatsApp/2.21.12.21 A",
    // TelegramBot — Shopee trả về meta tags đầy đủ
    "TelegramBot (like TwitterBot)",
    "Twitterbot/1.0",
    // Facebook crawler — lấy được og:title + og:image
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    // Mobile Chrome UA
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    // Standard Desktop UA
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    // Googlebot (cho các trang khác Shopee hỗ trợ JSON-LD)
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ];

  for (const targetUrl of candidateUrls) {
    for (const ua of UAS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": ua,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "vi-VN,vi;q=0.9",
          },
        });
        clearTimeout(timeout);

        if (!res.ok) continue;

        const html = await res.text();
        let rawTitle = extractMeta(html, "og:title") || extractMeta(html, "twitter:title");
        let title = cleanTitle(rawTitle);

        let rawImage = extractMeta(html, "og:image") || extractMeta(html, "twitter:image");
        let image = cleanImage(rawImage);

        let price = extractJsonLdPrice(html);
        const sold = extractSold(html);

        if (!title) title = cleanTitle(extractTextByClass(html, CLASS_FALLBACK.title));
        if (!image) image = cleanImage(extractImageSrcByClass(html, CLASS_FALLBACK.image));
        if (price == null) price = extractPriceByClass(html, CLASS_FALLBACK.price);
        if (price == null && title) price = extractPriceFromTitle(title);

        // Nếu lấy được ít nhất tiêu đề hoặc ảnh hợp lệ, trả về ngay
        if (title || image) {
          return { title, image, price, sold };
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}
