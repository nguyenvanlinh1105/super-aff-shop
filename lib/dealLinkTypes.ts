// Phân loại deal theo việc khách có cần tự tạo link riêng hay không —
// dùng chung giữa form tạo/sửa deal ở admin và tab lọc ở trang Ưu đãi.
export const DEAL_LINK_TYPES = [
  {
    value: "product",
    label: "Sản phẩm cụ thể",
    shortLabel: "Sản phẩm cụ thể",
    description: "Link trỏ thẳng 1 sản phẩm — khách bấm là mua luôn, hoàn tiền tự động ghi nhận.",
  },
  {
    value: "shop",
    label: "Cả Shop / Bộ sưu tập",
    shortLabel: "Cả Shop",
    description: "Link trỏ tới cả shop hoặc nhiều sản phẩm — khách cần chọn đúng sản phẩm muốn mua rồi tự tạo link riêng ở mục Hoàn tiền trước khi thanh toán.",
  },
] as const;

export type DealLinkType = (typeof DEAL_LINK_TYPES)[number]["value"];
