import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildAffiliateReplyMessage,
  buildUnsupportedPlatformMessage,
  buildWebhookVerificationResponse,
  buildZaloHelpMessage,
  extractFirstUrl,
  extractZaloWebhookMessage,
  mapDetectedPlatformToCode,
  sendZaloOaTextMessage,
} from "@/lib/zaloOa";
import { createTrackingLink } from "@/lib/trackingLinkService";
import { generateCustomerCode } from "@/lib/customerCode";

export async function GET(req: NextRequest) {
  const challenge = buildWebhookVerificationResponse(req.nextUrl);
  if (!challenge) {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => ({}));
  const incoming = extractZaloWebhookMessage(payload);
  const account = await prisma.zaloAccount.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const inboundLog = await prisma.zaloMessageLog.create({
    data: {
      zaloAccountId: account?.id,
      direction: "in",
      senderId: incoming.senderId,
      receiverId: incoming.recipientId,
      messageType: incoming.eventName,
      messageText: incoming.text,
      payload: JSON.stringify(payload),
      processingStatus: "received",
    },
  });

  if (!account || account.status !== "active") {
    return NextResponse.json({ ok: true, skipped: "No active Zalo account" });
  }

  if (!incoming.senderId) {
    await prisma.zaloMessageLog.update({
      where: { id: inboundLog.id },
      data: { processingStatus: "ignored_no_sender" },
    });
    return NextResponse.json({ ok: true, skipped: "No sender id" });
  }

  let customer = await prisma.customer.findFirst({
    where: { zaloUserId: incoming.senderId },
  });

  if (!customer) {
    const customerCode = await generateCustomerCode();
    customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: `Zalo User ${incoming.senderId}`,
        zaloUserId: incoming.senderId,
        note: "Tự tạo từ webhook Zalo OA",
      },
    });
  }

  const originalUrl = extractFirstUrl(incoming.text);
  let replyText = "";
  let processingStatus = "processed";

  if (!originalUrl) {
    replyText = buildZaloHelpMessage();
    processingStatus = "processed_no_url";
  } else {
    const platformCode = mapDetectedPlatformToCode(originalUrl);

    if (!platformCode) {
      replyText = buildUnsupportedPlatformMessage(originalUrl);
      processingStatus = "processed_unsupported_platform";
    } else {
      const platform = await prisma.platform.findUnique({ where: { code: platformCode } });

      if (!platform) {
        replyText = "Hệ thống chưa cấu hình nền tảng phù hợp để đổi link.";
        processingStatus = "processed_platform_not_found";
      } else {
        const created = await createTrackingLink({
          originalUrl,
          platformId: platform.id,
          customerId: customer.id,
          channelSource: "zalo",
        });

        replyText = buildAffiliateReplyMessage({
          platformName: platform.name,
          affiliateUrl: created.shortUrl,
          trackingCode: created.link.trackingCode,
          customerCode: customer.customerCode,
          channelSource: "zalo",
        });
      }
    }
  }

  const sendResult = await sendZaloOaTextMessage({
    recipientId: incoming.senderId,
    message: replyText,
  });

  await prisma.zaloMessageLog.create({
    data: {
      zaloAccountId: account.id,
      customerId: customer.id,
      direction: "out",
      senderId: incoming.recipientId,
      receiverId: incoming.senderId,
      messageType: "text",
      messageText: replyText,
      payload: JSON.stringify(
        sendResult.response ?? { error: sendResult.error, simulated: sendResult.simulated }
      ),
      processingStatus: sendResult.ok
        ? sendResult.simulated
          ? "simulated"
          : "sent"
        : "send_failed",
    },
  });

  await prisma.zaloMessageLog.update({
    where: { id: inboundLog.id },
    data: {
      customerId: customer.id,
      processingStatus,
    },
  });

  return NextResponse.json({
    ok: true,
    customerCode: customer.customerCode,
    replyText,
    sendResult,
  });
}
