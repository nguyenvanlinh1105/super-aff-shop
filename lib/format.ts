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
