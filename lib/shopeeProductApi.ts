const FETCH_TIMEOUT_MS = 5000;

export type ShopeeProductDetail = {
  name: string | null;
  price: number | null; // VND
  sold: number | null;
  image: string | null;
};

function extractShopeeIds(url: string): { shopId: string; itemId: string } | null {
  try {
    const path = new URL(url).pathname;
    const suffixMatch = path.match(/-i\.(\d+)\.(\d+)/);
    if (suffixMatch) return { shopId: suffixMatch[1], itemId: suffixMatch[2] };
    const productMatch = path.match(/\/product\/(\d+)\/(\d+)/);
    if (productMatch) return { shopId: productMatch[1], itemId: productMatch[2] };
    // Link chia sẻ ngắn từ app Shopee (s.shopee.vn/xxxx) redirect ra dạng
    // /opaanlp/SHOPID/ITEMID trước khi Shopee tự đổi route thành
    // /product/SHOPID/ITEMID — đã xác nhận bằng quan sát thực tế: cùng
    // credential_token, cùng 2 số, chỉ khác đúng tên route. Nhận diện luôn ở
    // đây để không phải đợi/đoán được redirect cuối mới lấy được ID.
    const opaanlpMatch = path.match(/\/opaanlp\/(\d+)\/(\d+)/);
    if (opaanlpMatch) return { shopId: opaanlpMatch[1], itemId: opaanlpMatch[2] };
    return null;
  } catch {
    return null;
  }
}

/**
 * Goi thang API noi bo ma web Shopee dung de render trang san pham (khong
 * phai API affiliate chinh thuc — Shopee chua cap API do, xem ghi chu trong
 * lib/linkConversion.ts). Day la cach duy nhat lay duoc gia/luot ban theo
 * thoi gian thuc, nhung co the bi chan hoac doi cau truc bat ky luc nao nen
 * phai coi la best-effort, callers luon phai xu ly truong hop tra ve null.
 */
export async function fetchShopeeProductDetail(url: string): Promise<ShopeeProductDetail | null> {
  const ids = extractShopeeIds(url);
  if (!ids) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(
      `https://shopee.vn/api/v4/pdp/get_pc?item_id=${ids.itemId}&shop_id=${ids.shopId}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/json",
          Referer: url,
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json();
    const item = json?.data?.item;
    if (!item) return null;

    const rawPrice = typeof item.price_min === "number" ? item.price_min : item.price;
    const price = typeof rawPrice === "number" ? Math.round(rawPrice / 100000) : null;
    const sold =
      typeof item.historical_sold === "number"
        ? item.historical_sold
        : typeof item.sold === "number"
        ? item.sold
        : null;
    const imageHash = item.image ?? item.images?.[0] ?? null;
    const image = imageHash ? `https://cf.shopee.vn/file/${imageHash}` : null;

    if (price == null && !image) return null;
    return { name: item.name ?? null, price, sold, image };
  } catch {
    return null;
  }
}
