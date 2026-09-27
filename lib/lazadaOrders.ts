import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getActiveCommissionRule, isWithinReferralWindow, isSettlementReady, splitCommission } from "./commission";
import { notifyCustomerInApp } from "./notifications";
import { notifyCustomerTelegram } from "./telegramNotify";
import { buildOrderApprovedMessage, buildReferralBonusMessage } from "./telegramBot";
import { getLazadaConversionReport, LazadaConversionRow } from "./lazadaApi";

export type LazadaOrderSyncResult = {
  processed: number;
  created: number;
  updated: number;
  approved: number;
  unmapped: number;
};

/**
 * Đồng bộ đơn Lazada — mặc định quét 30 ngày gần nhất mỗi lần chạy (đủ dư so
 * với chu kỳ 30 phút của timer) để bắt được cả đơn cũ vừa đổi trạng thái
 * (vd fulfilled -> delivered -> returned), không chỉ đơn mới phát sinh.
 */
export async function syncLazadaOrders(params: { days?: number } = {}): Promise<LazadaOrderSyncResult> {
  const result: LazadaOrderSyncResult = { processed: 0, created: 0, updated: 0, approved: 0, unmapped: 0 };
  const days = params.days ?? 30;
  const dateEnd = new Date().toISOString().slice(0, 10);
  const dateStart = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  let page = 1;
  const maxPages = 20;
  while (page <= maxPages) {
    const { rows } = await getLazadaConversionReport({ dateStart, dateEnd, page, limit: 100 });
    if (!rows.length) break;

    for (const row of rows) {
      const one = await upsertLazadaOrder(row);
      result.processed++;
      if (one.created) result.created++;
      if (one.updated) result.updated++;
      if (one.justApproved) result.approved++;
      if (!one.customerId) result.unmapped++;
    }

    if (rows.length < 100) break;
    page++;
  }

  return result;
}

/**
 * Trạng thái Lazada (theo tài liệu API): fulfilled (sẵn sàng giao, ước tính
 * hoa hồng tạm) / delivered (đã giao) / returned (yêu cầu trả hàng). KHÔNG
 * duyệt "approved" ngay khi delivered — áp dụng đúng cơ chế SETTLEMENT_DAYS
 * (15 ngày kể từ ngày giao) giống hệt Shopee, để phòng trường hợp đổi/trả
 * hàng, thay vì duyệt ngay lập tức như cách RioHub/TikTok đang làm.
 *
 * "returned" trên 1 đơn CHƯA từng approved → cancelled (chưa có gì để đảo).
 * "returned" trên 1 đơn ĐÃ từng approved → clawback (Lazada đòi lại hoa
 * hồng đã ghi nhận — phải đảo tiền, xem xử lý ở upsertLazadaOrder).
 */
function resolveLazadaStatus(row: LazadaConversionRow, deliveredAt: Date | null, wasApproved: boolean): string {
  const status = (row.status ?? "").toLowerCase();
  if (status === "returned") return wasApproved ? "clawback" : "cancelled";
  if (status === "delivered") {
    return isSettlementReady(deliveredAt) ? "approved" : "processing";
  }
  return "pending"; // fulfilled hoặc trạng thái khác chưa xác định
}

