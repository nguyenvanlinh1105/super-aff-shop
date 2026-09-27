import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getActiveCommissionRule, isWithinReferralWindow, splitCommission } from "./commission";
import { notifyCustomerInApp } from "./notifications";
import { notifyCustomerTelegram } from "./telegramNotify";
import { buildOrderApprovedMessage, buildReferralBonusMessage } from "./telegramBot";
import { listRioHubTikTokOrders, parseRioHubMoney, RioHubOrder } from "./riohubTikTok";

export type RioHubOrderSyncResult = {
  processed: number;
  created: number;
  updated: number;
  approved: number;
  unmapped: number;
};

export async function syncRioHubTikTokOrders(params: {
  timeStart?: string | number | null;
  timeEnd?: string | number | null;
  updateTimeStart?: string | number | null;
  updateTimeEnd?: string | number | null;
  orderId?: string | null;
  maxPages?: number;
} = {}): Promise<RioHubOrderSyncResult> {
  const result: RioHubOrderSyncResult = { processed: 0, created: 0, updated: 0, approved: 0, unmapped: 0 };
  const pageSize = 200;
  const maxPages = params.maxPages ?? 20;

  for (let page = 1; page <= maxPages; page++) {
    const response = await listRioHubTikTokOrders({
      page,
      pageSize,
      timeStart: params.timeStart,
      timeEnd: params.timeEnd,
      updateTimeStart: params.updateTimeStart,
      updateTimeEnd: params.updateTimeEnd,
      orderId: params.orderId,
    });

    for (const order of response.orders ?? []) {
      const one = await upsertRioHubTikTokOrder(order);
      result.processed++;
      if (one.created) result.created++;
      if (one.updated) result.updated++;
      if (one.justApproved) result.approved++;
      if (!one.customerId) result.unmapped++;
    }

    const seen = page * pageSize;
    if (!response.orders?.length || seen >= (response.total ?? 0)) break;
  }

  return result;
}

