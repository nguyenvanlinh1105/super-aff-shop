import { Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";

export const SHOPEE_AFFILIATE_CSV_HEADERS = [
  "ID đơn hàng",
  "Trạng thái đặt hàng",
  "Checkout id",
  "Thời Gian Đặt Hàng",
  "Thời gian hoàn thành",
  "Thời gian Click",
  "Tên Shop",
  "Shop id",
  "Loại Shop",
  "Item id",
  "Tên Item",
  "ID Model",
  "Loại sản phẩm",
  "Promotion id",
  "L1 Danh mục toàn cầu",
  "L2 Danh mục toàn cầu",
  "L3 Danh mục toàn cầu",
  "Giá(₫)",
  "Số lượng",
  "Loại Hoa hồng",
  "Đối tác chiến dịchr",
  "Giá trị đơn hàng (₫)",
  "Số tiền hoàn trả (₫)",
  "Tỷ lệ sản phẩm hoa hồng Shope",
  "Hoa hồng Shopee trên sản phẩm(₫)",
  "Tỷ lệ sản phẩm hoa hồng người bán",
  "Hoa hồng Xtra trên sản phẩm(₫)",
  "Tổng hoa hồng sản phẩm(₫)",
  "Hoa hồng đơn hàng từ Shopee(₫)",
  "Hoa hồng đơn hàng từ Người bán(₫)",
  "Tổng hoa hồng đơn hàng(₫)",
  "Tên MNC đã liên kết",
  "Mã hợp đồng MCN",
  "Mức phí quản lý MCN",
  "Phí quản lý MCN(₫)",
  "Mức hoa hồng tiếp thị liên kết theo thỏa thuận",
  "Hoa hồng ròng tiếp thị liên kết(₫)",
  "Trạng thái sản phẩm liên kết",
  "Ghi chú sản phẩm",
  "Loại thuộc tính",
  "Trạng thái người mua",
  "Sub_id1",
  "Sub_id2",
  "Sub_id3",
  "Sub_id4",
  "Sub_id5",
  "Kênh",
] as const;

export type ShopeeAffiliateCsvHeader = (typeof SHOPEE_AFFILIATE_CSV_HEADERS)[number];
export type ShopeeAffiliateCsvRow = Record<ShopeeAffiliateCsvHeader, string>;

export type ShopeeAffiliateImportRecord = {
  rawRow: ShopeeAffiliateCsvRow;
  externalOrderId: string;
  checkoutId: string | null;
  orderStatus: string | null;
  orderedAt: Date | null;
  completedAt: Date | null;
  clickedAt: Date | null;
  shopName: string | null;
  shopId: string | null;
  itemId: string | null;
  itemName: string | null;
  orderAmount: Prisma.Decimal;
  grossCommission: Prisma.Decimal;
  netCommission: Prisma.Decimal;
  productAffiliateStatus: string | null;
  subId1: string | null;
  subId2: string | null;
  subId3: string | null;
  subId4: string | null;
  subId5: string | null;
  channel: string | null;
  trackingCode: string | null;
  customerCode: string | null;
};

function cleanValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseNullableDateTime(value: string): Date | null {
  const normalized = cleanValue(value);
  if (!normalized) return null;
  const asIso = normalized.replace(" ", "T");
  const date = new Date(asIso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDecimal(value: string): Prisma.Decimal {
  let normalized = cleanValue(value)
    .replace(/[₫\s]/g, "")
    .replace("%", "");

  if (!normalized) {
    return new Prisma.Decimal(0);
  }

  const lastCommaIndex = normalized.lastIndexOf(",");
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    if (lastCommaIndex > lastDotIndex) {
      // e.g. 12.345,67
      normalized = normalized.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // e.g. 12,345.67
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastCommaIndex > -1) {
    // Only comma
    const parts = normalized.split(",");
    const isThousands = parts.slice(1).every((p) => p.length === 3);
    if (isThousands && parts[0].length <= 3) {
      // e.g. 12,345
      normalized = normalized.replace(/,/g, "");
    } else {
      // e.g. 12,50
      normalized = normalized.replace(/,/g, ".");
    }
  } else if (lastDotIndex > -1) {
    // Only dot
    const parts = normalized.split(".");
    const isThousands = parts.slice(1).every((p) => p.length === 3);
    if (isThousands && parts[0].length <= 3) {
      // e.g. 12.345
      normalized = normalized.replace(/\./g, "");
    } else {
      // e.g. 44498.215 (Raw Shopee CSV)
      // Keep the dot as a decimal point
    }
  }

  try {
    return new Prisma.Decimal(normalized);
  } catch (e) {
    return new Prisma.Decimal(0);
  }
}

export function assertShopeeAffiliateHeaders(headers: string[]): void {
  const missingHeaders = SHOPEE_AFFILIATE_CSV_HEADERS.filter((header) => !headers.includes(header));
  const unknownHeaders = headers.filter(
    (header) => !SHOPEE_AFFILIATE_CSV_HEADERS.includes(header as ShopeeAffiliateCsvHeader)
  );

  if (missingHeaders.length || unknownHeaders.length) {
    const parts = [];
    if (missingHeaders.length) parts.push(`thiếu cột: ${missingHeaders.join(", ")}`);
    if (unknownHeaders.length) parts.push(`cột ngoài danh sách: ${unknownHeaders.join(", ")}`);
    throw new Error(`Header CSV Shopee không đúng cấu trúc mong đợi (${parts.join("; ")})`);
  }
}

export function parseShopeeAffiliateCsv(csvText: string): ShopeeAffiliateImportRecord[] {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: false,
    trim: false,
  }) as Array<Record<string, string>>;

  if (!rows.length) {
    return [];
  }

  assertShopeeAffiliateHeaders(Object.keys(rows[0]));

  return rows.map((raw) => {
    const row = raw as ShopeeAffiliateCsvRow;
    const netCommission = parseDecimal(row["Hoa hồng ròng tiếp thị liên kết(₫)"]);
    const grossCommission = parseDecimal(row["Tổng hoa hồng đơn hàng(₫)"]);

    return {
      rawRow: row,
      externalOrderId: cleanValue(row["ID đơn hàng"]),
      checkoutId: cleanValue(row["Checkout id"]) || null,
      orderStatus: cleanValue(row["Trạng thái đặt hàng"]) || null,
      orderedAt: parseNullableDateTime(row["Thời Gian Đặt Hàng"]),
      completedAt: parseNullableDateTime(row["Thời gian hoàn thành"]),
      clickedAt: parseNullableDateTime(row["Thời gian Click"]),
      shopName: cleanValue(row["Tên Shop"]) || null,
      shopId: cleanValue(row["Shop id"]) || null,
      itemId: cleanValue(row["Item id"]) || null,
      itemName: cleanValue(row["Tên Item"]) || null,
      orderAmount: parseDecimal(row["Giá trị đơn hàng (₫)"]),
      grossCommission,
      netCommission,
      productAffiliateStatus: cleanValue(row["Trạng thái sản phẩm liên kết"]) || null,
      subId1: cleanValue(row["Sub_id1"]) || null,
      subId2: cleanValue(row["Sub_id2"]) || null,
      subId3: cleanValue(row["Sub_id3"]) || null,
      subId4: cleanValue(row["Sub_id4"]) || null,
      subId5: cleanValue(row["Sub_id5"]) || null,
      channel: cleanValue(row["Kênh"]) || null,
      trackingCode: cleanValue(row["Sub_id2"]) || null,
      customerCode: cleanValue(row["Sub_id1"]) || null,
    };
  });
}
