// Danh sách danh mục cố định cho deal — dùng chung giữa form tạo/sửa deal ở
// admin và thanh lọc ở trang /uu-dai, tránh lệch danh sách giữa 2 nơi.
export const DEAL_CATEGORIES = [
  "Thời trang",
  "Mỹ phẩm",
  "Thực phẩm",
  "Mẹ & Bé",
  "Gia dụng",
  "Điện tử",
  "Khác",
] as const;

export type DealCategory = (typeof DEAL_CATEGORIES)[number];
