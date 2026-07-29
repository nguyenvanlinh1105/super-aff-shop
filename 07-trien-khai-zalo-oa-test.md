# Hướng dẫn triển khai Zalo OA để test

## 1. Mục tiêu

Sau khi làm xong các bước dưới đây, bạn sẽ test được luồng:

1. Người dùng nhắn link Shopee/TikTok vào Zalo OA.
2. Webhook nhận tin nhắn.
3. Hệ thống tự tìm hoặc tạo khách hàng theo `zalo_user_id`.
4. Hệ thống tạo tracking link kênh `zalo`.
5. Hệ thống sinh link affiliate.
6. Hệ thống lưu log inbound/outbound.
7. Nếu đã điền access token + message endpoint, OA sẽ phản hồi lại tin nhắn thật.

## 2. Những file đã có sẵn

- Webhook Zalo: [app/api/zalo/webhook/route.ts](app/api/zalo/webhook/route.ts)
- Cấu hình OA: [app/api/zalo/account/route.ts](app/api/zalo/account/route.ts)
- Màn hình admin Zalo: [app/admin/zalo/page.tsx](app/admin/zalo/page.tsx)
- Helper OA: [lib/zaloOa.ts](lib/zaloOa.ts)

## 2.1. Tài liệu chính thức của Zalo nên mở song song khi cấu hình

