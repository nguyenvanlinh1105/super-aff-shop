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
  { id: "bronze", name: "Đồng", minOrders: 0, rate: 80 },
  { id: "silver", name: "Bạc", minOrders: 10, rate: 80 },
  { id: "gold", name: "Vàng", minOrders: 20, rate: 80 },
];

export function getCustomerTierRate(approvedOrdersCount?: number, ruleCustomerRate?: Prisma.Decimal | number | null): Prisma.Decimal {
  // Giá trị thật cài đặt ở admin, code mặc định là 80%
  if (ruleCustomerRate != null) {
    return new Prisma.Decimal(ruleCustomerRate);
  }
  return new Prisma.Decimal(80);
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
  
  // Ưu tiên rate động theo hạng của khách, nếu không truyền mới fallback về rule (mặc định luôn 80%)
  const customerRate = customerRateOverride ?? (rule ? new Prisma.Decimal(rule.customerRate) : new Prisma.Decimal(80));

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

export const PARTNER_RATE_PRESETS = [
  { value: 0.03, percent: 3, label: "3%" },
  { value: 0.05, percent: 5, label: "5%" },
  { value: 0.07, percent: 7, label: "7%" },
  { value: 0.10, percent: 10, label: "10%" },
] as const;

/**
 * Tra cứu tỷ lệ hoa hồng đối tác hiệu lực tại thời điểm đơn hàng phát sinh (referenceDate).
 * Bảo đảm tính toàn vẹn lịch sử (Temporal Point-in-Time rate resolution):
 * - Đơn phát sinh ở giai đoạn nào sẽ hưởng đúng % của giai đoạn đó.
 * - Ví dụ: 01/10-01/11 là 7%, 01/11-01/12 là 10% -> đơn tháng 10 vẫn nhận đúng 7%, không bị ghi đè.
 * - Nếu đối tác chưa cấu hình khoảng riêng hoặc nằm ngoài các khoảng, fallback về tỷ lệ mặc định.
 */
export async function getEffectivePartnerRate(
  partnerCustomerId: string,
  referenceDate: Date = new Date(),
  fallbackRate: Prisma.Decimal | number = new Prisma.Decimal(0.05)
): Promise<Prisma.Decimal> {
  const fallback = typeof fallbackRate === "number" ? new Prisma.Decimal(fallbackRate) : fallbackRate;

  try {
    const period = await prisma.partnerRatePeriod.findFirst({
      where: {
        customerId: partnerCustomerId,
        startsAt: { lte: referenceDate },
        OR: [
          { endsAt: null },
          { endsAt: { gte: referenceDate } },
        ],
      },
      orderBy: { startsAt: "desc" },
    });

    if (period) {
      return new Prisma.Decimal(period.rate);
    }
  } catch (error) {
    console.error("Lỗi khi tra cứu partnerRatePeriod:", error);
  }

  return fallback;
}

