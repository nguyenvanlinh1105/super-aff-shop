import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildOrderApprovedMessage, buildReferralBonusMessage } from "@/lib/telegramBot";
import { notifyCustomerInApp } from "@/lib/notifications";
import { isWithinReferralWindow, isSettlementReady, SETTLEMENT_DAYS, getEffectivePartnerRate } from "@/lib/commission";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { customerId, orderStatus, earlyApprovalReason } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  // Kiểm tra chuyển trạng thái hợp lệ
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending:    ["completed", "cancelled", "approved", "processing"],
    processing: ["approved", "cancelled"],  // Đang đối soát
    completed:  ["approved", "cancelled"],   // Shopee đã trả → approved; hoặc phát hiện lỗi → cancelled
    approved:   ["clawback"],                // Shopee đòi lại
    cancelled:  ["pending"],                 // Khôi phục nếu nhầm
    clawback:   [],                          // Trạng thái cuối, không thay đổi
  };

  const MAX_EARLY_SETTLEMENT_REWARD = 5000;
  let isEarlyApproval = false;

  if (orderStatus && order.orderStatus !== orderStatus) {
    const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];
    if (!allowed.includes(orderStatus)) {
      return NextResponse.json(
        { error: `Không thể chuyển từ "${order.orderStatus}" sang "${orderStatus}"` },
        { status: 400 }
      );
    }

    // Kiểm tra quy định đối soát:
    // Nếu chưa đủ SETTLEMENT_DAYS (15 ngày):
    // Chỉ cho phép duyệt sớm với đơn có tiền hoàn (customerRewardAmount) <= 5.000đ
    // VÀ phải cung cấp lý do hoàn thành đối soát sớm.
    if (orderStatus === "approved") {
      const settlementReady = isSettlementReady(order.completedAt);
      if (!settlementReady) {
        const rewardAmount = Number(order.customerRewardAmount || 0);
        if (rewardAmount > MAX_EARLY_SETTLEMENT_REWARD) {
          return NextResponse.json(
            {
              error: `Đơn chưa đủ ${SETTLEMENT_DAYS} ngày đối soát và có tiền hoàn ${rewardAmount.toLocaleString("vi-VN")}đ (vượt mức tối đa ${MAX_EARLY_SETTLEMENT_REWARD.toLocaleString("vi-VN")}đ cho phép duyệt trước hạn). Vui lòng chờ đủ thời gian đối soát.`,
            },
            { status: 400 }
          );
        }

        const reasonStr = typeof earlyApprovalReason === "string" ? earlyApprovalReason.trim() : "";
        if (!reasonStr) {
          return NextResponse.json(
            {
              error: `Đơn chưa đủ ${SETTLEMENT_DAYS} ngày đối soát. Vui lòng nhập lý do hoàn thành đối soát sớm để chuyển tiền vào ví khách.`,
            },
            { status: 400 }
          );
        }

        isEarlyApproval = true;
      }
    }
  }

  // Đổi/bỏ gán khách chỉ an toàn khi đơn CHƯA có khách + đã duyệt (đó vẫn
  // là luồng "Gán khách" bình thường cho đơn approved nhưng chưa map) —
  // nếu đơn ĐÃ có khách VÀ đã approved/clawback, tiền + hoa hồng giới
  // thiệu (nếu có) đã tính theo đúng khách đó, đổi khách lúc này sẽ để
  // lại dữ liệu sai lệch không tự dọn được. Phải Clawback trước rồi mới
  // gán lại khách khác.
  if (
    customerId !== undefined &&
    order.customerId &&
    (order.orderStatus === "approved" || order.orderStatus === "clawback")
  ) {
    return NextResponse.json(
      { error: "Đơn đã có khách và đã duyệt — không thể đổi/bỏ gán khách. Dùng Clawback trước nếu cần gán lại khách khác." },
      { status: 400 }
    );
  }

  let data: Record<string, unknown> = {};

  if (customerId !== undefined) data.customerId = customerId;
  if (orderStatus) {
    data.orderStatus = orderStatus;
    if (orderStatus === "approved") {
      data.approvedAt = new Date();
      if (isEarlyApproval && earlyApprovalReason) {
        data.earlyApprovalReason = String(earlyApprovalReason).trim();
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật" }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id: params.id }, data });

  if (isEarlyApproval && session?.userId) {
    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        entityType: "Order",
        entityId: params.id,
        action: "early_approval",
        beforeData: JSON.stringify({ orderStatus: order.orderStatus }),
        afterData: JSON.stringify({
          orderStatus: "approved",
          reason: earlyApprovalReason,
          customerRewardAmount: Number(order.customerRewardAmount),
          completedAt: order.completedAt,
        }),
      },
    }).catch((err) => console.error("Lỗi ghi audit log:", err));
  }

  const targetCustomerId = updated.customerId;

  // ============================================================
  // Xử LÝ APPROVED (Admin xác nhận Shopee đã trả hoa hồng)
  // Chạy referral bonus + thông báo Telegram khi đơn VỪA chuyển sang
  // approved, HOẶC khi đơn đã approved từ trước (import tự động) nhưng
  // chưa map khách — và admin vừa gán khách vào (thao tác "Gán khách" ở
  // tab "Chưa map khách" rất phổ biến, trước đây bị bỏ sót không tính
  // referral bonus / không báo Telegram vì chỉ check khi đổi orderStatus
  // trong CÙNG request).
  // ============================================================
  const justBecameApproved = updated.orderStatus === "approved" && order.orderStatus !== "approved";
  const justGotCustomerOnApprovedOrder = updated.orderStatus === "approved" && !order.customerId && !!customerId;

  if ((justBecameApproved || justGotCustomerOnApprovedOrder) && targetCustomerId) {
    // Thông báo Telegram
    void notifyCustomerTelegram(
      targetCustomerId,
      buildOrderApprovedMessage({
        orderExternalId: updated.orderExternalId,
        customerRewardAmount: Number(updated.customerRewardAmount),
        shopName: updated.shopName,
      })
    );

    void notifyCustomerInApp(targetCustomerId, {
      type: "order_approved",
      title: "💰 Tiền đã về!",
      message: `Đơn hàng ${updated.orderExternalId}${updated.shopName ? ` (${updated.shopName})` : ""} đã được duyệt — bạn sẽ nhận ${Number(updated.customerRewardAmount).toLocaleString("vi-VN")}đ hoàn tiền.`,
      link: "/app/orders",
    });

    // Xử lý Referral Bonus
    const customerData = await prisma.customer.findUnique({
      where: { id: targetCustomerId },
      select: {
        referredById: true,
        createdAt: true,
        referredBy: { select: { isPartner: true } },
      },
    });

    if (customerData?.referredById) {
      const activeRule = await prisma.commissionRule.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });

      const maxOrders = activeRule?.maxReferralOrders ?? 5;
      const validMonths = activeRule?.referralValidityMonths ?? 6;
      // Giữ Prisma.Decimal xuyên suốt, không ép về Number rồi nhân dấu phẩy
      // động — cùng chuẩn với splitCommission() và với orders/import/route.ts,
      // tránh sai số nhị phân len vào tiền hoa hồng giới thiệu.
      const referralRate = activeRule?.referralRate ?? new Prisma.Decimal(0.05);
      const isPartner = customerData.referredBy?.isPartner ?? false;

      // Đối chiếu theo ngày ĐƠN HÀNG thực sự phát sinh (orderedAt/completedAt),
      // không phải thời điểm admin duyệt/đối soát — vì Shopee/TikTok có thể
      // trả hoa hồng trễ 15-30 ngày, nếu dùng "now" một đơn phát sinh hợp lệ
      // trong hạn 6 tháng có thể bị từ chối oan chỉ vì duyệt trễ. ĐỐI TÁC
      // (isPartner) không bị giới hạn 6 tháng — hoa hồng vĩnh viễn.
      const referenceDate = updated.orderedAt ?? updated.completedAt ?? new Date();
      const isTimeValid = isPartner || isWithinReferralWindow(customerData.createdAt, validMonths, referenceDate);

      if (isTimeValid) {
        // Giới hạn 5 đơn là MỖI người bạn (F1) riêng — xem chú thích chi tiết
        // trong orders/import/route.ts. ĐỐI TÁC không giới hạn số đơn.
        const referrerBonusCount = isPartner
          ? 0
          : await prisma.order.count({
              where: {
                customerId: customerData.referredById,
                sourceType: "referral",
                orderStatus: "approved",
                referralSourceCustomerId: targetCustomerId,
              },
            });

        if (isPartner || referrerBonusCount < maxOrders) {
          // ============================================================
          // Hoa hồng giới thiệu TRÍCH TỪ PHẦN HỆ THỐNG GIỮ, không đụng vào
          // 80% của khách (B).
          // Đối tác (isPartner) được tra cứu tỷ lệ theo khoảng thời gian hiệu lực
          // tại thời điểm đơn phát sinh (referenceDate) (3%, 5%, 7%, 10%...).
          // ============================================================
          const effectiveRate = isPartner
            ? await getEffectivePartnerRate(customerData.referredById, referenceDate, referralRate)
            : referralRate;

          const afterTaxAmount = new Prisma.Decimal(updated.customerRewardAmount).add(
            new Prisma.Decimal(updated.systemProfitAmount)
          );
          const bonusAmount = afterTaxAmount.mul(effectiveRate).toDecimalPlaces(0);
          const systemProfitAfterReferral = new Prisma.Decimal(updated.systemProfitAmount).sub(bonusAmount);

          await prisma.order.update({
            where: { id: updated.id },
            data: { systemProfitAmount: systemProfitAfterReferral, referralBonusDeducted: bonusAmount },
          });

          await prisma.order.upsert({
            where: { platformId_orderExternalId: { platformId: updated.platformId, orderExternalId: `REF-${updated.orderExternalId}` } },
            update: {
              customerId: customerData.referredById,
              orderAmount: updated.orderAmount,
              commissionAmount: 0,
              customerRewardAmount: bonusAmount,
              systemProfitAmount: 0,
              orderStatus: "approved",
              referralSourceCustomerId: targetCustomerId,
            },
            create: {
              platformId: updated.platformId,
              orderExternalId: `REF-${updated.orderExternalId}`,
              customerId: customerData.referredById,
              trackingCode: "REFERRAL",
              channel: "REFERRAL",
              orderedAt: updated.orderedAt,
              completedAt: updated.completedAt,
              shopName: updated.shopName,
              itemName: `Hoa hồng giới thiệu: ${updated.orderExternalId}`,
              orderAmount: updated.orderAmount,
              grossCommissionAmount: 0,
              netCommissionAmount: 0,
              commissionAmount: 0,
              customerRewardAmount: bonusAmount,
              systemProfitAmount: 0,
              orderStatus: "approved",
              sourceType: "referral",
              referralSourceCustomerId: targetCustomerId,
            },
          });

          void notifyCustomerInApp(customerData.referredById, {
            type: "referral_bonus",
            title: "🎁 Hoa hồng giới thiệu",
            message: `Bạn vừa nhận ${Number(bonusAmount).toLocaleString("vi-VN")}đ hoa hồng giới thiệu từ đơn hàng của bạn bè.`,
            link: "/app/referral",
          });

          void notifyCustomerTelegram(
            customerData.referredById,
            buildReferralBonusMessage({
              bonusAmount: Number(bonusAmount),
              friendOrderExternalId: updated.orderExternalId,
            })
          );
        }
      }
    }
  }

  // ============================================================
  // Xử LÝ CLAWBACK (Shopee đòi lại hoa hồng)
  // Nếu đơn đã được duyệt và chưa thanh toán cho khách:
  //   → Chỉ đổi trạng thái, không có tác động tài chính thêm
  // Nếu đơn đã thanh toán cho khách (payoutStatus=paid):
  //   → Tạo bụt toán đảo (Order âm) để trừ tiền ví
  // ============================================================
  if (orderStatus === "clawback") {
    // Đảo referral bonus nếu có
    const refOrder = await prisma.order.findUnique({
      where: { platformId_orderExternalId: { platformId: updated.platformId, orderExternalId: `REF-${updated.orderExternalId}` } },
    });
    if (refOrder && refOrder.orderStatus === "approved") {
      await prisma.order.update({
        where: { id: refOrder.id },
        data: { orderStatus: "clawback" },
      });

      // Nếu hoa hồng giới thiệu đã được trả cho người giới thiệu rồi,
      // phải trừ lại ví của họ — nếu không họ vẫn giữ tiền cho một đơn
      // hàng gốc đã bị Shopee đòi lại hoa hồng.
      if (refOrder.payoutStatus === "paid") {
        await prisma.order.create({
          data: {
            platformId: refOrder.platformId,
            orderExternalId: `CLAWBACK-${refOrder.orderExternalId}`,
            customerId: refOrder.customerId,
            trackingCode: "REFERRAL",
            channel: "CLAWBACK",
            itemName: `[Clawback hoa hồng giới thiệu] ${updated.orderExternalId}`,
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
      }
    }

    if (updated.payoutStatus === "paid" && targetCustomerId) {
      // Tạo bụt toán trừ ví khách
      await prisma.order.create({
        data: {
          platformId: updated.platformId,
          orderExternalId: `CLAWBACK-${updated.orderExternalId}`,
          customerId: targetCustomerId,
          trackingCode: updated.trackingCode,
          channel: "CLAWBACK",
          orderedAt: updated.orderedAt,
          completedAt: updated.completedAt,
          shopName: updated.shopName,
          itemName: `[Clawback] ${updated.itemName ?? updated.orderExternalId}`,
          orderAmount: updated.orderAmount,
          grossCommissionAmount: 0,
          netCommissionAmount: 0,
          commissionAmount: 0,
          customerRewardAmount: -Number(updated.customerRewardAmount), // Số âm = trừ ví
          systemProfitAmount: -Number(updated.systemProfitAmount),
          orderStatus: "clawback",
          payoutStatus: "unpaid",
          sourceType: "clawback",
        },
      });
    }
  }

  return NextResponse.json({ order: updated });
}
