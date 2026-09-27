// Client cho Lazada Open API (Affiliate) — dùng trực tiếp, KHÔNG qua bên
// trung gian như RioHub (Lazada cấp API chính thức). Ký request theo chuẩn
// TOP (Alibaba/Lazada Open Platform): sort tham số theo tên, nối key+value
// liên tiếp (không dấu = hay &), ghép API path phía trước, HMAC-SHA256 với
// App Secret, hex UPPERCASE. Đã test sống và xác nhận đúng thuật toán
// (request vượt qua bước kiểm tra chữ ký, chỉ còn báo access_token hết hạn)
// — dùng crypto có sẵn của Node, KHÔNG cài SDK/package mới (VPS RAM hạn chế
// từng OOM khi cài googleapis, xem lib/googleSheets.ts).
import { createHmac } from "crypto";

export type LazadaConfig = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  accessToken: string;
};

export function getLazadaConfig(): LazadaConfig {
  return {
    baseUrl: (process.env.LAZADA_API_BASE_URL || "https://api.lazada.sg/rest").replace(/\/+$/, ""),
    appKey: process.env.LAZADA_APP_KEY || "",
    appSecret: process.env.LAZADA_APP_SECRET || "",
    accessToken: process.env.LAZADA_ACCESS_TOKEN || "",
  };
}

export function getLazadaConfigStatus() {
  const config = getLazadaConfig();
  return {
    baseUrl: config.baseUrl,
    hasAppKey: Boolean(config.appKey),
    hasAppSecret: Boolean(config.appSecret),
    hasAccessToken: Boolean(config.accessToken),
    ready: Boolean(config.appKey && config.appSecret && config.accessToken),
  };
}

export class LazadaApiError extends Error {
  code?: string;
  requestId?: string;

  constructor(message: string, code?: string, requestId?: string) {
    super(message);
    this.name = "LazadaApiError";
    this.code = code;
    this.requestId = requestId;
  }
}

function signRequest(apiPath: string, params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let concatenated = apiPath;
  for (const key of sortedKeys) concatenated += key + params[key];
  return createHmac("sha256", appSecret).update(concatenated, "utf8").digest("hex").toUpperCase();
}

