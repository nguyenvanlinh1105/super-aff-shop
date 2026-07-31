import * as xlsx from "xlsx";

export type ParsedTikTokOrderRow = {
  externalOrderId: string;
  orderStatus: string;
  orderedAt: Date | null;
  completedAt: Date | null;
  shopName: string | null;
  itemName: string | null;
  orderAmount: number;
  commissionAmount: number;
  subId2: string | null;
  rawRow: Record<string, string>;
};

function parseNumber(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: any): Date | null {
  if (!val || val === "/") return null;
  if (val instanceof Date) return val;
  const str = String(val).trim();
  // VD: 27/07/2026 23:12:31 hoặc 2026-07-27 23:12:31
  if (str.includes("/")) {
    const parts = str.split(" ");
    const dateParts = parts[0].split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const timeParts = parts[1] ? parts[1].split(":") : [0, 0, 0];
      return new Date(
        year,
        month,
        day,
        parseInt(String(timeParts[0] || 0), 10),
        parseInt(String(timeParts[1] || 0), 10),
        parseInt(String(timeParts[2] || 0), 10)
      );
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function parseTikTokAffiliateReport(buffer: Buffer): ParsedTikTokOrderRow[] {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h).trim());
  const findColIndex = (...candidates: string[]): number => {
    return headers.findIndex((h) => candidates.some((c) => h.toLowerCase().includes(c.toLowerCase())));
  };

  const idxOrderId = findColIndex("id đơn hàng", "order id", "order no");
  const idxItemName = findColIndex("tên sản phẩm", "product name", "sku name");
  const idxShopName = findColIndex("tên cửa hàng", "shop name", "seller name");
  const idxStatus = findColIndex("trạng thái quyết toán", "trạng thái đặt hàng", "order status", "status");
  const idxGmv = findColIndex("gmv", "cơ sở hoa hồng", "giá trị đơn hàng", "order amount");
  const idxCommission = findColIndex("hoa hồng tiêu chuẩn ước tính", "hoa hồng tiêu chuẩn", "tổng số tiền nhận được", "hoa hồng");
  const idxSubId2 = findColIndex("sub id", "sub_id2", "passthrough", "subid");
  const idxOrderedAt = findColIndex("ngày đặt hàng", "thời gian đặt hàng", "order time", "created time");
  const idxCompletedAt = findColIndex("ngày quyết toán", "thời gian hoàn thành", "completed time", "settled time");

  const results: ParsedTikTokOrderRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const externalOrderId = idxOrderId !== -1 ? String(row[idxOrderId]).trim() : "";
    if (!externalOrderId) continue;

    const itemName = idxItemName !== -1 ? String(row[idxItemName]).trim() : null;
    const shopName = idxShopName !== -1 ? String(row[idxShopName]).trim() : null;
    const orderStatusRaw = idxStatus !== -1 ? String(row[idxStatus]).trim() : "completed";
    const orderAmount = idxGmv !== -1 ? parseNumber(row[idxGmv]) : 0;
    const commissionAmount = idxCommission !== -1 ? parseNumber(row[idxCommission]) : 0;
    const subId2 = idxSubId2 !== -1 ? String(row[idxSubId2]).trim() || null : null;
    const orderedAt = idxOrderedAt !== -1 ? parseDate(row[idxOrderedAt]) : null;
    const completedAt = idxCompletedAt !== -1 ? parseDate(row[idxCompletedAt]) : null;

    // Chuẩn hóa trạng thái đơn hàng TikTok
    let orderStatus = "completed";
    const lowerStatus = orderStatusRaw.toLowerCase();
    if (lowerStatus.includes("chờ") || lowerStatus.includes("pending") || lowerStatus.includes("processing")) {
      orderStatus = "processing";
    } else if (lowerStatus.includes("hủy") || lowerStatus.includes("cancelled") || lowerStatus.includes("refund")) {
      orderStatus = "cancelled";
    }

    const rawRow: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rawRow[h] = String(row[colIdx] ?? "");
    });

    results.push({
      externalOrderId,
      orderStatus,
      orderedAt,
      completedAt,
      shopName,
      itemName,
      orderAmount,
      commissionAmount,
      subId2,
      rawRow,
    });
  }

  return results;
}
