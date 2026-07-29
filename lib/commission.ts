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
const DEFAULT_CUSTOMER_RATE = new Prisma.Decimal(80);
const DEFAULT_SYSTEM_RATE = new Prisma.Decimal(20);

export async function getActiveCommissionRule() {
  return prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Trước khi chia 80/20, phải trừ thuế thu nhập (mặc định 10.98%) trên hoa
 * hồng gộp — khớp với cách sếp tính tay trong file Excel đối soát:
 *   HH sau thuế = HH ghi nhận × (1 - taxRate/100)
 *   Trả khách   = HH sau thuế × customerRate/100
 */
export function splitCommission(
  commissionAmount: Prisma.Decimal | number,
  rule?: { taxRate?: Prisma.Decimal | null; customerRate: Prisma.Decimal; systemRate: Prisma.Decimal } | null
): CommissionSplit {
  const amount = new Prisma.Decimal(commissionAmount);
  const taxRate = rule?.taxRate != null ? new Prisma.Decimal(rule.taxRate) : DEFAULT_TAX_RATE;
  const customerRate = rule ? new Prisma.Decimal(rule.customerRate) : DEFAULT_CUSTOMER_RATE;
  const systemRate = rule ? new Prisma.Decimal(rule.systemRate) : DEFAULT_SYSTEM_RATE;

  const afterTaxAmount = amount.mul(new Prisma.Decimal(100).sub(taxRate)).div(100);
  const customerRewardAmount = afterTaxAmount.mul(customerRate).div(100);
  const systemProfitAmount = afterTaxAmount.sub(customerRewardAmount);

  return { customerRewardAmount, systemProfitAmount, customerRate, systemRate };
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
