import { detectPlatform } from "./linkConversion";

export type ZaloWebhookMessage = {
  raw: unknown;
  senderId: string | null;
  recipientId: string | null;
  text: string | null;
  eventName: string | null;
};

export type ZaloSendResult = {
  ok: boolean;
  simulated: boolean;
  response?: unknown;
  error?: string;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function extractZaloWebhookMessage(payload: any): ZaloWebhookMessage {
  const text =
    payload?.message?.text ??
    payload?.message?.msg ??
    payload?.text ??
    payload?.data?.message?.text ??
    null;

  return {
    raw: payload,
    senderId:
      payload?.sender?.id?.toString?.() ??
      payload?.from?.id?.toString?.() ??
      payload?.user_id?.toString?.() ??
      null,
    recipientId:
      payload?.recipient?.id?.toString?.() ??
      payload?.to?.id?.toString?.() ??
      payload?.oa_id?.toString?.() ??
      null,
    text: typeof text === "string" ? text.trim() : null,
    eventName: payload?.event_name ?? payload?.type ?? null,
  };
}

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  return match?.[0] ?? null;
}

export function buildZaloHelpMessage(): string {
  return [
    "Mình đã nhận được tin nhắn.",
    "Bạn hãy gửi link sản phẩm Shopee hoặc TikTok để mình đổi sang link affiliate hoàn tiền.",
    "Ví dụ: https://shopee.vn/... hoặc https://vt.tiktok.com/...",
  ].join("\n");
}

export function buildUnsupportedPlatformMessage(rawUrl: string): string {
  return [
    "Mình đã nhận được link nhưng hiện chỉ hỗ trợ Shopee và TikTok.",
    `Link bạn gửi: ${rawUrl}`,
  ].join("\n");
}

export function buildAffiliateReplyMessage(params: {
  platformName: string;
  affiliateUrl: string;
  trackingCode: string;
  customerCode: string;
  channelSource: "web" | "zalo";
}): string {
  return [
    `Đã đổi link ${params.platformName} thành công.`,
    `Link affiliate: ${params.affiliateUrl}`,
    `Mã khách: ${params.customerCode}`,
    `Mã tracking: ${params.trackingCode}`,
    `Nguồn: ${params.channelSource.toUpperCase()}`,
    "Lưu ý: hãy bấm vào link affiliate trước khi mua để hệ thống có thể đối soát hoa hồng.",
  ].join("\n");
}

export function buildWebhookVerificationResponse(url: URL): string | null {
  const verifyToken = process.env.ZALO_OA_VERIFY_TOKEN;
  const token =
    url.searchParams.get("verify_token") ??
    url.searchParams.get("hub.verify_token") ??
    url.searchParams.get("token");
  const challenge =
    url.searchParams.get("challenge") ??
    url.searchParams.get("hub.challenge") ??
    url.searchParams.get("oa_id");

  if (!challenge) return null;
  if (!verifyToken) return challenge;
  return token === verifyToken ? challenge : null;
}

export async function sendZaloOaTextMessage(params: {
  recipientId: string;
  message: string;
}) : Promise<ZaloSendResult> {
  const accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
  const endpoint = process.env.ZALO_OA_MESSAGE_ENDPOINT;

  if (!accessToken || !endpoint) {
    return {
      ok: true,
      simulated: true,
      response: {
        reason: "Missing ZALO_OA_ACCESS_TOKEN or ZALO_OA_MESSAGE_ENDPOINT",
        recipientId: params.recipientId,
        message: params.message,
      },
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        recipient: { user_id: params.recipientId },
        message: { text: params.message },
      }),
    });

    const responseBody = await response.json().catch(() => null);
    return {
      ok: response.ok,
      simulated: false,
      response: responseBody,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function mapDetectedPlatformToCode(url: string): "SHOPEE" | "TIKTOK" | null {
  const platform = detectPlatform(url);
  if (platform === "shopee") return "SHOPEE";
  if (platform === "tiktok") return "TIKTOK";
  return null;
}
