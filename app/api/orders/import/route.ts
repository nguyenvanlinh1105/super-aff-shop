import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseImportCsv } from "@/lib/csvImport";
import { parseShopeeAffiliateCsv } from "@/lib/shopeeAffiliateCsv";
import { getActiveCommissionRule, splitCommission, isWithinReferralWindow, isSettlementReady } from "@/lib/commission";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildOrderApprovedMessage, buildReferralBonusMessage } from "@/lib/telegramBot";
import { notifyCustomerInApp } from "@/lib/notifications";

// Chuẩn hoá output từ cả 2 parser về cùng shape dùng trong route
type NormRow = {
  rowNumber: number;
  orderExternalId?: string;
  checkoutId?: string;
  trackingCode?: string;
  channel?: string;
  orderedAt?: Date | null;
  completedAt?: Date | null;
  clickedAt?: Date | null;
  shopName?: string | null;
  shopId?: string | null;
  itemId?: string | null;
  itemName?: string | null;
  commissionAmount?: number;
  grossCommissionAmount?: number;
  netCommissionAmount?: number;
  orderAmount?: number;
  orderStatus?: string | null;
  productAffiliateStatus?: string | null;
  subId1?: string | null;
  subId2?: string | null;
  subId3?: string | null;
  subId4?: string | null;
  subId5?: string | null;
  paymentStatus?: string;
  rawData: Record<string, string>;
};

