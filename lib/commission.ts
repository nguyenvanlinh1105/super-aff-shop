import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type CommissionSplit = {
  customerRewardAmount: Prisma.Decimal;
  systemProfitAmount: Prisma.Decimal;
  customerRate: Prisma.Decimal;
  systemRate: Prisma.Decimal;
};

// Shopee bao "Hoàn thành" ngay khi đơn giao xong, nhưng hoa hồng thực tế còn
// nằm trong thời gian đối soát của Shopee — chỉ chắc chắn nhận được sau
// khoảng thời gian này kể từ ngày hoàn thành. Trước mốc này đơn ở trạng thái
// "processing" (đang đối soát), chưa tính là "tiền đã về" và chưa cho rút.
export const SETTLEMENT_DAYS = 15;

export function isSettlementReady(completedAt: Date | null | undefined, referenceDate: Date = new Date()): boolean {
  if (!completedAt) return false;
  const readyAt = new Date(completedAt);
  readyAt.setDate(readyAt.getDate() + SETTLEMENT_DAYS);
  return referenceDate.getTime() >= readyAt.getTime();
}

const DEFAULT_TAX_RATE = new Prisma.Decimal(10.98);

export const MEMBERSHIP_TIERS = [
  { id: "bronze", name: "Đồng", minOrders: 0, rate: 50 },
  { id: "silver", name: "Bạc", minOrders: 10, rate: 60 },
  { id: "gold", name: "Vàng", minOrders: 20, rate: 70 },
];

export function getCustomerTierRate(approvedOrdersCount: number): Prisma.Decimal {
  let rate = MEMBERSHIP_TIERS[0].rate;
  if (approvedOrdersCount >= 20) {
    rate = MEMBERSHIP_TIERS[2].rate;
  } else if (approvedOrdersCount >= 10) {
    rate = MEMBERSHIP_TIERS[1].rate;
  }
  return new Prisma.Decimal(rate);
}

export async function getActiveCommissionRule() {
  return prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Trước khi chia tỷ lệ cho khách/hệ thống, phải trừ thuế thu nhập (mặc định 10.98%) trên hoa
 * hồng gộp. Khách hàng sẽ nhận số tiền chia theo customerRateOverride (động theo hạng),
 * nếu không truyền sẽ lấy default từ rule (dự phòng). Hệ thống giữ phần còn lại.
 */
export function splitCommission(
  commissionAmount: Prisma.Decimal | number,
  rule?: { taxRate?: Prisma.Decimal | null; customerRate: Prisma.Decimal; systemRate: Prisma.Decimal } | null,
  customerRateOverride?: Prisma.Decimal
): CommissionSplit {
  const amount = new Prisma.Decimal(commissionAmount);
  const taxRate = rule?.taxRate != null ? new Prisma.Decimal(rule.taxRate) : DEFAULT_TAX_RATE;
  
  // Ưu tiên rate động theo hạng của khách, nếu không truyền mới fallback về rule
  const customerRate = customerRateOverride ?? (rule ? new Prisma.Decimal(rule.customerRate) : new Prisma.Decimal(50));

  const afterTaxAmount = amount.mul(new Prisma.Decimal(100).sub(taxRate)).div(100);
  const customerRewardAmount = afterTaxAmount.mul(customerRate).div(100);
  const systemProfitAmount = afterTaxAmount.sub(customerRewardAmount);

  // systemRate thực tế là phần còn lại sau khi chia cho khách
  const actualSystemRate = new Prisma.Decimal(100).sub(customerRate);

  return { customerRewardAmount, systemProfitAmount, customerRate, systemRate: actualSystemRate };
}

/**
 * Kiểm tra một mốc thời gian (ngày đơn hàng thực sự phát sinh) có còn nằm
 * trong hạn hoa hồng giới thiệu (N tháng kể từ khi F1 đăng ký) hay không.
 * Dùng cộng tháng "an toàn" (clamp về ngày cuối tháng đích) để tránh lỗi
 * tràn ngày của Date.setMonth thô — vd 31/8 + 6 tháng phải là 28/2 (hoặc
 * 29/2 năm nhuận), không phải bị tràn thành 2-3/3.
 */
export function isWithinReferralWindow(
  customerCreatedAt: Date,
  validMonths: number,
  referenceDate: Date
): boolean {
  const start = new Date(customerCreatedAt);
  const targetMonthIndex = start.getMonth() + validMonths;
  const daysInTargetMonth = new Date(start.getFullYear(), targetMonthIndex + 1, 0).getDate();

  const expirationDate = new Date(start);
  expirationDate.setDate(1);
  expirationDate.setMonth(targetMonthIndex);
  expirationDate.setDate(Math.min(start.getDate(), daysInTargetMonth));

  return referenceDate.getTime() <= expirationDate.getTime();
}