function parseLazadaMoney(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseLazadaDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildLazadaOrderExternalId(row: LazadaConversionRow): string {
  return `${row.orderId}:${row.subOrderId || "line"}`;
}

export async function upsertLazadaOrder(row: LazadaConversionRow): Promise<{
  orderId: string;
  created: boolean;
  updated: boolean;
  justApproved: boolean;
  customerId: string | null;
}> {
  const platform = await prisma.platform.findUnique({ where: { code: "LAZADA" } });
  if (!platform) throw new Error("Nền tảng LAZADA chưa được cấu hình");

  const orderExternalId = buildLazadaOrderExternalId(row);
  const existing = await prisma.order.findUnique({
    where: { platformId_orderExternalId: { platformId: platform.id, orderExternalId } },
  });

  const trackingLink = await findTrackingLinkForLazadaOrder(row);
  const deliveredAt = parseLazadaDate(row.deliveredTime);
  const wasApproved = existing?.orderStatus === "approved";
  const status = resolveLazadaStatus(row, deliveredAt, wasApproved);
  const isClawback = status === "clawback";
  const commissionAmount = ["returned", "clawback"].includes(row.status?.toLowerCase() ?? "") ? 0 : parseLazadaMoney(row.estPayout);
  const rule = await getActiveCommissionRule();
  const split = splitCommission(commissionAmount, rule);
  const orderedAt = parseLazadaDate(row.fulfilledTime) ?? new Date();
  const completedAt = deliveredAt ?? parseLazadaDate(row.returnedTime);
  const orderAmount = parseLazadaMoney(row.orderAmt);
  const rawData = JSON.stringify(row);
  const isFullyPaid = existing?.payoutStatus === "paid";

  const justApproved = status === "approved" && !wasApproved;
  const resolvedCustomerId = existing?.customerId ?? trackingLink?.customerId ?? null;

  // Số tiền bị khoá 1 khi đơn đã thực trả cho khách (payoutStatus=paid) —
  // giữ nguyên lịch sử đã trả bao nhiêu, không ghi đè theo dữ liệu mới.
  // NHƯNG bản thân orderStatus vẫn PHẢI được phép chuyển sang "clawback"
  // dù đã trả tiền — đó chính là tín hiệu "cần đảo tiền", xử lý riêng bên
  // dưới bằng 1 bút toán âm (KHÔNG được khoá cứng orderStatus như tiền).
  const updateData: Prisma.OrderUpdateInput = {
    trackingLink: trackingLink ? { connect: { id: trackingLink.id } } : undefined,
    customer: resolvedCustomerId ? { connect: { id: resolvedCustomerId } } : undefined,
    trackingCode: trackingLink?.trackingCode ?? row.subId2 ?? existing?.trackingCode,
    orderedAt,
    completedAt,
    shopName: null,
    itemName: row.offerName ?? row.skuName ?? existing?.itemName,
    orderAmount: isFullyPaid ? existing?.orderAmount : orderAmount,
    grossCommissionAmount: isFullyPaid ? existing?.grossCommissionAmount : commissionAmount,
    netCommissionAmount: isFullyPaid ? existing?.netCommissionAmount : commissionAmount,
    commissionAmount: isFullyPaid ? existing?.commissionAmount : commissionAmount,
    customerRewardAmount: isFullyPaid ? existing?.customerRewardAmount : split.customerRewardAmount,
    systemProfitAmount: isFullyPaid ? existing?.systemProfitAmount : split.systemProfitAmount,
    orderStatus: isFullyPaid ? (isClawback ? "clawback" : existing?.orderStatus) : status,
    productAffiliateStatus: row.status ?? null,
    subId1: row.subId1 ?? null,
    subId2: row.subId2 ?? null,
    sourceType: "lazada",
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
          trackingCode: trackingLink?.trackingCode ?? row.subId2 ?? undefined,
          orderedAt,
          completedAt,
          itemName: row.offerName ?? row.skuName ?? undefined,
          orderAmount,
          grossCommissionAmount: commissionAmount,
          netCommissionAmount: commissionAmount,
          commissionAmount,
          customerRewardAmount: split.customerRewardAmount,
          systemProfitAmount: split.systemProfitAmount,
          orderStatus: status,
          productAffiliateStatus: row.status ?? undefined,
          subId1: row.subId1 ?? undefined,
          subId2: row.subId2 ?? undefined,
          sourceType: "lazada",
          rawData,
          approvedAt: status === "approved" ? new Date() : undefined,
        },
      });

  if (isClawback) {
    await handleLazadaClawback(saved);
  }

  if ((existing ? justApproved : status === "approved") && saved.customerId) {
    await handleApprovedLazadaOrder(saved.id);
  }

  return {
    orderId: saved.id,
    created: !existing,
    updated: Boolean(existing),
    justApproved: existing ? justApproved : status === "approved",
    customerId: saved.customerId,
  };
}

