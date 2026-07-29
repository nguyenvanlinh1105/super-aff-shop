import { detectPlatform } from "./linkConversion";
import { formatCurrency } from "./format";

export type TelegramIncomingMessage = {
  raw: unknown;
  senderId: string | null;
  chatId: string | null;
  text: string | null;
  messageId: string | null;
  username: string | null;
  fullName: string | null;
  eventName: string;
  callbackQueryId: string | null;
};

export type TelegramSendResult = {
  ok: boolean;
  simulated: boolean;
  response?: unknown;
  error?: string;
};

export type TelegramInlineKeyboard = {
  inline_keyboard: { text: string; callback_data: string }[][];
};

export type TelegramReplyKeyboard = {
  keyboard: { text: string }[][];
  resize_keyboard: true;
  is_persistent: true;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function extractTelegramMessage(payload: any): TelegramIncomingMessage {
  // Nút inline được bấm -> Telegram gửi update dạng callback_query, không phải message.
  const callback = payload?.callback_query ?? null;
  if (callback) {
    return {
      raw: payload,
      senderId: callback.from?.id?.toString?.() ?? null,
      chatId: callback.message?.chat?.id?.toString?.() ?? null,
      text: typeof callback.data === "string" ? callback.data : null,
      messageId: callback.message?.message_id?.toString?.() ?? null,
      username: callback.from?.username ?? null,
      fullName: [callback.from?.first_name, callback.from?.last_name].filter(Boolean).join(" ") || null,
      eventName: "callback_query",
      callbackQueryId: callback.id?.toString?.() ?? null,
    };
  }

  const message = payload?.message ?? payload?.edited_message ?? payload?.channel_post ?? null;
  const from = message?.from ?? null;
  const chat = message?.chat ?? null;

  return {
    raw: payload,
    senderId: from?.id?.toString?.() ?? null,
    chatId: chat?.id?.toString?.() ?? null,
    text: typeof message?.text === "string" ? message.text.trim() : null,
    messageId: message?.message_id?.toString?.() ?? null,
    username: from?.username ?? null,
    fullName: [from?.first_name, from?.last_name].filter(Boolean).join(" ") || null,
    eventName: message ? "message" : "unknown",
    callbackQueryId: null,
  };
}

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  return match?.[0] ?? null;
}

export function buildMainMenuKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "🔄 Đổi link nhanh", callback_data: "newlink" }],
      [
        { text: "💰 Số dư ví", callback_data: "wallet" },
        { text: "📦 Đơn hàng", callback_data: "orders" },
      ],
      [
        { text: "🔗 Link của tôi", callback_data: "links" },
        { text: "🏷️ Ưu đãi", callback_data: "deals" },
      ],
      [
        { text: "🎁 Mời bạn", callback_data: "referral" },
        { text: "📖 Hướng dẫn", callback_data: "help" },
      ],
    ],
  };
}

// Menu nút bấm cố định ngay dưới ô nhập tin nhắn (ReplyKeyboard) — tiện hơn
// inline keyboard vì không bị trôi mất khi cuộn lên, luôn nằm sẵn chờ bấm.
// Dùng chung 1 danh sách cho cả hiển thị nút lẫn nhận diện text khi bấm, để
// nhãn nút và lệnh tương ứng không bao giờ lệch nhau.
const QUICK_MENU_ITEMS: { label: string; command: string }[][] = [
  [{ label: "🔄 Đổi link nhanh", command: "/newlink" }],
  [
    { label: "💰 Số dư ví", command: "/wallet" },
    { label: "💸 Rút tiền", command: "/rut" },
  ],
  [
    { label: "📦 Đơn hàng", command: "/orders" },
    { label: "🔗 Link của tôi", command: "/links" },
  ],
  [
    { label: "🏷️ Ưu đãi", command: "/deals" },
    { label: "🎁 Mời bạn", command: "/referral" },
  ],
  [{ label: "📖 Hướng dẫn", command: "/help" }],
];

export function buildReplyKeyboardMenu(): TelegramReplyKeyboard {
  return {
    keyboard: QUICK_MENU_ITEMS.map((row) => row.map((item) => ({ text: item.label }))),
    resize_keyboard: true,
    is_persistent: true,
  };
}

// Khi khách bấm 1 nút trên ReplyKeyboard, Telegram gửi lại đúng chuỗi label
// đó dưới dạng tin nhắn thường (không phải callback_query) — hàm này map
// ngược label về command tương ứng để tái dùng toàn bộ logic xử lý lệnh sẵn có.
export function matchQuickMenuCommand(text: string): string | null {
  const trimmed = text.trim();
  for (const row of QUICK_MENU_ITEMS) {
    for (const item of row) {
      if (item.label === trimmed) return item.command;
    }
  }
  return null;
}

