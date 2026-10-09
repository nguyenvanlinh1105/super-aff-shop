import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getActiveCommissionRule, splitCommission } from "./commission";

export type CashbackEstimate = {
  estimatedCashback: Prisma.Decimal | null;
  categoryName: string;
  categoryRate: Prisma.Decimal;
  customerEffectiveRate?: Prisma.Decimal;
  sampleCashbacks?: {
    orderAmount: number;
    cashback: number;
  }[];
};

function stripDiacritics(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Shopee khong tra truoc % hoa hong that cua tung san pham (chi biet chinh
 * xac sau khi doi soat CSV), nen day chi la uoc tinh dua tren bang ty le
 * hoa hong gop theo nganh hang (admin cau hinh o /admin/settings), doan
 * nganh hang bang cach khop tu khoa trong tieu de san pham.
 *
 * Neu co realGrossCommission (hoa hong GOP that cua dung san pham, lay tu
 * San Cam Product Data API — xem lib/sanCamApi.ts) thi UU TIEN dung so that
 * nay thay vi doan theo danh muc — chinh xac hon han vi la dung so cua dung
 * san pham, khong phai muc trung binh ca nganh hang.
 */
export async function estimateCashback(
  productTitle: string | null,
  price: number | null,
  realGrossCommission?: number | null
): Promise<CashbackEstimate | null> {
  const rule = await getActiveCommissionRule();

  if (realGrossCommission != null && realGrossCommission > 0) {
    const split = splitCommission(realGrossCommission, rule);
    return {
      estimatedCashback: split.customerRewardAmount,
      categoryName: "Hoa hồng thực tế sản phẩm",
      categoryRate: split.customerRate,
      customerEffectiveRate: split.customerRate,
    };
  }

  const categories = await prisma.categoryCommissionRate.findMany({ orderBy: { sortOrder: "asc" } });
  if (categories.length === 0) return null;

  const normalizedTitle = productTitle ? stripDiacritics(productTitle) : "";
  const matched =
    categories.find(
      (c) =>
        !c.isDefault &&
        c.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
          .some((k) => normalizedTitle.includes(stripDiacritics(k)))
    ) ??
    categories.find((c) => c.isDefault) ??
    categories[categories.length - 1];

  const taxRate = rule?.taxRate != null ? new Prisma.Decimal(rule.taxRate) : new Prisma.Decimal(10.98);
  const customerRate = rule ? new Prisma.Decimal(rule.customerRate) : new Prisma.Decimal(80);
  const afterTaxMultiplier = new Prisma.Decimal(100).sub(taxRate).div(100);
  const customerEffectiveRate = new Prisma.Decimal(matched.rate).mul(afterTaxMultiplier).mul(customerRate).div(100);

  const samples = [100000, 200000, 500000].map((amt) => {
    const gross = new Prisma.Decimal(amt).mul(matched.rate).div(100);
    const split = splitCommission(gross, rule);
    return {
      orderAmount: amt,
      cashback: Math.round(Number(split.customerRewardAmount)),
    };
  });

  if (!price || price <= 0) {
    return {
      estimatedCashback: null,
      categoryName: matched.name,
      categoryRate: matched.rate,
      customerEffectiveRate,
      sampleCashbacks: samples,
    };
  }

  const grossCommission = new Prisma.Decimal(price).mul(matched.rate).div(100);
  const split = splitCommission(grossCommission, rule);

  return {
    estimatedCashback: split.customerRewardAmount,
    categoryName: matched.name,
    categoryRate: matched.rate,
    customerEffectiveRate,
    sampleCashbacks: samples,
  };
}
