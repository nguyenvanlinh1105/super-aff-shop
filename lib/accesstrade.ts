import { AffiliateSubIds } from "./linkConversion";

const ACCESSTRADE_CREATE_LINK_ENDPOINT = "https://api.accesstrade.vn/v1/product_link/create";

type AccessTradeCreateLinkResponse = {
  success?: boolean;
  data?: {
    success_link?: { url_origin: string; aff_link: string; short_link?: string }[];
    error_link?: { url_origin: string; error?: string }[];
  };
};

/**
 * Goi API that cua AccessTrade de tao deep link TikTok Shop (theo tai lieu
 * https://developers.accesstrade.vn/api-accesstrade-tai-lieu-tich-hop/create-tracking-link).
 * Tra ve null neu chua cau hinh token/campaign hoac API loi — de goi noi (linkConversion.ts)
 * fallback ve link mock, khong lam gian doan flow tao link.
 */
export async function buildTikTokAffiliateUrlViaAccessTrade(
  normalizedUrl: string,
  trackingCode: string,
  subIds?: AffiliateSubIds
): Promise<string | null> {
  const token = process.env.ACCESSTRADE_API_TOKEN;
  const campaignId = process.env.ACCESSTRADE_TIKTOK_CAMPAIGN_ID;

  if (!token || !campaignId) return null;

  const effectiveSubIds = subIds ?? { subId2: trackingCode };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(ACCESSTRADE_CREATE_LINK_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        urls: [normalizedUrl],
        utm_source: "affiliate_app",
        utm_medium: "web",
        utm_campaign: "tiktok_link",
        utm_content: trackingCode,
        sub1: effectiveSubIds.subId1 ?? "",
        sub2: effectiveSubIds.subId2 ?? trackingCode,
        sub3: effectiveSubIds.subId3 ?? "",
        sub4: effectiveSubIds.subId4 ?? "",
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data: AccessTradeCreateLinkResponse = await res.json();
    const affLink = data.data?.success_link?.[0]?.aff_link;
    return affLink ?? null;
  } catch {
    return null;
  }
}