function parseAnyCsv(content: string): NormRow[] {
  // Thử parser Shopee chuẩn trước (header tiếng Việt đầy đủ)
  try {
    const rows = parseShopeeAffiliateCsv(content);
    return rows.map((r, i) => ({
      rowNumber: i + 1,
      orderExternalId: r.externalOrderId || undefined,
      checkoutId: r.checkoutId || undefined,
      trackingCode: r.subId2 || undefined,      // Sub_id2 = trackingCode
      channel: r.channel || undefined,
      orderedAt: r.orderedAt,
      completedAt: r.completedAt,
      clickedAt: r.clickedAt,
      shopName: r.shopName,
      shopId: r.shopId,
      itemId: r.itemId,
      itemName: r.itemName,
      commissionAmount: Number(r.grossCommission),
      grossCommissionAmount: Number(r.grossCommission),
      netCommissionAmount: Number(r.netCommission),
      orderAmount: Number(r.orderAmount),
      orderStatus: r.orderStatus,
      productAffiliateStatus: r.productAffiliateStatus,
      subId1: r.subId1,
      subId2: r.subId2,
      subId3: r.subId3,
      subId4: r.subId4,
      subId5: r.subId5,
      rawData: r.rawRow as unknown as Record<string, string>,
    }));
  } catch {
    // Fallback: generic parser cho các nền tảng khác
    return parseImportCsv(content);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "preview";
  const sourceName = (formData.get("sourceName") as string) || "Không rõ nguồn";
  const platformId = formData.get("platformId") as string | null;

  if (!file || !platformId) {
    return NextResponse.json({ error: "Thiếu file hoặc nền tảng" }, { status: 400 });
  }

  const content = await file.text();
  const rows = parseAnyCsv(content);

  if (mode === "preview") {
    // Đối chiếu cả 5 sub_id (không chỉ sub_id2) — khớp với logic commit thật
    // bên dưới, để số liệu xem trước không báo "chưa map" oan.
    const rowCandidates = (r: NormRow) => [r.subId2, r.subId1, r.subId3, r.subId4, r.subId5].filter(
      (v): v is string => Boolean(v)
    );
    const allCandidates = rows.flatMap(rowCandidates);
    const matchedLinks = await prisma.trackingLink.findMany({
      where: { trackingCode: { in: allCandidates } },
      select: { trackingCode: true },
    });
    const matchedSet = new Set(matchedLinks.map((l) => l.trackingCode));
    const rowIsMatched = (r: NormRow) => rowCandidates(r).some((c) => matchedSet.has(c));

    return NextResponse.json({
      totalRows: rows.length,
      matchedRows: rows.filter(rowIsMatched).length,
      unmappedRows: rows.filter((r) => !rowIsMatched(r)).length,
      preview: rows.slice(0, 20),
    });
  }

  // mode === "commit"
  const uploadDir = path.join(process.cwd(), "storage", "imports");
  await mkdir(uploadDir, { recursive: true });
  const storageKey = `${randomUUID()}-${file.name}`;
  await writeFile(path.join(uploadDir, storageKey), Buffer.from(await file.arrayBuffer()));

  const rule = await getActiveCommissionRule();

  const batch = await prisma.importBatch.create({
    data: {
      sourceName,
      fileName: file.name,
      fileStorageKey: storageKey,
      importedByUserId: session.userId,
      totalRows: rows.length,
      status: "processing",
    },
  });

  let successRows = 0;
  let unmappedRows = 0;
  let errorRows = 0;
  let duplicateRows = 0;
  let referralBonusCount = 0;
  let referralBonusTotal = new Prisma.Decimal(0);

  // ============================================================
  // GỘP DÒNG THEO ĐƠN HÀNG
  //
  // Shopee xuất CSV theo TỪNG SẢN PHẨM (1 đơn nhiều món = nhiều dòng cùng
  // "ID đơn hàng"). Trước đây mỗi dòng upsert độc lập theo orderExternalId
  // nên dòng sau đè dòng trước, làm mất tiền của các sản phẩm khác trong
  // cùng đơn (đã kiểm chứng: 33/249 đơn thật bị mất tổng ~1.29tr hoa hồng).
  // Giờ gộp tất cả dòng cùng 1 đơn lại, cộng dồn tiền, rồi mới upsert 1 lần.
  // ============================================================
  const rowsByOrderId = new Map<string, NormRow[]>();
  for (const row of rows) {
    if (!row.orderExternalId) continue;
    const list = rowsByOrderId.get(row.orderExternalId) ?? [];
    list.push(row);
    rowsByOrderId.set(row.orderExternalId, list);
  }

  // Ghi audit trail cho từng dòng CSV gốc (giữ nguyên, không gộp — để soát lại sau này)
  for (const row of rows) {
    try {
      await prisma.importBatchRow.create({
        data: {
          batchId: batch.id,
          rowNumber: row.rowNumber,
          orderExternalId: row.orderExternalId,
          checkoutId: row.checkoutId,
          trackingCode: row.trackingCode,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          commissionAmount: row.commissionAmount,
          grossCommissionAmount: row.grossCommissionAmount,
          netCommissionAmount: row.netCommissionAmount,
          orderAmount: row.orderAmount,
          orderStatus: row.orderStatus,
          productAffiliateStatus: row.productAffiliateStatus,
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          paymentStatus: row.paymentStatus,
          rawData: JSON.stringify(row.rawData),
          processingStatus: "pending",
        },
      });

      if (!row.orderExternalId) errorRows++;
    } catch {
      errorRows++;
    }
  }

  for (const [orderExternalId, groupRows] of rowsByOrderId) {
    try {
      // Cộng dồn tiền của tất cả sản phẩm trong đơn — Shopee đã tự đưa
      // orderAmount/commission về 0 cho dòng "Đã hủy" nên cộng thẳng là đúng.
      const orderAmount = groupRows.reduce((s, r) => s + (r.orderAmount ?? 0), 0);
      const grossCommissionAmount = groupRows.reduce((s, r) => s + (r.grossCommissionAmount ?? 0), 0);
      const netCommissionAmount = groupRows.reduce((s, r) => s + (r.netCommissionAmount ?? 0), 0);

      // Dòng đại diện cho các field mô tả chung (ngày tháng, shop, tracking...) — lấy dòng cuối.
      const row = groupRows[groupRows.length - 1];

      // ============================================================
      // TÌM TRACKING LINK — kiểm tra CẢ 5 sub_id, không chỉ sub_id2
      //
      // Quy ước tạo link của mình luôn đặt trackingCode vào sub_id2
      // (xem lib/tracking.ts), nhưng Shopee không đảm bảo giữ nguyên đúng
      // vị trí sub_id qua mọi luồng traffic (short-link redirect, app vs
      // web, một số kênh dồn hết dữ liệu vào sub_id1...) — nếu chỉ so khớp
      // sub_id2, các đơn dùng đúng link của mình vẫn có thể bị báo "Chưa
      // map" oan chỉ vì Shopee trả code lệch cột. Ưu tiên sub_id2 (đúng quy
      // ước), rồi thử lần lượt các cột còn lại.
      // ============================================================
      const subIdCandidates = [row.subId2, row.subId1, row.subId3, row.subId4, row.subId5].filter(
        (v): v is string => Boolean(v)
      );
      const trackingLink =
        subIdCandidates.length > 0
          ? await prisma.trackingLink.findFirst({ where: { trackingCode: { in: subIdCandidates } } })
          : null;

      // Ghi lại đúng mã đã khớp được (có thể không phải sub_id2) để hiển thị
      // chính xác trên trang đơn hàng — fallback về sub_id2 nếu không khớp gì.
      if (trackingLink) row.trackingCode = trackingLink.trackingCode;

      if (!trackingLink) unmappedRows++;

      const commissionAmount = netCommissionAmount || grossCommissionAmount || 0;
      const split = splitCommission(commissionAmount, rule);

      const existing = await prisma.order.findUnique({
        where: { platformId_orderExternalId: { platformId, orderExternalId } },
      });
      if (existing) duplicateRows++;

      // ============================================================
      // MAP TRẠNG THÁI SHOPEE → NỘI BỘ
      //
      // Nguồn xác thực chính là "Trạng thái sản phẩm liên kết"
      // (productAffiliateStatus) của TỪNG sản phẩm — đây mới là field
      // Shopee dùng để quyết định hoa hồng, không phải "Trạng thái đặt
      // hàng" (orderStatus) ở cấp đơn. Khi orderStatus="Hoàn thành" nhưng
      // 1 sản phẩm cụ thể bị "Đã hủy" (khách hoàn trả món đó), sản phẩm đó
      // không tính tiền — nhưng các sản phẩm khác "Hoàn thành" thật trong
      // cùng đơn vẫn tính bình thường.
      //
      //   Có ít nhất 1 sản phẩm "Hoàn thành" → chờ đủ SETTLEMENT_DAYS kể từ
      //                                        ngày hoàn thành mới "approved"
      //                                        (tiền đã về ví); chưa đủ thì
      //                                        "processing" (đang đối soát)
      //   TẤT CẢ sản phẩm đều "Đã hủy"       → "cancelled"
      //   Còn lại (đang chờ xử lý)           → "pending"
      //
      // Shopee báo "Hoàn thành" ngay khi giao hàng xong nhưng hoa hồng vẫn
      // còn trong thời gian đối soát của Shopee — trước đây hệ thống tính
      // "approved" (tiền đã về, cho rút luôn) ngay khi CSV báo hoàn thành,
      // dẫn tới hiện "Tiền đã về" dù đối soát thật còn đang xử lý.
      // ============================================================
      const affStatuses = groupRows.map((r) => (r.productAffiliateStatus ?? "").toLowerCase());
      const anyCompleted = affStatuses.some((s) => s.includes("hoàn thành"));
      const allCancelled = affStatuses.length > 0 && affStatuses.every((s) => s.includes("hủy") || s.includes("huỷ"));

      let autoMappedStatus: string;
      if (allCancelled) {
        autoMappedStatus = "cancelled";
      } else if (anyCompleted) {
        autoMappedStatus = isSettlementReady(row.completedAt) ? "approved" : "processing";
      } else {
        autoMappedStatus = "pending";
      }

      // ============================================================
      // LOCK LOGIC — Bảo vệ đơn đã thanh toán thật cho khách
      // Chỉ lock hoàn toàn khi payoutStatus === "paid" (tiền đã chuyển)
      // Nếu đơn đang "approved" nhưng chưa trả tiền (payoutStatus unpaid)
      // và Shopee báo hủy qua re-import → Cho phép chuyển sang "clawback"
      // ============================================================
      const isFullyPaid = existing?.payoutStatus === "paid";
      const isApprovedByAdmin = existing?.orderStatus === "approved";
      const shopeeIsNowCancelled = autoMappedStatus === "cancelled";

      let resolvedOrderStatus: string;
      if (isFullyPaid) {
        // Tiền đã chuyển cho khách — không tự động thay đổi, admin xử lý thủ công
        resolvedOrderStatus = existing!.orderStatus;
      } else if (isApprovedByAdmin && shopeeIsNowCancelled) {
        // Đã duyệt nhưng Shopee re-import báo hủy → Clawback
        resolvedOrderStatus = "clawback";
      } else if (isApprovedByAdmin && !shopeeIsNowCancelled) {
        // Đã duyệt, Shopee không hủy → Giữ nguyên approved
        resolvedOrderStatus = "approved";
      } else {
        // Đơn mới hoặc chưa duyệt → Cập nhật theo CSV
        resolvedOrderStatus = autoMappedStatus;
      }

      const resolvedCustomerId = existing?.customerId ?? trackingLink?.customerId;

      // ============================================================
      // KHOÁ SỐ TIỀN KHI ĐƠN ĐÃ THANH TOÁN THẬT
      // Nếu chỉ khoá orderStatus mà vẫn ghi đè số tiền theo CSV mới, một
      // lần re-import với số liệu Shopee đã sửa (hoặc lệch cột) có thể âm
      // thầm đổi lịch sử số tiền đã thực trả cho khách — dù trạng thái
      // đơn vẫn hiển thị "approved". Khoá luôn toàn bộ field tiền theo
      // đúng số đã ghi nhận lúc thanh toán.
      // ============================================================
      const resolvedOrderAmount = isFullyPaid ? Number(existing!.orderAmount ?? 0) : orderAmount;
      const resolvedGrossCommissionAmount = isFullyPaid
        ? Number(existing!.grossCommissionAmount ?? 0)
        : grossCommissionAmount;
      const resolvedNetCommissionAmount = isFullyPaid
        ? Number(existing!.netCommissionAmount ?? 0)
        : netCommissionAmount;
      const resolvedCommissionAmount = isFullyPaid ? Number(existing!.commissionAmount) : commissionAmount;
      const resolvedCustomerRewardAmount = isFullyPaid ? existing!.customerRewardAmount : split.customerRewardAmount;
      const resolvedSystemProfitAmount = isFullyPaid ? existing!.systemProfitAmount : split.systemProfitAmount;

      const updatedOrder = await prisma.order.upsert({
        where: { platformId_orderExternalId: { platformId, orderExternalId } },
        update: {
          trackingLinkId: trackingLink?.id || existing?.trackingLinkId,
          customerId: resolvedCustomerId,
          trackingCode: row.trackingCode,
          checkoutId: row.checkoutId,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          orderAmount: resolvedOrderAmount,
          grossCommissionAmount: resolvedGrossCommissionAmount,
          netCommissionAmount: resolvedNetCommissionAmount,
          commissionAmount: resolvedCommissionAmount,
          customerRewardAmount: resolvedCustomerRewardAmount,
          systemProfitAmount: resolvedSystemProfitAmount,
          orderStatus: resolvedOrderStatus,
          productAffiliateStatus: row.productAffiliateStatus ?? row.orderStatus,
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          importBatchId: batch.id,
          rawData: JSON.stringify(row.rawData),
        },
        create: {
          platformId,
          orderExternalId,
          trackingLinkId: trackingLink?.id,
          customerId: trackingLink?.customerId,
          trackingCode: row.trackingCode,
          checkoutId: row.checkoutId,
          channel: row.channel,
          orderedAt: row.orderedAt,
          completedAt: row.completedAt,
          clickedAt: row.clickedAt,
          shopName: row.shopName,
          shopId: row.shopId,
          itemId: row.itemId,
          itemName: row.itemName,
          orderAmount,
          grossCommissionAmount,
          netCommissionAmount,
          commissionAmount,
          customerRewardAmount: split.customerRewardAmount,
          systemProfitAmount: split.systemProfitAmount,
          orderStatus: autoMappedStatus,
          productAffiliateStatus: row.productAffiliateStatus ?? row.orderStatus,
          subId1: row.subId1,
          subId2: row.subId2,
          subId3: row.subId3,
          subId4: row.subId4,
          subId5: row.subId5,
          importBatchId: batch.id,
          sourceType: "import",
          rawData: JSON.stringify(row.rawData),
        },
      });

      // ============================================================
      // Nếu Shopee đã xác nhận hoa hồng ("Dã duyệt") và khách có đơn mới
      // → Tạo referral bonus + thông báo Telegram ngay (giống manual approve)
      // Chỉ chạy khi đơn vừa được tạo mới hoặc vừa chuyển sang approved
      // (tránh chạy lại mỗi lần re-import)
      // ============================================================
      const wasAlreadyApproved = existing?.orderStatus === "approved";
      const justApproved = resolvedOrderStatus === "approved" && !wasAlreadyApproved;

      // ============================================================
      // ĐẢO REFERRAL BONUS KHI ĐƠN GỐC BỊ CLAWBACK QUA RE-IMPORT
      // Nếu đơn này từng "approved" và đã tạo hoa hồng giới thiệu cho
      // người giới thiệu, mà giờ Shopee đòi lại (chuyển "clawback") —
      // phải đảo luôn hoa hồng giới thiệu đó, nếu không người giới thiệu
      // vẫn được trả tiền cho một đơn hàng đã bị huỷ hoa hồng thật.
      // ============================================================
      if (resolvedOrderStatus === "clawback") {
        const refOrder = await prisma.order.findUnique({
          where: { platformId_orderExternalId: { platformId, orderExternalId: `REF-${orderExternalId}` } },
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
                itemName: `[Clawback hoa hồng giới thiệu] ${orderExternalId}`,
                orderAmount: refOrder.orderAmount,
                grossCommissionAmount: 0,
                netCommissionAmount: 0,
                commissionAmount: 0,
                customerRewardAmount: -Number(refOrder.customerRewardAmount),
                systemProfitAmount: 0,
                orderStatus: "clawback",
                payoutStatus: "unpaid",
                sourceType: "clawback",
                importBatchId: batch.id,
              },
            });
          }
        }
      }

      if (justApproved && resolvedCustomerId) {
        // Thông báo Telegram cho khách
        void notifyCustomerTelegram(
          resolvedCustomerId,
          buildOrderApprovedMessage({
            orderExternalId,
            customerRewardAmount: Number(split.customerRewardAmount),
            shopName: row.shopName ?? null,
          })
        );

        void notifyCustomerInApp(resolvedCustomerId, {
          type: "order_approved",
          title: "💰 Tiền đã về!",
          message: `Đơn hàng ${orderExternalId}${row.shopName ? ` (${row.shopName})` : ""} đã được duyệt — bạn sẽ nhận ${Number(split.customerRewardAmount).toLocaleString("vi-VN")}đ hoàn tiền.`,
          link: "/app/orders",
        });

        // Tạo Referral Bonus
        const customerData = await prisma.customer.findUnique({
          where: { id: resolvedCustomerId },
          select: {
            referredById: true,
            createdAt: true,
            referredBy: { select: { isPartner: true } },
          },
        });

        if (customerData?.referredById) {
          const maxOrders = rule?.maxReferralOrders ?? 5;
          const validMonths = rule?.referralValidityMonths ?? 6;
          // Giữ nguyên Prisma.Decimal xuyên suốt (không ép về Number rồi nhân
          // dấu phẩy động) — tránh sai số làm tròn nhị phân len vào tiền hoa
          // hồng giới thiệu, đúng chuẩn mà splitCommission() đã áp dụng cho
          // hoa hồng chính.
          const referralRate = rule?.referralRate ?? new Prisma.Decimal(0.05);
          const isPartner = customerData.referredBy?.isPartner ?? false;

          // Đối chiếu theo ngày ĐƠN HÀNG thực sự phát sinh (row.orderedAt/completedAt),
          // không phải thời điểm import CSV — vì đối soát có thể trễ nhiều tuần
          // so với lúc đơn phát sinh. ĐỐI TÁC (isPartner) không bị giới hạn
          // 6 tháng — hoa hồng vĩnh viễn cho mọi đơn của khách được gán.
          const referenceDate = row.orderedAt ?? row.completedAt ?? new Date();

          if (isPartner || isWithinReferralWindow(customerData.createdAt, validMonths, referenceDate)) {
            // Giới hạn 5 đơn là MỖI người bạn (F1) riêng — người giới thiệu
            // (A) mời càng nhiều bạn thì càng được nhiều đơn hoa hồng, không
            // bị dồn chung vào 1 hạn mức 5 đơn cho tất cả bạn bè cộng lại.
            // ĐỐI TÁC (isPartner) không bị giới hạn số đơn — ăn 5% vĩnh viễn
            // trên mọi đơn của khách được admin gán, không giới hạn số lượng.
            const referrerBonusCount = isPartner
              ? 0
              : await prisma.order.count({
                  where: {
                    customerId: customerData.referredById,
                    sourceType: "referral",
                    orderStatus: "approved",
                    referralSourceCustomerId: resolvedCustomerId,
                  },
                });

            if (isPartner || referrerBonusCount < maxOrders) {
              // ============================================================
              // Hoa hồng giới thiệu được TRÍCH TỪ PHẦN HỆ THỐNG GIỮ, không
              // đụng vào 80% của khách (B) — đúng chủ trương: đơn của B thay
              // vì hệ thống giữ đủ systemRate% (vd 20%) thì giữ lại
              // (systemRate - referralRate)% (vd 15%), phần chênh lệch
              // (vd 5%) chuyển cho người giới thiệu (A). B không mất gì.
              //
              // afterTaxAmount dựng lại từ 2 số ĐÃ lưu trên đơn gốc (thay vì
              // suy ngược từ customerRate hiện tại) để không lệch nếu rule
              // hoa hồng đã đổi giữa lúc đơn được tính và lúc đơn được duyệt.
              // ============================================================
              const afterTaxAmount = split.customerRewardAmount.add(split.systemProfitAmount);
              const bonusAmount = afterTaxAmount.mul(referralRate).toDecimalPlaces(0);
              const systemProfitAfterReferral = split.systemProfitAmount.sub(bonusAmount);
              referralBonusCount++;
              referralBonusTotal = referralBonusTotal.add(bonusAmount);

              await prisma.order.update({
                where: { id: updatedOrder.id },
                data: { systemProfitAmount: systemProfitAfterReferral, referralBonusDeducted: bonusAmount },
              });

              await prisma.order.upsert({
                where: { platformId_orderExternalId: { platformId, orderExternalId: `REF-${orderExternalId}` } },
                update: {
                  customerId: customerData.referredById,
                  orderAmount,
                  commissionAmount: 0,
                  customerRewardAmount: bonusAmount,
                  systemProfitAmount: 0,
                  orderStatus: "approved",
                  importBatchId: batch.id,
                  referralSourceCustomerId: resolvedCustomerId,
                },
                create: {
                  platformId,
                  orderExternalId: `REF-${orderExternalId}`,
                  customerId: customerData.referredById,
                  trackingCode: "REFERRAL",
                  channel: "REFERRAL",
                  orderedAt: row.orderedAt,
                  completedAt: row.completedAt,
                  shopName: row.shopName,
                  itemName: `Hoa hồng giới thiệu: ${orderExternalId}`,
                  orderAmount,
                  grossCommissionAmount: 0,
                  netCommissionAmount: 0,
                  commissionAmount: 0,
                  customerRewardAmount: bonusAmount,
                  systemProfitAmount: 0,
                  orderStatus: "approved",
                  sourceType: "referral",
                  importBatchId: batch.id,
                  referralSourceCustomerId: resolvedCustomerId,
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
                  friendOrderExternalId: orderExternalId,
                })
              );
            }
          }
        }
      }

      successRows++;
    } catch (err) {
      errorRows++;
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: { successRows, unmappedRows, errorRows, duplicateRows, status: "done" },
  });

  return NextResponse.json({
    batchId: batch.id,
    successRows,
    unmappedRows,
    errorRows,
    duplicateRows,
    referralBonusCount,
    referralBonusTotal: Number(referralBonusTotal),
  });
}
