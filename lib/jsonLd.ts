// JSON.stringify không tự escape ký tự mở thẻ — nếu dữ liệu (vd tiêu đề
// deal do admin nhập) chứa chuỗi đóng thẻ script, nó có thể đóng sớm thẻ
// <script> chứa JSON-LD và cho phép chèn HTML/script tuỳ ý ngay sau đó.
// Escape thành mã Unicode tương đương (browser/JSON.parse hiểu y hệt) để
// chặn hoàn toàn, không ảnh hưởng nội dung dữ liệu thật.
export function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
