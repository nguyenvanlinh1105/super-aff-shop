# Hướng Dẫn Tích Hợp TikTok Shop và Lazada

Tài liệu này giải thích chi tiết cách thức hoạt động, cách đăng ký, cách tracking và luồng đồng bộ đơn hàng cho 2 nền tảng TikTok Shop và Lazada trên hệ thống Meowback.

---

## 1. Tích hợp TikTok Shop (thông qua RioHub)

Do TikTok Shop chưa mở API Affiliate công khai cho developer cá nhân, hệ thống sử dụng giải pháp trung gian là **RioHub** để tạo link tracking và nhận webhook đơn hàng.

### A. Cần đăng ký gì để sử dụng?
1. Đăng ký tài khoản tại [RioHub.vn](https://riohub.vn).
2. Trong Dashboard của RioHub, lấy các thông tin sau và điền vào file `.env` của hệ thống:
   - `RIOHUB_API_KEY`: API Key của RioHub.
   - `RIOHUB_WEBHOOK_SIGNING_SECRET`: Secret key dùng để bảo mật Webhook (chỉ nhận dữ liệu chuẩn từ RioHub).
   - `RIOHUB_TIKTOK_CREATOR_USERNAME`: Username tài khoản TikTok Affiliate của bạn (tài khoản đã liên kết để nhận hoa hồng).

### B. Cách thức Tracking và Tạo đơn hàng tự động
1. **Khách tạo link**: Khi khách hàng gửi 1 link TikTok vào hệ thống, hệ thống gọi API của RioHub để chuyển đổi thành link Affiliate. Trong lúc gọi API, hệ thống sẽ chèn 1 đoạn mã `sub_id` đặc biệt (chứa mã khách hàng + mã tracking link).
2. **Khách mua hàng**: Khách bấm vào link đó và mua hàng trên ứng dụng TikTok.
3. **Webhook tự động (Realtime)**: Ngay khi khách đặt hàng thành công, RioHub sẽ bắn (Push) 1 sự kiện Webhook về hệ thống của chúng ta thông qua API `POST /api/riohub/tiktok/webhook`.
4. **Hệ thống xử lý**: Webhook payload sẽ chứa `sub_id`. Hệ thống tách `sub_id` ra để biết chính xác đơn hàng này thuộc về khách hàng nào và Tracking Link nào, sau đó tự động tạo/cập nhật đơn hàng trong database.

### C. Lấy `order_id` TikTok ở đâu nếu nhiều khách hàng?
Nhờ cơ chế **Webhook tự động**, bạn **không cần phải lấy `order_id` thủ công**! Mỗi khi có bất kỳ khách nào đặt hàng, Webhook sẽ tự động cập nhật ngay lập tức.
Chức năng "Đồng bộ đơn TikTok" (nhập tay `order_id`) trên giao diện Admin chỉ là tính năng **dự phòng**. Bạn chỉ dùng nó khi:
- Webhook bị lỗi/mạng rớt khiến hệ thống không nhận được tin nhắn tự động.
- Lúc này, bạn có thể vào trang quản lý affiliate của TikTok hoặc RioHub, copy các ID đơn hàng bị thiếu (ngăn cách bằng dấu phẩy) và dán vào ô nhập tay để hệ thống chủ động gọi API lấy lại dữ liệu đơn đó.

---

## 2. Tích hợp Lazada (thông qua Lazada Open API)

Khác với TikTok, hệ thống tương tác trực tiếp với API chính thức của Lazada Affiliate.

### A. Cần đăng ký gì để sử dụng?
1. Đăng ký tài khoản Lazada Affiliate (Dành cho Publisher).
2. Đăng ký tài khoản [Lazada Open Platform](https://open.lazada.com/) và tạo một App (loại Affiliate/Marketing).
3. Lấy thông tin cấp quyền và điền vào `.env`:
   - `LAZADA_APP_KEY`: Key của App.
   - `LAZADA_APP_SECRET`: Secret của App.
   - `LAZADA_ACCESS_TOKEN`: Mã token truy cập (Cần sinh ra từ Open Platform và renew khi hết hạn).

### B. Cách thức Tracking và Tạo đơn hàng
1. **Khách tạo link**: Hệ thống sử dụng thuật toán ký (Signature) của Lazada để tạo Universal Link. Mã `sub_id` (định danh khách hàng) sẽ được gắn trực tiếp vào tham số URL khi tạo link Affiliate Lazada.
2. **Khách mua hàng**: Khách bấm vào link mua hàng qua App/Web Lazada.
3. **Đồng bộ quét đơn (Cron/Thủ công)**:
   - Lazada **không có Webhook** báo đơn realtime cho Affiliate cá nhân.
   - Thay vào đó, bạn sử dụng nút **"Đồng bộ Lazada"** trên giao diện Admin.
   - Khi bấm, hệ thống gọi API `Conversion Report` của Lazada, yêu cầu lấy danh sách **toàn bộ đơn hàng phát sinh trong 30 ngày gần nhất**.
   - Dữ liệu trả về sẽ chứa các đơn hàng kèm theo `sub_id`. Hệ thống sẽ tự động đối chiếu `sub_id`, lọc ra đơn mới để tạo và đơn cũ để cập nhật trạng thái (Chờ duyệt -> Đã thanh toán -> Hủy).

### Tóm tắt sự khác biệt
- **TikTok**: Hoạt động dạng **Thụ động (Realtime)**. Khách mua xong là RioHub tự đẩy đơn về hệ thống ngay qua Webhook. Admin không cần thao tác gì thêm, ô nhập `order_id` chỉ dùng để fix lỗi rơi rớt đơn.
- **Lazada**: Hoạt động dạng **Chủ động (Pull)**. Hệ thống phải chủ động "kéo" danh sách đơn về bằng cách gọi API định kỳ. Do đó trên Admin có nút "Đồng bộ ngay" quét 30 ngày gần nhất, không cần nhập từng `order_id`.
