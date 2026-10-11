import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  answerTelegramCallbackQuery,
  buildAffiliateReplyMessage,
  buildBankInfoFlowPrompt,
  buildBankInfoSavedMessage,
  buildConvertLinkPromptMessage,
  buildDealCardCaption,
  buildDealsListMessage,
  buildFlowCancelledMessage,
  buildLinkExpiredMessage,
  buildLinkPromptMessage,
  buildLinkSuccessMessage,
  buildLinksListMessage,
  buildOrdersListMessage,
  buildReferralInfoMessage,
  buildReplyKeyboardMenu,
  buildReplyKeyboardRemove,
  buildMainMenuKeyboard,
  buildTelegramHelpMessage,
  buildUnsupportedPlatformMessage,
  buildTikTokDisabledOnTelegramMessage,
  buildWalletMessage,
  buildWithdrawErrorMessage,
  buildWithdrawSuccessMessage,
  escapeHtml,
  extractFirstUrl,
  extractTelegramMessage,
  mapDetectedPlatformToCode,
  matchQuickMenuCommand,
  sendTelegramTextMessage,
  sendTelegramPhoto,
  editTelegramMessageMedia,
  TelegramInlineKeyboard,
  TelegramReplyKeyboard,
  TelegramReplyKeyboardRemove,
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

  let activeAccount = account;
  if (!activeAccount || activeAccount.status !== "active") {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop").replace(/\/+$/, "");
      activeAccount = await prisma.telegramAccount.upsert({
        where: { id: "default-telegram-account" },
        update: { status: "active", webhookUrl: `${appUrl}/api/telegram/webhook` },
        create: {
          id: "default-telegram-account",
          botName: "MeowBack Hoàn Tiền Bot",
          botUsername: "meowback_bot",
          botTokenHint: process.env.TELEGRAM_BOT_TOKEN.slice(-8),
          webhookUrl: `${appUrl}/api/telegram/webhook`,
          status: "active",
        },
      });
    } else {
      return NextResponse.json({ ok: true, skipped: "No active Telegram account" });
    }
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
    const rawCode = args[0].trim();
    const code = rawCode.toUpperCase();

    // 1. Kiểm tra nếu là mã liên kết Quản Trị Viên (Admin)
    const adminLinkCode = await prisma.adminTelegramLinkCode.findUnique({
      where: { code },
      include: { user: true },
    });

    if (adminLinkCode) {
      const isValidAdmin = !adminLinkCode.usedAt && adminLinkCode.expiresAt.getTime() > Date.now();
      if (isValidAdmin && adminLinkCode.user) {
        // Gỡ liên kết chat này khỏi các tài khoản admin khác (nếu có) để tránh xung đột
        await prisma.user.updateMany({
          where: {
            role: "admin",
            telegramChatId: incoming.chatId,
            id: { not: adminLinkCode.userId },
          },
          data: { telegramChatId: null, telegramUsername: null },
        });

        const updatedAdmin = await prisma.user.update({
          where: { id: adminLinkCode.userId },
          data: {
            telegramChatId: incoming.chatId,
            telegramUsername: incoming.username || null,
          },
        });

        await prisma.adminTelegramLinkCode.update({
          where: { id: adminLinkCode.id },
          data: { usedAt: new Date() },
        });

        linkOutcomeMessage = [
          "🎉 <b>KẾT NỐI QUẢN TRỊ VIÊN THÀNH CÔNG!</b>",
          "",
          `👋 Xin chào Quản trị viên <b>${escapeHtml(updatedAdmin.fullName)}</b>!`,
          `📧 Email: <code>${escapeHtml(updatedAdmin.email)}</code>`,
          `🆔 Telegram Chat ID: <code>${incoming.chatId}</code>`,
          `👤 Username: ${incoming.username ? `@${incoming.username}` : "<i>Chưa đặt username</i>"}`,
          "",
          "✅ <b>Tài khoản của bạn đã được kết nối với hệ thống MeowBack.</b>",
          "Từ bây giờ bot sẽ tự động gửi thông báo trực tiếp tới tài khoản Telegram này:",
          "• 🔔 <b>Khách hàng mới đăng ký tài khoản</b>",
          "• 📊 <b>Báo cáo kết quả Import đối soát đơn hàng CSV</b> (thành công / lỗi chi tiết)",
          "",
          "💡 <i>Bạn có thể đổi tài khoản hoặc hủy liên kết bất cứ lúc nào trong mục Quản trị viên trên web.</i>",
        ].join("\n");
      } else {
        linkOutcomeMessage = "⚠️ <b>Mã liên kết Quản trị viên đã hết hạn hoặc đã được sử dụng.</b>\n\nVui lòng quay lại website quản trị để tạo mã kết nối mới.";
      }
    } else {
      // 2. Kiểm tra nếu là mã liên kết Khách hàng (Customer)
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

  // Xử lý các Callback Query đặc biệt từ nút bấm inline (lướt deal carousel...)
  if (isCallback) {
    if (normalizedText === "noop") {
      if (incoming.callbackQueryId) await answerTelegramCallbackQuery(incoming.callbackQueryId);
      return NextResponse.json({ ok: true, action: "noop" });
    }

    if (normalizedText.startsWith("deal_page:")) {
      const pageIdx = parseInt(normalizedText.replace("deal_page:", ""), 10) || 0;
      const now = new Date();
      const deals = await prisma.dealPost.findMany({
        where: {
          status: "active",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (deals.length > 0 && incoming.messageId) {
        const currentIdx = ((pageIdx % deals.length) + deals.length) % deals.length;
        const d = deals[currentIdx];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";

        const personalLink = await getOrCreatePersonalDealLink({
          customerId: customer.id,
          deal: { id: d.id, cleanLink: d.cleanLink, platformCode: d.platformCode },
          channelSource: "telegram",
        });

        const targetUrl = personalLink?.shortUrl ?? d.shortUrl ?? d.affiliateUrl ?? `${appUrl}/uu-dai`;
        const rawImg = d.uploadedImageUrl || d.shopeeImageUrl;
        const fullImageUrl = rawImg && rawImg.startsWith("/") ? `${appUrl.replace(/\/+$/, "")}${rawImg}` : rawImg;
        const discountLabel = d.discountPercent ? `🛒 Mua ngay (Giảm ${d.discountPercent}%) ➔` : "🛒 Mua ngay ➔";

        const prevIdx = (currentIdx - 1 + deals.length) % deals.length;
        const nextIdx = (currentIdx + 1) % deals.length;

        const caption = buildDealCardCaption({
          title: `[${currentIdx + 1}/${deals.length}] ${d.title}`,
          platformCode: d.platformCode,
          category: d.category,
          salePrice: d.salePrice ? Number(d.salePrice) : null,
          originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
          discountPercent: d.discountPercent,
        });

        const dealKeyboard: TelegramInlineKeyboard = {
          inline_keyboard: [
            [{ text: discountLabel, url: targetUrl }],
            [
              { text: "◀️ Trước", callback_data: `deal_page:${prevIdx}` },
              { text: `${currentIdx + 1}/${deals.length} 🔄`, callback_data: "noop" },
              { text: "Tiếp ▶️", callback_data: `deal_page:${nextIdx}` },
            ],
            [{ text: "📋 Xem tất cả dạng danh sách", callback_data: "deals_list" }],
          ],
        };

        if (fullImageUrl) {
          await editTelegramMessageMedia({
            chatId: incoming.chatId,
            messageId: incoming.messageId,
            photo: fullImageUrl,
            caption,
            keyboard: dealKeyboard,
          });
        }
      }

      if (incoming.callbackQueryId) {
        await answerTelegramCallbackQuery(incoming.callbackQueryId);
      }
      return NextResponse.json({ ok: true, action: "flipped_deal_page", page: pageIdx });
    }
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
      .filter((o) => o.orderStatus === "pending" || o.orderStatus === "processing")
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meowback.shop";

    replyText = buildReferralInfoMessage({
      inviteUrl: `${appUrl}/register?ref=${customer.customerCode}`,
      referralPercent: Math.round(referralRate * 1000) / 10,
      maxReferralOrders: activeRule?.maxReferralOrders ?? 5,
      referralValidityMonths: activeRule?.referralValidityMonths ?? 6,
      referredCount,
      totalBonusEarned,
    });
    processingStatus = "processed_referral";
  } else if (command === "/deals" || command === "/deals_list") {
    const now = new Date();
    const deals = await prisma.dealPost.findMany({
      where: {
        status: "active",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (deals.length === 0) {
      replyText = "🏷️ Hiện tại chưa có ưu đãi nào đang chạy. Bạn có thể gửi link Shopee bất kỳ vào đây để nhận hoàn tiền ngay nhé! 🎁";
      processingStatus = "processed_deals_empty";
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";

      const dealsWithPersonalLinks = [];
      for (const d of deals) {
        const personalLink = await getOrCreatePersonalDealLink({
          customerId: customer.id,
          deal: { id: d.id, cleanLink: d.cleanLink, platformCode: d.platformCode },
          channelSource: "telegram",
        });

        dealsWithPersonalLinks.push({
          title: d.title,
          discountPercent: d.discountPercent,
          salePrice: d.salePrice ? Number(d.salePrice) : null,
          originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
          platformCode: d.platformCode,
          url: personalLink?.shortUrl ?? d.shortUrl ?? d.affiliateUrl ?? `${appUrl}/uu-dai`,
        });
      }

      const cardsText = buildDealsListMessage(dealsWithPersonalLinks);

      // Sắp xếp các nút bấm Mua ngay nằm ngang thành từng cặp 2 nút/dòng
      const buttonRows: TelegramInlineKeyboard["inline_keyboard"] = [];
      for (let i = 0; i < dealsWithPersonalLinks.length; i += 2) {
        const row = [];
        const d1 = dealsWithPersonalLinks[i];
        const d2 = dealsWithPersonalLinks[i + 1];

        const label1 = d1.discountPercent ? `🛒 [${i + 1}] Giảm ${d1.discountPercent}%` : `🛒 [${i + 1}] Mua ngay`;
        row.push({ text: label1, url: d1.url });

        if (d2) {
          const label2 = d2.discountPercent ? `🛒 [${i + 2}] Giảm ${d2.discountPercent}%` : `🛒 [${i + 2}] Mua ngay`;
          row.push({ text: label2, url: d2.url });
        }
        buttonRows.push(row);
      }
      buttonRows.push([
        { text: "🌐 Xem tất cả Ưu đãi trên Website ➔", url: `${appUrl}/uu-dai` },
      ]);

      const dealKeyboard: TelegramInlineKeyboard = {
        inline_keyboard: buttonRows,
      };

      const firstDeal = deals[0];
      const rawImg = firstDeal.uploadedImageUrl || firstDeal.shopeeImageUrl;
      const fullImageUrl = rawImg && rawImg.startsWith("/") ? `${appUrl.replace(/\/+$/, "")}${rawImg}` : rawImg;

      let cardSent = false;
      if (fullImageUrl && cardsText.length <= 1024) {
        const photoResult = await sendTelegramPhoto({
          chatId: incoming.chatId,
          photo: fullImageUrl,
          caption: cardsText,
          keyboard: dealKeyboard,
        });
        cardSent = photoResult.ok;
      }

      if (!cardSent) {
        await sendTelegramTextMessage({
          chatId: incoming.chatId,
          message: cardsText,
          keyboard: dealKeyboard,
        });
      }

      if (isCallback && incoming.callbackQueryId) {
        await answerTelegramCallbackQuery(incoming.callbackQueryId);
      }

      return NextResponse.json({
        ok: true,
        action: "processed_deals_cards",
        dealCount: dealsWithPersonalLinks.length,
      });
    }
  } else if (command === "/close") {
    replyText = "✨ Đã đóng menu thao tác. Bấm nút <b>Menu</b> ở góc trái hoặc gõ <b>/menu</b> bất kỳ lúc nào để mở lại nhé!";
    processingStatus = "processed_close_menu";
  } else if (command === "/menu") {
    replyText = "📱 <b>Bàn phím thao tác nhanh đã mở!</b>\n\nBạn có thể bấm các nút bên dưới để sử dụng, hoặc bấm <b>[ ❌ Đóng menu ]</b> để thu gọn lại cho gọn màn hình.";
    processingStatus = "processed_menu";
  } else if (command === "/id" || command === "/myid") {
    // Hiển thị thông tin Chat ID của người dùng và nhận diện nếu là Admin
    const adminUser = await prisma.user.findFirst({
      where: {
        role: "admin",
        status: "active",
        OR: [
          { telegramChatId: incoming.chatId },
          { telegramChatId: incoming.senderId },
          ...(incoming.username
            ? [
                { telegramChatId: `@${incoming.username}` },
                { telegramChatId: incoming.username },
                { telegramUsername: incoming.username },
              ]
            : []),
          ...(customer?.id ? [{ customerId: customer.id }] : []),
        ],
      },
    });

    replyText = [
      "🆔 <b>Thông tin Telegram của bạn:</b>",
      "",
      `• <b>Chat ID:</b> <code>${incoming.chatId}</code>`,
      `• <b>User ID:</b> <code>${incoming.senderId}</code>`,
      `• <b>Username:</b> ${incoming.username ? `@${incoming.username}` : "<i>Chưa đặt username</i>"}`,
      ...(adminUser
        ? [
            "",
            `🛡️ <b>Quản trị viên hệ thống:</b> ${escapeHtml(adminUser.fullName)} (<code>${escapeHtml(adminUser.email)}</code>)`,
            "✅ Đã kết nối nhận thông báo quản trị thành công.",
          ]
        : [
            "",
            "💡 <i>Bạn có thể dùng mã Chat ID này hoặc quét mã QR trong trang Quản lý Admin để kết nối tự động.</i>",
          ]),
    ].join("\n");
    processingStatus = "processed_myid";
  } else if (command === "/keyboard" || command === "/phim") {
    replyText = "⌨️ Đã mở bàn phím phím tắt bên dưới. Bạn có thể bấm [ ❌ Đóng menu ] để thu gọn lại bất kỳ lúc nào.";
    processingStatus = "processed_keyboard";
  } else if (command === "/nokeyboard" || command === "/closekeyboard") {
    replyText = "✨ Đã đóng bàn phím phím tắt. Bạn có thể dùng nút <b>[ Menu ]</b> màu xanh ở góc trái ô nhập tin nhắn.";
    processingStatus = "processed_nokeyboard";
  } else {
    // Kiểm tra câu lệnh tùy chỉnh được Admin cấu hình trong Database
    const customCmd = command.startsWith("/")
      ? await (prisma as any).telegramBotCommand.findUnique({ where: { command } })
      : null;

    if (customCmd && customCmd.isActive) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meowback.shop";
      replyText = customCmd.replyText
        .replace(/\{fullName\}/g, customer.fullName || "")
        .replace(/\{customerCode\}/g, customer.customerCode || "")
        .replace(/\{appUrl\}/g, appUrl)
        .replace(/\{inviteUrl\}/g, `${appUrl}/register?ref=${customer.customerCode}`);
      processingStatus = `processed_custom_command_${customCmd.command.replace('/', '')}`;
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
}

  const sendResult = await sendTelegramTextMessage({
    chatId: incoming.chatId,
    message: replyText,
    keyboard: buildReplyKeyboardRemove(),
  });

  if (isCallback && incoming.callbackQueryId) {
    await answerTelegramCallbackQuery(incoming.callbackQueryId);
  }

  await prisma.telegramMessageLog.create({
    data: {
      telegramAccountId: activeAccount?.id ?? account?.id ?? null,
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
