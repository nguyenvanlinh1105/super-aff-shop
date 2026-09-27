import { Prisma } from "@prisma/client";
import { estimateCashback } from "./cashbackEstimate";

const DEFAULT_BASE_URL = "https://riohub.vn/api/v1";

export type RioHubProduct = {
  id: string;
  title?: string | null;
  main_image_url?: string | null;
  detail_link?: string | null;
  units_sold?: number | null;
  commission?: { rate?: number | null; amount?: string | null; currency?: string | null } | null;
  shop_ads_commission?: { rate?: number | null } | null;
  sales_price?: RioHubPriceRange | null;
  original_price?: RioHubPriceRange | null;
  shop?: { name?: string | null } | null;
  observed_commission?: {
    commission_rate?: number | null;
    commission_bonus_rate?: number | null;
    shop_ads_commission_rate?: number | null;
    standard_commission_rate?: number | null;
    scope?: string | null;
    source?: string | null;
    last_order_at?: string | null;
  } | null;
};

export type RioHubPriceRange = {
  minimum_amount?: string | null;
  maximum_amount?: string | null;
  currency?: string | null;
};

export type RioHubProductLinkResponse = {
  affiliate_link: string;
  sub_id: string;
  product_id: string;
  creator_username: string;
  product: RioHubProduct | null;
  product_error?: string | null;
};

export type RioHubOrder = {
  order_id: string;
  sku_id?: string | null;
  product_id?: string | null;
  product_name?: string | null;
  price?: string | null;
  quantity?: number | null;
  refunded_quantity?: number | null;
  returned_quantity?: number | null;
  fully_refunded?: number | null;
  creator_username?: string | null;
  shop_name?: string | null;
  currency?: string | null;
  settlement_status?: string | null;
  payment_status?: string | null;
  status?: number | null;
  tt_order_status?: number | null;
  content_type?: string | null;
  content_id?: string | null;
  sub_id?: string | null;
  subid?: string | null;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  commission_rate?: number | null;
  commission_bonus_rate?: number | null;
  shop_ads_commission_rate?: number | null;
  commission_gmv?: string | null;
  est_commission?: string | null;
  actual_commission?: string | null;
  create_time?: number | null;
  update_time?: number | null;
  time_created?: string | null;
  time_delivered?: string | null;
};

export type RioHubOrdersResponse = {
  creator_username: string;
  page: number;
  page_size: number;
  total: number;
  orders: RioHubOrder[];
};

export type RioHubLinkListResponse = {
  creator_username: string;
  page: number;
  page_size: number;
  total: number;
  links: unknown[];
};

export class RioHubError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "RioHubError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getRioHubConfig() {
  return {
    baseUrl: (process.env.RIOHUB_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    apiKey: process.env.RIOHUB_API_KEY || "",
    creatorUsername: process.env.RIOHUB_TIKTOK_CREATOR_USERNAME || "",
    signingSecret: process.env.RIOHUB_WEBHOOK_SIGNING_SECRET || "",
  };
}

export function getRioHubConfigStatus() {
  const config = getRioHubConfig();
  return {
    baseUrl: config.baseUrl,
    hasApiKey: Boolean(config.apiKey),
    creatorUsername: config.creatorUsername || null,
    hasCreatorUsername: Boolean(config.creatorUsername),
    hasSigningSecret: Boolean(config.signingSecret),
    readyForLinks: Boolean(config.apiKey && config.creatorUsername),
    readyForWebhook: Boolean(config.signingSecret),
  };
}

export function buildRioHubSubId(params: {
  customerCode: string;
  trackingCode: string;
  channelSource: string;
}) {
  return `${params.customerCode}-${params.trackingCode}-${params.channelSource.toUpperCase()}-`;
}

export async function createRioHubTikTokProductLink(params: {
  productUrl: string;
  subId: string;
  channel?: string;
}): Promise<RioHubProductLinkResponse> {
  return rioHubRequest<RioHubProductLinkResponse>("/partner/tiktok/affiliate/product-links", {
    method: "POST",
    body: JSON.stringify({
      creator_username: requireCreatorUsername(),
      product_url: params.productUrl,
      sub_id: params.subId,
      channel: params.channel ?? "BunnyHoanTien",
    }),
  });
}

