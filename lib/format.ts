export function formatCurrency(value: number | string | { toString(): string }): string {
  const num = typeof value === "object" ? Number(value.toString()) : Number(value);
  if (isNaN(num)) return "0đ";
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted + "đ";
}

/**
 * Định dạng tiền chuẩn VNĐ: xxx.xxx.xxx VNĐ (ví dụ 187.000 VNĐ)
 */
export function formatVND(value: number | string | { toString(): string } | null | undefined): string {
  if (value == null) return "0 VNĐ";
  const num = typeof value === "object" ? Number(value.toString()) : Number(value);
  if (isNaN(num)) return "0 VNĐ";
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} VNĐ`;
}

/**
 * Định dạng số nhập liệu có dấu chấm phân cách hàng nghìn (ví dụ "187000" -> "187.000")
 */
export function formatNumberInput(value: string | number | null | undefined): string {
  if (!value) return "";
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Lấy chuỗi số nguyên thô từ input đã format dấu chấm (ví dụ "187.000" -> "187000")
 */
export function parseNumberInput(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Lấy giờ trong ngày (0..23) theo chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7).
 * Giải quyết triệt để lỗi chênh lệch múi giờ khi server chạy trên môi trường UTC (Linux / Docker).
 */
export function getVietnamHour(value: Date | string): number {
  const date = typeof value === "string" ? new Date(value) : value;
  const hourStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    hour12: false,
  }).format(date);
  return parseInt(hourStr, 10) % 24;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/**
 * Lấy các thành phần ngày/tháng/năm/giờ/thứ theo chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7).
 */
export function getVietnamDateParts(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    return { year: 2026, month: 1, day: 1, hour: 0, dateKey: "2026-01-01", dayOfWeek: 4 };
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }
  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10); // 1..12
  const day = parseInt(partMap.day, 10); // 1..31
  const hour = parseInt(partMap.hour, 10) % 24; // 0..23
  const dateKey = `${partMap.year}-${partMap.month}-${partMap.day}`; // "YYYY-MM-DD"

  // Thứ trong tuần (0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
  const localDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = localDate.getUTCDay();

  return { year, month, day, hour, dateKey, dayOfWeek };
}