export function buildConvertLinkPromptMessage(): string {
  return [
    "🔄 <b>Đổi link nhanh</b>",
    "",
    "Dán link Shopee bạn muốn đổi vào ngay khung chat này (chỉ cần gửi link, không cần lệnh gì thêm), bot sẽ trả về link hoàn tiền ngay lập tức.",
  ].join("\n");
}

export function buildTelegramHelpMessage(): string {
  return [
    "👋 <b>Chào mừng đến với bot ivi Hoàn Tiền!</b>",
    "",
    "Gửi link Shopee, bot sẽ đổi sang link hoàn tiền ngay lập tức.",
    "",
    "<b>Lệnh nhanh:</b>",
    "💰 /wallet — xem số dư hoàn tiền",
    "💸 /rut — yêu cầu rút tiền (chưa có TK ngân hàng? bot sẽ hỏi luôn)",
    "📦 /orders — 5 đơn hàng gần nhất",
    "🔗 /links — 5 link đã tạo gần nhất",
    "🏷️ /deals — ưu đãi hot đang chạy",
    "🎁 /referral — link mời bạn & hoa hồng giới thiệu",
    "📖 /help — xem lại hướng dẫn này",
    "",
    "Ví dụ: <code>https://shopee.vn/...</code>",
  ].join("\n");
}

export function buildLinkPromptMessage(): string {
  return [
    "🔐 <b>Tài khoản Telegram này chưa liên kết với web.</b>",
    "",
    "Số dư/đơn hàng bạn thấy ở đây đang tính theo một hồ sơ Telegram riêng, có thể không khớp với tài khoản bạn đăng nhập trên web.",
    "",
    "Vào mục <b>Ví tiền</b> trên web → bấm <b>Liên kết Telegram</b> → bấm nút mở Telegram để đồng bộ đúng 1 tài khoản duy nhất.",
  ].join("\n");
}

export function buildLinkSuccessMessage(params: { fullName: string; customerCode: string }): string {
  return [
    "✅ <b>Liên kết thành công!</b>",
    "",
    `Xin chào <b>${escapeHtml(params.fullName)}</b> (${params.customerCode}).`,
    "Từ giờ mọi thao tác trên bot sẽ đồng bộ trực tiếp với tài khoản web của bạn.",
  ].join("\n");
}

export function buildLinkExpiredMessage(): string {
  return [
    "⚠️ Mã liên kết không hợp lệ hoặc đã hết hạn.",
    "Vào lại mục <b>Ví tiền</b> trên web để lấy mã liên kết mới nhé.",
  ].join("\n");
}

export function buildUnsupportedPlatformMessage(rawUrl: string): string {
  return [
    "🙁 Bot đã nhận link nhưng hiện chỉ hỗ trợ <b>Shopee</b>.",
    `Link vừa gửi: ${escapeHtml(rawUrl)}`,
  ].join("\n");
}

// TikTok Shop tạm thời chỉ đổi được trên website, chưa hỗ trợ qua Telegram —
// khác với link Shopee vẫn hoạt động bình thường ở cả 2 nơi.
export function buildTikTokDisabledOnTelegramMessage(): string {
  return [
    "🙁 Bot hiện <b>chưa hỗ trợ đổi link TikTok Shop</b> qua Telegram.",
    "Vui lòng dùng website meowback.vn để đổi link TikTok, hoặc gửi link Shopee vào đây nhé.",
  ].join("\n");
}

export function buildAffiliateReplyMessage(params: {
  platformName: string;
  affiliateUrl: string;
  trackingCode: string;
  customerCode: string;
}): string {
  return [
    `✅ <b>Đã đổi link ${escapeHtml(params.platformName)} thành công!</b>`,
    "",
    `🔗 <a href="${params.affiliateUrl}">${params.affiliateUrl}</a>`,
    "",
    `Mã khách: <code>${params.customerCode}</code>`,
    `Mã tracking: <code>${params.trackingCode}</code>`,
    "",
    "⚠️ Hãy bấm vào link này <b>trước khi mua</b> để hệ thống đối soát hoa hồng chính xác.",
  ].join("\n");
}