export async function upsertRioHubTikTokOrder(order: RioHubOrder): Promise<{
  orderId: string;
  created: boolean;
  updated: boolean;
  justApproved: boolean;
  customerId: string | null;
}> {
  const platform = await prisma.platform.findUnique({ where: { code: "TIKTOK" } });
  if (!platform) throw new Error("Nền tảng TIKTOK chưa được cấu hình");

  const orderExternalId = buildRioHubOrderExternalId(order);
  const existing = await prisma.order.findUnique({
    where: { platformId_orderExternalId: { platformId: platform.id, orderExternalId } },
  });

  const trackingLink = await findTrackingLinkForRioHubOrder(order);
  const status = mapRioHubStatus(order.status);
  const commissionAmount = resolveRioHubCommissionAmount(order, status);
  const rule = await getActiveCommissionRule();
  const split = splitCommission(commissionAmount, rule);
  const orderedAt = parseRioHubDate(order.create_time, order.time_created);
  const completedAt = status === "approved" ? parseRioHubDate(order.update_time, order.time_delivered) ?? new Date() : parseRioHubDate(order.update_time, order.time_delivered);
  const orderAmount = parseRioHubMoney(order.commission_gmv) ?? calculateOrderAmount(order);
  const rawData = JSON.stringify(order);
  const isFullyPaid = existing?.payoutStatus === "paid";

  const wasApproved = existing?.orderStatus === "approved";
  const justApproved = status === "approved" && !wasApproved;
  const resolvedCustomerId = existing?.customerId ?? trackingLink?.customerId ?? null;

  const updateData: Prisma.OrderUpdateInput = {
    trackingLink: trackingLink ? { connect: { id: trackingLink.id } } : undefined,
    customer: resolvedCustomerId ? { connect: { id: resolvedCustomerId } } : undefined,
    trackingCode: trackingLink?.trackingCode ?? order.sub2 ?? existing?.trackingCode,
    checkoutId: order.content_id ?? existing?.checkoutId,
    channel: order.content_type ?? existing?.channel,
    orderedAt,
    completedAt,
    clickedAt: existing?.clickedAt,
    shopName: order.shop_name ?? existing?.shopName,
    itemId: order.product_id ?? existing?.itemId,
    itemName: order.product_name ?? existing?.itemName,
    orderAmount: isFullyPaid ? existing?.orderAmount : orderAmount,
    grossCommissionAmount: isFullyPaid ? existing?.grossCommissionAmount : commissionAmount,
    netCommissionAmount: isFullyPaid ? existing?.netCommissionAmount : commissionAmount,
    commissionAmount: isFullyPaid ? existing?.commissionAmount : commissionAmount,
    customerRewardAmount: isFullyPaid ? existing?.customerRewardAmount : split.customerRewardAmount,
    systemProfitAmount: isFullyPaid ? existing?.systemProfitAmount : split.systemProfitAmount,
    orderStatus: isFullyPaid ? existing?.orderStatus : status,
    productAffiliateStatus: order.settlement_status ?? order.payment_status ?? String(order.status ?? ""),
    subId1: order.sub1 ?? null,
    subId2: order.sub2 ?? null,
    subId3: order.sub3 ?? null,
    subId4: order.sub4 ?? null,
    subId5: null,
    sourceType: "riohub",
    rawData,
    approvedAt: justApproved ? new Date() : existing?.approvedAt,
  };

  const saved = existing
    ? await prisma.order.update({ where: { id: existing.id }, data: updateData })
    : await prisma.order.create({
        data: {
          platformId: platform.id,
          orderExternalId,
          trackingLinkId: trackingLink?.id,
          customerId: trackingLink?.customerId,
          trackingCode: trackingLink?.trackingCode ?? order.sub2 ?? undefined,
          checkoutId: order.content_id ?? undefined,
          channel: order.content_type ?? undefined,
          orderedAt,
          completedAt,
          shopName: order.shop_name ?? undefined,
          itemId: order.product_id ?? undefined,
          itemName: order.product_name ?? undefined,
          orderAmount,
          grossCommissionAmount: commissionAmount,
          netCommissionAmount: commissionAmount,
          commissionAmount,
          customerRewardAmount: split.customerRewardAmount,
          systemProfitAmount: split.systemProfitAmount,
          orderStatus: status,
          productAffiliateStatus: order.settlement_status ?? order.payment_status ?? String(order.status ?? ""),
          subId1: order.sub1 ?? undefined,
          subId2: order.sub2 ?? undefined,
          subId3: order.sub3 ?? undefined,
          subId4: order.sub4 ?? undefined,
          sourceType: "riohub",
          rawData,
          approvedAt: status === "approved" ? new Date() : undefined,
        },
      });

  if ((existing ? justApproved : status === "approved") && saved.customerId) {
    await handleApprovedRioHubOrder(saved.id);
  }

  return {
    orderId: saved.id,
    created: !existing,
    updated: Boolean(existing),
    justApproved: existing ? justApproved : status === "approved",
    customerId: saved.customerId,
  };
}

export function buildRioHubOrderExternalId(order: RioHubOrder) {
  const skuPart = order.sku_id || order.product_id || "line";
  return `${order.order_id}:${skuPart}`;
}

function mapRioHubStatus(status: number | null | undefined) {
  if (status === 2) return "approved";
  if (status === 3) return "cancelled";
  return "pending";
}

function resolveRioHubCommissionAmount(order: RioHubOrder, status: string) {
  if (status === "cancelled") return 0;
  return parseRioHubMoney(order.actual_commission) ?? parseRioHubMoney(order.est_commission) ?? 0;
}

function calculateOrderAmount(order: RioHubOrder) {
  const price = parseRioHubMoney(order.price) ?? 0;
  const quantity = order.quantity ?? 1;
  return price * quantity;
}

