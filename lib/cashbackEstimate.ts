import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getActiveCommissionRule, splitCommission } from "./commission";

export type CashbackEstimate = {
  estimatedCashback: Prisma.Decimal;
  categoryName: string;
  categoryRate: Prisma.Decimal;
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
 */
export async function estimateCashback(
  productTitle: string | null,
  price: number | null
): Promise<CashbackEstimate | null> {
  if (!price || price <= 0) return null;

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

  const grossCommission = new Prisma.Decimal(price).mul(matched.rate).div(100);
  const rule = await getActiveCommissionRule();
  const split = splitCommission(grossCommission, rule);

  return {
    estimatedCashback: split.customerRewardAmount,
    categoryName: matched.name,
    categoryRate: matched.rate,
  };
}
