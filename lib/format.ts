export function formatCurrency(value: number | string | { toString(): string }): string {
  const num = typeof value === "object" ? Number(value.toString()) : Number(value);
  if (isNaN(num)) return "0đ";
  const formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted + "đ";
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}