function parseRioHubDate(unixSeconds?: number | null, textDate?: string | null) {
  if (typeof unixSeconds === "number" && unixSeconds > 0) return new Date(unixSeconds * 1000);
  if (textDate) {
    const normalized = textDate.includes("T") ? textDate : `${textDate.replace(" ", "T")}Z`;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

async function findTrackingLinkForRioHubOrder(order: RioHubOrder) {
  const candidates = [order.sub2, order.sub1, order.sub3, order.sub4, order.sub_id, order.subid].filter(
    (value): value is string => Boolean(value)
  );
  if (candidates.length === 0) return null;
  return prisma.trackingLink.findFirst({ where: { trackingCode: { in: candidates } } });
}

async function handleApprovedRioHubOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.customerId) return;

  void notifyCustomerTelegram(
    order.customerId,
    buildOrderApprovedMessage({
      orderExternalId: order.orderExternalId,
      customerRewardAmount: Number(order.customerRewardAmount),
      shopName: order.shopName,
    })
  );

  void notifyCustomerInApp(order.customerId, {
    type: "order_approved",
    title: "Tiền đã về!",
    message: `Đơn hàng ${order.orderExternalId}${order.shopName ? ` (${order.shopName})` : ""} đã được duyệt - bạn sẽ nhận ${Number(order.customerRewardAmount).toLocaleString("vi-VN")}đ hoàn tiền.`,
    link: "/app/orders",
  });

  const customerData = await prisma.customer.findUnique({
    where: { id: order.customerId },
    select: {
      referredById: true,
      createdAt: true,
      referredBy: { select: { isPartner: true } },
    },
  });

  if (!customerData?.referredById) return;

  const existingRef = await prisma.order.findUnique({
    where: { platformId_orderExternalId: { platformId: order.platformId, orderExternalId: `REF-${order.orderExternalId}` } },
  });
  if (existingRef) return;

  const rule = await getActiveCommissionRule();
  const maxOrders = rule?.maxReferralOrders ?? 5;
  const validMonths = rule?.referralValidityMonths ?? 6;
  const referralRate = rule?.referralRate ?? new Prisma.Decimal(0.05);
  const isPartner = customerData.referredBy?.isPartner ?? false;
  const referenceDate = order.orderedAt ?? order.completedAt ?? new Date();

  if (!isPartner && !isWithinReferralWindow(customerData.createdAt, validMonths, referenceDate)) return;

  const referrerBonusCount = isPartner
    ? 0
    : await prisma.order.count({
        where: {
          customerId: customerData.referredById,
          sourceType: "referral",
          orderStatus: "approved",
          referralSourceCustomerId: order.customerId,
        },
      });

  if (!isPartner && referrerBonusCount >= maxOrders) return;

  const afterTaxAmount = new Prisma.Decimal(order.customerRewardAmount).add(new Prisma.Decimal(order.systemProfitAmount));
  const bonusAmount = afterTaxAmount.mul(referralRate).toDecimalPlaces(0);
  const systemProfitAfterReferral = new Prisma.Decimal(order.systemProfitAmount).sub(bonusAmount);

  await prisma.order.update({
    where: { id: order.id },
    data: { systemProfitAmount: systemProfitAfterReferral, referralBonusDeducted: bonusAmount },
  });

  await prisma.order.create({
    data: {
      platformId: order.platformId,
      orderExternalId: `REF-${order.orderExternalId}`,
      customerId: customerData.referredById,
      trackingCode: "REFERRAL",
      channel: "REFERRAL",
      orderedAt: order.orderedAt,
      completedAt: order.completedAt,
      shopName: order.shopName,
      itemName: `Hoa hồng giới thiệu: ${order.orderExternalId}`,
      orderAmount: order.orderAmount,
      grossCommissionAmount: 0,
      netCommissionAmount: 0,
      commissionAmount: 0,
      customerRewardAmount: bonusAmount,
      systemProfitAmount: 0,
      orderStatus: "approved",
      sourceType: "referral",
      referralSourceCustomerId: order.customerId,
    },
  });

  void notifyCustomerInApp(customerData.referredById, {
    type: "referral_bonus",
    title: "Hoa hồng giới thiệu",
    message: `Bạn vừa nhận ${Number(bonusAmount).toLocaleString("vi-VN")}đ hoa hồng giới thiệu từ đơn hàng của bạn bè.`,
    link: "/app/referral",
  });

  void notifyCustomerTelegram(
    customerData.referredById,
    buildReferralBonusMessage({
      bonusAmount: Number(bonusAmount),
      friendOrderExternalId: order.orderExternalId,
    })
  );
}