export async function listRioHubTikTokLinks(): Promise<RioHubLinkListResponse> {
  const query = new URLSearchParams({
    creator_username: requireCreatorUsername(),
    page: "1",
    page_size: "1",
  });
  return rioHubRequest<RioHubLinkListResponse>(`/partner/tiktok/affiliate/links?${query.toString()}`);
}

export async function listRioHubTikTokOrders(params: {
  page?: number;
  pageSize?: number;
  timeStart?: string | number | null;
  timeEnd?: string | number | null;
  updateTimeStart?: string | number | null;
  updateTimeEnd?: string | number | null;
  orderId?: string | null;
} = {}): Promise<RioHubOrdersResponse> {
  const query = new URLSearchParams({
    creator_username: requireCreatorUsername(),
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 50),
  });

  if (params.timeStart) query.set("time_start", String(params.timeStart));
  if (params.timeEnd) query.set("time_end", String(params.timeEnd));
  if (params.updateTimeStart) query.set("update_time_start", String(params.updateTimeStart));
  if (params.updateTimeEnd) query.set("update_time_end", String(params.updateTimeEnd));
  if (params.orderId) query.set("order_id", params.orderId);

  return rioHubRequest<RioHubOrdersResponse>(`/partner/tiktok/affiliate/orders?${query.toString()}`);
}

export async function buildTikTokProductSnapshot(product: RioHubProduct | null) {
  if (!product) {
    return {
      productTitle: null,
      productImage: null,
      productPrice: null,
      productSold: null,
      estimatedCashback: null,
      estimatedCashbackCategory: null,
    };
  }

  const productPrice = parseRioHubPrice(product.sales_price) ?? parseRioHubPrice(product.original_price);
  const commissionRate = getEffectiveCommissionRate(product);
  const grossCommission =
    productPrice != null && commissionRate > 0
      ? new Prisma.Decimal(productPrice).mul(commissionRate).div(10000).toNumber()
      : null;
  const cashback = await estimateCashback(product.title ?? null, productPrice, grossCommission);

  return {
    productTitle: product.title ?? null,
    productImage: product.main_image_url ?? null,
    productPrice,
    productSold: typeof product.units_sold === "number" ? product.units_sold : null,
    estimatedCashback: cashback?.estimatedCashback ?? null,
    estimatedCashbackCategory: cashback?.categoryName ?? null,
  };
}

export function parseRioHubMoney(value: string | number | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;
  const first = value.split("-")[0]?.trim().replace(/,/g, "");
  if (!first) return null;
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRioHubPrice(price: RioHubPriceRange | null | undefined): number | null {
  const min = parseRioHubMoney(price?.minimum_amount);
  if (min != null && min > 0) return min;
  const max = parseRioHubMoney(price?.maximum_amount);
  return max != null && max > 0 ? max : null;
}

function getEffectiveCommissionRate(product: RioHubProduct): number {
  const observed = product.observed_commission?.commission_rate;
  if (typeof observed === "number" && observed > 0) return observed;
  const standard = product.commission?.rate ?? 0;
  const shopAds = product.shop_ads_commission?.rate ?? 0;
  return standard + shopAds;
}

function requireCreatorUsername() {
  const { creatorUsername } = getRioHubConfig();
  if (!creatorUsername) throw new Error("Thiếu RIOHUB_TIKTOK_CREATOR_USERNAME trong .env");
  return creatorUsername;
}

async function rioHubRequest<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
  const config = getRioHubConfig();
  if (!config.apiKey) throw new Error("Thiếu RIOHUB_API_KEY trong .env");

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Riohub-Api-Key": config.apiKey,
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 429 && attempt < 2) {
    const retryAfter = Number(response.headers.get("Retry-After") || "1");
    await delay(Math.max(1, retryAfter) * 1000);
    return rioHubRequest<T>(path, init, attempt + 1);
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const code = typeof data?.code === "string" ? data.code : undefined;
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
        ? data.error
        : `RioHub API lỗi HTTP ${response.status}`;
    console.error("[RIOHUB_TIKTOK_ERROR]", { status: response.status, code, message, path, data });
    throw new RioHubError(message, response.status, code, data);
  }

  return data as T;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