async function findTrackingLinkForLazadaOrder(row: LazadaConversionRow) {
  const candidates = [row.subId2, row.subId1].filter((v): v is string => Boolean(v));
  if (candidates.length === 0) return null;
  return prisma.trackingLink.findFirst({ where: { trackingCode: { in: candidates } } });
}

/**
 * Lazada đòi lại hoa hồng cho 1 đơn ĐÃ từng approved — đảo cả đơn gốc lẫn
 * hoa hồng giới thiệu (nếu có), đúng khuôn với cơ chế clawback thủ công ở
 * app/api/orders/[id]/route.ts:
 *   - Chưa trả cho khách: xoá số tiền ảo về 0 (không có gì để đảo).
 *   - Đã trả cho khách: tạo 1 đơn "CLAWBACK-..." số ÂM để trừ lại ví,
 *     giữ nguyên đơn gốc làm lịch sử đã từng trả bao nhiêu.
 * Áp dụng y hệt cho đơn REF- (hoa hồng giới thiệu) nếu người giới thiệu đã
 * lỡ nhận tiền cho đơn của bạn họ mời, mà giờ đơn gốc bị Lazada đòi lại.
 */
async function handleLazadaClawback(order: { id: string; platformId: string; orderExternalId: string; customerId: string | null; payoutStatus: string; customerRewardAmount: Prisma.Decimal; orderAmount: Prisma.Decimal | null; trackingCode: string | null; orderedAt: Date | null; completedAt: Date | null; itemName: string | null }) {
  const refOrder = await prisma.order.findUnique({
    where: { platformId_orderExternalId: { platformId: order.platformId, orderExternalId: `REF-${order.orderExternalId}` } },
  });

  if (refOrder && refOrder.orderStatus === "approved") {
    await prisma.order.update({ where: { id: refOrder.id }, data: { orderStatus: "clawback" } });

    if (refOrder.payoutStatus === "paid") {
      await prisma.order.create({
        data: {
          platformId: refOrder.platformId,
          orderExternalId: `CLAWBACK-${refOrder.orderExternalId}`,
          customerId: refOrder.customerId,
          trackingCode: "REFERRAL",
          channel: "CLAWBACK",
          itemName: `[Clawback hoa hồng giới thiệu] ${order.orderExternalId}`,
          orderAmount: refOrder.orderAmount,
          grossCommissionAmount: 0,
          netCommissionAmount: 0,
          commissionAmount: 0,
          customerRewardAmount: -Number(refOrder.customerRewardAmount),
          systemProfitAmount: 0,
          orderStatus: "clawback",
          payoutStatus: "unpaid",
          sourceType: "clawback",
        },
      });
    } else {
      await prisma.order.update({ where: { id: refOrder.id }, data: { customerRewardAmount: 0 } });
    }
  }

  if (order.payoutStatus === "paid" && order.customerId) {
    await prisma.order.create({
      data: {
        platformId: order.platformId,
        orderExternalId: `CLAWBACK-${order.orderExternalId}`,
        customerId: order.customerId,
        trackingCode: order.trackingCode,
        channel: "CLAWBACK",
        orderedAt: order.orderedAt,
        completedAt: order.completedAt,
        itemName: `[Clawback] ${order.itemName ?? order.orderExternalId}`,
        orderAmount: order.orderAmount,
        grossCommissionAmount: 0,
        netCommissionAmount: 0,
        commissionAmount: 0,
        customerRewardAmount: -Number(order.customerRewardAmount),
        systemProfitAmount: 0,
        orderStatus: "clawback",
        payoutStatus: "unpaid",
        sourceType: "clawback",
      },
    });
  } else if (order.payoutStatus !== "paid") {
    await prisma.order.update({
      where: { id: order.id },
      data: { customerRewardAmount: 0, systemProfitAmount: 0 },
    });
  }
}

async function handleApprovedLazadaOrder(orderId: string) {
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
    select: { referredById: true, createdAt: true, referredBy: { select: { isPartner: true } } },
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
    buildReferralBonusMessage({ bonusAmount: Number(bonusAmount), friendOrderExternalId: order.orderExternalId })
  );
}
