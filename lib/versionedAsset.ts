// Ép trình duyệt tải lại ảnh mới mỗi lần build/deploy, kể cả khi admin thay
// nội dung file nhưng giữ nguyên tên (vd icontitle.png, anhluuy.jpg) — nếu
// không, ai đã từng xem trang sẽ tiếp tục thấy ảnh cũ cho tới khi tự xoá
// cache trình duyệt (Ctrl+Shift+R). Dùng cho ảnh tĩnh trong public/, KHÔNG
// cần cho ảnh /uploads/ vì đã có tên UUID riêng cho mỗi ảnh.
export function versionedAsset(path: string): string {
  return `${path}?v=${process.env.NEXT_PUBLIC_ASSET_VERSION ?? "1"}`;
}
