import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toBool(val: any, defaultVal = false): boolean {
  if (val === null || val === undefined) return defaultVal;
  return Boolean(val);
}

async function main() {
  const dumpPath = path.join(process.cwd(), "prisma", "sqlite_dump.json");
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Dump file not found at ${dumpPath}`);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, "utf-8"));
  console.log("=== BẮT ĐẦU DI CHUYỂN DỮ LIỆU TỪ SQLITE SANG POSTGRESQL ===");

  console.log("Resetting PostgreSQL tables...");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "users", "customers", "platforms", "affiliate_channels", "tracking_links", 
      "vouchers", "link_voucher_matches", "import_batches", "import_batch_rows", 
      "orders", "commission_rules", "category_commission_rates", "payment_batches", 
      "payment_batch_items", "zalo_accounts", "zalo_message_logs", "telegram_accounts", 
      "telegram_message_logs", "telegram_link_codes", "withdraw_requests", 
      "notifications", "chat_messages", "deal_posts", "telegram_bot_commands", 
      "audit_logs", "password_reset_tokens" 
    CASCADE;
  `);

  // 1. platforms
  const platforms = dump["platforms"] || [];
  console.log(`Migrating platforms (${platforms.length})...`);
  for (const p of platforms) {
    await prisma.platform.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        status: p.status || "active",
        createdAt: toDate(p.created_at) || new Date(),
      },
    });
  }

  // 2. customers (chưa gán referredById để tránh lỗi self-reference foreign key)
  const customers = dump["customers"] || [];
  console.log(`Migrating customers step 1 (${customers.length})...`);
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        customerCode: c.customer_code,
        fullName: c.full_name,
        phone: c.phone,
        address: c.address,
        zaloUserId: c.zalo_user_id,
        zaloDisplayName: c.zalo_display_name,
        telegramUserId: c.telegram_user_id,
        telegramUsername: c.telegram_username,
        status: c.status || "active",
        note: c.note,
        bankName: c.bank_name,
        bankAccountNumber: c.bank_account_number,
        bankAccountName: c.bank_account_name,
        momoNumber: c.momo_number,
        momoName: c.momo_name,
        isPartner: toBool(c.is_partner, false),
        telegramFlowStep: c.telegram_flow_step,
        telegramFlowData: c.telegram_flow_data,
        paymentPin: c.payment_pin,
        pinFailedAttempts: c.pin_failed_attempts ?? 0,
        pinLockUntil: toDate(c.pin_lock_until),
        createdAt: toDate(c.created_at) || new Date(),
        updatedAt: toDate(c.updated_at) || new Date(),
      },
    });
  }

  // 3. users
  const users = dump["users"] || [];
  console.log(`Migrating users (${users.length})...`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.password_hash,
        fullName: u.full_name,
        role: u.role,
        status: u.status || "active",
        customerId: u.customer_id,
        mfaEnabled: toBool(u.mfa_enabled, false),
        mfaSecret: u.mfa_secret,
        mfaMethod: u.mfa_method || "totp",
        mfaBackupCodes: u.mfa_backup_codes,
        mfaResetToken: u.mfa_reset_token,
        mfaResetExpiresAt: toDate(u.mfa_reset_expires_at),
        createdAt: toDate(u.created_at) || new Date(),
        updatedAt: toDate(u.updated_at) || new Date(),
      },
    });
  }

  // Cập nhật lại referredById cho customers (step 2)
  console.log("Updating customer referredById references...");
  for (const c of customers) {
    if (c.referred_by_id) {
      await prisma.customer.update({
        where: { id: c.id },
        data: { referredById: c.referred_by_id },
      });
    }
  }

  // 4. tracking_links
  const trackingLinks = dump["tracking_links"] || [];
  console.log(`Migrating tracking_links (${trackingLinks.length})...`);
  for (const tl of trackingLinks) {
    await prisma.trackingLink.upsert({
      where: { id: tl.id },
      update: {},
      create: {
        id: tl.id,
        customerId: tl.customer_id,
        platformId: tl.platform_id,
        channelSource: tl.channel_source,
        trackingCode: tl.tracking_code,
        originalUrl: tl.original_url,
        normalizedUrl: tl.normalized_url,
        affiliateUrl: tl.affiliate_url,
        productTitle: tl.product_title,
        productImage: tl.product_image,
        productPrice: tl.product_price !== null ? tl.product_price : null,
        productSold: tl.product_sold,
        estimatedCashback: tl.estimated_cashback !== null ? tl.estimated_cashback : null,
        subId1: tl.sub_id1,
        subId2: tl.sub_id2,
        subId3: tl.sub_id3,
        subId4: tl.sub_id4,
        subId5: tl.sub_id5,
        shortCode: tl.short_code,
        shortUrl: tl.short_url,
        isFavorite: toBool(tl.is_favorite, false),
        clicks: tl.clicks ?? 0,
        lastClickedAt: toDate(tl.last_clicked_at),
        status: tl.status || "active",
        createdByUserId: tl.created_by_user_id,
        createdAt: toDate(tl.created_at) || new Date(),
        updatedAt: toDate(tl.updated_at) || new Date(),
      },
    });
  }

  // 6. vouchers
  const vouchers = dump["vouchers"] || [];
  console.log(`Migrating vouchers (${vouchers.length})...`);
  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        platformId: v.platform_id,
        title: v.title,
        voucherCode: v.voucher_code,
        voucherUrl: v.voucher_url,
        productImage: v.product_image,
        benefitText: v.benefit_text,
        conditionsText: v.conditions_text,
        startsAt: toDate(v.starts_at),
        endsAt: toDate(v.ends_at),
        status: v.status || "draft",
        priority: v.priority ?? 0,
        metadata: v.metadata,
        createdByUserId: v.created_by_user_id,
        createdAt: toDate(v.created_at) || new Date(),
        updatedAt: toDate(v.updated_at) || new Date(),
      },
    });
  }

  // 7. link_voucher_matches
  const linkVoucherMatches = dump["link_voucher_matches"] || [];
  console.log(`Migrating link_voucher_matches (${linkVoucherMatches.length})...`);
  for (const lvm of linkVoucherMatches) {
    await prisma.linkVoucherMatch.upsert({
      where: { id: lvm.id },
      update: {},
      create: {
        id: lvm.id,
        trackingLinkId: lvm.tracking_link_id,
        voucherId: lvm.voucher_id,
        createdAt: toDate(lvm.created_at) || new Date(),
      },
    });
  }

  // 8. import_batches
  const importBatches = dump["import_batches"] || [];
  console.log(`Migrating import_batches (${importBatches.length})...`);
  for (const ib of importBatches) {
    await prisma.importBatch.upsert({
      where: { id: ib.id },
      update: {},
      create: {
        id: ib.id,
        sourceName: ib.source_name,
        fileName: ib.file_name,
        fileStorageKey: ib.file_storage_key,
        importedByUserId: ib.imported_by_user_id,
        totalRows: ib.total_rows ?? 0,
        successRows: ib.success_rows ?? 0,
        duplicateRows: ib.duplicate_rows ?? 0,
        unmappedRows: ib.unmapped_rows ?? 0,
        errorRows: ib.error_rows ?? 0,
        status: ib.status || "uploaded",
        columnMapping: ib.column_mapping,
        notes: ib.notes,
        createdAt: toDate(ib.created_at) || new Date(),
        updatedAt: toDate(ib.updated_at) || new Date(),
      },
    });
  }

  // 9. import_batch_rows
  const importBatchRows = dump["import_batch_rows"] || [];
  console.log(`Migrating import_batch_rows (${importBatchRows.length})...`);
  for (const ibr of importBatchRows) {
    await prisma.importBatchRow.upsert({
      where: { id: ibr.id },
      update: {},
      create: {
        id: ibr.id,
        batchId: ibr.batch_id,
        rowNumber: ibr.row_number,
        orderExternalId: ibr.order_external_id,
        checkoutId: ibr.checkout_id,
        trackingCode: ibr.tracking_code,
        channel: ibr.channel,
        orderedAt: toDate(ibr.ordered_at),
        completedAt: toDate(ibr.completed_at),
        clickedAt: toDate(ibr.clicked_at),
        shopName: ibr.shop_name,
        shopId: ibr.shop_id,
        itemId: ibr.item_id,
        itemName: ibr.item_name,
        commissionAmount: ibr.commission_amount !== null ? ibr.commission_amount : null,
        grossCommissionAmount: ibr.gross_commission_amount !== null ? ibr.gross_commission_amount : null,
        netCommissionAmount: ibr.net_commission_amount !== null ? ibr.net_commission_amount : null,
        orderAmount: ibr.order_amount !== null ? ibr.order_amount : null,
        orderStatus: ibr.order_status,
        productAffiliateStatus: ibr.product_affiliate_status,
        subId1: ibr.sub_id1,
        subId2: ibr.sub_id2,
        subId3: ibr.sub_id3,
        subId4: ibr.sub_id4,
        subId5: ibr.sub_id5,
        paymentStatus: ibr.payment_status,
        rawData: ibr.raw_data || "",
        processingStatus: ibr.processing_status || "pending",
        errorMessage: ibr.error_message,
        createdAt: toDate(ibr.created_at) || new Date(),
      },
    });
  }

  // 10. commission_rules
  const commissionRules = dump["commission_rules"] || [];
  console.log(`Migrating commission_rules (${commissionRules.length})...`);
  for (const cr of commissionRules) {
    await prisma.commissionRule.upsert({
      where: { id: cr.id },
      update: {},
      create: {
        id: cr.id,
        name: cr.name,
        taxRate: cr.tax_rate ?? 10.98,
        customerRate: cr.customer_rate,
        systemRate: cr.system_rate,
        referralRate: cr.referral_rate ?? 0.05,
        maxReferralOrders: cr.max_referral_orders ?? 5,
        referralValidityMonths: cr.referral_validity_months ?? 6,
        active: toBool(cr.active, false),
        startsAt: toDate(cr.starts_at),
        endsAt: toDate(cr.ends_at),
        createdByUserId: cr.created_by_user_id,
        createdAt: toDate(cr.created_at) || new Date(),
      },
    });
  }

  // 11. category_commission_rates
  const catRates = dump["category_commission_rates"] || [];
  console.log(`Migrating category_commission_rates (${catRates.length})...`);
  for (const ccr of catRates) {
    await prisma.categoryCommissionRate.upsert({
      where: { id: ccr.id },
      update: {},
      create: {
        id: ccr.id,
        name: ccr.name,
        keywords: ccr.keywords,
        rate: ccr.rate,
        sortOrder: ccr.sort_order ?? 0,
        isDefault: toBool(ccr.is_default, false),
        createdAt: toDate(ccr.created_at) || new Date(),
        updatedAt: toDate(ccr.updated_at) || new Date(),
      },
    });
  }

  // 12. orders
  const orders = dump["orders"] || [];
  console.log(`Migrating orders (${orders.length})...`);
  for (const o of orders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        platformId: o.platform_id,
        customerId: o.customer_id,
        trackingLinkId: o.tracking_link_id,
        importBatchId: o.import_batch_id,
        orderExternalId: o.order_external_id,
        checkoutId: o.checkout_id,
        trackingCode: o.tracking_code,
        channel: o.channel,
        orderedAt: toDate(o.ordered_at),
        completedAt: toDate(o.completed_at),
        clickedAt: toDate(o.clicked_at),
        shopName: o.shop_name,
        shopId: o.shop_id,
        itemId: o.item_id,
        itemName: o.item_name,
        orderAmount: o.order_amount !== null ? o.order_amount : null,
        grossCommissionAmount: o.gross_commission_amount !== null ? o.gross_commission_amount : null,
        netCommissionAmount: o.net_commission_amount !== null ? o.net_commission_amount : null,
        commissionAmount: o.commission_amount ?? 0,
        customerRewardAmount: o.customer_reward_amount ?? 0,
        systemProfitAmount: o.system_profit_amount ?? 0,
        orderStatus: o.order_status || "pending",
        productAffiliateStatus: o.product_affiliate_status,
        subId1: o.sub_id1,
        subId2: o.sub_id2,
        subId3: o.sub_id3,
        subId4: o.sub_id4,
        subId5: o.sub_id5,
        payoutStatus: o.payout_status || "unpaid",
        sourceType: o.source_type || "import",
        referralSourceCustomerId: o.referral_source_customer_id,
        referralBonusDeducted: o.referral_bonus_deducted ?? 0,
        rawData: o.raw_data,
        approvedAt: toDate(o.approved_at),
        createdAt: toDate(o.created_at) || new Date(),
        updatedAt: toDate(o.updated_at) || new Date(),
      },
    });
  }

  // 13. payment_batches
  const paymentBatches = dump["payment_batches"] || [];
  console.log(`Migrating payment_batches (${paymentBatches.length})...`);
  for (const pb of paymentBatches) {
    await prisma.paymentBatch.upsert({
      where: { id: pb.id },
      update: {},
      create: {
        id: pb.id,
        paymentCode: pb.payment_code,
        periodLabel: pb.period_label,
        customerId: pb.customer_id,
        totalAmount: pb.total_amount,
        transferReference: pb.transfer_reference,
        transferNote: pb.transfer_note,
        billStorageKey: pb.bill_storage_key,
        status: pb.status || "pending",
        paidByUserId: pb.paid_by_user_id,
        paidAt: toDate(pb.paid_at),
        createdAt: toDate(pb.created_at) || new Date(),
        updatedAt: toDate(pb.updated_at) || new Date(),
      },
    });
  }

  // 14. payment_batch_items
  const paymentBatchItems = dump["payment_batch_items"] || [];
  console.log(`Migrating payment_batch_items (${paymentBatchItems.length})...`);
  for (const pbi of paymentBatchItems) {
    await prisma.paymentBatchItem.upsert({
      where: { id: pbi.id },
      update: {},
      create: {
        id: pbi.id,
        paymentBatchId: pbi.payment_batch_id,
        orderId: pbi.order_id,
        amount: pbi.amount,
        createdAt: toDate(pbi.created_at) || new Date(),
      },
    });
  }

  // 15. telegram_accounts
  const telegramAccounts = dump["telegram_accounts"] || [];
  console.log(`Migrating telegram_accounts (${telegramAccounts.length})...`);
  for (const ta of telegramAccounts) {
    await prisma.telegramAccount.upsert({
      where: { id: ta.id },
      update: {},
      create: {
        id: ta.id,
        botName: ta.bot_name,
        botUsername: ta.bot_username,
        botTokenHint: ta.bot_token_hint,
        webhookUrl: ta.webhook_url,
        status: ta.status || "inactive",
        metadata: ta.metadata,
        createdAt: toDate(ta.created_at) || new Date(),
        updatedAt: toDate(ta.updated_at) || new Date(),
      },
    });
  }

  // 16. telegram_message_logs
  const telegramMessageLogs = dump["telegram_message_logs"] || [];
  console.log(`Migrating telegram_message_logs (${telegramMessageLogs.length})...`);
  for (const tml of telegramMessageLogs) {
    await prisma.telegramMessageLog.upsert({
      where: { id: tml.id },
      update: {},
      create: {
        id: tml.id,
        telegramAccountId: tml.telegram_account_id,
        customerId: tml.customer_id,
        direction: tml.direction,
        externalMessageId: tml.external_message_id,
        senderId: tml.sender_id,
        receiverId: tml.receiver_id,
        messageType: tml.message_type,
        messageText: tml.message_text,
        payload: tml.payload,
        processingStatus: tml.processing_status || "received",
        createdAt: toDate(tml.created_at) || new Date(),
      },
    });
  }

  // 17. telegram_link_codes
  const telegramLinkCodes = dump["telegram_link_codes"] || [];
  console.log(`Migrating telegram_link_codes (${telegramLinkCodes.length})...`);
  for (const tlc of telegramLinkCodes) {
    await prisma.telegramLinkCode.upsert({
      where: { id: tlc.id },
      update: {},
      create: {
        id: tlc.id,
        code: tlc.code,
        customerId: tlc.customer_id,
        expiresAt: toDate(tlc.expires_at) || new Date(),
        usedAt: toDate(tlc.used_at),
        createdAt: toDate(tlc.created_at) || new Date(),
      },
    });
  }

  // 18. withdraw_requests
  const withdrawRequests = dump["withdraw_requests"] || [];
  console.log(`Migrating withdraw_requests (${withdrawRequests.length})...`);
  for (const wr of withdrawRequests) {
    await prisma.withdrawRequest.upsert({
      where: { id: wr.id },
      update: {},
      create: {
        id: wr.id,
        customerId: wr.customer_id,
        amount: wr.amount,
        status: wr.status || "pending",
        createdAt: toDate(wr.created_at) || new Date(),
        resolvedAt: toDate(wr.resolved_at),
      },
    });
  }

  // 19. notifications
  const notifications = dump["notifications"] || [];
  console.log(`Migrating notifications (${notifications.length})...`);
  for (const n of notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: toBool(n.is_read, false),
        createdAt: toDate(n.created_at) || new Date(),
      },
    });
  }

  // 20. chat_messages
  const chatMessages = dump["chat_messages"] || [];
  console.log(`Migrating chat_messages (${chatMessages.length})...`);
  for (const cm of chatMessages) {
    await prisma.chatMessage.upsert({
      where: { id: cm.id },
      update: {},
      create: {
        id: cm.id,
        userId: cm.user_id,
        message: cm.message,
        createdAt: toDate(cm.created_at) || new Date(),
      },
    });
  }

  console.log("\n=== HOÀN TẤT DI CHUYỂN DỮ LIỆU THÀNH CÔNG! ===");
}

main()
  .catch((err) => {
    console.error("LỖI KHI MIGRATE DỮ LIỆU:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
