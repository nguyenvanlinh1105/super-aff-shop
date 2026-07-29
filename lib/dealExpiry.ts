// Admin chọn "hết hạn ngày X" ở ô <input type="date"> — cần hiểu là hết
// hạn CUỐI ngày X theo giờ Việt Nam (UTC+7), không phải đầu ngày X theo
// UTC. new Date("YYYY-MM-DD") mặc định parse ra 00:00 UTC = 07:00 sáng
// giờ VN cùng ngày, khiến deal bị coi là hết hạn gần như suốt cả ngày đó
// thay vì còn hiệu lực tới tận cuối ngày như admin mong muốn.
export function dealExpiryEndOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 16, 59, 59, 999));
}