async function lazadaRequest<T>(apiPath: string, businessParams: Record<string, string>): Promise<T> {
  const config = getLazadaConfig();
  if (!config.appKey || !config.appSecret || !config.accessToken) {
    throw new Error("Thiếu LAZADA_APP_KEY / LAZADA_APP_SECRET / LAZADA_ACCESS_TOKEN trong .env");
  }

  const systemParams: Record<string, string> = {
    app_key: config.appKey,
    timestamp: String(Date.now()),
    sign_method: "sha256",
    access_token: config.accessToken,
  };
  const allParams = { ...systemParams, ...businessParams };
  const sign = signRequest(apiPath, allParams, config.appSecret);
  const query = new URLSearchParams({ ...allParams, sign }).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${apiPath}?${query}`, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new LazadaApiError(`Lazada API trả về dữ liệu không hợp lệ: ${text.slice(0, 200)}`);
  }

  // Response lỗi của Lazada có "type":"ISV"/"code" khác "0"/không có field
  // "data" mong đợi — bản thân request thành công (HTTP 200) nhưng logic
  // bên trong báo lỗi, phải tự kiểm tra field "code"/"type" như dưới đây.
  if (data?.code && data.code !== "0" && data.type) {
    throw new LazadaApiError(data.message || "Lazada API lỗi", data.code, data.request_id);
  }

  return data as T;
}

export type LazadaGetLinkResult = {
  productId: string | null;
  productName: string | null;
  promotionLink: string | null;
  commission: string | null;
};

/**
 * /marketing/getlink (Batch get link) — CHỈ endpoint này nhận URL sản phẩm
 * trực tiếp (inputType=url); "Get tracking link by product id" chỉ nhận
 * productId số nên không dùng được cho luồng khách tự dán link.
 */
export async function getLazadaLinkByUrl(
  productUrl: string,
  subIds?: { subId1?: string; subId2?: string; subId3?: string; subId4?: string; subId5?: string; subId6?: string }
): Promise<LazadaGetLinkResult> {
  const params: Record<string, string> = {
    inputType: "url",
    inputValue: productUrl,
  };
  if (subIds?.subId1) params.subId1 = subIds.subId1;
  if (subIds?.subId2) params.subId2 = subIds.subId2;
  if (subIds?.subId3) params.subId3 = subIds.subId3;
  if (subIds?.subId4) params.subId4 = subIds.subId4;
  if (subIds?.subId5) params.subId5 = subIds.subId5;
  if (subIds?.subId6) params.subId6 = subIds.subId6;

  const data = await lazadaRequest<any>("/marketing/getlink", params);
  const item = data?.data?.urlBatchGetLinkInfoList;
  const info = Array.isArray(item) ? item[0] : item;

  if (!info || info.errorInfoList) {
    const err = info?.errorInfoList;
    // Log response thật khi lỗi/không khớp cấu trúc mong đợi — hữu ích để
    // xác nhận đúng field name thật của Lazada ngay lần test đầu tiên có
    // access_token hợp lệ, thay vì đoán mù theo tài liệu dạng bảng text.
    if (!info) console.warn("[LAZADA_GETLINK_UNEXPECTED_SHAPE]", JSON.stringify(data).slice(0, 500));
    throw new LazadaApiError(err?.errorMsg || "Không lấy được link Lazada cho URL này", err?.errorCode);
  }

  return {
    productId: info.productId ?? null,
    productName: info.productName ?? null,
    promotionLink: info.regularPromotionLink ?? null,
    commission: info.regularCommission ?? null,
  };
}

export type LazadaConversionRow = {
  orderId: string;
  subOrderId: string | null;
  offerName: string | null;
  skuName: string | null;
  status: string | null;
  estPayout: string | null;
  orderAmt: string | null;
  currency: string | null;
  subId1: string | null;
  subId2: string | null;
  fulfilledTime: string | null;
  deliveredTime: string | null;
  returnedTime: string | null;
};

export async function getLazadaConversionReport(params: {
  dateStart: string;
  dateEnd: string;
  page?: number;
  limit?: number;
}): Promise<{ rows: LazadaConversionRow[]; total: number }> {
  const data = await lazadaRequest<any>("/marketing/conversion/report", {
    dateStart: params.dateStart,
    dateEnd: params.dateEnd,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 100),
  });

  // NOTE: tài liệu Lazada cung cấp chỉ liệt kê tên field, không có mẫu JSON
  // đầy đủ nên KHÔNG chắc chắn 100% key bọc ngoài là "data" hay tên khác —
  // đoán theo quy ước "data" đã thấy ở /marketing/getlink. Nếu sai, hàm này
  // âm thầm trả về mảng rỗng (không crash) nên log cảnh báo rõ để phát hiện
  // ngay khi có access_token thật, tránh lặp lại kiểu lỗi "âm thầm sai số"
  // như vụ parse tiền CSV Shopee trước đó.
  const rawList = data?.data ?? data?.result;
  if (!Array.isArray(rawList)) {
    console.warn(
      "[LAZADA_CONVERSION_REPORT_UNEXPECTED_SHAPE] Không tìm thấy mảng đơn hàng ở data.data/data.result — kiểm tra lại cấu trúc response thật:",
      JSON.stringify(data).slice(0, 500)
    );
  }
  const rows: LazadaConversionRow[] = (rawList ?? []).map((r: any) => ({
    orderId: r.orderId,
    subOrderId: r.subOrderId ?? null,
    offerName: r.offerName ?? null,
    skuName: r.skuName ?? null,
    status: r.status ?? null,
    estPayout: r.estPayout ?? null,
    orderAmt: r.orderAmt ?? null,
    currency: r.currency ?? null,
    subId1: r.subId1 ?? null,
    subId2: r.subId2 ?? null,
    fulfilledTime: r.fulfilledTime ?? null,
    deliveredTime: r.deliveredTime ?? null,
    returnedTime: r.returnedTime ?? null,
  }));

  return { rows, total: rows.length };
}
