import { buildTikTokAffiliateUrlViaAccessTrade } from "./accesstrade";

export type DetectedPlatform = "shopee" | "tiktok" | "unknown";
export type AffiliateSubIds = {
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
};
export type BuildAffiliateUrlOptions = {
  platformCode?: string;
};

export function detectPlatform(rawUrl: string): DetectedPlatform {
  const url = rawUrl.toLowerCase();
  // shp.ee la domain rut gon chinh thuc cua Shopee (vn.shp.ee, s.shopee.vn...),
  // khong chua chuoi "shopee." nen phai kiem tra rieng.
  if (url.includes("shopee.") || url.includes("shp.ee")) return "shopee";
  if (url.includes("tiktok.") || url.includes("vt.tiktok") || url.includes("vm.tiktok")) return "tiktok";
  return "unknown";
}

const SHORT_LINK_HOST_PATTERNS = [/(^|\.)shp\.ee$/, /(^|\.)s\.shopee\.vn$/, /(^|\.)vt\.tiktok\.com$/, /(^|\.)vm\.tiktok\.com$/];

function isShortLinkHost(hostname: string): boolean {
  return SHORT_LINK_HOST_PATTERNS.some((pattern) => pattern.test(hostname.toLowerCase()));
}

/**
 * Link rut gon (shp.ee, s.shopee.vn, vt/vm.tiktok.com) chi la redirect stub —
 * theo redirect thuc te de lay URL san pham that, tranh luu lai link co the
 * het han va giup lay duoc thong tin/anh san pham chinh xac hon.
 */
export async function resolveShortLink(rawUrl: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return rawUrl;
  }

  if (!isShortLinkHost(parsed.hostname)) return rawUrl;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);
    return res.url || rawUrl;
  } catch {
    return rawUrl;
  }
}

export function normalizeUrl(rawUrl: string): string {
  try {
    const shopeeExtractedUrl = extractNestedShopeeUrl(rawUrl.trim());
    const url = new URL(shopeeExtractedUrl ?? rawUrl.trim());
    // Bỏ query params tracking cũ để tránh chồng tracking khi đổi link nhiều lần.
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "sub_id",
      "click_id",
      "sp_atk",
      "xptdk",
      "smtt",
      "share_channel_code",
      "uls_trackid",
      "deep_and_deferred",
      "is_from_login",
      "action_from",
      "af_siteid",
      "af_sub_siteid",
      "pid",
      "cns",
    ].forEach((p) => url.searchParams.delete(p));

    if (detectPlatform(rawUrl) === "shopee") {
      // Link Shopee copy từ app/web thường kèm token phiên như `sp_atk`, `xptdk`
      // hoặc các tham số state tạm thời. Với affiliate redirect, chỉ cần URL công khai.
      url.search = "";
    }

    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

function extractNestedShopeeUrl(rawUrl: string): string | null {
  const decoded = safeDecodeURIComponent(rawUrl);
  const marker = "https://shopee.vn/";
  const lastIndex = decoded.toLowerCase().lastIndexOf(marker);
  if (lastIndex === -1) return null;
  return decoded.slice(lastIndex);
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// NOTE: Shopee dung link mock dang s.shopee.vn/an_redir (chua co API affiliate
// Shopee that — xem 05-ghi-chu-nghien-cuu-va-rui-ro.md). TikTok Shop di qua
// AccessTrade (mang affiliate that, xem lib/accesstrade.ts) khi da cau hinh
// ACCESSTRADE_API_TOKEN/ACCESSTRADE_TIKTOK_CAMPAIGN_ID, neu chua thi fallback
// ve link mock (gan sub_id truc tiep vao URL goc) de khong lam gian doan flow.
export async function buildAffiliateUrl(
  normalizedUrl: string,
  trackingCode: string,
  subIds?: AffiliateSubIds,
  options?: BuildAffiliateUrlOptions
): Promise<string> {
  const platformCode = options?.platformCode?.toUpperCase();
  if (platformCode === "SHOPEE") {
    return buildShopeeAffiliateUrl(normalizedUrl, trackingCode, subIds);
  }

  if (platformCode === "TIKTOK") {
    const accessTradeLink = await buildTikTokAffiliateUrlViaAccessTrade(normalizedUrl, trackingCode, subIds);
    if (accessTradeLink) return accessTradeLink;
  }

  try {
    const url = new URL(normalizedUrl);
    const effectiveSubIds = subIds ?? { subId2: trackingCode };

    if (effectiveSubIds.subId1) url.searchParams.set("sub_id1", effectiveSubIds.subId1);
    if (effectiveSubIds.subId2) url.searchParams.set("sub_id2", effectiveSubIds.subId2);
    if (effectiveSubIds.subId3) url.searchParams.set("sub_id3", effectiveSubIds.subId3);
    if (effectiveSubIds.subId4) url.searchParams.set("sub_id4", effectiveSubIds.subId4);
    if (effectiveSubIds.subId5) url.searchParams.set("sub_id5", effectiveSubIds.subId5);

    // Giữ fallback cho các network/flow chỉ đọc một tracking key chung.
    url.searchParams.set("sub_id", effectiveSubIds.subId2 ?? trackingCode);
    url.searchParams.set("aff_channel", "affiliate-hoantien");
    return url.toString();
  } catch {
    const separator = normalizedUrl.includes("?") ? "&" : "?";
    const params = new URLSearchParams();
    const effectiveSubIds = subIds ?? { subId2: trackingCode };

    if (effectiveSubIds.subId1) params.set("sub_id1", effectiveSubIds.subId1);
    if (effectiveSubIds.subId2) params.set("sub_id2", effectiveSubIds.subId2);
    if (effectiveSubIds.subId3) params.set("sub_id3", effectiveSubIds.subId3);
    if (effectiveSubIds.subId4) params.set("sub_id4", effectiveSubIds.subId4);
    if (effectiveSubIds.subId5) params.set("sub_id5", effectiveSubIds.subId5);
    params.set("sub_id", effectiveSubIds.subId2 ?? trackingCode);

    return `${normalizedUrl}${separator}${params.toString()}`;
  }
}

function buildShopeeAffiliateUrl(
  normalizedUrl: string,
  trackingCode: string,
  subIds?: AffiliateSubIds
): string {
  const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
  if (!affiliateId) {
    throw new Error("Thieu SHOPEE_AFFILIATE_ID trong .env de build link Shopee");
  }

  const effectiveSubIds = subIds ?? { subId2: trackingCode };
  const params = new URLSearchParams({
    origin_link: normalizedUrl,
    affiliate_id: affiliateId,
    sub_id: effectiveSubIds.subId2 ?? trackingCode,
  });

  if (effectiveSubIds.subId1) params.set("sub_id1", effectiveSubIds.subId1);
  if (effectiveSubIds.subId2) params.set("sub_id2", effectiveSubIds.subId2);
  if (effectiveSubIds.subId3) params.set("sub_id3", effectiveSubIds.subId3);
  if (effectiveSubIds.subId4) params.set("sub_id4", effectiveSubIds.subId4);
  if (effectiveSubIds.subId5) params.set("sub_id5", effectiveSubIds.subId5);

  return `https://s.shopee.vn/an_redir?${params.toString()}`;
}