- Tổng quan OA: [developers.zalo.me/docs/official-account/bat-dau/kham-pha](https://developers.zalo.me/docs/official-account/bat-dau/kham-pha)
- Xác thực và ủy quyền ứng dụng: [developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new](https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new)
- Tổng quan tin nhắn OA: [developers.zalo.me/docs/official-account/tin-nhan/tong-quan](https://developers.zalo.me/docs/official-account/tin-nhan/tong-quan)
- Điều kiện gửi tin tư vấn: [developers.zalo.me/docs/official-account/tin-nhan/tin-tu-van/dieu-kien-gui-tin-tu-van](https://developers.zalo.me/docs/official-account/tin-nhan/tin-tu-van/dieu-kien-gui-tin-tu-van)
- Gửi tin tư vấn dạng văn bản: [developers.zalo.me/docs/official-account/tin-nhan/tin-tu-van/gui-tin-tu-van-dang-van-ban](https://developers.zalo.me/docs/official-account/tin-nhan/tin-tu-van/gui-tin-tu-van-dang-van-ban)
- Tổng quan webhook: [developers.zalo.me/docs/official-account/webhook/tong-quan](https://developers.zalo.me/docs/official-account/webhook/tong-quan)
- Sự kiện người dùng gửi tin nhắn: [developers.zalo.me/docs/official-account/webhook/tin-nhan/su-kien-nguoi-dung-gui-tin-nhan](https://developers.zalo.me/docs/official-account/webhook/tin-nhan/su-kien-nguoi-dung-gui-tin-nhan)

## 3. Cấu hình môi trường

Mở file `.env` và thêm:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ZALO_OA_VERIFY_TOKEN="your-zalo-verify-token"
ZALO_OA_ACCESS_TOKEN="your-zalo-access-token"
ZALO_OA_MESSAGE_ENDPOINT="your-zalo-send-message-endpoint"
```

Ý nghĩa:

- `ZALO_OA_VERIFY_TOKEN`: token dùng khi verify webhook.
- `ZALO_OA_ACCESS_TOKEN`: token gọi API gửi tin nhắn ra từ OA.
- `ZALO_OA_MESSAGE_ENDPOINT`: endpoint gửi message theo tài liệu OA bạn đang dùng.

Nếu chưa có `ACCESS_TOKEN` hoặc `MESSAGE_ENDPOINT`, hệ thống vẫn test được luồng nhận webhook và tạo link, nhưng outbound sẽ chạy ở chế độ `simulated`.

## 4. Chạy local

### Chuẩn bị database

Nếu chưa có database:

1. Bật PostgreSQL theo `DATABASE_URL`.
2. Chạy migrate của Prisma.
3. Chạy seed.

### Chạy app

```powershell
.\node_modules\.bin\prisma.cmd generate
.\node_modules\.bin\tsx.cmd prisma/seed.ts
.\node_modules\.bin\next.cmd dev
```

Đăng nhập admin:

- Email: `admin@demo.vn`
- Mật khẩu: `Demo@123`

## 5. Cấu hình OA trong admin

Vào:

- [Trang quản lý Zalo OA](app/admin/zalo/page.tsx)

Nhập:

- `Tên OA`
- `OA ID`
- `App ID`
- `Webhook URL`
- Bật `auto reply`

Với local, webhook URL thường là:

- `https://your-public-domain/api/zalo/webhook`

Nếu test từ máy local, bạn cần public cổng 3000 bằng tunnel như ngrok hoặc Cloudflare Tunnel.

Ví dụ:

- `https://abc123.ngrok-free.app/api/zalo/webhook`

## 6. Cấu hình trên Zalo OA

Trên màn hình quản trị OA của Zalo, bạn cần cấu hình:

1. Webhook callback URL trỏ vào `/api/zalo/webhook`
2. Verify token trùng với `ZALO_OA_VERIFY_TOKEN`
3. Quyền nhận tin nhắn từ người dùng
4. Quyền gửi phản hồi tin nhắn nếu OA của bạn được cấp

Đối chiếu theo docs chính thức:

- phần webhook: mục `Webhook > Tổng quan`
- phần payload tin nhắn vào: mục `Webhook > Tin nhắn > Sự kiện người dùng gửi tin nhắn`
- phần gửi tin ra: mục `Tin nhắn > Tin tư vấn > Gửi tin tư vấn dạng văn bản`

## 7. Cách test nhanh nhất

### Test 1: verify webhook

Gọi thử:

```text
GET /api/zalo/webhook?verify_token=your-zalo-verify-token&challenge=123456
```

Kỳ vọng:

- API trả lại `123456`

### Test 2: giả lập webhook bằng Postman

Gửi `POST /api/zalo/webhook` với payload mẫu:

```json
{
  "event_name": "user_send_text",
  "sender": { "id": "zalo-user-001" },
  "recipient": { "id": "oa-demo-001" },
  "message": {
    "text": "Đổi giúp mình link này https://shopee.vn/product/123/456"
  }
}
```

Kỳ vọng:

- Tạo customer mới nếu chưa có `zalo_user_id = zalo-user-001`
- Tạo `tracking_link` mới với `channel_source = zalo`
- Tạo outbound log
- Nếu chưa cấu hình API gửi tin thật, response sẽ có `simulated: true`

### Test 3: xem log trong admin

Vào trang admin Zalo:

- thấy log inbound
- thấy log outbound
- thấy `processing_status`

## 8. Cách test với người dùng thật trên OA

1. Public local app qua tunnel.
2. Cấu hình webhook URL trên OA.
3. Điền đủ `ZALO_OA_ACCESS_TOKEN` và `ZALO_OA_MESSAGE_ENDPOINT`.
4. Nhắn một link Shopee vào OA.
5. Kiểm tra:
   - user có nhận được reply không
   - `tracking_links` có được tạo không
   - log inbound/outbound có lưu không

## 9. Luồng phản hồi hiện tại

### Nếu người dùng gửi đúng link Shopee/TikTok

Hệ thống sẽ:

- xác định nền tảng
- tạo `trackingCode`
- tạo:
  - `Sub_id1 = mã khách`
  - `Sub_id2 = mã tracking`
  - `Sub_id3 = ZALO`
  - `Sub_id4 = ""`
  - `Sub_id5 = ""`
- sinh affiliate link
- trả lại link cho người dùng

### Nếu người dùng không gửi link

Hệ thống trả tin nhắn hướng dẫn gửi đúng định dạng.

### Nếu gửi link không hỗ trợ

Hệ thống báo chỉ hỗ trợ Shopee và TikTok.

## 10. Lưu ý quan trọng

- Không phải OA nào cũng có quyền gửi tin chủ động giống nhau.
- Endpoint gửi message và format header có thể phụ thuộc tài liệu OA/app của bạn ở thời điểm cấu hình.
- Vì vậy code hiện tại để `ZALO_OA_MESSAGE_ENDPOINT` ở dạng cấu hình thay vì hardcode sai endpoint.
- Trước khi test gửi tin thật, phải đọc kỹ mục `Điều kiện gửi tin tư vấn` trong tài liệu chính thức của Zalo.

## 11. Checklist để bạn test thành công

- Database chạy ổn
- Seed đã tạo `platform` Shopee và TikTok
- App đang chạy và public được ra internet
- OA đã trỏ đúng webhook URL
- Verify token khớp
- OA đang bật trong admin
- Có `ACCESS_TOKEN`
- Có `MESSAGE_ENDPOINT`

## 12. Payload test mẫu

```json
{
  "event_name": "user_send_text",
  "sender": { "id": "zalo-user-001" },
  "recipient": { "id": "oa-demo-001" },
  "message": { "text": "https://vt.tiktok.com/abcxyz/" }
}
```

## 13. Nếu muốn test ngay không cần OA thật

Bạn vẫn test được gần hết luồng bằng Postman:

1. `POST /api/zalo/webhook`
2. kiểm tra response
3. mở admin Zalo xem log
4. mở admin Links xem link đã tạo

Đây là cách nhanh nhất để xác nhận nghiệp vụ trước khi gắn OA thật.