export function buildOrderApprovedMessage(params: {
  orderExternalId: string;
  customerRewardAmount: number;
  shopName?: string | null;
}): string {
  return [
    "🎉 <b>Đơn hàng của bạn vừa được duyệt!</b>",
    "",
    `Mã đơn: <code>${escapeHtml(params.orderExternalId)}</code>`,
    params.shopName ? `Shop: ${escapeHtml(params.shopName)}` : null,
    `Số tiền được hoàn: <b>${formatCurrency(params.customerRewardAmount)}</b>`,
    "",
    "Gõ /wallet để xem tổng số dư bất cứ lúc nào.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildReferralBonusMessage(params: {
  bonusAmount: number;
  friendOrderExternalId: string;
}): string {
  return [
    "🎁 <b>Bạn vừa nhận hoa hồng giới thiệu!</b>",
    "",
    `Một người bạn bạn mời vừa có đơn hàng được duyệt (mã <code>${escapeHtml(params.friendOrderExternalId)}</code>).`,
    `Hoa hồng giới thiệu: <b>${formatCurrency(params.bonusAmount)}</b>`,
    "",
    "Gõ /wallet để xem tổng số dư hoặc /referral để xem link mời bạn của bạn.",
  ].join("\n");
}

export function buildReferralInfoMessage(params: {
  inviteUrl: string;
  referralPercent: number;
  maxReferralOrders: number;
  referralValidityMonths: number;
  referredCount: number;
  totalBonusEarned: number;
}): string {
  return [
    "🎁 <b>Mời bạn bè — nhận hoa hồng giới thiệu</b>",
    "",
    `Mời bạn bè đăng ký bằng link dưới đây, bạn sẽ nhận <b>${params.referralPercent}% hoa hồng</b> từ ${params.maxReferralOrders} đơn hàng đầu tiên của <b>mỗi người bạn</b> bạn mời — mời càng nhiều bạn, nhận càng nhiều hoa hồng, không giới hạn dồn chung (áp dụng trong vòng ${params.referralValidityMonths} tháng kể từ ngày người đó tham gia).`,
    "",
    `🔗 ${params.inviteUrl}`,
    "",
    `👥 Số bạn đã mời: <b>${params.referredCount}</b>`,
    `💰 Tổng hoa hồng giới thiệu đã nhận: <b>${formatCurrency(params.totalBonusEarned)}</b>`,
  ].join("\n");
}

export function buildDealsListMessage(
  deals: { title: string; discountPercent: number | null; url: string | null }[]
): string {
  if (deals.length === 0) {
    return "🏷️ Hiện chưa có ưu đãi nào đang chạy. Quay lại sau nhé!";
  }

  const lines = deals.map((d) => {
    const discount = d.discountPercent ? ` (giảm ${d.discountPercent}%)` : "";
    const title = `${escapeHtml(d.title)}${discount}`;
    return d.url ? `🏷️ <a href="${d.url}">${title}</a>` : `🏷️ ${title}`;
  });

  return ["🏷️ <b>Ưu đãi hot đang chạy:</b>", "", ...lines].join("\n");
}

