import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  answerTelegramCallbackQuery,
  buildAffiliateReplyMessage,
  buildBankInfoFlowPrompt,
  buildBankInfoSavedMessage,
  buildConvertLinkPromptMessage,
  buildDealsListMessage,
  buildFlowCancelledMessage,
  buildLinkExpiredMessage,
  buildLinkPromptMessage,
  buildLinkSuccessMessage,
  buildLinksListMessage,
  buildOrdersListMessage,
  buildReferralInfoMessage,
  buildReplyKeyboardMenu,
  buildTelegramHelpMessage,
  buildUnsupportedPlatformMessage,
  buildTikTokDisabledOnTelegramMessage,
  buildWalletMessage,
  buildWithdrawErrorMessage,
  buildWithdrawSuccessMessage,
  extractFirstUrl,
  extractTelegramMessage,
  mapDetectedPlatformToCode,
  matchQuickMenuCommand,
  sendTelegramTextMessage,
} from "@/lib/telegramBot";
import { createTrackingLink } from "@/lib/trackingLinkService";
import { getOrCreatePersonalDealLink } from "@/lib/dealPersonalization";
import { generateCustomerCode } from "@/lib/customerCode";
import { createWithdrawRequest } from "@/lib/withdrawRequest";
import {
  cancelFlow,
  handleBankInfoFlowReply,
  isValidFlowStep,
  parseFlowData,
  startBankInfoFlow,
} from "@/lib/telegramBankFlow";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (configuredSecret && secret !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, endpoint: "/api/telegram/webhook" });
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");

  if (configuredSecret && secretHeader !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "Invalid secret token" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));
  const incoming = extractTelegramMessage(payload);
  const isCallback = incoming.eventName === "callback_query";

  const account = await prisma.telegramAccount.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const inboundLog = await prisma.telegramMessageLog.create({
    data: {
      telegramAccountId: account?.id,
      direction: "in",
      externalMessageId: incoming.messageId,
      senderId: incoming.senderId,
      receiverId: incoming.chatId,
      messageType: incoming.eventName,
      messageText: incoming.text,
      payload: JSON.stringify(payload),
      processingStatus: "received",
    },
  });

  if (!account || account.status !== "active") {
    return NextResponse.json({ ok: true, skipped: "No active Telegram account" });
  }

  if (!incoming.senderId || !incoming.chatId) {
    await prisma.telegramMessageLog.update({
      where: { id: inboundLog.id },
      data: { processingStatus: "ignored_missing_sender_or_chat" },
    });
    return NextResponse.json({ ok: true, skipped: "Missing sender or chat" });
  }

  const normalizedText = incoming.text?.trim() ?? "";
  let command: string;
  let args: string[] = [];

  const quickMenuCommand = isCallback ? null : matchQuickMenuCommand(normalizedText);

  if (isCallback) {
    command = `/${normalizedText.toLowerCase()}`;
  } else if (quickMenuCommand) {
    command = quickMenuCommand;
  } else {
    const parts = normalizedText.split(/\s+/);
    command = parts[0]?.toLowerCase() ?? "";
    args = parts.slice(1);
  }

  let customer = await prisma.customer.findFirst({ where: { telegramUserId: incoming.senderId } });
  let linkOutcomeMessage: string | null = null;

  if (command === "/start" && args[0]) {
    const code = args[0].toUpperCase();
    const linkCode = await prisma.telegramLinkCode.findUnique({ where: { code } });
    const isValid = linkCode && !linkCode.usedAt && linkCode.expiresAt.getTime() > Date.now();

    if (isValid && linkCode) {
      // Gỡ liên kết cũ (nếu Telegram này từng tự tạo 1 customer rời rạc trước đó)
      // để đảm bảo 1 senderId Telegram chỉ khớp đúng 1 customer duy nhất.
      await prisma.customer.updateMany({
        where: { telegramUserId: incoming.senderId, id: { not: linkCode.customerId } },
        data: { telegramUserId: null, telegramUsername: null },
      });

      customer = await prisma.customer.update({
        where: { id: linkCode.customerId },
        data: { telegramUserId: incoming.senderId, telegramUsername: incoming.username },
      });

      await prisma.telegramLinkCode.update({ where: { id: linkCode.id }, data: { usedAt: new Date() } });

      linkOutcomeMessage = buildLinkSuccessMessage({
        fullName: customer.fullName,
        customerCode: customer.customerCode,
      });
    } else {
      linkOutcomeMessage = buildLinkExpiredMessage();
    }
  }

  if (!customer) {
    const customerCode = await generateCustomerCode();
    customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: incoming.fullName || `Telegram User ${incoming.senderId}`,
        telegramUserId: incoming.senderId,
        telegramUsername: incoming.username,
        note: "Tu dong tao tu webhook Telegram (chua lien ket web)",
      },
    });
  } else if (incoming.username && customer.telegramUsername !== incoming.username) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { telegramUsername: incoming.username },
    });
  }

  // Hội thoại nhiều bước nhập thông tin ngân hàng (bot hỏi lần lượt tên NH
  // -> số TK -> tên chủ TK) — kiểm tra TRƯỚC mọi lệnh khác, vì trong lúc
  // này mọi tin nhắn thường (không phải lệnh khác) đều là câu trả lời cho
  // bước hiện tại, không phải nội dung để xử lý như bình thường.
  let flowReplyText: string | null = null;
  const activeFlowStep = customer.telegramFlowStep;
  if (!isCallback && isValidFlowStep(activeFlowStep)) {
    const lowerText = normalizedText.toLowerCase();
    if (lowerText === "/huy" || lowerText === "/cancel") {
      await cancelFlow(customer.id);
      flowReplyText = buildFlowCancelledMessage();
    } else if (normalizedText.startsWith("/")) {
      // Gõ lệnh khác giữa chừng -> huỷ luồng, để lệnh đó xử lý bình thường bên dưới.
      await cancelFlow(customer.id);
    } else {
      const flowData = parseFlowData(customer.telegramFlowData);
      const flowResult = await handleBankInfoFlowReply(customer.id, activeFlowStep, flowData, normalizedText);
      if (!flowResult.done) {
        flowReplyText = buildBankInfoFlowPrompt(flowResult.next, flowResult.data);
      } else {
        const withdrawResult = await createWithdrawRequest(customer.id);
        const savedMessage = buildBankInfoSavedMessage({
          bankName: flowResult.bankName,
          bankAccountNumber: flowResult.bankAccountNumber,
          bankAccountName: flowResult.bankAccountName,
        });
        const withdrawMessage = withdrawResult.ok
          ? buildWithdrawSuccessMessage(withdrawResult.request.amount)
          : buildWithdrawErrorMessage(withdrawResult.error);
        flowReplyText = `${savedMessage}\n\n${withdrawMessage}`;
      }
    }
  }

  const originalUrl = extractFirstUrl(normalizedText);
  let replyText = "";
  let processingStatus = "processed";

  if (flowReplyText !== null) {
    replyText = flowReplyText;
    processingStatus = "processed_bank_flow";
  } else if (linkOutcomeMessage) {
    replyText = linkOutcomeMessage;
    processingStatus = command === "/start" && args[0] ? "processed_start_link" : processingStatus;
  } else if (!normalizedText || command === "/start" || command === "/help") {
    replyText = customer.note?.includes("chua lien ket web")
      ? `${buildTelegramHelpMessage()}\n\n${buildLinkPromptMessage()}`
      : buildTelegramHelpMessage();
    processingStatus = "processed_help";
  } else if (command === "/newlink") {
    replyText = buildConvertLinkPromptMessage();
    processingStatus = "processed_newlink_prompt";
  } else if (command === "/wallet") {
    const orders = await prisma.order.findMany({ where: { customerId: customer.id } });
    const available = orders
      .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const processing = orders
      .filter((o) => o.payoutStatus === "processing")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const paid = orders
      .filter((o) => o.payoutStatus === "paid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

    replyText = buildWalletMessage({
      customerName: customer.fullName,
      customerCode: customer.customerCode,
      available,
      processing,
      paid,
      totalOrders: orders.length,
    });
    processingStatus = "processed_wallet";
  } else if (command === "/rut" || command === "/withdraw") {
    // Dùng chung đúng 1 hàm với web (lib/withdrawRequest.ts) để 2 kênh
    // không bao giờ lệch nhau về điều kiện/số tiền tối thiểu/chặn trùng.
    const result = await createWithdrawRequest(customer.id);
    if (result.ok) {
      replyText = buildWithdrawSuccessMessage(result.request.amount);
      processingStatus = "processed_withdraw_success";
    } else if (result.code === "missing_bank_info") {
      await startBankInfoFlow(customer.id);
      replyText = buildBankInfoFlowPrompt("await_bank_name");
      processingStatus = "processed_withdraw_start_bank_flow";
    } else {
      replyText = buildWithdrawErrorMessage(result.error);
      processingStatus = "processed_withdraw_error";
    }
  } else if (command === "/orders") {
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    replyText = buildOrdersListMessage(
      orders.map((o) => ({
        orderExternalId: o.orderExternalId,
        orderStatus: o.orderStatus,
        customerRewardAmount: Number(o.customerRewardAmount),
      }))
    );
    processingStatus = "processed_orders";
  } else if (command === "/links") {
    const links = await prisma.trackingLink.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    replyText = buildLinksListMessage(
      links.map((l) => ({ trackingCode: l.trackingCode, shortUrl: l.shortUrl, createdAt: l.createdAt }))
    );
    processingStatus = "processed_links";
  } else if (command === "/referral") {
    const [activeRule, referredCount, referralOrders] = await Promise.all([
      prisma.commissionRule.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where: { referredById: customer.id } }),
      prisma.order.findMany({ where: { customerId: customer.id, sourceType: "referral" } }),
    ]);

    const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
    const totalBonusEarned = referralOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meowback.vn";

    replyText = buildReferralInfoMessage({
      inviteUrl: `${appUrl}/register?ref=${customer.customerCode}`,
      referralPercent: Math.round(referralRate * 1000) / 10,
      maxReferralOrders: activeRule?.maxReferralOrders ?? 5,
      referralValidityMonths: activeRule?.referralValidityMonths ?? 6,
      referredCount,
      totalBonusEarned,
    });
    processingStatus = "processed_referral";
  } else if (command === "/deals") {
    const deals = await prisma.dealPost.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Mỗi deal gửi qua Telegram PHẢI map vào link cá nhân của đúng khách
    // này (không phải link chung của deal gán vào SYSTEM) — trước đây
    // luôn gửi d.shortUrl tĩnh, khiến 100% deal bấm qua Telegram bị tính
    // nhầm hoa hồng vào khách hệ thống thay vì người thật đã bấm.
    //
    // Chạy TUẦN TỰ (không Promise.all) — sinh trackingCode dựa trên số thứ
    // tự trong ngày của khách, chạy song song nhiều deal cùng lúc cho CÙNG
    // 1 khách khiến nhiều request đọc cùng "số thứ tự kế tiếp" trước khi
    // request nào commit xong, gây lỗi trùng trackingCode (unique
    // constraint) — đã bắt được lỗi này ngay trong lần test đầu tiên nhờ
    // log DEAL_PERSONALIZE_FALLBACK mới thêm.
    const dealsWithPersonalLinks: { title: string; discountPercent: number | null; url: string | null }[] = [];
    for (const d of deals) {
      const personalLink = await getOrCreatePersonalDealLink({
        customerId: customer.id,
        deal: { id: d.id, cleanLink: d.cleanLink, platformCode: d.platformCode },
        channelSource: "telegram",
      });

      dealsWithPersonalLinks.push({
        title: d.title,
        discountPercent: d.discountPercent,
        url: personalLink?.shortUrl ?? d.shortUrl ?? d.affiliateUrl,
      });
    }

    replyText = buildDealsListMessage(dealsWithPersonalLinks);
    processingStatus = "processed_deals";
  } else if (!originalUrl) {
    replyText = buildTelegramHelpMessage();
    processingStatus = "processed_no_url";
  } else {
    const platformCode = mapDetectedPlatformToCode(originalUrl);

    if (!platformCode) {
      replyText = buildUnsupportedPlatformMessage(originalUrl);
      processingStatus = "processed_unsupported_platform";
    } else if (platformCode === "TIKTOK") {
      // TikTok Shop tạm khoá riêng cho kênh Telegram — Shopee vẫn hoạt động
      // bình thường, web vẫn đổi được link TikTok như cũ.
      replyText = buildTikTokDisabledOnTelegramMessage();
      processingStatus = "processed_tiktok_disabled_telegram";
    } else {
      const platform = await prisma.platform.findUnique({ where: { code: platformCode } });

      if (!platform) {
        replyText = "😕 Hệ thống chưa cấu hình nền tảng phù hợp để đổi link này.";
        processingStatus = "processed_platform_not_found";
      } else {
        const created = await createTrackingLink({
          originalUrl,
          platformId: platform.id,
          customerId: customer.id,
          channelSource: "telegram",
        });

        replyText = buildAffiliateReplyMessage({
          platformName: platform.name,
          affiliateUrl: created.shortUrl,
          trackingCode: created.link.trackingCode,
          customerCode: customer.customerCode,
        });
      }
    }
  }

  const sendResult = await sendTelegramTextMessage({
    chatId: incoming.chatId,
    message: replyText,
    keyboard: buildReplyKeyboardMenu(),
  });

  if (isCallback && incoming.callbackQueryId) {
    await answerTelegramCallbackQuery(incoming.callbackQueryId);
  }

  await prisma.telegramMessageLog.create({
    data: {
      telegramAccountId: account.id,
      customerId: customer.id,
      direction: "out",
      senderId: incoming.chatId,
      receiverId: incoming.senderId,
      messageType: "text",
      messageText: replyText,
      payload: JSON.stringify(
        sendResult.response ?? { error: sendResult.error, simulated: sendResult.simulated }
      ),
      processingStatus: sendResult.ok ? (sendResult.simulated ? "simulated" : "sent") : "send_failed",
    },
  });

  await prisma.telegramMessageLog.update({
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
