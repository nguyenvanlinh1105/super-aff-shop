import { parse } from "csv-parse/sync";

// Alias tên cột thường gặp trong file export Shopee Affiliate / TikTok Shop
// (tiếng Việt lẫn tiếng Anh) -> field chuẩn hoá của hệ thống.
const HEADER_ALIASES: Record<string, string[]> = {
  orderExternalId: ["order id", "mã đơn hàng", "order_id", "mã đơn"],
  checkoutId: ["checkout id", "mã thanh toán", "checkout_id"],
  subId1: ["sub_id1", "sub id 1", "subid1"],
  subId2: ["sub_id2", "sub id 2", "subid2", "tracking code", "mã tracking", "tracking_code"],
  subId3: ["sub_id3", "sub id 3", "subid3"],
  subId4: ["sub_id4", "sub id 4", "subid4"],
  subId5: ["sub_id5", "sub id 5", "subid5"],
  commissionAmount: ["commission", "hoa hồng", "hoa hồng dự kiến", "estimated commission", "est. commission"],
  grossCommissionAmount: ["gross commission", "hoa hồng gộp"],
  netCommissionAmount: ["net commission", "hoa hồng thực nhận"],
  orderAmount: ["order amount", "giá trị đơn hàng", "total amount", "order value"],
  orderStatus: ["order status", "trạng thái đơn hàng", "trạng thái"],
  productAffiliateStatus: ["product affiliate status", "trạng thái affiliate"],
  shopName: ["shop name", "tên shop", "tên cửa hàng"],
  shopId: ["shop id", "mã shop"],
  itemId: ["item id", "mã sản phẩm"],
  itemName: ["item name", "tên sản phẩm"],
  orderedAt: ["order time", "ngày đặt hàng", "order date"],
  completedAt: ["complete time", "ngày hoàn thành", "completion time"],
  clickedAt: ["click time", "ngày click"],
  paymentStatus: ["payment status", "trạng thái thanh toán"],
  channel: ["channel", "kênh"],
};

export type ParsedImportRow = {
  rowNumber: number;
  orderExternalId?: string;
  checkoutId?: string;
  trackingCode?: string;
  channel?: string;
  orderedAt?: Date;
  completedAt?: Date;
  clickedAt?: Date;
  shopName?: string;
  shopId?: string;
  itemId?: string;
  itemName?: string;
  commissionAmount?: number;
  grossCommissionAmount?: number;
  netCommissionAmount?: number;
  orderAmount?: number;
  orderStatus?: string;
  productAffiliateStatus?: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
  paymentStatus?: string;
  rawData: Record<string, string>;
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const normalizedHeaders = headers.map(normalizeHeader);

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normalizedHeaders.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[field] = headers[idx];
  }
  return map;
}

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^\d.-]/g, "");
  if (!cleaned) return undefined;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseImportCsv(content: string): ParsedImportRow[] {
  const records: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  if (records.length === 0) return [];

  const headers = Object.keys(records[0]);
  const headerMap = buildHeaderMap(headers);

  const get = (row: Record<string, string>, field: string) =>
    headerMap[field] ? row[headerMap[field]] : undefined;

  return records.map((row, i) => {
    const subId2 = get(row, "subId2");
    return {
      rowNumber: i + 1,
      orderExternalId: get(row, "orderExternalId"),
      checkoutId: get(row, "checkoutId"),
      trackingCode: subId2,
      channel: get(row, "channel"),
      orderedAt: toDate(get(row, "orderedAt")),
      completedAt: toDate(get(row, "completedAt")),
      clickedAt: toDate(get(row, "clickedAt")),
      shopName: get(row, "shopName"),
      shopId: get(row, "shopId"),
      itemId: get(row, "itemId"),
      itemName: get(row, "itemName"),
      commissionAmount: toNumber(get(row, "commissionAmount")),
      grossCommissionAmount: toNumber(get(row, "grossCommissionAmount")),
      netCommissionAmount: toNumber(get(row, "netCommissionAmount")),
      orderAmount: toNumber(get(row, "orderAmount")),
      orderStatus: get(row, "orderStatus"),
      productAffiliateStatus: get(row, "productAffiliateStatus"),
      subId1: get(row, "subId1"),
      subId2,
      subId3: get(row, "subId3"),
      subId4: get(row, "subId4"),
      subId5: get(row, "subId5"),
      paymentStatus: get(row, "paymentStatus"),
      rawData: row,
    };
  });
}