export function buildPaymentPaidMessage(params: {
  amount: number;
  paymentCode: string;
  transferReference?: string | null;
}): string {
  return [
    "💸 <b>Bạn vừa được thanh toán!</b>",
    "",
    `Mã phiếu: <code>${params.paymentCode}</code>`,
    `Số tiền: <b>${formatCurrency(params.amount)}</b>`,
    params.transferReference ? `Mã giao dịch: <code>${escapeHtml(params.transferReference)}</code>` : null,
    "",
    "Cảm ơn bạn đã đồng hành cùng hệ thống hoàn tiền! 🙏",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrdersListMessage(
  orders: { orderExternalId: string; orderStatus: string; customerRewardAmount: number }[]
): string {
  if (orders.length === 0) {
    return "📦 Bạn chưa có đơn hàng nào. Đổi link và mua sắm để bắt đầu tích luỹ nhé!";
  }

  const statusEmoji: Record<string, string> = { approved: "✅", pending: "⏳", rejected: "❌" };
  const lines = orders.map((o) => {
    const emoji = statusEmoji[o.orderStatus] ?? "•";
    return `${emoji} <code>${escapeHtml(o.orderExternalId)}</code> — ${escapeHtml(o.orderStatus)} — <b>${formatCurrency(o.customerRewardAmount)}</b>`;
  });

  return ["📦 <b>5 đơn hàng gần nhất:</b>", "", ...lines, "", "Gõ /wallet để xem tổng số dư."].join("\n");
}

export function buildLinksListMessage(
  links: { trackingCode: string; shortUrl: string | null; createdAt: Date }[]
): string {
  if (links.length === 0) {
    return "🔗 Bạn chưa tạo link nào. Gửi link Shopee cho bot để bắt đầu đổi link hoàn tiền.";
  }

  const lines = links.map((l) => `🔗 <a href="${l.shortUrl ?? "#"}">${l.shortUrl ?? l.trackingCode}</a>`);

  return ["🔗 <b>5 link gần nhất của bạn:</b>", "", ...lines].join("\n");
}

export function buildWalletMessage(params: {
  customerName: string;
  customerCode: string;
  available: number;
  processing: number;
  paid: number;
  totalOrders: number;
}): string {
  return [
    `💰 <b>Ví hoàn tiền của ${escapeHtml(params.customerName)}</b>`,
    `Mã khách: <code>${params.customerCode}</code>`,
    "",
    `🎒 Sẵn sàng rút: <b>${formatCurrency(params.available)}</b>`,
    `⏳ Đang xử lý: <b>${formatCurrency(params.processing)}</b>`,
    `✅ Đã thanh toán: <b>${formatCurrency(params.paid)}</b>`,
    "",
    `📦 Tổng số đơn: ${params.totalOrders}`,
  ].join("\n");
}

export function buildWithdrawSuccessMessage(amount: number): string {
  return [
    "✅ <b>Đã gửi yêu cầu rút tiền!</b>",
    "",
    `Số tiền: <b>${formatCurrency(amount)}</b>`,
    "",
    "Admin sẽ xử lý và chuyển khoản trong vòng 24h. Gõ /wallet để theo dõi số dư.",
  ].join("\n");
}

export function buildWithdrawErrorMessage(error: string): string {
  return `⚠️ ${escapeHtml(error)}`;
}

export function buildBankInfoFlowPrompt(
  step: "await_bank_name" | "await_bank_account_number" | "await_bank_account_name",
  context?: { bankName?: string; bankAccountNumber?: string }
): string {
  if (step === "await_bank_name") {
    return [
      "🏦 <b>Bạn chưa có thông tin tài khoản ngân hàng để nhận tiền.</b>",
      "",
      "Cho tôi biết <b>tên ngân hàng</b> của bạn (vd: Vietcombank, Techcombank, MB Bank...).",
      "",
      "Gõ /huy để huỷ bất cứ lúc nào.",
    ].join("\n");
  }
  if (step === "await_bank_account_number") {
    return [
      `✅ Đã ghi nhận ngân hàng: <b>${escapeHtml(context?.bankName ?? "")}</b>`,
      "",
      "Giờ cho tôi <b>số tài khoản</b> ngân hàng của bạn.",
    ].join("\n");
  }
  return [
    `✅ Đã ghi nhận số tài khoản: <b>${escapeHtml(context?.bankAccountNumber ?? "")}</b>`,
    "",
    "Cuối cùng, cho tôi <b>tên chủ tài khoản</b> (viết đúng như trên thẻ/tài khoản, thường là IN HOA không dấu).",
  ].join("\n");
}

export function buildBankInfoSavedMessage(params: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}): string {
  return [
    "✅ <b>Đã lưu thông tin ngân hàng!</b>",
    "",
    `Ngân hàng: <b>${escapeHtml(params.bankName)}</b>`,
    `Số tài khoản: <code>${escapeHtml(params.bankAccountNumber)}</code>`,
    `Chủ tài khoản: <b>${escapeHtml(params.bankAccountName)}</b>`,
    "",
    "Thông tin này đồng bộ trực tiếp với web — bạn có thể sửa lại bất cứ lúc nào ở mục Cài đặt trên web.",
    "Đang tiếp tục gửi yêu cầu rút tiền cho bạn...",
  ].join("\n");
}

export function buildFlowCancelledMessage(): string {
  return "❌ Đã huỷ. Gõ /rut bất cứ lúc nào để thử lại.";
}

export function mapDetectedPlatformToCode(url: string): "SHOPEE" | "TIKTOK" | null {
  const platform = detectPlatform(url);
  if (platform === "shopee") return "SHOPEE";
  if (platform === "tiktok") return "TIKTOK";
  return null;
}

export async function sendTelegramTextMessage(params: {
  chatId: string;
  message: string;
  keyboard?: TelegramInlineKeyboard | TelegramReplyKeyboard;
}): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      ok: true,
      simulated: true,
      response: {
        reason: "Missing TELEGRAM_BOT_TOKEN",
        chatId: params.chatId,
        message: params.message,
      },
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: params.keyboard,
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

// Đổi tên hiển thị thật của bot trên Telegram (tên trong header chat, danh
// bạ...). Lưu ý: @username của bot (vd @meowback_bot) KHÔNG
// đổi được qua API — chỉ đổi được qua lệnh /setusername trong chat @BotFather.
export async function setBotDisplayName(name: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "Thiếu TELEGRAM_BOT_TOKEN trong .env" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setMyName`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      return { ok: false, error: data?.description || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function answerTelegramCallbackQuery(callbackQueryId: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId }),
    });
  } catch {
    // Không nghiêm trọng nếu answerCallbackQuery lỗi — nút chỉ hết loading chậm hơn.
  }
}
