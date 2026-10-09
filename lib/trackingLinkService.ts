import { prisma } from "./prisma";
import {
  normalizeUrl,
  buildAffiliateUrl,
  resolveShortLink,
  buildTikTokAffiliateWithSnapshot,
  TikTokProductSnapshot,
} from "./linkConversion";
import { generateTrackingCode, buildShopeeSubIds } from "./tracking";
import { buildShortUrl, generateShortCode } from "./shortLink";
import {
  fetchProductInfo,
  extractPriceFromTitle,
  extractTikTokOgInfo,
  cleanTitle,
  cleanImage,
} from "./productInfo";
import { fetchShopeeProductDetail } from "./shopeeProductApi";
import { estimateCashback } from "./cashbackEstimate";

export async function createTrackingLink(params: {
  originalUrl: string;
  platformId: string;
  customerId: string;
  channelSource: "web" | "zalo" | "telegram";
  createdByUserId?: string | null;
  manualPrice?: number | null;
}) {
  const [platform, customer] = await Promise.all([
    prisma.platform.findUnique({ where: { id: params.platformId } }),
    prisma.customer.findUnique({ where: { id: params.customerId } }),
  ]);

  if (!platform || !customer) {
    throw new Error("Nen tang hoac khach hang khong hop le");
  }

  const trackingCode = await generateTrackingCode({
    platformCode: platform.code,
    customerCode: customer.customerCode,
    channelSource: params.channelSource,
  });

  const resolvedUrl = await resolveShortLink(params.originalUrl);
  const normalizedUrl = normalizeUrl(resolvedUrl);
  const shortCode = await generateShortCode();
  const shortUrl = buildShortUrl(shortCode);
  const subIds = buildShopeeSubIds({
    customerCode: customer.customerCode,
    trackingCode,
    channelSource: params.channelSource,
  });

  const isShopee = platform.code.toUpperCase() === "SHOPEE";
  const isTikTok = platform.code.toUpperCase() === "TIKTOK";

  let affiliateUrl: string;
  let tikTokSnapshot: TikTokProductSnapshot | null = null;

  if (isTikTok) {
    const tikTokRes = await buildTikTokAffiliateWithSnapshot(normalizedUrl, trackingCode, subIds);
    if (tikTokRes?.affiliateUrl) {
      affiliateUrl = tikTokRes.affiliateUrl;
      tikTokSnapshot = tikTokRes.productSnapshot ?? null;
    } else {
      affiliateUrl = await buildAffiliateUrl(normalizedUrl, trackingCode, subIds, {
        platformCode: platform.code,
      });
    }
  } else {
    affiliateUrl = await buildAffiliateUrl(normalizedUrl, trackingCode, subIds, {
      platformCode: platform.code,
    });
  }

  // Thu thập thông tin sản phẩm đa nguồn (ưu tiên dữ liệu sàn chuẩn -> og_info URL -> API chi tiết -> Scrape)
  const tiktokOg = isTikTok
    ? extractTikTokOgInfo(params.originalUrl) || extractTikTokOgInfo(resolvedUrl)
    : null;

  const [productInfo, shopeeDetail] = await Promise.all([
    !tikTokSnapshot?.productTitle && !tiktokOg?.title
      ? fetchProductInfo(normalizedUrl)
      : Promise.resolve(null),
    isShopee ? fetchShopeeProductDetail(normalizedUrl) : Promise.resolve(null),
  ]);

  const rawTitle =
    tikTokSnapshot?.productTitle ||
    tiktokOg?.title ||
    productInfo?.title ||
    shopeeDetail?.name ||
    null;
  const productTitle = cleanTitle(rawTitle);

  const rawImage =
    tikTokSnapshot?.productImage ||
    tiktokOg?.image ||
    productInfo?.image ||
    shopeeDetail?.image ||
    null;
  const productImage = cleanImage(rawImage);

  // Ưu tiên giá: Nhập tay > RioHub Snapshot > Scrape/API > Trích xuất từ tiêu đề
  const rawPrice =
    params.manualPrice && params.manualPrice > 0
      ? params.manualPrice
      : (tikTokSnapshot?.productPrice ??
        productInfo?.price ??
        shopeeDetail?.price ??
        extractPriceFromTitle(productTitle) ??
        null);
  const productPrice = rawPrice;

  const productSold =
    tikTokSnapshot?.productSold ??
    shopeeDetail?.sold ??
    productInfo?.sold ??
    null;

  // Tính tiền hoàn: Nếu RioHub có snapshot với hoa hồng thật thì dùng, nếu không thì ước tính theo ngành hàng
  const cashback =
    tikTokSnapshot?.estimatedCashback != null
      ? {
          estimatedCashback: tikTokSnapshot.estimatedCashback,
          categoryName: tikTokSnapshot.estimatedCashbackCategory || "TikTok Shop",
        }
      : productPrice != null
      ? await estimateCashback(productTitle, productPrice)
      : null;

  const link = await prisma.trackingLink.create({
    data: {
      customerId: customer.id,
      platformId: platform.id,
      channelSource: params.channelSource,
      trackingCode,
      originalUrl: params.originalUrl,
      normalizedUrl,
      affiliateUrl,
      productTitle,
      productImage,
      productPrice,
      productSold,
      estimatedCashback: cashback?.estimatedCashback ?? null,
      shortCode,
      shortUrl,
      ...subIds,
      createdByUserId: params.createdByUserId ?? null,
    },
    include: { platform: true, customer: true },
  });

  return {
    link,
    generatedLink: affiliateUrl,
    shortCode,
    shortUrl,
    subId: subIds.subId2,
    estimatedCashbackCategory: cashback?.categoryName ?? null,
  };
}

